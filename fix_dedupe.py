import re

filepath = 'mobile/app/(patient)/medicine/edit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix deduplication logic
dedupe_old = """  const handleAddSchedule = () => {
    // Check if it already exists
    const existsInExisting = existingSchedules.find(s => s.schedule_time.startsWith(newTime) && !deletedScheduleIds.includes(s.id));"""

dedupe_new = """  const handleAddSchedule = () => {
    // Check if it already exists
    const existsInExisting = existingSchedules.find(s => {
      if (deletedScheduleIds.includes(s.id)) return false;
      const t = formatTime(s.schedule_time);
      const newT = formatTime(newTime);
      return t === newT || s.schedule_time.includes(newTime);
    });"""

content = content.replace(dedupe_old, dedupe_new)

with open(filepath, 'w') as f:
    f.write(content)
