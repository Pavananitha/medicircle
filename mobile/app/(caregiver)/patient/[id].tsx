import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CaregiverService } from '../../../services/caregiver.service';
import { User, Medicine, MedicationLog } from '../../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../../constants/theme';
import { AppHeader } from '../../../components/AppHeader';
import { ScheduleCard } from '../../../components/ScheduleCard';
import { LoadingState } from '../../../components/LoadingState';
import { Ionicons } from '@expo/vector-icons';

export default function CaregiverPatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [patient, setPatient] = useState<User | null>(null);
  const [medications, setMedications] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<MedicationLog[]>([]);
  const [adherence, setAdherence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      CaregiverService.getPatientDetails(id),
      CaregiverService.getPatientMedications(id),
      CaregiverService.getPatientHistory(id, 7),
      CaregiverService.getPatientAdherence(id),
    ])
      .then(([pData, medsData, histData, adhData]) => {
        setPatient(pData);
        setMedications(medsData);
        setHistory(histData);
        setAdherence(adhData);
      })
      .catch((err) => {
        Alert.alert('Access Denied', err.message || 'Cannot view this patient profile.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading patient health records..." />;
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="Patient Profile" showBack={true} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Patient record not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={patient.name} subtitle="Read-Only Caregiver Access" showBack={true} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Patient Header Card */}
        <View style={styles.patientCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{patient.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientEmail}>{patient.email}</Text>
            {patient.phone && <Text style={styles.patientPhone}>📞 {patient.phone}</Text>}
          </View>
        </View>

        {/* Adherence Card */}
        {adherence && (
          <View style={styles.adherenceCard}>
            <View style={styles.adherenceTop}>
              <View>
                <Text style={styles.cardHeader}>Weekly Adherence</Text>
                <Text style={styles.adherenceSub}>Last 7 days performance</Text>
              </View>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{adherence.percentage}%</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Text style={styles.dotGreen}>●</Text>
                <Text style={styles.statText}>{adherence.takenDoses} Taken</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.dotRed}>●</Text>
                <Text style={styles.statText}>{adherence.missedDoses} Missed</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.dotGray}>●</Text>
                <Text style={styles.statText}>{adherence.skippedDoses} Skipped</Text>
              </View>
            </View>
          </View>
        )}

        {/* Prescribed Medications (Read Only) */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Prescribed Medicines ({medications.length})</Text>
          <Text style={styles.readOnlyNotice}>
            🔒 Caregivers have read-only access. Only the patient can modify prescriptions.
          </Text>

          {medications.map((m) => (
            <View key={m.id} style={styles.medItem}>
              <View style={styles.medIconBox}>
                <Ionicons name="medkit" size={20} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{m.name}</Text>
                <Text style={styles.medDosage}>
                  {m.dosage} {m.dosage_unit} • {m.medicine_type}
                </Text>
                {m.instructions && (
                  <Text style={styles.medInstructions}>💬 {m.instructions}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Recent Doses History */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Recent Dose Activity</Text>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No recent dose events recorded.</Text>
          ) : (
            history.slice(0, 10).map((log) => (
              <ScheduleCard key={log.id} log={log} isActionable={false} />
            ))
          )}
        </View>
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
  scroll: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.h2,
    color: Colors.secondary,
  },
  patientName: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  patientEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  patientPhone: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  adherenceCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  adherenceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  adherenceSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: Colors.secondaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  percentText: {
    ...Typography.h2,
    color: Colors.secondary,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dotGreen: { color: Colors.taken, fontSize: 14 },
  dotRed: { color: Colors.missed, fontSize: 14 },
  dotGray: { color: Colors.skipped, fontSize: 14 },
  statText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  readOnlyNotice: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginVertical: Spacing.xs,
    fontStyle: 'italic',
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    gap: Spacing.sm,
  },
  medIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  medDosage: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  medInstructions: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginVertical: Spacing.sm,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
