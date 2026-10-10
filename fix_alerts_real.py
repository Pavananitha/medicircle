import re

filepath = 'mobile/app/(caregiver)/alerts.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace markAsRead block
funcs_old = """  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationApiService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update alert status');
    }
  };"""

funcs_new = """  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationApiService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not update alert status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await NotificationApiService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not delete alert');
    }
  };"""
content = content.replace(funcs_old, funcs_new)

# Replace FlatList block
render_old = """      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <NotificationCard notification={item} onMarkAsRead={() => handleMarkAsRead(item.id)} />
        )}"""

render_new = """      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
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
