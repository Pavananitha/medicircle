import re
filepath = 'mobile/app/(patient)/home.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace(
    "<Text style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0]}</Text>",
    "<Text style={styles.welcomeText}>Hello, {user?.name ? user.name.split(' ')[0] : 'Patient'}</Text>"
)

with open(filepath, 'w') as f:
    f.write(content)
