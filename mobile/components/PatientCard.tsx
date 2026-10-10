import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';
import { User } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface PatientCardProps {
  patient: User;
  adherencePercentage?: number;
  takenCount?: number;
  missedCount?: number;
  onPress: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  adherencePercentage = 100,
  takenCount = 0,
  missedCount = 0,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{patient.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.meta}>{patient.email}</Text>
        </View>
        <View style={styles.adherenceBadge}>
          <Text style={styles.adherenceNumber}>{adherencePercentage}%</Text>
          <Text style={styles.adherenceLabel}>adherence</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.takenSymbol}>✓</Text>
          <Text style={styles.statText}>{takenCount} Taken</Text>
        </View>
        <View style={[styles.statPill, styles.missedPill]}>
          <Text style={styles.missedSymbol}>⚠</Text>
          <Text style={[styles.statText, styles.missedText]}>{missedCount} Missed</Text>
        </View>
        <View style={styles.viewLink}>
          <Text style={styles.viewLinkText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </View>
      </View>
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
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.secondary,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  meta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  adherenceBadge: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  adherenceNumber: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  adherenceLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.takenLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  takenSymbol: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.taken,
  },
  missedPill: {
    backgroundColor: Colors.missedLight,
  },
  missedSymbol: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.missed,
  },
  statText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  missedText: {
    color: Colors.missed,
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 2,
  },
  viewLinkText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});
