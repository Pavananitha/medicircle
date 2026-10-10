import os
import re

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            # 1. Fix the import path for types
            content = re.sub(r"from '\./types'", r"from '../types'", content)
            
            # Special case for jobs and config which are in src/folder
            if 'config/' in filepath:
                content = re.sub(r"from '\.\./types'", r"from '@prisma/client'", content)
            elif 'jobs/' in filepath:
                pass # it needs '../types'
            elif 'test/' in filepath:
                content = re.sub(r"from '\.\./types'", r"from '../../types'", content)
            
            # 2. Fix enum usages: Enum.VALUE -> 'VALUE'
            content = re.sub(r'\bConnectionStatus\.PENDING\b', "'PENDING'", content)
            content = re.sub(r'\bConnectionStatus\.ACTIVE\b', "'ACTIVE'", content)
            content = re.sub(r'\bConnectionStatus\.REJECTED\b', "'REJECTED'", content)
            content = re.sub(r'\bConnectionStatus\.REMOVED\b', "'REMOVED'", content)
            
            content = re.sub(r'\bLogStatus\.PENDING\b', "'PENDING'", content)
            content = re.sub(r'\bLogStatus\.TAKEN\b', "'TAKEN'", content)
            content = re.sub(r'\bLogStatus\.SKIPPED\b', "'SKIPPED'", content)
            content = re.sub(r'\bLogStatus\.MISSED\b', "'MISSED'", content)

            content = re.sub(r'\bRole\.PATIENT\b', "'PATIENT'", content)
            content = re.sub(r'\bRole\.CAREGIVER\b', "'CAREGIVER'", content)

            content = re.sub(r'\bNotificationType\.([A-Z_]+)\b', r"'\1'", content)
            content = re.sub(r'\bFrequencyType\.([A-Z_]+)\b', r"'\1'", content)
            content = re.sub(r'\bPlatform\.([A-Z_]+)\b', r"'\1'", content)

            with open(filepath, 'w') as f:
                f.write(content)
