import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { WorkoutSet } from '../types';

interface ExerciseGroup {
  id: string;
  name: string;
  emoji: string;
  equipment?: string;
  targetReps?: number;
  sets: ManualSet[];
  isCollapsed: boolean;
}

interface ManualSet {
  id: string;
  setNumber: number;
  weight: string;
  reps: string;
  rir: string; // Reps in Reserve
  tenRM: string; // 10 Rep Max
  isCompleted: boolean;
}

interface Props {
  exercises: ExerciseGroup[];
  onUpdateExercises: (exercises: ExerciseGroup[]) => void;
  onAddExercise: () => void;
}

export default function ManualWorkoutTable({ exercises, onUpdateExercises, onAddExercise }: Props) {
  const { theme } = useTheme();

  const toggleExerciseCollapse = (exerciseId: string) => {
    const updatedExercises = exercises.map(exercise =>
      exercise.id === exerciseId
        ? { ...exercise, isCollapsed: !exercise.isCollapsed }
        : exercise
    );
    onUpdateExercises(updatedExercises);
  };

  const updateSetValue = (exerciseId: string, setId: string, field: keyof ManualSet, value: string | boolean) => {
    const updatedExercises = exercises.map(exercise =>
      exercise.id === exerciseId
        ? {
            ...exercise,
            sets: exercise.sets.map(set =>
              set.id === setId ? { ...set, [field]: value } : set
            ),
          }
        : exercise
    );
    onUpdateExercises(updatedExercises);
  };

  const addSetToExercise = (exerciseId: string) => {
    const updatedExercises = exercises.map(exercise =>
      exercise.id === exerciseId
        ? {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: Date.now().toString(),
                setNumber: exercise.sets.length + 1,
                weight: '',
                reps: '',
                rir: '',
                tenRM: '',
                isCompleted: false,
              },
            ],
          }
        : exercise
    );
    onUpdateExercises(updatedExercises);
  };

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.headerCell, styles.setCell, { color: theme.colors.textSecondary }]}>#</Text>
      <Text style={[styles.headerCell, styles.weightCell, { color: theme.colors.textSecondary }]}>Kg</Text>
      <Text style={[styles.headerCell, styles.repsCell, { color: theme.colors.textSecondary }]}>Reps</Text>
      <Text style={[styles.headerCell, styles.rirCell, { color: theme.colors.textSecondary }]}>RIR</Text>
      <Text style={[styles.headerCell, styles.tenRMCell, { color: theme.colors.textSecondary }]}>10RM</Text>
    </View>
  );

  const renderSetRow = (set: ManualSet, exerciseId: string) => (
    <View key={set.id} style={[styles.setRow, { borderBottomColor: theme.colors.border }]}>
      <View style={[styles.setCell, styles.setNumberContainer]}>
        <TouchableOpacity
          style={[
            styles.completionButton,
            {
              backgroundColor: set.isCompleted ? theme.colors.accent : 'transparent',
              borderColor: set.isCompleted ? theme.colors.accent : theme.colors.border,
            },
          ]}
          onPress={() => updateSetValue(exerciseId, set.id, 'isCompleted', !set.isCompleted)}
        >
          {set.isCompleted && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </TouchableOpacity>
        <Text style={[styles.setNumber, { color: theme.colors.text }]}>{set.setNumber}</Text>
      </View>

      <TextInput
        style={[
          styles.tableInput,
          styles.weightCell,
          {
            color: theme.colors.text,
            backgroundColor: theme.isDark ? '#3C3C3E' : '#F8F8F8',
            borderColor: theme.colors.border,
          },
        ]}
        value={set.weight}
        onChangeText={(text) => updateSetValue(exerciseId, set.id, 'weight', text)}
        placeholder="80"
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType="numeric"
      />

      <TextInput
        style={[
          styles.tableInput,
          styles.repsCell,
          {
            color: theme.colors.text,
            backgroundColor: theme.isDark ? '#3C3C3E' : '#F8F8F8',
            borderColor: theme.colors.border,
          },
        ]}
        value={set.reps}
        onChangeText={(text) => updateSetValue(exerciseId, set.id, 'reps', text)}
        placeholder="10"
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType="numeric"
      />

      <TextInput
        style={[
          styles.tableInput,
          styles.rirCell,
          {
            color: theme.colors.text,
            backgroundColor: theme.isDark ? '#3C3C3E' : '#F8F8F8',
            borderColor: theme.colors.border,
          },
        ]}
        value={set.rir}
        onChangeText={(text) => updateSetValue(exerciseId, set.id, 'rir', text)}
        placeholder="2"
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType="numeric"
      />

      <View style={[styles.tenRMCell, styles.tenRMContainer]}>
        <Text style={[styles.tenRMText, { color: theme.colors.textSecondary }]}>
          {set.weight && set.reps && set.rir ? 
            Math.round(parseFloat(set.weight) * (1 + (parseFloat(set.reps) + parseFloat(set.rir)) / 30)).toString() : 
            '-'
          }
        </Text>
      </View>
    </View>
  );

  const renderExercise = (exercise: ExerciseGroup) => (
    <View key={exercise.id} style={styles.exerciseContainer}>
      <TouchableOpacity
        style={[styles.exerciseHeader, { borderBottomColor: theme.colors.border }]}
        onPress={() => toggleExerciseCollapse(exercise.id)}
      >
        <View style={styles.exerciseHeaderLeft}>
          <Ionicons
            name={exercise.isCollapsed ? 'chevron-forward' : 'chevron-down'}
            size={20}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
            {exercise.emoji} {exercise.name}
          </Text>
          <Ionicons name="repeat" size={16} color={theme.colors.textSecondary} />
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {!exercise.isCollapsed && (
        <>
          {exercise.equipment && (
            <View style={styles.tagsContainer}>
              <View style={[styles.equipmentTag, { backgroundColor: '#D4A574' + '20' }]}>
                <Text style={[styles.tagText, { color: '#D4A574' }]}>
                  🔗 {exercise.equipment}
                </Text>
              </View>
              {exercise.targetReps && (
                <View style={[styles.targetTag, { backgroundColor: theme.colors.accent + '20' }]}>
                  <Text style={[styles.tagText, { color: theme.colors.accent }]}>
                    🎯 {exercise.targetReps} reps
                  </Text>
                </View>
              )}
            </View>
          )}

          {renderTableHeader()}
          
          {exercise.sets.map((set) => renderSetRow(set, exercise.id))}

          <TouchableOpacity
            style={styles.addSetButton}
            onPress={() => addSetToExercise(exercise.id)}
          >
            <Ionicons name="add" size={20} color={theme.colors.primary} />
            <Text style={[styles.addSetText, { color: theme.colors.primary }]}>
              Add Set
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {exercises.map(renderExercise)}
      
      <TouchableOpacity
        style={[styles.addExerciseButton, { borderColor: theme.colors.border }]}
        onPress={onAddExercise}
      >
        <Ionicons name="add" size={24} color={theme.colors.primary} />
        <Text style={[styles.addExerciseText, { color: theme.colors.primary }]}>
          Add Exercise
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exerciseContainer: {
    marginBottom: 24,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  equipmentTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  targetTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerCell: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  setCell: {
    width: 60,
    alignItems: 'center',
  },
  weightCell: {
    width: 80,
  },
  repsCell: {
    width: 80,
  },
  rirCell: {
    width: 80,
  },
  tenRMCell: {
    width: 80,
  },
  setNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  tableInput: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 16,
    marginHorizontal: 4,
  },
  tenRMContainer: {
    alignItems: 'center',
  },
  tenRMText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addSetText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
    gap: 8,
  },
  addExerciseText: {
    fontSize: 18,
    fontWeight: '600',
  },
});