import re

# Edit screen
filepath = 'mobile/app/(patient)/medicine/edit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("{time} (New)", "{formatTime(time)} (New)")
with open(filepath, 'w') as f:
    f.write(content)

# Add screen
filepath_add = 'mobile/app/(patient)/medicine/add.tsx'
with open(filepath_add, 'r') as f:
    content_add = f.read()

# I need to add formatTime to add.tsx if it's not there.
format_time_code = """
const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '';
  let hStr = '';
  let mStr = '';
  if (/^\\d{2}:\\d{2}/.test(timeString)) {
    const parts = timeString.split(':');
    hStr = parts[0];
    mStr = parts[1];
  } else if (timeString.includes('T')) {
    const timePart = timeString.split('T')[1];
    hStr = timePart.substring(0, 2);
    mStr = timePart.substring(3, 5);
  } else {
    return timeString;
  }
  const hour = parseInt(hStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${mStr} ${ampm}`;
};
"""
if "const formatTime =" not in content_add:
    content_add = content_add.replace("export default function AddMedicineScreen() {", "export default function AddMedicineScreen() {\n" + format_time_code)

content_add = content_add.replace(">{time}</Text>", ">{formatTime(time)}</Text>")

with open(filepath_add, 'w') as f:
    f.write(content_add)
