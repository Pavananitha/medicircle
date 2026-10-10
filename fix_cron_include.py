import re

filepath = 'server/src/cron/missedDose.cron.ts'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("CaregiverConnectionPatient:", "caregiver_connections_as_patient:")
content = content.replace("log.patient.CaregiverConnectionPatient", "log.patient.caregiver_connections_as_patient")

with open(filepath, 'w') as f:
    f.write(content)
