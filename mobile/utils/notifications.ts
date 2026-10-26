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
      // If medicine end date is already in the past, do not schedule
      if (endDate) {
        const endDateStr = typeof endDate === 'string' ? endDate.split('T')[0] : '';
        if (endDateStr) {
          const endDateTime = new Date(endDateStr + 'T23:59:59');
          if (new Date() > endDateTime) {
            console.log(`[NOTIFS] Skipping reminder for expired medicine: ${medicineName}`);
            return null;
          }
        }
      }

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

      // Schedule daily notification
      const identifier = await Notifications.scheduleNotificationAsync({
        identifier: `sched_${scheduleId}`,
        content: {
          title: '💊 Medicine Reminder',
          body: `Time to take ${medicineName} ${dosage} ${dosageUnit}.`,
          sound: true,
          data: { scheduleId, medicineName, endDate },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          channelId: 'medicine-reminders',
        },
      });

      return identifier;
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

      for (const notif of scheduled) {
        if (!notif.identifier.startsWith('sched_')) continue;
        const schedId = notif.identifier.replace('sched_', '');

        // Check if this schedule belongs to an active, unexpired medicine
        let shouldKeep = false;
        if (Array.isArray(medicines)) {
          for (const med of medicines) {
            if (!med.is_active) continue;
            if (med.end_date) {
              const endDateStr = typeof med.end_date === 'string' ? med.end_date.split('T')[0] : med.end_date.toISOString().split('T')[0];
              const endDateTime = new Date(endDateStr + 'T23:59:59');
              if (now > endDateTime) continue; // Expired!
            }
            if (med.schedules?.some((s: any) => s.id === schedId && s.is_active)) {
              shouldKeep = true;
              break;
            }
          }
        }

        if (!shouldKeep) {
          console.log(`[NOTIFS] Cancelling expired or inactive reminder: ${notif.identifier}`);
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
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
      await Notifications.cancelScheduledNotificationAsync(`sched_${scheduleId}`);
    } catch (e) {
      console.warn('Failed to cancel notification:', e);
    }
  },
};
