import os
import re

filepath = 'mobile/app/(patient)/profile.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add states for DOB and Gender
states_to_add = """  const [emergencyName, setEmergencyName] = useState(user?.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergency_contact_phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth ? user.date_of_birth.substring(0, 10) : '');
  const [gender, setGender] = useState(user?.gender || '');"""

content = re.sub(
    r"  const \[emergencyName, setEmergencyName\] = useState\(user\?\.emergency_contact_name \|\| ''\);\n  const \[emergencyPhone, setEmergencyPhone\] = useState\(user\?\.emergency_contact_phone \|\| ''\);",
    states_to_add,
    content
)

# Update handleSave to include camelCase properties
save_payload = """      const updated = await AuthService.updateProfile({
        name,
        phone,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        emergencyContactName: emergencyName || null,
        emergencyContactPhone: emergencyPhone || null,
      });"""

content = re.sub(
    r"      const updated = await AuthService\.updateProfile\(\{\n        name,\n        phone,\n        emergency_contact_name: emergencyName,\n        emergency_contact_phone: emergencyPhone,\n      \}\);",
    save_payload,
    content
)

# Add DOB and Gender to the form
fields_to_add = """          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.date_of_birth ? user.date_of_birth.substring(0, 10) : 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={gender}
                onChangeText={setGender}
                placeholder="Male / Female / Other"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.gender || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.divider} />"""

content = content.replace("          <View style={styles.divider} />", fields_to_add)

# Replace avatar styles with headerInfo
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
