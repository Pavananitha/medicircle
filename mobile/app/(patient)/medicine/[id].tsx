import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MedicineService } from '../../../services/medicine.service';
import { Medicine } from '../../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../../constants/theme';
import { AppHeader } from '../../../components/AppHeader';
import { LoadingState } from '../../../components/LoadingState';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import { formatDisplayDate } from '../../../components/DatePicker';
import { Ionicons } from '@expo/vector-icons';

export default function MedicineDetailsScreen() {

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

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    MedicineService.getMedicineById(id)
      .then(setMedicine)
      .catch((e) => Alert.alert('Error', e.message || 'Failed to load medicine details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!medicine) return;
    setDeleting(true);
    try {
      await MedicineService.deleteMedicine(medicine.id);
      setShowDeleteModal(false);
      Alert.alert('Deleted', 'Medicine deleted successfully.', [
        { text: 'OK', onPress: () => router.replace('/(patient)/medicines') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to delete medicine');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading medicine details..." />;
  }

  if (!medicine) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="Medicine Not Found" showBack={true} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This medicine does not exist or was deleted.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title={medicine.name}
        showBack={true}
        rightAction={
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/(patient)/medicine/edit', params: { id: medicine.id } })
            }
          >
            <Ionicons name="create-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroBox}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="medkit" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.heroName}>{medicine.name}</Text>
          {medicine.generic_name && (
            <Text style={styles.heroGeneric}>{medicine.generic_name}</Text>
          )}
          <View style={styles.badgeRow}>
            <View style={styles.dosagePill}>
              <Text style={styles.dosagePillText}>
                {medicine.dosage} {medicine.dosage_unit}
              </Text>
            </View>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{medicine.medicine_type}</Text>
            </View>
          </View>
        </View>

        {/* Prescription Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Instructions & Guidelines</Text>
          <Text style={styles.instructionsText}>
            {medicine.instructions || 'No specific instructions provided.'}
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Start Date</Text>
              <Text style={styles.infoValue}>
                {formatDisplayDate(medicine.start_date)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>End Date</Text>
              <Text style={styles.infoValue}>
                {medicine.end_date
                  ? formatDisplayDate(medicine.end_date)
                  : 'Ongoing'}
              </Text>
            </View>
          </View>

          {medicine.notes && (
            <>
              <View style={styles.divider} />
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.notesText}>{medicine.notes}</Text>
            </>
          )}
        </View>

        {/* Schedules */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Dose Schedules</Text>
          {(medicine.schedules || []).length === 0 ? (
            <Text style={styles.emptySched}>No active schedules.</Text>
          ) : (
            (medicine.schedules || []).map((s) => (
              <View key={s.id} style={styles.schedItem}>
                <Ionicons name="alarm-outline" size={20} color={Colors.primary} />
                <Text style={styles.schedTime}>
{formatTime(s.schedule_time)}
                </Text>
                <Text style={styles.freqTag}>{s.frequency_type}</Text>
              </View>
            ))
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setShowDeleteModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          <Text style={styles.deleteBtnText}>Delete This Medicine</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Medicine"
        message={`Are you sure you want to delete ${medicine.name}? All upcoming dose reminders will be cancelled.`}
        confirmText="Delete"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
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
  scroll: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  heroBox: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroName: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  heroGeneric: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  dosagePill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  dosagePillText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  typePill: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  typePillText: {
    ...Typography.caption,
    fontWeight: '600',
    color: '#4F46E5',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  instructionsText: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  notesText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  schedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  schedTime: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  freqTag: {
    ...Typography.caption,
    color: Colors.textSecondary,
    backgroundColor: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptySched: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  deleteBtnText: {
    ...Typography.button,
    color: Colors.danger,
    fontSize: 14,
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
