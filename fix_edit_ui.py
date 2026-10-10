import re

filepath = 'mobile/app/(patient)/medicine/edit.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix text cutoff
content = content.replace(
    "<Text style={[styles.label, { fontSize: 16, color: Colors.textPrimary }]}>Scheduled Times</Text>",
    "<Text style={[styles.label, { fontSize: 16, lineHeight: 24, marginBottom: 12, color: Colors.textPrimary }]}>Scheduled Times</Text>"
)

# Fix time formatting for existing schedules
time_logic_old = """               let displayTime = s.schedule_time;
               if (displayTime && displayTime.length > 5) displayTime = displayTime.substring(0, 5);"""

time_logic_new = """               let displayTime = s.schedule_time;
               if (displayTime && displayTime.includes('T')) {
                 const date = new Date(displayTime);
                 displayTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
               } else if (displayTime && displayTime.length > 5) {
                 displayTime = displayTime.substring(0, 5);
               }"""

content = content.replace(time_logic_old, time_logic_new)

with open(filepath, 'w') as f:
    f.write(content)
