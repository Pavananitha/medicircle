import React, { useState, useEffect } from 'react';
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

export const normalizeDateStr = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim();

  // Case 1: YYYY-MM-DD or YYYY/MM/DD
  const ymd = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) {
    const y = ymd[1];
    const m = ymd[2].padStart(2, '0');
    const d = ymd[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Case 2: DD-MM-YYYY or DD/MM/YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    let d = dmy[1].padStart(2, '0');
    let m = dmy[2].padStart(2, '0');
    const y = dmy[3];
    // If month > 12, user probably typed MM-DD-YYYY
    if (parseInt(m, 10) > 12 && parseInt(d, 10) <= 12) {
      const temp = d;
      d = m;
      m = temp;
    }
    return `${y}-${m}-${d}`;
  }

  return trimmed;
};

export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const norm = normalizeDateStr(dateStr);
  const parts = norm.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(y, m, d);
      target.setHours(0, 0, 0, 0);

      const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dateFormatted = `${days[date.getDay()]}, ${months[m]} ${d}, ${y}`;

      if (diffDays === 0) return `Today (${dateFormatted})`;
      if (diffDays === 1) return `Tomorrow (${dateFormatted})`;
      if (diffDays === -1) return `Yesterday (${dateFormatted})`;
      return dateFormatted;
    }
  }
  return dateStr;
};

const getRelativeDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [dateInput, setDateInput] = useState(value || getRelativeDateStr(0));

  useEffect(() => {
    if (value) {
      setDateInput(normalizeDateStr(value));
    }
  }, [value]);

  const openPicker = () => {
    setDateInput(normalizeDateStr(value) || getRelativeDateStr(0));
    setModalVisible(true);
  };

  const handleSave = () => {
    const clean = normalizeDateStr(dateInput);
    onChange(clean);
    setModalVisible(false);
  };

  const shiftDay = (days: number) => {
    const current = normalizeDateStr(dateInput) || getRelativeDateStr(0);
    const parts = current.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const targetDate = new Date(y, m, d);
      targetDate.setDate(targetDate.getDate() + days);
      const newY = targetDate.getFullYear();
      const newM = (targetDate.getMonth() + 1).toString().padStart(2, '0');
      const newD = targetDate.getDate().toString().padStart(2, '0');
      setDateInput(`${newY}-${newM}-${newD}`);
    }
  };

  const displayPreview = formatDisplayDate(dateInput);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputBox, !!error && styles.inputError]}
        onPress={openPicker}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value ? formatDisplayDate(value) : 'Select date'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Quick Preset Buttons */}
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => setDateInput(getRelativeDateStr(0))}
              >
                <Text style={styles.presetText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetBtn, styles.presetHighlight]}
                onPress={() => setDateInput(getRelativeDateStr(1))}
              >
                <Text style={[styles.presetText, styles.presetHighlightText]}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => setDateInput(getRelativeDateStr(7))}
              >
                <Text style={styles.presetText}>+7 Days</Text>
              </TouchableOpacity>
            </View>

            {/* Step Controls */}
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => shiftDay(-1)}>
                <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
                <Text style={styles.stepperText}>-1 Day</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.stepperBtn} onPress={() => shiftDay(1)}>
                <Text style={styles.stepperText}>+1 Day</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Manual Text Input */}
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Date (YYYY-MM-DD or DD-MM-YYYY):</Text>
              <TextInput
                style={styles.textInput}
                value={dateInput}
                onChangeText={setDateInput}
                placeholder="2026-11-01"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />
            </View>

            {/* Human Readable Preview */}
            {displayPreview ? (
              <View style={styles.previewBox}>
                <Ionicons name="time-outline" size={16} color={Colors.primary} />
                <Text style={styles.previewText} numberOfLines={1}>
                  {displayPreview}
                </Text>
              </View>
            ) : null}

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
    fontWeight: '500',
    flex: 1,
  },
  placeholderText: {
    color: Colors.textMuted,
    fontWeight: '400',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dialogTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetHighlight: {
    backgroundColor: '#E0F2FE',
    borderColor: Colors.primaryLight,
  },
  presetText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  presetHighlightText: {
    color: Colors.primaryDark,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: Spacing.md,
  },
  stepperBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  stepperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  inputWrap: {
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  previewText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    fontWeight: '700',
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
  },
});
