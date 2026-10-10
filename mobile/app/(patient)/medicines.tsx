import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MedicineService } from '../../services/medicine.service';
import { NotificationService } from '../../utils/notifications';
import { Medicine } from '../../types';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { MedicineCard } from '../../components/MedicineCard';
import { LoadingState } from '../../components/LoadingState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { Ionicons } from '@expo/vector-icons';

export default function MedicinesScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  const loadMedicines = useCallback(async () => {
    try {
      const data = await MedicineService.getMedicines();
      setMedicines(data);
    } catch (err: any) {
      console.warn('Failed to load medicines:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [loadMedicines])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMedicines();
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      // Find the medicine to get its schedules
      const medToDelete = medicines.find(m => m.id === deleteTargetId);
      if (medToDelete && medToDelete.schedules) {
        for (const s of medToDelete.schedules) {
          await NotificationService.cancelReminder(s.id);
        }
      }
      
      await MedicineService.deleteMedicine(deleteTargetId);
      setDeleteTargetId(null);
      loadMedicines();
    } catch (err: any) {
      Alert.alert('Delete Failed', err.message || 'Unable to delete medicine.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !refreshing) {
    return <LoadingState message="Loading your medicine list..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Medicines</Text>
          <Text style={styles.subtitle}>{medicines.length} medications configured</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(patient)/medicine/add')}
        >
          <Ionicons name="add" size={20} color={Colors.textInverse} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <MedicineCard
            medicine={item}
            onPress={() => router.push(`/(patient)/medicine/${item.id}`)}
            onEdit={() => router.push({ pathname: '/(patient)/medicine/edit', params: { id: item.id } })}
            onDelete={() => setDeleteTargetId(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="medical-outline" size={40} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No medicines added yet</Text>
            <Text style={styles.emptyDesc}>
              Keep all your prescriptions organized with automated daily alarms.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => router.push('/(patient)/medicine/add')}
            >
              <Text style={styles.emptyAddBtnText}>+ Add First Medicine</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ConfirmationModal
        visible={!!deleteTargetId}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine and all its active schedules? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
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
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addBtnText: {
    ...Typography.button,
    fontSize: 14,
    color: Colors.textInverse,
  },
  list: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  emptyAddBtn: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.md,
  },
  emptyAddBtnText: {
    ...Typography.bodySmall,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
});
