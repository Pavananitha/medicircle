import re

filepath = 'mobile/app/(caregiver)/_layout.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix patient/[id] tab
old_tab = """      {/* Hide child patient detail stack from tab bar */}
      <Tabs.Screen
        name="patient"
        options={{
          href: null,
        }}
      />"""

new_tab = """      {/* Hide child patient detail stack from tab bar */}
      <Tabs.Screen
        name="patient/[id]"
        options={{
          href: null,
        }}
      />"""

content = content.replace(old_tab, new_tab)

# Also hide alerts if it's not implemented yet or if they want it gone
# Actually I'll leave alerts for now but just fix the patient/[id] text.

with open(filepath, 'w') as f:
    f.write(content)
