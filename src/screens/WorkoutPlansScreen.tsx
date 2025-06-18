import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useTheme } from '../contexts/ThemeContext';
import { WorkoutPlan, RootStackParamList } from '../types';
import { database } from '../services/database';

type WorkoutPlansScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutPlans'>;

interface WorkoutPlanWithStats extends WorkoutPlan {
  workoutCount: number;
  lastWorkoutDate?: Date;
}

export default function WorkoutPlansScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<WorkoutPlansScreenNavigationProp>();
  const [plans, setPlans] = useState<WorkoutPlanWithStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');

  // Set up header with profile button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons 
            name="person-circle-outline" 
            size={28} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  useFocusEffect(
    React.useCallback(() => {
      loadPlans();
    }, [])
  );

  const loadPlans = async () => {
    try {
      await database.initialize();
      const workoutPlans = await database.getWorkoutPlans();
      
      // Get workout counts and last workout dates for each plan
      const plansWithStats = await Promise.all(
        workoutPlans.map(async (plan) => {
          const sessions = await database.getWorkoutSessions(plan.id, 1000);
          const lastWorkout = sessions.length > 0 ? sessions[0].date : undefined;
          
          return {
            ...plan,
            workoutCount: sessions.length,
            lastWorkoutDate: lastWorkout,
          };
        })
      );
      
      setPlans(plansWithStats);
    } catch (error) {
      console.error('Error loading plans:', error);
      Alert.alert('Error', 'Failed to load workout plans');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) {
      Alert.alert('Error', 'Plan name is required');
      return;
    }

    try {
      const newPlan: WorkoutPlan = {
        id: Date.now().toString(),
        name: newPlanName.trim(),
        description: newPlanDescription.trim() || undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await database.createWorkoutPlan(newPlan);
      setShowCreateModal(false);
      setNewPlanName('');
      setNewPlanDescription('');
      await loadPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
      Alert.alert('Error', 'Failed to create workout plan');
    }
  };

  const handleDeletePlan = (plan: WorkoutPlanWithStats) => {
    if (plan.id === 'default') {
      Alert.alert('Cannot Delete', 'The default workout plan cannot be deleted.');
      return;
    }

    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${plan.name}"? All workouts in this plan will be moved to "My Workouts".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.deleteWorkoutPlan(plan.id);
              await loadPlans();
            } catch (error) {
              console.error('Error deleting plan:', error);
              Alert.alert('Error', 'Failed to delete workout plan');
            }
          },
        },
      ]
    );
  };

  const formatLastWorkout = (date?: Date) => {
    if (!date) return 'No workouts yet';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const diffTime = Math.abs(today.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    }
  };

  const handlePlanSelect = async (plan: WorkoutPlanWithStats) => {
    try {
      await database.setLastSelectedPlan(plan.id);
      navigation.navigate('Workouts', { planId: plan.id, planName: plan.name });
    } catch (error) {
      console.error('Error saving last selected plan:', error);
      // Still navigate even if saving fails
      navigation.navigate('Workouts', { planId: plan.id, planName: plan.name });
    }
  };

  const renderPlanItem = ({ item }: { item: WorkoutPlanWithStats }) => (
    <TouchableOpacity 
      style={[styles.planItem, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
      onPress={() => handlePlanSelect(item)}
      onLongPress={() => handleDeletePlan(item)}
    >
      <View style={styles.planHeader}>
        <View style={styles.planTitleContainer}>
          <Text style={[styles.planTitle, { color: theme.colors.text }]}>
            📋 {item.name}
          </Text>
          <View style={styles.planMeta}>
            <View style={[styles.workoutTag, { backgroundColor: theme.colors.accent + '20' }]}>
              <Text style={[styles.workoutTagText, { color: theme.colors.accent }]}>
                {item.workoutCount} workouts
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.planDetails}>
        {item.description && (
          <Text style={[styles.planDescription, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
        )}
        <Text style={[styles.lastWorkout, { color: theme.colors.textSecondary }]}>
          Last workout: {formatLastWorkout(item.lastWorkoutDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="folder-outline" 
        size={80} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No workout plans yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Tap the + button to create your first workout plan
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={plans}
        renderItem={renderPlanItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Plan Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                setNewPlanName('');
                setNewPlanDescription('');
              }}
            >
              <Text style={[styles.modalCancel, { color: theme.colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>New Plan</Text>
            <TouchableOpacity onPress={handleCreatePlan}>
              <Text style={[styles.modalSave, { color: theme.colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Plan Name</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={newPlanName}
                onChangeText={setNewPlanName}
                placeholder="e.g., Push/Pull/Legs"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={newPlanDescription}
                onChangeText={setNewPlanDescription}
                placeholder="Describe your workout plan..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  addButton: {
    padding: 8,
  },
  profileButton: {
    padding: 8,
    marginRight: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  planItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  planHeader: {
    marginBottom: 8,
  },
  planTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workoutTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planDetails: {
    gap: 4,
  },
  planDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  lastWorkout: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E7',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalCancel: {
    fontSize: 17,
  },
  modalSave: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
  },
});