import re

filepath = 'server/src/services/medicationLog.service.ts'
with open(filepath, 'r') as f:
    content = f.read()

# Replace today with todayPrisma in upsertLog
content = content.replace("scheduled_date: today,", "scheduled_date: todayPrisma,")

# Fix getTodayLogs
get_today_old = """  async getTodayLogs(patientId: string) {
    await this.ensureTodayLogs(patientId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return medicationLogRepository.findTodayLogs(patientId, today);
  }"""

get_today_new = """  async getTodayLogs(patientId: string) {
    await this.ensureTodayLogs(patientId);
    const now = new Date();
    const todayLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const todayPrisma = new Date(todayLocal + 'T00:00:00.000Z');
    
    return medicationLogRepository.findTodayLogs(patientId, todayPrisma);
  }"""

content = content.replace(get_today_old, get_today_new)

with open(filepath, 'w') as f:
    f.write(content)
