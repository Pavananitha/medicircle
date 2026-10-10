import re

filepath = 'mobile/components/TimePicker.tsx'
with open(filepath, 'r') as f:
    content = f.read()

save_old = """  const handleSave = () => {
    onChange(timeInput);
    setModalVisible(false);
  };"""

save_new = """  const handleSave = () => {
    let finalTime = timeInput.trim();
    // Auto-convert 12-hour AM/PM text into 24-hour format
    const match = finalTime.match(/^(\d{1,2}):(\d{2})\s*([PpAa][Mm])?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = match[2];
      const modifier = match[3] ? match[3].toLowerCase() : null;

      if (modifier === 'pm' && h < 12) h += 12;
      if (modifier === 'am' && h === 12) h = 0;
      
      finalTime = `${h.toString().padStart(2, '0')}:${m}`;
    }

    onChange(finalTime);
    setModalVisible(false);
  };"""

content = content.replace(save_old, save_new)

with open(filepath, 'w') as f:
    f.write(content)
