import re

filepath = 'server/src/services/caregiver.service.ts'
with open(filepath, 'r') as f:
    content = f.read()

# Make sure medicationLogService is imported
if "medicationLogService" not in content:
    content = content.replace("import { medicationLogRepository } from '../repositories/medicationLog.repository';",
                              "import { medicationLogRepository } from '../repositories/medicationLog.repository';\nimport { medicationLogService } from './medicationLog.service';")

old_history = """  async getPatientHistory(patientId: string, caregiverId: string, days = 30) {
    await this.verifyCaregiverAccess(patientId, caregiverId);
    const today = new Date();"""

new_history = """  async getPatientHistory(patientId: string, caregiverId: string, days = 30) {
    await this.verifyCaregiverAccess(patientId, caregiverId);
    await medicationLogService.ensureTodayLogs(patientId);
    
    // Fix timezone range for today
    const now = new Date();
    const todayLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const startDate = new Date(todayLocal + 'T00:00:00.000Z');
    startDate.setDate(startDate.getDate() - days);
    
    const endDate = new Date(todayLocal + 'T23:59:59.999Z');

    return medicationLogRepository.findByPatientAndDateRange(patientId, startDate, endDate);"""

content = re.sub(
    r"  async getPatientHistory\(patientId: string, caregiverId: string, days = 30\) \{\n    await this\.verifyCaregiverAccess\(patientId, caregiverId\);\n    const today = new Date\(\);\n    today\.setHours\(23, 59, 59, 999\);\n    const startDate = new Date\(\);\n    startDate\.setDate\(today\.getDate\(\) - days\);\n    startDate\.setHours\(0, 0, 0, 0\);\n\n    return medicationLogRepository\.findByPatientAndDateRange\(patientId, startDate, today\);",
    new_history,
    content
)

old_adherence = """  async getPatientAdherence(patientId: string, caregiverId: string) {
    await this.verifyCaregiverAccess(patientId, caregiverId);
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);"""

new_adherence = """  async getPatientAdherence(patientId: string, caregiverId: string) {
    await this.verifyCaregiverAccess(patientId, caregiverId);
    await medicationLogService.ensureTodayLogs(patientId);
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);"""

content = content.replace(old_adherence, new_adherence)

with open(filepath, 'w') as f:
    f.write(content)
