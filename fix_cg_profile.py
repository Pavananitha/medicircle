import os
import re

filepath = 'mobile/app/(caregiver)/profile.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix AuthService payload
save_payload = """      const updated = await AuthService.updateProfile({
        name,
        phone,
      });"""

content = re.sub(
    r"      const updated = await AuthService\.updateProfile\(\{\n        name,\n        phone,\n      \}\);",
    save_payload,
    content
)

# Remove avatarCard and use headerInfo
content = re.sub(
    r"        \{\/\* User Card \*\/\}\n        <View style=\{styles\.avatarCard\}>\n          <View style=\{styles\.avatarCircle\}>\n            <Text style=\{styles\.avatarText\}>\{user\?\.name\?\.charAt\(0\)\.toUpperCase\(\)\}<\/Text>\n          <\/View>\n          <Text style=\{styles\.userName\}>\{user\?\.name\}<\/Text>\n          <Text style=\{styles\.userRole\}>CAREGIVER ACCOUNT<\/Text>\n          <Text style=\{styles\.userEmail\}>\{user\?\.email\}<\/Text>\n        <\/View>",
    r"        {/* Header Information */}\n        <View style={styles.headerInfo}>\n          <Text style={styles.userName}>{user?.name}</Text>\n          <Text style={styles.userRole}>CAREGIVER ACCOUNT</Text>\n          <Text style={styles.userEmail}>{user?.email}</Text>\n        </View>",
    content
)

styles_replace = """  headerInfo: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userName: {"""

content = re.sub(
    r"  avatarCard: \{.*?\},\n  avatarCircle: \{.*?\},\n  avatarText: \{.*?\},\n  userName: \{",
    styles_replace,
    content,
    flags=re.DOTALL
)

with open(filepath, 'w') as f:
    f.write(content)
