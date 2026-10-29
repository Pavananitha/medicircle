import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { NotificationService } from '../../utils/notifications';
import { useAuth } from '../../store/authContext';
import { MedicineService } from '../../services/medicine.service';

export default function PatientTabsLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
      return;
    }

    if (user) {
      // Register for push notifications with server
      NotificationService.registerForPushNotifications().then(async (token) => {
        if (token) {
          try {
            const { NotificationApiService } = require('../../services/adherence.service');
            const { Platform } = require('react-native');
            const platform = Platform.OS === 'ios' ? 'IOS' : Platform.OS === 'android' ? 'ANDROID' : 'WEB';
            await NotificationApiService.registerDevice(token, platform);
          } catch (err) {
            console.warn('Failed to register push device with server:', err);
          }
        }
      });

      // Synchronize and cancel any expired or deleted medicine alarms
      MedicineService.getMedicines()
        .then((medicines) => {
          NotificationService.syncMedicineNotifications(medicines);
        })
        .catch((e) => console.warn('Failed to sync medicine notifications:', e));
    }
  }, [user, isLoading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
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
        name="medicines"
        options={{
          title: 'Medicines',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="caregiver"
        options={{
          title: 'Caregivers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
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
      {/* Hide child medicine stack routes from tab bar */}
      <Tabs.Screen name="medicine/add" options={{ href: null }} />
      <Tabs.Screen name="medicine/[id]" options={{ href: null }} />
      <Tabs.Screen name="medicine/edit" options={{ href: null }} />
    </Tabs>
  );
}
