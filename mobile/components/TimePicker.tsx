import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface TimePickerProps {
  label: string;
  value: string; // HH:MM (24-hour format)
  onChange: (value: string) => void;
  error?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [timeInput, setTimeInput] = useState(value || '08:00');

  const presetTimes = [
    { label: '08:00 AM (Morning)', value: '08:00' },
    { label: '01:00 PM (Afternoon)', value: '13:00' },
    { label: '02:00 PM (Afternoon)', value: '14:00' },
    { label: '08:00 PM (Night)', value: '20:00' },
    { label: '09:00 PM (Night)', value: '21:00' },
  ];

  const handleSave = () => {
    let finalTime = timeInput.trim();
    // Auto-convert 12-hour AM/PM text into 24-hour format
    const match = finalTime.match(/^(\d{1,2}):(\d{2})\s*([PpAa][Mm])?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = match[2];
      const modifier = match[3] ? match[3].toLowerCase() : null;

      if (modifier === 'pm' && h < 12) h += 12;
      if (modifier === 'am' && h === 12) h = 0;
      
      finalTime = `${h.toString().padStart(2, '0')}:${m}`;
    }

    onChange(finalTime);
    setModalVisible(false);
  };

  const formatDisplay = (val: string) => {
    if (!val) return 'Select time';
    const parts = val.split(':');
    let hour = parseInt(parts[0], 10);
    const min = parts[1] || '00';
    if (isNaN(hour)) return val;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${min} ${ampm} (${val})`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputBox, !!error && styles.inputError]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="time-outline" size={18} color={Colors.primary} />
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {formatDisplay(value)}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Select Schedule Time</Text>
            <Text style={styles.hint}>Pick a common time or enter 24-hr HH:MM</Text>

            <View style={styles.presetWrap}>
              {presetTimes.map((preset) => (
                <TouchableOpacity
                  key={preset.value}
                  style={[
                    styles.presetPill,
                    timeInput === preset.value && styles.presetActive,
                  ]}
                  onPress={() => setTimeInput(preset.value)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      timeInput === preset.value && styles.presetTextActive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.textInput}
              value={timeInput}
              onChangeText={setTimeInput}
              placeholder="08:00"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.btnRow}>
              <SecondaryButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                style={styles.modalBtn}
              />
              <PrimaryButton
                title="Done"
                onPress={handleSave}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  valueText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  dialogTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  hint: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  presetWrap: {
    gap: 6,
    marginBottom: Spacing.md,
  },
  presetPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  presetText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
  },
  presetTextActive: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
  },
});
