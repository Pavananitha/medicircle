import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';

interface SecondaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'outline' | 'ghost' | 'tint';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  loading = false,
  disabled = false,
  variant = 'outline',
  style,
  textStyle,
  icon,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getContainerStyle = () => {
    switch (variant) {
      case 'ghost':
        return styles.buttonGhost;
      case 'tint':
        return styles.buttonTint;
      case 'outline':
      default:
        return styles.buttonOutline;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return Colors.textMuted;
    switch (variant) {
      case 'tint':
        return Colors.primaryDark;
      case 'ghost':
      case 'outline':
      default:
        return Colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        getContainerStyle(),
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  buttonTint: {
    backgroundColor: Colors.primaryLight,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  text: {
    ...Typography.button,
  },
});
