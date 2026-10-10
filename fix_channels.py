import re

filepath = 'mobile/utils/notifications.ts'
with open(filepath, 'r') as f:
    content = f.read()

# Add channel setup logic inside registerForPushNotifications
channel_logic = """
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medicine-reminders', {
          name: 'Medicine Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();"""

content = content.replace("      const tokenData = await Notifications.getExpoPushTokenAsync();", channel_logic)

with open(filepath, 'w') as f:
    f.write(content)
