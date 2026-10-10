import os
import re

# We will just write the formatTime directly into the files to avoid messy import paths across different folder depths.

FORMAT_TIME_CODE = """
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

# 1. Fix MedicineCard.tsx
card_file = 'mobile/components/MedicineCard.tsx'
with open(card_file, 'r') as f:
    card = f.read()

card_replace_old = """  const formattedSchedules = (medicine.schedules || []).map((s) => {
    try {
      const parts = s.schedule_time.split(':');
      if (parts.length >= 2) {
        let hour = parseInt(parts[0], 10);
        const min = parts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${min} ${ampm}`;
      }
      const d = new Date(s.schedule_time);
      let hour = d.getUTCHours();
      const min = d.getUTCMinutes().toString().padStart(2, '0');
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${min} ${ampm}`;
    } catch {
      return s.schedule_time;
    }
  });"""

card = card.replace(card_replace_old, FORMAT_TIME_CODE + "\n  const formattedSchedules = (medicine.schedules || []).map((s) => formatTime(s.schedule_time));")
with open(card_file, 'w') as f:
    f.write(card)

# 2. Fix home.tsx
home_file = 'mobile/app/(patient)/home.tsx'
with open(home_file, 'r') as f:
    home = f.read()

home_replace_old = """  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };"""

home = home.replace(home_replace_old, FORMAT_TIME_CODE.strip())
with open(home_file, 'w') as f:
    f.write(home)

# 3. Fix [id].tsx (Medicine Details)
id_file = 'mobile/app/(patient)/medicine/[id].tsx'
with open(id_file, 'r') as f:
    id_content = f.read()

id_replace_old = """                  {new Date(s.schedule_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}"""
id_content = id_content.replace(id_replace_old, "{formatTime(s.schedule_time)}")
if "const formatTime =" not in id_content:
    id_content = id_content.replace("export default function MedicineDetailsScreen() {", "export default function MedicineDetailsScreen() {\n" + FORMAT_TIME_CODE)
with open(id_file, 'w') as f:
    f.write(id_content)

# 4. Fix edit.tsx
edit_file = 'mobile/app/(patient)/medicine/edit.tsx'
with open(edit_file, 'r') as f:
    edit = f.read()

edit_replace_old = """               let displayTime = s.schedule_time;
               if (displayTime && displayTime.includes('T')) {
                 const date = new Date(displayTime);
                 displayTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
               } else if (displayTime && displayTime.length > 5) {
                 displayTime = displayTime.substring(0, 5);
               }"""

edit = edit.replace(edit_replace_old, "               const displayTime = formatTime(s.schedule_time);")
if "const formatTime =" not in edit:
    edit = edit.replace("export default function EditMedicineScreen() {", "export default function EditMedicineScreen() {\n" + FORMAT_TIME_CODE)
with open(edit_file, 'w') as f:
    f.write(edit)

