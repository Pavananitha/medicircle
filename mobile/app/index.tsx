import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../store/authContext';
import { Colors, Spacing, Typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function IndexSplash() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/(auth)/login');
      } else if (user.role === 'PATIENT') {
        router.replace('/(patient)/home');
      } else if (user.role === 'CAREGIVER') {
        router.replace('/(caregiver)/home');
      } else {
        router.replace('/(patient)/home');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        <View style={styles.logoCircle}>
          <Ionicons name="medical" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.appName}>MediCircle</Text>
        <Text style={styles.tagline}>Smart Medicine Reminder</Text>
        <Text style={styles.andSign}>&</Text>
        <Text style={styles.tagline}>Caregiver Management System</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading MediCircle...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxl * 1.5,
    paddingHorizontal: Spacing.lg,
  },
  centerBox: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    ...Typography.h1,
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.body,
    color: '#94A3B8',
    textAlign: 'center',
  },
  andSign: {
    ...Typography.bodySmall,
    color: Colors.primaryLight,
    marginVertical: 2,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    ...Typography.caption,
    color: '#64748B',
  },
});
