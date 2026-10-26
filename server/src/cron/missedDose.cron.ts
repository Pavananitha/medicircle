import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { notificationService } from '../services/notification.service';

// Grace period in minutes
const GRACE_PERIOD_MINUTES = 60;

export const startMissedDoseCron = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('[CRON] Running missed-dose detection...');
      
      // Get current local wall clock time wrapped in UTC
      const now = new Date();
      const localWallClock = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      
      // Fetch all PENDING logs
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
                include: { caregiver: true }
              }
            }
          }
        }
      });

      let missedCount = 0;

      for (const log of pendingLogs) {
        // Construct the expected wall-clock target from the DB fields
        const dateStr = log.scheduled_date.toISOString().split('T')[0];
        const timeStr = log.scheduled_time.toISOString().split('T')[1];

        // Skip if log scheduled date is after medicine end date
        const endDateLocal = log.medicine.end_date ? log.medicine.end_date.toISOString().split('T')[0] : null;
        if (endDateLocal && dateStr > endDateLocal) {
          await prisma.medicationLog.delete({ where: { id: log.id } });
          continue;
        }

        const targetTime = new Date(`${dateStr}T${timeStr}`);
        
        // Add grace period
        const expiryTime = new Date(targetTime.getTime() + GRACE_PERIOD_MINUTES * 60000);

        if (localWallClock > expiryTime) {
          // 1. Mark as MISSED
          await prisma.medicationLog.update({
            where: { id: log.id },
            data: { status: 'MISSED', updated_at: new Date() }
          });
          missedCount++;

          // 2. Notify Patient
          const timeFormatted = `${targetTime.getUTCHours() % 12 || 12}:${targetTime.getUTCMinutes().toString().padStart(2, '0')} ${targetTime.getUTCHours() >= 12 ? 'PM' : 'AM'}`;
          
          await notificationService.createNotification({
            userId: log.patient_id,
            type: 'MISSED_DOSE',
            title: 'Missed Medication',
            message: `You missed your ${log.medicine.name} scheduled for ${timeFormatted}.`,
            relatedEntityId: log.id
          });

          // 3. Notify Caregivers
          for (const connection of log.patient.caregiver_connections_as_patient) {
            await notificationService.createNotification({
              userId: connection.caregiver_id,
              type: 'MISSED_DOSE',
              title: 'Patient Missed Dose',
              message: `${log.patient.name} missed their ${log.medicine.name} dose scheduled for ${timeFormatted}.`,
              relatedEntityId: log.id
            });
          }
        }
      }

      if (missedCount > 0) {
        console.log(`[CRON] Processed ${missedCount} missed doses.`);
      }
    } catch (error) {
      console.error('[CRON] Error in missed-dose detection:', error);
    }
  });
};
