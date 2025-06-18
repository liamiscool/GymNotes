import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useTheme } from '../contexts/ThemeContext';
import { WorkoutSession, RootStackParamList } from '../types';
import { database } from '../services/database';

type WorkoutsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Workouts'>;
type WorkoutsScreenRouteProp = RouteProp<RootStackParamList, 'Workouts'>;

export default function WorkoutsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<WorkoutsScreenNavigationProp>();
  const route = useRoute<WorkoutsScreenRouteProp>();
  const { planId, planName } = route.params;
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
      loadWorkouts();
    }, [planId])
  );

  const loadWorkouts = async () => {
    try {
      await database.initialize();
      const sessions = await database.getWorkoutSessions(planId);
      setWorkouts(sessions);
    } catch (error) {
      console.error('Error loading workouts:', error);
      Alert.alert('Error', 'Failed to load workouts');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderWorkoutItem = ({ item }: { item: WorkoutSession }) => (
    <TouchableOpacity 
      style={[styles.workoutItem, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
      onPress={() => navigation.navigate('WorkoutInput', { sessionId: item.id, planId })}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutTitleContainer}>
          <Text style={[styles.workoutTitle, { color: theme.colors.text }]}>
            💪 {formatDate(item.date)}
          </Text>
          <View style={styles.workoutMeta}>
            <View style={[styles.exerciseTag, { backgroundColor: theme.colors.accent + '20' }]}>
              <Text style={[styles.exerciseTagText, { color: theme.colors.accent }]}>
                {item.sets.length} exercises
              </Text>
            </View>
            {item.duration && (
              <Text style={[styles.workoutDuration, { color: theme.colors.textSecondary }]}>
                {Math.round(item.duration / 60)}min
              </Text>
            )}
          </View>
        </View>
        <Text style={[styles.workoutDate, { color: theme.colors.textSecondary }]}>
          {item.date.toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.exercisePreview}>
        {item.sets.slice(0, 2).map((set, index) => (
          <Text key={set.id} style={[styles.exercisePreviewText, { color: theme.colors.textSecondary }]}>
            {set.exercise} • {set.sets}×{set.reps}{set.weight && ` @ ${set.weight}kg`}
          </Text>
        ))}
        {item.sets.length > 2 && (
          <Text style={[styles.moreExercises, { color: theme.colors.textSecondary }]}>
            +{item.sets.length - 2} more...
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="fitness-outline" 
        size={80} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No workouts in {planName}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Tap the + button to start your first workout in this plan
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('WorkoutInput', { planId })}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        renderItem={renderWorkoutItem}
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
  workoutItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  workoutHeader: {
    marginBottom: 8,
  },
  workoutTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workoutTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exerciseTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  workoutDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  workoutDate: {
    fontSize: 13,
    fontWeight: '400',
  },
  exercisePreview: {
    gap: 2,
  },
  exercisePreviewText: {
    fontSize: 15,
    lineHeight: 20,
  },
  moreExercises: {
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 2,
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
});