import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CaregiverService } from '../../services/caregiver.service';
import { User, CaregiverConnection } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingState } from '../../components/LoadingState';
import { Ionicons } from '@expo/vector-icons';

export default function CaregiverPatientsScreen() {
  const router = useRouter();

  const [connections, setConnections] = useState<CaregiverConnection[]>([]);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConnections = useCallback(async () => {
    try {
      const data = await CaregiverService.getConnections();
      setConnections(data);
    } catch (e) {
      console.warn('Failed to load connections:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const onRefresh = () => {
    setRefreshing(true);
    loadConnections();
  };

  const handleConnectCode = async () => {
    if (!code.trim()) {
      Alert.alert('Required', 'Please enter a connection code.');
      return;
    }

    setSubmitting(true);
    try {
      await CaregiverService.connectWithCode(code.trim().toUpperCase());
      setCode('');
      Alert.alert(
        'Request Sent',
        'Connection request sent to patient! They will need to approve it on their screen.'
      );
      loadConnections();
    } catch (err: any) {
      Alert.alert('Connection Failed', err.message || 'Unable to connect with code');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return <LoadingState message="Loading patients..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients & Connections</Text>
        <Text style={styles.subtitle}>Enter a code to connect with a patient</Text>
      </View>

      <FlatList
        data={connections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.codeCard}>
            <Text style={styles.codeTitle}>Connect to a New Patient</Text>
            <Text style={styles.codeDesc}>
              Enter the 5-character connection code generated on the patient's device (e.g. MC-8F4K2).
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="MC-XXXXX"
                placeholderTextColor={Colors.textMuted}
                value={code}
                onChangeText={(val) => setCode(val.toUpperCase())}
                autoCapitalize="characters"
              />
              <PrimaryButton
                title="Connect"
                loading={submitting}
                onPress={handleConnectCode}
                style={styles.connectBtn}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.connItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.patient?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.patient?.name}</Text>
              <Text style={styles.email}>{item.patient?.email}</Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'ACTIVE'
                      ? styles.badgeActive
                      : item.status === 'PENDING'
                      ? styles.badgePending
                      : styles.badgeOther,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'ACTIVE'
                        ? styles.textActive
                        : item.status === 'PENDING'
                        ? styles.textPending
                        : styles.textOther,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>

            {item.status === 'ACTIVE' && (
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() =>
                  router.push({
                    pathname: '/(caregiver)/patient/[id]',
                    params: { id: item.patient_id },
                  })
                }
              >
                <Text style={styles.viewBtnText}>View</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.secondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
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
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  list: {
    padding: Spacing.md,
  },
  codeCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  codeTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  codeDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    ...Typography.h3,
    color: Colors.textPrimary,
    backgroundColor: '#F8FAFC',
    letterSpacing: 2,
  },
  connectBtn: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.lg,
  },
  connItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.secondary,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  email: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statusRow: {
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  badgeActive: { backgroundColor: Colors.takenLight },
  badgePending: { backgroundColor: Colors.pendingLight },
  badgeOther: { backgroundColor: '#F1F5F9' },
  statusText: { fontSize: 10, fontWeight: '700' },
  textActive: { color: Colors.taken },
  textPending: { color: '#B45309' },
  textOther: { color: Colors.textMuted },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 2,
  },
  viewBtnText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.secondary,
  },
});
