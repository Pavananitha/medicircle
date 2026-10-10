import re

filepath = 'mobile/app/(caregiver)/patient/[id].tsx'
with open(filepath, 'r') as f:
    content = f.read()

sort_old = """      historyData.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));"""
sort_new = """      historyData.sort((a, b) => {
        const dateA = new Date(a.scheduled_date).getTime();
        const dateB = new Date(b.scheduled_date).getTime();
        if (dateA !== dateB) return dateB - dateA; // Newest dates first
        return a.scheduled_time.localeCompare(b.scheduled_time); // Earliest time first
      });"""

content = content.replace(sort_old, sort_new)

with open(filepath, 'w') as f:
    f.write(content)
