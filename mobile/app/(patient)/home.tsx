import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../store/authContext';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MedicineService } from '../../services/medicine.service';
import { MedicationLog } from '../../types';
import { LoadingState } from '../../components/LoadingState';

export default function PatientHomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await MedicineService.getTodayLogs();
      setLogs(data);
    } catch (err) {
      console.warn('Failed to load today logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [fetchLogs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleAction = async (logId: string, action: 'taken' | 'skipped') => {
    try {
      if (action === 'taken') {
        await MedicineService.markTaken(logId);
      } else {
        await MedicineService.markSkipped(logId);
      }
      fetchLogs(); // Reload silently
    } catch (err: any) {
      Alert.alert('Action Failed', err.message || 'Unable to update status.');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  // Stats calculation
  const totalLogs = logs.length;
  const takenLogs = logs.filter((l) => l.status === 'TAKEN').length;
  const skippedLogs = logs.filter((l) => l.status === 'SKIPPED' || l.status === 'MISSED').length;
  const progressText = totalLogs > 0 ? `${takenLogs} of ${totalLogs} taken` : 'No medicines today';

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

  const renderLogItem = ({ item }: { item: MedicationLog }) => {
    const isPending = item.status === 'PENDING';
    const isTaken = item.status === 'TAKEN';
    const isSkipped = item.status === 'SKIPPED' || item.status === 'MISSED';

    return (
      <View style={[styles.logCard, isTaken && styles.logCardTaken, isSkipped && styles.logCardSkipped]}>
        <View style={styles.logHeaderRow}>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={16} color={Colors.primaryDark} />
            <Text style={styles.timeText}>{formatTime(item.scheduled_time)}</Text>
          </View>
          <View style={[styles.statusBadge, isTaken && styles.statusBadgeTaken, isSkipped && styles.statusBadgeSkipped]}>
            <Text style={[styles.statusText, isTaken && styles.statusTextTaken, isSkipped && styles.statusTextSkipped]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.medName}>{item.medicine?.name || 'Unknown Medicine'}</Text>
        <Text style={styles.medDosage}>
          {item.medicine?.dosage} {item.medicine?.dosage_unit}
        </Text>

        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => handleAction(item.id, 'skipped')}
            >
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.takeBtn}
              onPress={() => handleAction(item.id, 'taken')}
            >
              <Ionicons name="checkmark" size={18} color={Colors.textInverse} />
              <Text style={styles.takeBtnText}>Take Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) return <LoadingState message="Loading today's schedule..." />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.brandBadge}>
          <Ionicons name="medical" size={24} color={Colors.primary} />
          <View>
            <Text style={styles.brandName}>MediCircle</Text>
            <Text style={styles.welcomeText}>Hello, {user?.name || 'User'}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryTitle}>Today's Progress</Text>
          <Text style={styles.summarySubtitle}>{progressText}</Text>
        </View>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>
            {totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 0}%
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your Schedule</Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={renderLogItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptySubtitle}>You don't have any medications scheduled for today.</Text>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primary,
  },
  welcomeText: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  logoutBtn: {
    padding: Spacing.xs,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.textInverse,
    marginBottom: 4,
  },
  summarySubtitle: {
    ...Typography.body,
    color: Colors.primaryLight,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.textInverse,
  },
  progressText: {
    ...Typography.h3,
    color: Colors.textInverse,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  list: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    flexGrow: 1,
  },
  logCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  logCardTaken: {
    borderLeftColor: Colors.success,
    opacity: 0.8,
  },
  logCardSkipped: {
    borderLeftColor: Colors.danger,
    opacity: 0.6,
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  timeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeTaken: { backgroundColor: '#DCFCE7' },
  statusBadgeSkipped: { backgroundColor: '#FEE2E2' },
  statusText: {
    ...Typography.caption,
    fontWeight: '700',
    color: '#D97706',
  },
  statusTextTaken: { color: '#15803D' },
  statusTextSkipped: { color: '#B91C1C' },
  medName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  medDosage: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipBtnText: {
    ...Typography.button,
    color: Colors.textSecondary,
  },
  takeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  takeBtnText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
