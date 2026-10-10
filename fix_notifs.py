import re

filepath = 'mobile/utils/notifications.ts'
with open(filepath, 'r') as f:
    content = f.read()

old_logic = """      const parts = timeString.split(':');
      let hours = parseInt(parts[0], 10);
      let minutes = parseInt(parts[1], 10);

      if (isNaN(hours) || isNaN(minutes)) {
        const d = new Date(timeString);
        hours = d.getUTCHours();
        minutes = d.getUTCMinutes();
      }"""

new_logic = """      let hours = 0;
      let minutes = 0;
      
      if (/^\\d{2}:\\d{2}/.test(timeString)) {
        const parts = timeString.split(':');
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
      } else if (timeString.includes('T')) {
        const timePart = timeString.split('T')[1];
        hours = parseInt(timePart.substring(0, 2), 10);
        minutes = parseInt(timePart.substring(3, 5), 10);
      } else {
        throw new Error('Invalid time format');
      }"""

content = content.replace(old_logic, new_logic)

with open(filepath, 'w') as f:
    f.write(content)
