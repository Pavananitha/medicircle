import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler to present notifications when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request?.content?.data;
    if (data?.endDate) {
      const endDateStr = typeof data.endDate === 'string' ? data.endDate.split('T')[0] : '';
      if (endDateStr) {
        const endDateTime = new Date(endDateStr + 'T23:59:59');
        if (new Date() > endDateTime) {
          // Medicine course is over - automatically cancel from repeating
          if (notification.request.identifier) {
            Notifications.cancelScheduledNotificationAsync(notification.request.identifier).catch(() => {});
          }
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          };
        }
      }
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export const NotificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medicine-reminders', {
          name: 'Medicine Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      return tokenData.data;
    } catch (e) {
      console.warn('Failed to get push token:', e);
      return null;
    }
  },

  async scheduleMedicineReminder(
    medicineName: string,
    dosage: string,
    dosageUnit: string,
    timeString: string, // e.g. "08:00" or ISO
    scheduleId: string,
    endDate?: string | null
  ): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      let hours = 0;
      let minutes = 0;
      
      if (/^\d{2}:\d{2}/.test(timeString)) {
        const parts = timeString.split(':');
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
      } else if (timeString.includes('T')) {
        const timePart = timeString.split('T')[1];
        hours = parseInt(timePart.substring(0, 2), 10);
        minutes = parseInt(timePart.substring(3, 5), 10);
      } else {
        throw new Error('Invalid time format');
      }

      // First, cancel any old or existing notifications for this schedule
      await this.cancelReminder(scheduleId);

      const now = new Date();
      const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

      // CASE 1: Medicine has an endDate (e.g. course from Oct 27 to Oct 30)
      if (endDate) {
        const endDateStr = typeof endDate === 'string' ? endDate.split('T')[0] : (endDate as any).toISOString().split('T')[0];

        // If end date is already in the past, DO NOT schedule anything!
        if (todayStr > endDateStr) {
          console.log(`[NOTIFS] Medicine course ended on ${endDateStr}. Skipping reminders for ${medicineName}.`);
          return null;
        }

        // Schedule individual DATE triggers for each valid remaining day up to endDate (max 30 days ahead)
        // This guarantees Android OS will NEVER ring after endDate even if app is closed or killed!
        const startDay = new Date(todayStr + 'T00:00:00');
        const endDay = new Date(endDateStr + 'T23:59:59');
        let currentDay = new Date(startDay);

        let scheduledCount = 0;
        while (currentDay <= endDay && scheduledCount < 30) {
          const dayStr = currentDay.toISOString().split('T')[0];
          const target = new Date(`${dayStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);

          if (target.getTime() > Date.now()) {
            await Notifications.scheduleNotificationAsync({
              identifier: `sched_${scheduleId}_${dayStr}`,
              content: {
                title: '💊 Medicine Reminder',
                body: `Time to take ${medicineName} ${dosage} ${dosageUnit}.`,
                sound: true,
                data: { scheduleId, medicineName, endDate },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: target,
                channelId: 'medicine-reminders',
              },
            });
            scheduledCount++;
          }

          currentDay.setDate(currentDay.getDate() + 1);
        }

        console.log(`[NOTIFS] Scheduled ${scheduledCount} single-date reminders for ${medicineName} up to ${endDateStr}.`);
        return `sched_${scheduleId}`;
      } else {
        // CASE 2: No endDate (ongoing / chronic daily medicine) -> use DAILY trigger
        const identifier = await Notifications.scheduleNotificationAsync({
          identifier: `sched_${scheduleId}`,
          content: {
            title: '💊 Medicine Reminder',
            body: `Time to take ${medicineName} ${dosage} ${dosageUnit}.`,
            sound: true,
            data: { scheduleId, medicineName },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hours,
            minute: minutes,
            channelId: 'medicine-reminders',
          },
        });

        return identifier;
      }
    } catch (error) {
      console.warn('Could not schedule local notification:', error);
      return null;
    }
  },

  async syncMedicineNotifications(medicines: any[]): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const now = new Date();
      const todayStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

      // 1. Cancel expired, inactive, or removed medicine reminders
      for (const notif of scheduled) {
        if (!notif.identifier.startsWith('sched_')) continue;

        // Identifier can be sched_${scheduleId} or sched_${scheduleId}_${dayStr}
        const withoutPrefix = notif.identifier.replace('sched_', '');
        const parts = withoutPrefix.split('_');
        const schedId = parts[0];
        const notifDateStr = parts.length > 1 ? parts[1] : null;

        let shouldKeep = false;
        if (Array.isArray(medicines)) {
          for (const med of medicines) {
            if (!med.is_active) continue;

            const isSchedMatch = med.schedules?.some((s: any) => s.id === schedId && s.is_active);
            if (!isSchedMatch) continue;

            // Check medicine end_date
            if (med.end_date) {
              const endDateStr = typeof med.end_date === 'string' ? med.end_date.split('T')[0] : med.end_date.toISOString().split('T')[0];
              // If medicine course has ended, drop all notifications
              if (todayStr > endDateStr) {
                continue;
              }
              // If this is a legacy daily notification without date, cancel it so we can reschedule as DATE
              if (!notifDateStr) {
                continue;
              }
              // If this notification date is in the past or after end date, drop it
              if (notifDateStr < todayStr || notifDateStr > endDateStr) {
                continue;
              }
            }

            shouldKeep = true;
            break;
          }
        }

        if (!shouldKeep) {
          console.log(`[NOTIFS] Cancelling expired or invalid reminder: ${notif.identifier}`);
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }

      // 2. Schedule reminders for all active, unexpired medicines
      if (Array.isArray(medicines)) {
        for (const med of medicines) {
          if (!med.is_active) continue;
          if (med.end_date) {
            const endDateStr = typeof med.end_date === 'string' ? med.end_date.split('T')[0] : med.end_date.toISOString().split('T')[0];
            if (todayStr > endDateStr) continue; // Course over!
          }

          if (Array.isArray(med.schedules)) {
            for (const sched of med.schedules) {
              if (!sched.is_active) continue;
              await this.scheduleMedicineReminder(
                med.name,
                med.dosage,
                med.dosage_unit,
                sched.schedule_time,
                sched.id,
                med.end_date
              );
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to sync scheduled notifications:', e);
    }
  },

  async cancelAllMedicineReminders(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.identifier.startsWith('sched_')) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    } catch (e) {
      console.warn('Failed to cancel all notifications:', e);
    }
  },

  async cancelReminder(scheduleId: string): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.identifier === `sched_${scheduleId}` || notif.identifier.startsWith(`sched_${scheduleId}_`)) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }
    } catch (e) {
      console.warn('Failed to cancel notification:', e);
    }
  },
};
