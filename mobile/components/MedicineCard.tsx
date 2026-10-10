import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';
import { Medicine } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface MedicineCardProps {
  medicine: Medicine;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  // Format schedule times e.g. 08:00 AM, 02:00 PM

const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '';
  let hStr = '';
  let mStr = '';
  if (/^\d{2}:\d{2}/.test(timeString)) {
    const parts = timeString.split(':');
    hStr = parts[0];
    mStr = parts[1];
  } else if (timeString.includes('T')) {
    const timePart = timeString.split('T')[1];
    hStr = timePart.substring(0, 2);
    mStr = timePart.substring(3, 5);
  } else {
    return timeString;
  }
  const hour = parseInt(hStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${mStr} ${ampm}`;
};

  const formattedSchedules = (medicine.schedules || []).map((s) => formatTime(s.schedule_time));

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="medkit" size={22} color={Colors.primary} />
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.name}>{medicine.name}</Text>
          {medicine.generic_name ? (
            <Text style={styles.generic}>{medicine.generic_name}</Text>
          ) : null}
        </View>
        <View style={styles.dosageBadge}>
          <Text style={styles.dosageText}>
            {medicine.dosage} {medicine.dosage_unit}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{medicine.medicine_type}</Text>
        </View>
        {medicine.instructions ? (
          <Text style={styles.instructions} numberOfLines={1}>
            💬 {medicine.instructions}
          </Text>
        ) : null}
      </View>

      {formattedSchedules.length > 0 && (
        <View style={styles.schedulesContainer}>
          <Text style={styles.scheduleLabel}>Schedule:</Text>
          <View style={styles.schedulePills}>
            {formattedSchedules.map((time, idx) => (
              <View key={idx} style={styles.pill}>
                <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.pillText}>{time}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {showActions && (onEdit || onDelete) && (
        <View style={styles.footer}>
          {onEdit && (
            <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
              <Ionicons name="create-outline" size={16} color={Colors.primary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
              <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  titleInfo: {
    flex: 1,
  },
  name: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  generic: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  dosageBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  dosageText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  typeBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    ...Typography.caption,
    color: '#4F46E5',
    fontWeight: '500',
  },
  instructions: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  schedulesContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  scheduleLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  schedulePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  pillText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  actionText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  deleteBtn: {},
  deleteText: {
    color: Colors.danger,
  },
});
