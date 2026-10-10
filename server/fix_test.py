import re

filepath = 'src/test/suite.ts'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace("from '../../types'", "from '../types'")
content = content.replace("role: 'PATIENT',", "role: 'PATIENT' as Role,")

with open(filepath, 'w') as f:
    f.write(content)
