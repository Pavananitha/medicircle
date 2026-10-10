import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { LogStatus, NotificationType } from '../types';

export async function checkMissedDoses() {
  try {
    const now = new Date();
    const graceMinutes = config.missedDoseGracePeriodMinutes;

    // Today's date with 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Current time in seconds from midnight
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const graceSeconds = graceMinutes * 60;

    // Find all PENDING logs
    const pendingLogs = await prisma.medicationLog.findMany({
      where: {
        status: 'PENDING',
        scheduled_date: {
          lte: today,
        },
      },
      include: {
        medicine: true,
        schedule: true,
        patient: {
          include: {
            caregiver_connections_as_patient: {
              where: { status: 'ACTIVE' },
              include: {
                caregiver: true,
              },
            },
          },
        },
      },
    });

    for (const log of pendingLogs) {
      // Calculate scheduled time in seconds from midnight
      const schedDate = new Date(log.scheduled_time);
      const schedSeconds = schedDate.getUTCHours() * 3600 + schedDate.getUTCMinutes() * 60;

      const isPastDate = log.scheduled_date < today;
      const isPastGraceToday = !isPastDate && currentSeconds > schedSeconds + graceSeconds;

      if (isPastDate || isPastGraceToday) {
        // Mark as MISSED
        await prisma.medicationLog.update({
          where: { id: log.id },
          data: { status: 'MISSED' },
        });

        // Time formatted e.g. 08:00 PM
        const hours = schedDate.getUTCHours();
        const minutes = schedDate.getUTCMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

        // Notify patient
        await prisma.notification.create({
          data: {
            user_id: log.patient_id,
            type: 'MISSED_DOSE',
            title: 'Missed Medication Notice',
            message: `You missed your dose of ${log.medicine.name} ${log.medicine.dosage} ${log.medicine.dosage_unit} scheduled for ${formattedTime}.`,
            related_entity_id: log.medicine_id,
          },
        });

        // Notify connected caregivers
        for (const conn of log.patient.caregiver_connections_as_patient) {
          const caregiver = conn.caregiver;
          await prisma.notification.create({
            data: {
              user_id: caregiver.id,
              type: 'MISSED_DOSE',
              title: 'Missed Medication Alert',
              message: `${log.patient.name} missed: ${log.medicine.name} ${log.medicine.dosage} ${log.medicine.dosage_unit} Scheduled: ${formattedTime}.`,
              related_entity_id: log.medicine_id,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in checkMissedDoses cron job:', error);
  }
}

export function startMissedDoseJob() {
  // Run every minute: '* * * * *'
  cron.schedule('* * * * *', () => {
    checkMissedDoses();
  });
}
