import React, { useState, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MedicineService } from '../../../services/medicine.service';
import { Medicine } from '../../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../../components/AppHeader';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { DatePicker } from '../../../components/DatePicker';
import { NotificationService } from '../../../utils/notifications';
import { TimePicker } from '../../../components/TimePicker';
import { LoadingState } from '../../../components/LoadingState';

export default function EditMedicineScreen() {

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dosage, setDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [medicineType, setMedicineType] = useState('Tablet');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Schedule States
  const [existingSchedules, setExistingSchedules] = useState<any[]>([]);
  const [newSchedules, setNewSchedules] = useState<string[]>([]);
  const [deletedScheduleIds, setDeletedScheduleIds] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('08:00');

  useEffect(() => {
    if (!id) return;
    MedicineService.getMedicineById(id)
      .then((med: Medicine) => {
        setName(med.name);
        setGenericName(med.generic_name || '');
        setDosage(med.dosage);
        setDosageUnit(med.dosage_unit);
        setMedicineType(med.medicine_type);
        setInstructions(med.instructions || '');
        setStartDate(med.start_date.split('T')[0]);
        setEndDate(med.end_date ? med.end_date.split('T')[0] : '');
        setNotes(med.notes || '');
        setExistingSchedules(med.schedules || []);
      })
      .catch((e) => Alert.alert('Error', e.message || 'Failed to load medicine'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    if (!name.trim() || !dosage.trim()) {
      Alert.alert('Validation Error', 'Name and dosage are required.');
      return;
    }
    
    // Validate we have at least one schedule left
    if (existingSchedules.length - deletedScheduleIds.length + newSchedules.length === 0) {
      Alert.alert('Required', 'A medicine must have at least one scheduled time.');
      return;
    }

    setSaving(true);
    try {
      // 1. Update medicine details
      await MedicineService.updateMedicine(id!, {
        name: name.trim(),
        genericName: genericName.trim() || null,
        dosage: dosage.trim(),
        dosageUnit,
        medicineType,
        instructions: instructions.trim() || null,
        startDate,
        endDate: endDate || null,
        notes: notes.trim() || null,
      });

      // 2. Delete removed schedules
      for (const sId of deletedScheduleIds) {
        await MedicineService.deleteSchedule(sId);
        await NotificationService.cancelReminder(sId);
      }

      // 3. Add new schedules
      for (const time of newSchedules) {
        const sched = await MedicineService.addSchedule(id!, {
          scheduleTime: time,
          frequencyType: 'DAILY',
        });
        if (sched && sched.id) {
          await NotificationService.scheduleMedicineReminder(
            name.trim(),
            dosage.trim(),
            dosageUnit,
            time,
            sched.id,
            endDate
          );
        }
      }

      // 4. Update existing schedules' notifications with new medicine name/dosage
      for (const s of existingSchedules) {
        if (!deletedScheduleIds.includes(s.id)) {
          await NotificationService.cancelReminder(s.id);
          await NotificationService.scheduleMedicineReminder(
            name.trim(),
            dosage.trim(),
            dosageUnit,
            s.schedule_time,
            s.id,
            endDate
          );
        }
      }

      Alert.alert('Updated', 'Medicine updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Unable to update medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSchedule = () => {
    // Check if it already exists
    const existsInExisting = existingSchedules.find(s => {
      if (deletedScheduleIds.includes(s.id)) return false;
      const t = formatTime(s.schedule_time);
      const newT = formatTime(newTime);
      return t === newT || s.schedule_time.includes(newTime);
    });
    const existsInNew = newSchedules.includes(newTime);
    if (existsInExisting || existsInNew) {
      Alert.alert('Duplicate', 'This time is already scheduled.');
      return;
    }
    setNewSchedules([...newSchedules, newTime].sort());
  };

  const handleRemoveExisting = (scheduleId: string) => {
    setDeletedScheduleIds([...deletedScheduleIds, scheduleId]);
  };

  const handleRemoveNew = (time: string) => {
    setNewSchedules(newSchedules.filter(t => t !== time));
  };

  if (loading) {
    return <LoadingState message="Loading medicine details..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Edit Medicine" showBack={true} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medicine Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Generic Name</Text>
            <TextInput
              style={styles.input}
              value={genericName}
              onChangeText={setGenericName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { width: 100, marginLeft: Spacing.sm }]}>
              <Text style={styles.label}>Unit</Text>
              <TextInput
                style={styles.input}
                value={dosageUnit}
                onChangeText={setDosageUnit}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medicine Type</Text>
            <TextInput
              style={styles.input}
              value={medicineType}
              onChangeText={setMedicineType}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={styles.input}
              value={instructions}
              onChangeText={setInstructions}
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { height: 70 }]}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={[styles.label, { fontSize: 16, lineHeight: 24, marginBottom: 12, color: Colors.textPrimary }]}>Scheduled Times</Text>
          
          <View style={styles.scheduleList}>
            {existingSchedules.filter(s => !deletedScheduleIds.includes(s.id)).map(s => {
               // Format time
               const displayTime = formatTime(s.schedule_time);
               return (
                <View key={s.id} style={styles.scheduleItem}>
                  <Ionicons name="alarm" size={20} color={Colors.primary} />
                  <Text style={styles.scheduleTimeText}>{displayTime}</Text>
                  <TouchableOpacity onPress={() => handleRemoveExisting(s.id)}>
                    <Ionicons name="close-circle" size={24} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            })}
            
            {newSchedules.map((time, idx) => (
              <View key={`new-${idx}`} style={styles.scheduleItem}>
                <Ionicons name="alarm" size={20} color={Colors.success} />
                <Text style={styles.scheduleTimeText}>{formatTime(time)} (New)</Text>
                <TouchableOpacity onPress={() => handleRemoveNew(time)}>
                  <Ionicons name="close-circle" size={24} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={[styles.addScheduleRow, { alignItems: 'flex-end', gap: Spacing.sm }]}>
            <View style={{ flex: 1 }}>
              <TimePicker
                label="Pick Schedule Time"
                value={newTime}
                onChange={setNewTime}
              />
            </View>
            <TouchableOpacity style={[styles.addTimeBtn, { backgroundColor: Colors.primary, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }]} onPress={handleAddSchedule}>
              <Ionicons name="add" size={24} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton
          title="Save Changes"
          loading={saving}
          onPress={handleUpdate}
          style={{ marginTop: Spacing.sm }}
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
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
  },
  row: {
    flexDirection: 'row',
  },
  scheduleList: {
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scheduleTimeText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: Spacing.sm,
  },
  addScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  addTimeBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  addTimeBtnText: {
    ...Typography.button,
    color: Colors.primaryDark,
    fontSize: 14,
  },
});
