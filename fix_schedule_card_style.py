import re

filepath = 'mobile/components/ScheduleCard.tsx'
with open(filepath, 'r') as f:
    content = f.read()

styles_old = """  timeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
  },"""

styles_new = """  dateText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  timeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
  },"""

content = content.replace(styles_old, styles_new)

with open(filepath, 'w') as f:
    f.write(content)
