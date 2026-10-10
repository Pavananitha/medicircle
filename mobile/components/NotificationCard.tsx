import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';
import { NotificationItem } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const isMissedDose = notification.type === 'MISSED_DOSE';
  const isReminder = notification.type === 'MEDICINE_REMINDER';

  const getIcon = () => {
    if (isMissedDose) {
      return <Ionicons name="alert-circle" size={24} color={Colors.missed} />;
    }
    if (isReminder) {
      return <Ionicons name="alarm" size={24} color={Colors.primary} />;
    }
    return <Ionicons name="notifications" size={24} color={Colors.secondary} />;
  };

  return (
    <View style={[styles.card, !notification.is_read && styles.unreadCard]}>
      <View style={styles.iconWrap}>{getIcon()}</View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
            {!notification.is_read && <View style={styles.unreadDot} />}
          </View>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.message}>{notification.message}</Text>
        <View style={styles.footer}>
          <Text style={styles.time}>
            {new Date(notification.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {!notification.is_read && onMarkAsRead && (
            <TouchableOpacity onPress={onMarkAsRead} style={styles.readBtn}>
              <Text style={styles.readBtnText}>Mark as Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: Colors.primaryLight,
  },
  iconWrap: {
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  message: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  time: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  readBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  readBtnText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});
