import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
} from 'react-native';
import { MedicineService } from '../../services/medicine.service';
import { AdherenceService } from '../../services/adherence.service';
import { MedicationLog, AdherenceData } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { ScheduleCard } from '../../components/ScheduleCard';
import { StatCard } from '../../components/StatCard';
import { LoadingState } from '../../components/LoadingState';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const [filterDays, setFilterDays] = useState<number>(7);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [adherence, setAdherence] = useState<AdherenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const [logsData, adhData] = await Promise.all([
        MedicineService.getHistoryLogs(filterDays),
        filterDays === 1
          ? AdherenceService.getToday()
          : filterDays === 7
          ? AdherenceService.getWeekly()
          : AdherenceService.getMonthly(),
      ]);
      setLogs(logsData);
      setAdherence(adhData);
    } catch (e) {
      console.warn('Failed to load history:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterDays]);

  useEffect(() => {
    setLoading(true);
    loadHistory();
  }, [loadHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const filterOptions = [
    { label: 'Today', days: 1 },
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication History</Text>
        <Text style={styles.subtitle}>Track your past doses and adherence rate</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {filterOptions.map((opt) => (
          <TouchableOpacity
            key={opt.days}
            style={[styles.filterTab, filterDays === opt.days && styles.filterTabActive]}
            onPress={() => setFilterDays(opt.days)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterDays === opt.days && styles.filterTabTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          adherence ? (
            <View style={styles.statsContainer}>
              <View style={styles.adherenceHero}>
                <View style={styles.adherenceCircle}>
                  <Text style={styles.adherencePercent}>{adherence.percentage}%</Text>
                  <Text style={styles.adherenceLabel}>Adherence</Text>
                </View>
                <View style={styles.statBreakdown}>
                  <View style={styles.statRow}>
                    <Text style={styles.statDotGreen}>●</Text>
                    <Text style={styles.statName}>Taken:</Text>
                    <Text style={styles.statBold}>{adherence.takenDoses}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statDotRed}>●</Text>
                    <Text style={styles.statName}>Missed:</Text>
                    <Text style={styles.statBold}>{adherence.missedDoses}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statDotGray}>●</Text>
                    <Text style={styles.statName}>Skipped:</Text>
                    <Text style={styles.statBold}>{adherence.skippedDoses}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.disclaimerText}>
                ℹ️ {adherence.disclaimer}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => <ScheduleCard log={item} isActionable={false} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No history recorded</Text>
              <Text style={styles.emptyDesc}>
                Logs will appear automatically as you take or skip doses.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.textInverse,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  statsContainer: {
    marginBottom: Spacing.md,
  },
  adherenceHero: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.xs,
  },
  adherenceCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  adherencePercent: {
    ...Typography.h2,
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  adherenceLabel: {
    fontSize: 9,
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statBreakdown: {
    gap: 6,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDotGreen: { color: Colors.taken, fontSize: 16 },
  statDotRed: { color: Colors.missed, fontSize: 16 },
  statDotGray: { color: Colors.skipped, fontSize: 16 },
  statName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    width: 60,
  },
  statBold: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  disclaimerText: {
    fontSize: 10,
    color: Colors.textMuted,
    lineHeight: 14,
    marginHorizontal: 4,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
