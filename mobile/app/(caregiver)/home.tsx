import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../store/authContext';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CaregiverService } from '../../services/caregiver.service';
import { CaregiverConnection, MedicationLog } from '../../types';
import { formatTime } from '../../utils/date';

export default function CaregiverHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [connections, setConnections] = useState<CaregiverConnection[]>([]);
  const [dailyTasks, setDailyTasks] = useState<(MedicationLog & { patientName: string })[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await CaregiverService.getConnections();
      setConnections(data);
      
      const activeConns = data.filter(c => c.status === 'ACTIVE');
      let allTasks: (MedicationLog & { patientName: string })[] = [];
      
      for (const conn of activeConns) {
        // Fetch history for days=0 (today only)
        const hist = await CaregiverService.getPatientHistory(conn.patient_id, 0);
        // Only keep PENDING or SKIPPED
        const pendingOrSkipped = hist.filter(h => h.status === 'PENDING' || h.status === 'SKIPPED' || h.status === 'MISSED');
        
        pendingOrSkipped.forEach(t => {
          allTasks.push({ ...t, patientName: conn.patient?.name || 'Unknown Patient' });
        });
      }
      
      // Sort by scheduled time
      allTasks.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
      setDailyTasks(allTasks);
      
    } catch (e) {
      console.warn(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const activePatients = connections.filter(c => c.status === 'ACTIVE');
  const pendingPatients = connections.filter(c => c.status === 'PENDING');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.brandBadge}>
          <Ionicons name="medical" size={24} color={Colors.secondary} />
          <View>
            <Text style={styles.brandName}>MediCircle Care</Text>
            <Text style={styles.welcomeText}>Hello, {user?.name || 'User'}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryTitle}>Connected Patients</Text>
            <Text style={styles.summarySubtitle}>
              Monitoring {activePatients.length} {activePatients.length === 1 ? 'patient' : 'patients'}
            </Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{activePatients.length}</Text>
          </View>
        </View>

        {pendingPatients.length > 0 && (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => router.push('/(caregiver)/patients')}
          >
            <Ionicons name="time" size={24} color="#D97706" />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={styles.alertTitle}>Pending Approvals</Text>
              <Text style={styles.alertDesc}>
                You have {pendingPatients.length} connection request(s) waiting for patient approval.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D97706" />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionBox}
            onPress={() => router.push('/(caregiver)/patients')}
          >
            <View style={[styles.iconWrap, { backgroundColor: Colors.secondaryLight }]}>
              <Ionicons name="people" size={28} color={Colors.secondary} />
            </View>
            <Text style={styles.actionBoxText}>View Patients</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBox}
            onPress={() => router.push('/(caregiver)/alerts')}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="notifications" size={28} color="#DC2626" />
            </View>
            <Text style={styles.actionBoxText}>Recent Alerts</Text>
          </TouchableOpacity>
        </View>
        
        {activePatients.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Spacing.sm }]}>Action Required Today</Text>
            {dailyTasks.length === 0 ? (
              <View style={styles.infoBox}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />
                <Text style={styles.infoText}>
                  All patients are completely up to date with their medications for today!
                </Text>
              </View>
            ) : (
              dailyTasks.map(task => {
                const isSkipped = task.status === 'SKIPPED' || task.status === 'MISSED';
                return (
                  <View key={task.id} style={[styles.taskCard, isSkipped && styles.taskCardSkipped]}>
                    <View style={styles.taskTop}>
                      <View style={styles.timePill}>
                        <Ionicons name="time" size={14} color={Colors.primaryDark} />
                        <Text style={styles.timePillText}>{formatTime(task.scheduled_time)}</Text>
                      </View>
                      <View style={[styles.statusBadge, isSkipped && styles.statusBadgeSkipped]}>
                        <Text style={[styles.statusText, isSkipped && styles.statusTextSkipped]}>
                          {task.status}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.taskPatient}>{task.patientName}</Text>
                    <Text style={styles.taskMedicine}>{task.medicine?.name} ({task.medicine?.dosage} {task.medicine?.dosage_unit})</Text>
                  </View>
                );
              })
            )}
          </>
        )}

      </ScrollView>
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
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.secondary,
  },
  welcomeText: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    ...Typography.h2,
    color: Colors.textInverse,
    marginBottom: 4,
  },
  summarySubtitle: {
    ...Typography.body,
    color: Colors.secondaryLight,
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
    ...Typography.h2,
    color: Colors.textInverse,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  alertTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: '#92400E',
  },
  alertDesc: {
    ...Typography.caption,
    color: '#B45309',
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionBoxText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.secondaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    ...Typography.caption,
    color: "#0F766E",
    lineHeight: 20,
  },
  taskCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  taskCardSkipped: {
    borderLeftColor: Colors.danger,
    backgroundColor: '#FEF2F2',
  },
  taskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  timePillText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeSkipped: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  statusTextSkipped: {
    color: '#B91C1C',
  },
  taskPatient: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 2,
  },
  taskMedicine: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
});
