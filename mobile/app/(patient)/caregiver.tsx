import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { CaregiverService } from '../../services/caregiver.service';
import { CaregiverConnection, ConnectionCode } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { LoadingState } from '../../components/LoadingState';
import { Ionicons } from '@expo/vector-icons';

export default function PatientCaregiverScreen() {
  const [connections, setConnections] = useState<CaregiverConnection[]>([]);
  const [activeCode, setActiveCode] = useState<ConnectionCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await CaregiverService.getConnections();
      setConnections(data);
    } catch (err: any) {
      console.warn('Failed to load caregiver connections:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const codeRecord = await CaregiverService.generateCode();
      setActiveCode(codeRecord);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate code.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (connectionId: string) => {
    try {
      await CaregiverService.approveConnection(connectionId);
      Alert.alert('Approved', 'Caregiver connected successfully!');
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Approval failed');
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await CaregiverService.rejectConnection(connectionId);
      loadData();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Reject failed');
    }
  };

  const handleRemove = async (connectionId: string) => {
    Alert.alert(
      'Remove Caregiver',
      'Are you sure you want to disconnect this caregiver? They will no longer be able to monitor your medication status.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await CaregiverService.removeConnection(connectionId);
              loadData();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to remove caregiver');
            }
          },
        },
      ]
    );
  };

  const pendingRequests = connections.filter((c) => c.status === 'PENDING');
  const activeCaregivers = connections.filter((c) => c.status === 'ACTIVE');

  if (loading && !refreshing) {
    return <LoadingState message="Loading caregiver data..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Caregivers</Text>
        <Text style={styles.subtitle}>Connect trusted caregivers to assist your routine</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Generate Code Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="key" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Share Connection Code</Text>
              <Text style={styles.cardDesc}>
                Provide this temporary code to your caregiver to allow them to link accounts.
              </Text>
            </View>
          </View>

          {activeCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{activeCode.code}</Text>
              <Text style={styles.codeExpiry}>
                Expires: {new Date(activeCode.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ) : null}

          <PrimaryButton
            title={activeCode ? 'Generate New Code' : 'Generate Connection Code'}
            loading={generating}
            onPress={handleGenerateCode}
            style={styles.generateBtn}
          />
        </View>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Connection Requests ({pendingRequests.length})</Text>
            {pendingRequests.map((req) => (
              <View key={req.id} style={styles.requestItem}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {req.caregiver?.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.reqInfo}>
                  <Text style={styles.reqName}>{req.caregiver?.name}</Text>
                  <Text style={styles.reqEmail}>{req.caregiver?.email}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.approveBtn]}
                    onPress={() => handleApprove(req.id)}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, styles.rejectBtn]}
                    onPress={() => handleReject(req.id)}
                  >
                    <Ionicons name="close" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Active Connected Caregivers */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>
            Connected Caregivers ({activeCaregivers.length})
          </Text>

          {activeCaregivers.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="people-outline" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No connected caregivers</Text>
              <Text style={styles.emptyDesc}>
                Generate a code above and share it with your caregiver to connect.
              </Text>
            </View>
          ) : (
            activeCaregivers.map((conn) => (
              <View key={conn.id} style={styles.connectedItem}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {conn.caregiver?.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.reqInfo}>
                  <Text style={styles.reqName}>{conn.caregiver?.name}</Text>
                  <Text style={styles.reqEmail}>{conn.caregiver?.email}</Text>
                  {conn.caregiver?.phone && (
                    <Text style={styles.reqPhone}>📞 {conn.caregiver.phone}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.disconnectBtn}
                  onPress={() => handleRemove(conn.id)}
                >
                  <Ionicons name="person-remove-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
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
  scroll: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
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
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  cardDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  codeBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  codeText: {
    ...Typography.h1,
    fontSize: 32,
    color: Colors.primary,
    letterSpacing: 4,
    fontWeight: '800',
  },
  codeExpiry: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  generateBtn: {
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.secondary,
  },
  reqInfo: {
    flex: 1,
  },
  reqName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reqEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  reqPhone: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  approveBtn: {
    backgroundColor: Colors.primary,
  },
  approveBtnText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: '#F1F5F9',
  },
  connectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: Spacing.sm,
  },
  disconnectBtn: {
    padding: 8,
  },
  emptyWrap: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  emptyDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
