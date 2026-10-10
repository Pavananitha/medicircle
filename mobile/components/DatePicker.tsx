import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface DatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [dateInput, setDateInput] = useState(value || new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    onChange(dateInput);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputBox, !!error && styles.inputError]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value || 'Select date (YYYY-MM-DD)'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Select Date</Text>
            <Text style={styles.hint}>Enter date in format: YYYY-MM-DD</Text>
            <TextInput
              style={styles.textInput}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="2026-09-29"
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
