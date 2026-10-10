import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';
import { LogStatus } from '../types';

interface BadgeProps {
  status: LogStatus | 'UPCOMING';
  size?: 'sm' | 'md';
}

export const MedicationStatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'TAKEN':
        return {
          label: 'Taken',
          symbol: '✓',
          bg: Colors.takenLight,
          color: Colors.taken,
        };
      case 'UPCOMING':
        return {
          label: 'Upcoming',
          symbol: '○',
          bg: Colors.upcomingLight,
          color: Colors.upcoming,
        };
      case 'PENDING':
        return {
          label: 'Due Now',
          symbol: '⏳',
          bg: Colors.pendingLight,
          color: '#B45309', // Dark yellow/amber
        };
      case 'SKIPPED':
        return {
          label: 'Skipped',
          symbol: '⊘',
          bg: Colors.skippedLight,
          color: Colors.skipped,
        };
      case 'MISSED':
        return {
          label: 'Missed',
          symbol: '⚠',
          bg: Colors.missedLight,
          color: Colors.missed,
        };
      default:
        return {
          label: status,
          symbol: '•',
          bg: Colors.background,
          color: Colors.textSecondary,
        };
    }
  };

  const config = getBadgeConfig();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSm && styles.badgeSm,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${config.label}`}
    >
      <Text style={[styles.symbol, { color: config.color }, isSm && styles.symbolSm]}>
        {config.symbol}
      </Text>
      <Text style={[styles.text, { color: config.color }, isSm && styles.textSm]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    gap: 3,
  },
  symbol: {
    fontSize: 12,
    fontWeight: '700',
  },
  symbolSm: {
    fontSize: 10,
  },
  text: {
    ...Typography.caption,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 10,
    lineHeight: 12,
  },
});
