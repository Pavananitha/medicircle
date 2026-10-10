import re

filepath = 'mobile/components/NotificationCard.tsx'
with open(filepath, 'r') as f:
    content = f.read()

props_old = """interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
}) => {"""

props_new = """interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {"""
content = content.replace(props_old, props_new)

top_row_old = """        <View style={styles.topRow}>
          <Text style={styles.title}>{notification.title}</Text>
          {!notification.is_read && <View style={styles.unreadDot} />}
        </View>"""

top_row_new = """        <View style={styles.topRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
            {!notification.is_read && <View style={styles.unreadDot} />}
          </View>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>"""
content = content.replace(top_row_old, top_row_new)

styles_old = """  title: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },"""

styles_new = """  title: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 4,
  },"""
content = content.replace(styles_old, styles_new)

with open(filepath, 'w') as f:
    f.write(content)
