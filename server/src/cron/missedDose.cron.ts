import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { notificationService } from '../services/notification.service';
import { getWallClockTime, formatDoseDateTime } from '../utils/date';

export const checkAndProcessMissedDoses = async () => {
  try {
    const wallClock = getWallClockTime();
    const graceMinutes = config.missedDoseGracePeriodMinutes || 30;
    const graceMs = graceMinutes * 60000;

    // 1. Fetch all PENDING logs
    const pendingLogs = await prisma.medicationLog.findMany({
      where: {
        status: 'PENDING',
        medicine: {
          is_active: true,
        },
      },
      include: {
        medicine: true,
        patient: {
          include: {
            caregiver_connections_as_patient: {
              where: { status: 'ACTIVE' },
              include: { caregiver: true },
            },
          },
        },
      },
    });

    let missedCount = 0;

    for (const log of pendingLogs) {
      // Construct the expected wall-clock target from the DB fields
      const dateStr = log.scheduled_date.toISOString().split('T')[0];
      const timeStr = log.scheduled_time.toISOString().split('T')[1];

      // Skip and clean up if log scheduled date is after medicine end date
      const endDateLocal = log.medicine.end_date ? log.medicine.end_date.toISOString().split('T')[0] : null;
      if (endDateLocal && dateStr > endDateLocal) {
        await prisma.medicationLog.delete({ where: { id: log.id } });
        continue;
      }

      const targetTime = new Date(`${dateStr}T${timeStr}`);
      const expiryTime = new Date(targetTime.getTime() + graceMs);

      if (wallClock > expiryTime) {
        // Mark as MISSED
        await prisma.medicationLog.update({
          where: { id: log.id },
          data: { status: 'MISSED', updated_at: new Date() },
        });
        missedCount++;

        const { formattedDateTime } = formatDoseDateTime(log.scheduled_date, log.scheduled_time);

        // Notify Patient (if not already notified for this log)
        const patientNotif = await prisma.notification.findFirst({
          where: {
            user_id: log.patient_id,
            related_entity_id: log.id,
            type: 'MISSED_DOSE',
          },
        });

        if (!patientNotif) {
          await notificationService.createNotification({
            userId: log.patient_id,
            type: 'MISSED_DOSE',
            title: 'Missed Medication Notice',
            message: `You missed your ${log.medicine.name} dose scheduled for ${formattedDateTime}.`,
            relatedEntityId: log.id,
          });
        }

        // Notify Caregivers (if not already notified for this log)
        for (const connection of log.patient.caregiver_connections_as_patient) {
          const caregiverNotif = await prisma.notification.findFirst({
            where: {
              user_id: connection.caregiver_id,
              related_entity_id: log.id,
              type: 'MISSED_DOSE',
            },
          });

          if (!caregiverNotif) {
            await notificationService.createNotification({
              userId: connection.caregiver_id,
              type: 'MISSED_DOSE',
              title: 'Missed Medication Alert',
              message: `${log.patient.name} missed their ${log.medicine.name} dose scheduled for ${formattedDateTime}.`,
              relatedEntityId: log.id,
            });
          }
        }
      }
    }

    // 2. Also check recent MISSED logs that were backfilled or created without caregiver notifications
    const sevenDaysAgo = new Date(wallClock.getTime() - 7 * 86400000);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    const sevenDaysAgoPrisma = new Date(sevenDaysAgoStr + 'T00:00:00.000Z');

    const recentMissedLogs = await prisma.medicationLog.findMany({
      where: {
        status: 'MISSED',
        scheduled_date: {
          gte: sevenDaysAgoPrisma,
        },
        medicine: {
          is_active: true,
        },
      },
      include: {
        medicine: true,
        patient: {
          include: {
            caregiver_connections_as_patient: {
              where: { status: 'ACTIVE' },
              include: { caregiver: true },
            },
          },
        },
      },
    });

    for (const log of recentMissedLogs) {
      const { formattedDateTime } = formatDoseDateTime(log.scheduled_date, log.scheduled_time);

      // Check Caregivers
      for (const connection of log.patient.caregiver_connections_as_patient) {
        const caregiverNotif = await prisma.notification.findFirst({
          where: {
            user_id: connection.caregiver_id,
            related_entity_id: log.id,
            type: 'MISSED_DOSE',
          },
        });

        if (!caregiverNotif) {
          await notificationService.createNotification({
            userId: connection.caregiver_id,
            type: 'MISSED_DOSE',
            title: 'Missed Medication Alert',
            message: `${log.patient.name} missed their ${log.medicine.name} dose scheduled for ${formattedDateTime}.`,
            relatedEntityId: log.id,
          });
        }
      }

      // Check Patient
      const patientNotif = await prisma.notification.findFirst({
        where: {
          user_id: log.patient_id,
          related_entity_id: log.id,
          type: 'MISSED_DOSE',
        },
      });

      if (!patientNotif) {
        await notificationService.createNotification({
          userId: log.patient_id,
          type: 'MISSED_DOSE',
          title: 'Missed Medication Notice',
          message: `You missed your ${log.medicine.name} dose scheduled for ${formattedDateTime}.`,
          relatedEntityId: log.id,
        });
      }
    }

    if (missedCount > 0) {
      console.log(`[MISSED_DOSE] Processed ${missedCount} newly missed doses.`);
    }
  } catch (error) {
    console.error('[MISSED_DOSE] Error in checkAndProcessMissedDoses:', error);
  }
};

export const startMissedDoseCron = () => {
  // Run once immediately on startup
  checkAndProcessMissedDoses();

  // Run every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    await checkAndProcessMissedDoses();
  });
};
