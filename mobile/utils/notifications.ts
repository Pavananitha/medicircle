import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler to present notifications when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
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
    scheduleId: string
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

      // Schedule daily notification
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
    } catch (error) {
      console.warn('Could not schedule local notification:', error);
      return null;
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
