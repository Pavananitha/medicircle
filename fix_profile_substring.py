import re
import os

for filepath in ['mobile/app/(patient)/profile.tsx', 'mobile/app/(caregiver)/profile.tsx']:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace(
        "user?.date_of_birth ? user.date_of_birth.substring(0, 10) : ''",
        "(user?.date_of_birth && typeof user.date_of_birth === 'string') ? user.date_of_birth.substring(0, 10) : ''"
    )
    content = content.replace(
        "user?.date_of_birth ? user.date_of_birth.substring(0, 10) : 'Not provided'",
        "(user?.date_of_birth && typeof user.date_of_birth === 'string') ? user.date_of_birth.substring(0, 10) : 'Not provided'"
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
