import re

filepath = 'mobile/app/(patient)/_layout.tsx'
with open(filepath, 'r') as f:
    content = f.read()

caregiver_tab_old = """      <Tabs.Screen
        name="caregiver"
        options={{
          href: null,
          title: 'Caregiver',
          tabBarIcon: ({ color, size }) => ("""

caregiver_tab_new = """      <Tabs.Screen
        name="caregiver"
        options={{
          title: 'Caregivers',
          tabBarIcon: ({ color, size }) => ("""

content = content.replace(caregiver_tab_old, caregiver_tab_new)

with open(filepath, 'w') as f:
    f.write(content)
