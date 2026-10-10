import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../store/authContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextInputField } from '../../components/TextInputField';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

// Validation schema matching project specifications
const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must contain at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const user = await login(data.email, data.password);

      // Role-based routing foundation
      if (user.role === 'PATIENT') {
        router.replace('/(patient)/home');
      } else if (user.role === 'CAREGIVER') {
        router.replace('/(caregiver)/home');
      } else {
        router.replace('/(patient)/home');
      }
    } catch (err: any) {
      setServerError(
        err.message || 'Unable to sign in. Please verify your network and credentials.'
      );
    }
  };

  const handlePlaceholderAction = (featureName: string) => {
    Alert.alert(
      featureName,
      `${featureName} is coming soon in an upcoming phase of MediCircle.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="medical" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.brandTitle}>MediCircle</Text>
            <Text style={styles.screenTitle}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to MediCircle</Text>
          </View>

          {/* Top API/Network Error Display */}
          <ErrorMessage message={serverError} />

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={(val) => {
                    onChange(val);
                    if (serverError) setServerError(null);
                  }}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  iconName="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isSubmitting}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInputField
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={(val) => {
                    onChange(val);
                    if (serverError) setServerError(null);
                  }}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  iconName="lock-closed-outline"
                  isPassword
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
              )}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => handlePlaceholderAction('Forgot Password')}
              disabled={isSubmitting}
              accessibilityRole="button"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <PrimaryButton
              title="Login"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.loginButton}
            />

            {/* Create Account Link */}
            <View style={styles.createAccountRow}>
              <Text style={styles.noAccountText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                disabled={isSubmitting}
                accessibilityRole="button"
              >
                <Text style={styles.createAccountLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#EFF6FF', // Blue 50
    borderWidth: 1.5,
    borderColor: '#DBEAFE', // Blue 100
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A', // Slate 900
    marginBottom: 6,
  },
  subtitle: {
    ...Typography.body,
    color: '#64748B', // Slate 500
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Slate 200
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  forgotPasswordText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    minHeight: 50,
  },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    ...Typography.bodySmall,
    color: '#64748B',
  },
  createAccountLink: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
  },
});
