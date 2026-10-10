import re

# 1. Fix Caregiver Home Screen Crash
filepath_home = 'mobile/app/(caregiver)/home.tsx'
with open(filepath_home, 'r') as f:
    content_home = f.read()

content_home = content_home.replace(
    "<Text style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0]}</Text>",
    "<Text style={styles.welcomeText}>Hello, {user?.name ? user.name.split(' ')[0] : 'Caregiver'}</Text>"
)

with open(filepath_home, 'w') as f:
    f.write(content_home)

# 2. Fix Caregiver Profile Logout Web Bug and Name Web Bug
filepath_profile = 'mobile/app/(caregiver)/profile.tsx'
with open(filepath_profile, 'r') as f:
    content_profile = f.read()

logout_old = """  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of MediCircle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };"""

logout_new = """  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Are you sure you want to log out of MediCircle?');
      if (confirm) {
        await logout();
        router.replace('/(auth)/login');
      }
      return;
    }
    
    Alert.alert('Log Out', 'Are you sure you want to log out of MediCircle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };"""
content_profile = content_profile.replace(logout_old, logout_new)

# Also fix the empty name text if it's completely missing
content_profile = content_profile.replace(
    "<Text style={styles.userName}>{user?.name}</Text>",
    "<Text style={styles.userName}>{user?.name || 'Caregiver'}</Text>"
)
content_profile = content_profile.replace(
    "<Text style={styles.fieldValue}>{user?.name}</Text>",
    "<Text style={styles.fieldValue}>{user?.name || 'Not provided'}</Text>"
)

with open(filepath_profile, 'w') as f:
    f.write(content_profile)

