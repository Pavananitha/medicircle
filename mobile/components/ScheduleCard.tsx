import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';
import { MedicationLog } from '../types';
import { formatTime } from '../utils/date';
import { MedicationStatusBadge } from './MedicationStatusBadge';
import { Ionicons } from '@expo/vector-icons';

interface ScheduleCardProps {
  log: MedicationLog;
  onTake?: () => void;
  onSkip?: () => void;
  isActionable?: boolean;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  log,
  onTake,
  onSkip,
  isActionable = false,
}) => {


  const medicine = log.medicine;
  const time = formatTime(log.scheduled_time);
  const scheduledDate = new Date(log.scheduled_date).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <View style={styles.timeBox}>
          <Text style={styles.dateText}>{scheduledDate}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{medicine?.name || 'Medication'}</Text>
          <Text style={styles.dosage}>
            {medicine?.dosage} {medicine?.dosage_unit} • {medicine?.medicine_type}
          </Text>
          {medicine?.instructions ? (
            <Text style={styles.instructions} numberOfLines={1}>
              {medicine.instructions}
            </Text>
          ) : null}
        </View>

        <MedicationStatusBadge status={log.status} />
      </View>

      {/* Action buttons if dose is pending */}
      {isActionable && log.status === 'PENDING' && (
        <View style={styles.actionsRow}>
          {onSkip && (
            <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
              <Ionicons name="close-circle-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
          {onTake && (
            <TouchableOpacity style={styles.takeBtn} onPress={onTake} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.textInverse} />
              <Text style={styles.takeText}>Take Dose</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeBox: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  dateText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  timeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dosage: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  instructions: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  skipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  takeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    gap: 4,
  },
  takeText: {
    ...Typography.bodySmall,
    color: Colors.textInverse,
    fontWeight: '600',
  },
});
