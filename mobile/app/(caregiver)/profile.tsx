import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../store/authContext';
import { AuthService } from '../../services/auth.service';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';

export default function CaregiverProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyName, setEmergencyName] = useState(user?.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergency_contact_phone || '');
  const [dateOfBirth, setDateOfBirth] = useState((user?.date_of_birth && typeof user.date_of_birth === 'string') ? user.date_of_birth.substring(0, 10) : '');
  const [gender, setGender] = useState(user?.gender || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await AuthService.updateProfile({
        name,
        phone,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        emergencyContactName: emergencyName || null,
        emergencyContactPhone: emergencyPhone || null,
      });
      updateUser(updated);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Are you sure you want to log out of MediCircle?');
      if (confirm) {
        await logout();
        router.replace('/(auth)/login');
      }
      return;
    }
    
    Alert.alert('Log Out', 'Are you sure you want to log out of MediCircle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          style={styles.editBtn}
        >
          <Text style={styles.editBtnText}>{isEditing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header Information */}
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{user?.name || 'Caregiver'}</Text>
          <Text style={styles.userRole}>CAREGIVER ACCOUNT</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Personal Details</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            ) : (
              <Text style={styles.fieldValue}>{user?.name || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.phone || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
              />
            ) : (
              <Text style={styles.fieldValue}>{(user?.date_of_birth && typeof user.date_of_birth === 'string') ? user.date_of_birth.substring(0, 10) : 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={gender}
                onChangeText={setGender}
                placeholder="Male / Female / Other"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.gender || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.cardHeader}>Emergency Contact</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Contact Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={emergencyName}
                onChangeText={setEmergencyName}
              />
            ) : (
              <Text style={styles.fieldValue}>
                {user?.emergency_contact_name || 'None listed'}
              </Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Emergency Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {user?.emergency_contact_phone || 'None listed'}
              </Text>
            )}
          </View>
        </View>

        {/* Medical Disclaimer Banner */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} />
          <Text style={styles.disclaimerText}>
            MediCircle is a medication reminder and management application. It does not provide medical diagnosis, prescribe medication, or replace professional medical advice.
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  editBtnText: {
    ...Typography.button,
    fontSize: 14,
    color: Colors.primary,
  },
  scroll: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  headerInfo: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userName: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  userRole: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    marginVertical: 4,
  },
  userEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  fieldGroup: {
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.primaryDark,
    flex: 1,
    lineHeight: 18,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  logoutText: {
    ...Typography.button,
    color: Colors.danger,
    fontSize: 14,
  },
});
