import re

filepath = 'mobile/components/ScheduleCard.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace time rendering
time_old = """  const time = formatTime(log.scheduled_time);

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>{time}</Text>
        </View>"""

time_new = """  const time = formatTime(log.scheduled_time);
  const scheduledDate = new Date(log.scheduled_date).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <View style={styles.timeBox}>
          <Text style={styles.dateText}>{scheduledDate}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>"""

content = content.replace(time_old, time_new)

# Add style for dateText
styles_old = """  timeText: {
    ...Typography.bodySmall,
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
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },"""

content = content.replace(styles_old, styles_new)

with open(filepath, 'w') as f:
    f.write(content)
