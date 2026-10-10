import re

filepath = 'mobile/app/(caregiver)/patient/[id].tsx'
with open(filepath, 'r') as f:
    content = f.read()

history_sort_old = """      const historyData = await CaregiverService.getPatientHistory(id as string, 0);"""
history_sort_new = """      const historyData = await CaregiverService.getPatientHistory(id as string, 0);
      historyData.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));"""

content = content.replace(history_sort_old, history_sort_new)

with open(filepath, 'w') as f:
    f.write(content)
