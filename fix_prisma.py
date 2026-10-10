import re

with open('server/prisma/schema.prisma', 'r') as f:
    content = f.read()

# 1. Replace enum declarations with nothing (or just leave them as unused, but better to remove)
content = re.sub(r'enum \w+ \{[^}]+\}\n*', '', content)

# 2. Replace the field types in models
replacements = [
    (r'frequency_type\s+FrequencyType', r'frequency_type String    @db.VarChar(50)'),
    (r'status\s+LogStatus\s+@default\(PENDING\)', r'status         String    @default("PENDING") @db.VarChar(20)'),
    (r'status\s+ConnectionStatus\s+@default\(PENDING\)', r'status       String           @default("PENDING") @db.VarChar(20)'),
    (r'type\s+NotificationType', r'type              String           @db.VarChar(50)'),
    (r'platform\s+Platform', r'platform   String   @db.VarChar(20)'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open('server/prisma/schema.prisma', 'w') as f:
    f.write(content)
