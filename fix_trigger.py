import re

filepath = 'mobile/utils/notifications.ts'
with open(filepath, 'r') as f:
    content = f.read()

trigger_old = """        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },"""

trigger_new = """        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          channelId: 'medicine-reminders',
        },"""

content = content.replace(trigger_old, trigger_new)

with open(filepath, 'w') as f:
    f.write(content)
