import re

filepath = 'server/src/index.ts'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("import { config } from './config';", 
                          "import { config } from './config';\nimport { startMissedDoseCron } from './cron/missedDose.cron';")

start_logic = """const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 MediCircle Server running at http://${HOST}:${PORT}`);
  console.log(`📋 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://${HOST}:${PORT}/api/auth/login`);
  
  // Start background jobs
  startMissedDoseCron();
});"""

content = re.sub(r"const server = app\.listen\(PORT, HOST, \(\) => \{[\s\S]*?\}\);", start_logic, content)

with open(filepath, 'w') as f:
    f.write(content)
