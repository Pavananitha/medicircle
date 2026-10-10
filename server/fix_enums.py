import os
import re

for root, _, files in os.walk('server/src'):
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            # Fix imports path
            content = re.sub(r"from '\./types'", r"from '../types'", content)
            content = re.sub(r"from '\.\./types'", r"from '../types'", content) # Just to normalize if needed
            if 'test/' in filepath or 'jobs/' in filepath:
                content = re.sub(r"from '\.\./types'", r"from '../../types'", content)
            if 'config/' in filepath:
                content = re.sub(r"from '\.\./types'", r"from '@prisma/client'", content) # PrismaClient comes from @prisma/client

            # Replace Enum.VALUE with 'VALUE'
            content = re.sub(r'ConnectionStatus\.PENDING', "'PENDING'", content)
            content = re.sub(r'ConnectionStatus\.ACTIVE', "'ACTIVE'", content)
            content = re.sub(r'ConnectionStatus\.REJECTED', "'REJECTED'", content)
            content = re.sub(r'ConnectionStatus\.REMOVED', "'REMOVED'", content)
            
            content = re.sub(r'LogStatus\.PENDING', "'PENDING'", content)
            content = re.sub(r'LogStatus\.TAKEN', "'TAKEN'", content)
            content = re.sub(r'LogStatus\.SKIPPED', "'SKIPPED'", content)
            content = re.sub(r'LogStatus\.MISSED', "'MISSED'", content)

            content = re.sub(r'Role\.PATIENT', "'PATIENT'", content)
            content = re.sub(r'Role\.CAREGIVER', "'CAREGIVER'", content)

            content = re.sub(r'NotificationType\.([A-Z_]+)', r"'\1'", content)
            content = re.sub(r'FrequencyType\.([A-Z_]+)', r"'\1'", content)

            with open(filepath, 'w') as f:
                f.write(content)
