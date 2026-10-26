import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MedicineService } from '../../../services/medicine.service';
import { NotificationService } from '../../../utils/notifications';
import { Colors, Spacing, Typography, BorderRadius } from '../../../constants/theme';
import { AppHeader } from '../../../components/AppHeader';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { DatePicker } from '../../../components/DatePicker';
import { TimePicker } from '../../../components/TimePicker';
import { Ionicons } from '@expo/vector-icons';

export default function AddMedicineScreen() {

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

  const router = useRouter();

  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dosage, setDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [medicineType, setMedicineType] = useState('Tablet');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Multiple schedules list
  const [schedules, setSchedules] = useState<string[]>(['08:00']);
  const [newTime, setNewTime] = useState('14:00');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const medicineTypes = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Drops', 'Inhaler', 'Cream'];
  const units = ['mg', 'ml', 'g', 'mcg', 'IU', 'tablets', 'puffs'];

  const addScheduleTime = () => {
    if (!schedules.includes(newTime)) {
      setSchedules([...schedules, newTime].sort());
    } else {
      Alert.alert('Duplicate Schedule', 'This time is already in your schedule list.');
    }
  };

  const removeScheduleTime = (timeToRemove: string) => {
    if (schedules.length <= 1) {
      Alert.alert('Required', 'A medicine must have at least one scheduled time.');
      return;
    }
    setSchedules(schedules.filter((t) => t !== timeToRemove));
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Medicine name is required.';
    if (!dosage.trim()) errs.dosage = 'Dosage is required.';
    if (!startDate) errs.startDate = 'Start date is required.';
    if (schedules.length === 0) errs.schedules = 'At least one schedule time is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const created = await MedicineService.createMedicine({
        name: name.trim(),
        genericName: genericName.trim() || undefined,
        dosage: dosage.trim(),
        dosageUnit,
        medicineType,
        instructions: instructions.trim() || undefined,
        startDate,
        endDate: endDate || undefined,
        notes: notes.trim() || undefined,
        schedules: schedules.map((time) => ({
          scheduleTime: time,
          frequencyType: 'DAILY',
        })),
      });

      // Schedule local Expo reminders for each schedule
      if (created.schedules) {
        for (const s of created.schedules) {
          await NotificationService.scheduleMedicineReminder(
            created.name,
            created.dosage,
            created.dosage_unit,
            s.schedule_time,
            s.id,
            created.end_date || endDate
          );
        }
      }

      Alert.alert('Success', 'Medicine and schedules saved successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create medicine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Add Medicine" showBack={true} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Medicine Details</Text>

          {/* Medicine Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medicine Name *</Text>
            <TextInput
              style={[styles.input, !!errors.name && styles.inputError]}
              placeholder="e.g. Paracetamol"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Generic Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Generic Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Acetaminophen"
              placeholderTextColor={Colors.textMuted}
              value={genericName}
              onChangeText={setGenericName}
            />
          </View>

          {/* Dosage & Unit */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Dosage *</Text>
              <TextInput
                style={[styles.input, !!errors.dosage && styles.inputError]}
                placeholder="500"
                placeholderTextColor={Colors.textMuted}
                value={dosage}
                onChangeText={setDosage}
                keyboardType="numeric"
              />
              {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}
            </View>

            <View style={[styles.inputGroup, { width: 110 }]}>
              <Text style={styles.label}>Unit</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitRow}>
                {units.slice(0, 3).map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitPill, dosageUnit === u && styles.unitPillActive]}
                    onPress={() => setDosageUnit(u)}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        dosageUnit === u && styles.unitTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Medicine Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
              {medicineTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typePill, medicineType === type && styles.typePillActive]}
                  onPress={() => setMedicineType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      medicineType === type && styles.typeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Instructions */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Take after food with a glass of water"
              placeholderTextColor={Colors.textMuted}
              value={instructions}
              onChangeText={setInstructions}
            />
          </View>

          {/* Dates */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <DatePicker
                label="Start Date *"
                value={startDate}
                onChange={setStartDate}
                error={errors.startDate}
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <DatePicker
                label="End Date (Optional)"
                value={endDate}
                onChange={setEndDate}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Personal Notes</Text>
            <TextInput
              style={[styles.input, { height: 70 }]}
              placeholder="Doctor remarks or warnings..."
              placeholderTextColor={Colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        {/* Schedules Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Dose Schedules</Text>
          <Text style={styles.sectionDesc}>
            Add times of the day when you need to take this medicine.
          </Text>

          <View style={styles.scheduleList}>
            {schedules.map((time, idx) => (
              <View key={idx} style={styles.scheduleItem}>
                <Ionicons name="alarm" size={20} color={Colors.primary} />
                <Text style={styles.scheduleTimeText}>{formatTime(time)}</Text>
                <TouchableOpacity
                  onPress={() => removeScheduleTime(time)}
                  style={styles.deleteScheduleBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addScheduleRow}>
            <View style={{ flex: 1 }}>
              <TimePicker
                label="Pick Schedule Time"
                value={newTime}
                onChange={setNewTime}
              />
            </View>
            <TouchableOpacity style={styles.addTimeBtn} onPress={addScheduleTime}>
              <Ionicons name="add" size={22} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton
          title="Save Medicine"
          loading={loading}
          onPress={handleSave}
          style={styles.saveBtn}
        />
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
    paddingBottom: Spacing.xxl,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unitRow: {
    flexDirection: 'row',
  },
  unitPill: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F1F5F9',
    marginRight: 4,
  },
  unitPillActive: {
    backgroundColor: Colors.primaryLight,
  },
  unitText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  unitTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  pillsScroll: {
    flexDirection: 'row',
  },
  typePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  typePillActive: {
    backgroundColor: Colors.primary,
  },
  typeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  scheduleList: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  scheduleTimeText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  deleteScheduleBtn: {
    padding: 6,
  },
  addScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addTimeBtn: {
    backgroundColor: Colors.primary,
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveBtn: {
    marginTop: Spacing.sm,
  },
});
