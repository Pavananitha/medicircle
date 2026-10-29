import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/authContext';
import { NotificationService } from '../../utils/notifications';
import { Platform } from 'react-native';

export default function CaregiverTabsLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
      return;
    }

    if (user) {
      // Ensure no leftover patient local alarm reminders trigger on caregiver device
      NotificationService.cancelAllMedicineReminders();

      // Register caregiver device for push notifications
      NotificationService.registerForPushNotifications().then(async (token) => {
        if (token) {
          try {
            const { NotificationApiService } = require('../../services/adherence.service');
            const platform = Platform.OS === 'ios' ? 'IOS' : Platform.OS === 'android' ? 'ANDROID' : 'WEB';
            await NotificationApiService.registerDevice(token, platform);
          } catch (err) {
            console.warn('Failed to register caregiver device with server:', err);
          }
        }
      });
    }
  }, [user, isLoading]);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      {/* Hide child patient detail stack from tab bar */}
      <Tabs.Screen
        name="patient/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
