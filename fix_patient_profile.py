import re

filepath_profile = 'mobile/app/(patient)/profile.tsx'
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

if logout_old in content_profile:
    content_profile = content_profile.replace(logout_old, logout_new)
    with open(filepath_profile, 'w') as f:
        f.write(content_profile)
