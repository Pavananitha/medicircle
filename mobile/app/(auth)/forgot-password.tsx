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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AuthService } from '../../services/auth.service';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleReset = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await AuthService.forgotPassword(email.trim());
      setMessage(res.message);
      setSubmitted(true);
    } catch (err: any) {
      setMessage(err.message || 'Failed to submit reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the email address registered with your MediCircle account.
          </Text>

          {submitted ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <Text style={styles.successText}>{message}</Text>
              <PrimaryButton
                title="Back to Sign In"
                onPress={() => router.replace('/(auth)/login')}
                style={{ marginTop: Spacing.lg }}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <PrimaryButton
                title="Send Instructions"
                loading={loading}
                onPress={handleReset}
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: Spacing.xl,
    flex: 1,
  },
  backBtn: {
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  content: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  form: {
    width: '100%',
    gap: Spacing.md,
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
  successBox: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  successText: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
});
