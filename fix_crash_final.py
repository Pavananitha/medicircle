import re
import os

for filepath in ['mobile/app/(patient)/home.tsx', 'mobile/app/(caregiver)/home.tsx']:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove split entirely
    content = re.sub(
        r"<Text style=\{styles\.welcomeText\}>Hello, \{.*?\}</Text>",
        "<Text style={styles.welcomeText}>Hello, {user?.name || 'User'}</Text>",
        content
    )
    with open(filepath, 'w') as f:
        f.write(content)
