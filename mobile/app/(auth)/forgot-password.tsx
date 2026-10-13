import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AuthService } from '../../services/auth.service';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Step 1 = Request Code, Step 2 = Enter Code & New Password, Step 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Step 1: Send OTP
  const handleRequestOtp = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(email.trim());
      if (res.otp) {
        setDevOtp(res.otp);
      } else {
        setDevOtp(null);
      }
      setCode('');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async () => {
    setError(null);
    if (!code.trim() || code.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(email.trim(), code.trim(), newPassword);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
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
          {/* Back Button */}
          {step !== 3 && (
            <TouchableOpacity
              onPress={() => (step === 2 ? setStep(1) : router.back())}
              style={styles.backBtn}
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}

          <View style={styles.content}>
            {/* Header Icon */}
            <View style={styles.iconCircle}>
              <Ionicons
                name={step === 3 ? 'checkmark-circle' : step === 2 ? 'lock-closed-outline' : 'key-outline'}
                size={36}
                color={step === 3 ? Colors.success : Colors.primary}
              />
            </View>

            {/* Step Titles */}
            <Text style={styles.title}>
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Reset Password'}
              {step === 3 && 'Password Reset!'}
            </Text>

            <Text style={styles.subtitle}>
              {step === 1 && 'Enter your registered email address and we will send you a 6-digit verification code.'}
              {step === 2 && `Enter the 6-digit verification code and your new password for ${email}.`}
              {step === 3 && 'Your password has been successfully updated. You can now sign in with your new password.'}
            </Text>

            {/* Error Banner */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Step 1: Email Form */}
            {step === 1 && (
              <View style={styles.form}>
                <View style={styles.inputWrap}>
                  <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (error) setError(null);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>

                <PrimaryButton
                  title="Send Verification Code"
                  loading={loading}
                  onPress={handleRequestOtp}
                  style={styles.actionBtn}
                />
              </View>
            )}

            {/* Step 2: OTP + New Password Form */}
            {step === 2 && (
              <View style={styles.form}>
                {/* Dev OTP helper banner or Email Sent Notice */}
                {devOtp ? (
                  <View style={styles.otpBanner}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.otpBannerTitle}>Demo Mode - Verification Code:</Text>
                      <Text style={styles.otpBannerCode}>{devOtp}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setCode(devOtp)}
                      style={{
                        backgroundColor: Colors.primary,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Auto-Fill</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.otpBanner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    <Ionicons name="mail-open-outline" size={22} color="#16A34A" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.otpBannerTitle, { color: '#15803D' }]}>Code Sent to Email</Text>
                      <Text style={{ fontSize: 13, color: '#166534', marginTop: 2 }}>
                        Please check your inbox (and spam folder) for {email}.
                      </Text>
                    </View>
                  </View>
                )}

                {/* 6-digit OTP code */}
                <View style={styles.inputWrap}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="6-digit verification code"
                    placeholderTextColor={Colors.textMuted}
                    value={code}
                    onChangeText={(val) => {
                      setCode(val);
                      if (error) setError(null);
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                {/* New Password */}
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="New password (min 6 characters)"
                    placeholderTextColor={Colors.textMuted}
                    value={newPassword}
                    onChangeText={(val) => {
                      setNewPassword(val);
                      if (error) setError(null);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={Colors.textMuted}
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (error) setError(null);
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <PrimaryButton
                  title="Reset Password"
                  loading={loading}
                  onPress={handleResetPassword}
                  style={styles.actionBtn}
                />

                <TouchableOpacity
                  onPress={() => setStep(1)}
                  style={styles.resendBtn}
                >
                  <Text style={styles.resendText}>Change email or request new code</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 3: Success Screen */}
            {step === 3 && (
              <View style={styles.form}>
                <PrimaryButton
                  title="Back to Sign In"
                  onPress={() => router.replace('/(auth)/login')}
                  style={styles.actionBtn}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  backBtn: {
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#B91C1C',
    flex: 1,
  },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    width: '100%',
    marginBottom: Spacing.xs,
  },
  otpBannerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  otpBannerCode: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
    color: Colors.primary,
    marginTop: 2,
  },
  form: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    height: 50,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  actionBtn: {
    marginTop: Spacing.xs,
    minHeight: 50,
  },
  resendBtn: {
    alignSelf: 'center',
    paddingVertical: Spacing.xs,
  },
  resendText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
});
