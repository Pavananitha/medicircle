import re

filepath = 'mobile/app/(patient)/_layout.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add imports
content = content.replace("import React from 'react';", "import React, { useEffect } from 'react';")
content = content.replace("import { Ionicons } from '@expo/vector-icons';", 
                          "import { Ionicons } from '@expo/vector-icons';\nimport { NotificationService } from '../../utils/notifications';")

# 2. Add useEffect inside the component
layout_old = """export default function PatientTabsLayout() {
  return ("""

layout_new = """export default function PatientTabsLayout() {
  useEffect(() => {
    NotificationService.registerForPushNotifications().then((token) => {
      if (token) {
        console.log('Push Token Generated:', token);
      }
    });
  }, []);

  return ("""

content = content.replace(layout_old, layout_new)

with open(filepath, 'w') as f:
    f.write(content)
