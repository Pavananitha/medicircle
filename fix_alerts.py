import re

filepath = 'mobile/app/(caregiver)/alerts.tsx'
with open(filepath, 'r') as f:
    content = f.read()

funcs_old = """  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationApiService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (e) {
      console.warn('Failed to mark read', e);
    }
  };"""

funcs_new = """  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationApiService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (e) {
      console.warn('Failed to mark read', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await NotificationApiService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (e) {
      console.warn('Failed to delete notification', e);
    }
  };"""
content = content.replace(funcs_old, funcs_new)

render_old = """      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onMarkAsRead={() => handleMarkAsRead(item.id)}
          />
        )}"""

render_new = """      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onMarkAsRead={() => handleMarkAsRead(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}"""
content = content.replace(render_old, render_new)

with open(filepath, 'w') as f:
    f.write(content)
