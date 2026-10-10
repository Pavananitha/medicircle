import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

interface ErrorMessageProps {
  message?: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={20} color={Colors.danger} style={styles.icon} />
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2', // Red 50
    borderWidth: 1,
    borderColor: '#FECACA', // Red 200
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  messageText: {
    flex: 1,
    ...Typography.bodySmall,
    color: '#991B1B', // Red 800
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default ErrorMessage;
