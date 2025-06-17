import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { useTheme } from '../../contexts/ThemeContext';
import { WorkoutSet, WorkoutSession, RootStackParamList } from '../../types';
import { database } from '../../services/database';
import { WorkoutParser } from '../../utils/workoutParser';
import ManualWorkoutTable from '../../components/ManualWorkoutTable';

type WorkoutInputRouteProp = RouteProp<RootStackParamList, 'WorkoutInput'>;

export default function WorkoutInputScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<WorkoutInputRouteProp>();
  const { sessionId } = route.params;

  const [input, setInput] = useState('');
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState<'chat' | 'manual'>('chat');
  const [manualExercises, setManualExercises] = useState<any[]>([]);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    initializeSession();
    // Initialize with some example exercises for demo
    setManualExercises([
      {
        id: '1',
        name: 'Incline Chest',
        emoji: '💪',
        equipment: 'Dumbbells',
        targetReps: 11,
        sets: [
          { id: '1-1', setNumber: 1, weight: '80', reps: '11', rir: '0', tenRM: '', isCompleted: true },
          { id: '1-2', setNumber: 2, weight: '80', reps: '9', rir: '2', tenRM: '', isCompleted: true },
          { id: '1-3', setNumber: 3, weight: '82', reps: '7', rir: '3', tenRM: '', isCompleted: false },
          { id: '1-4', setNumber: 4, weight: '', reps: '', rir: '', tenRM: '', isCompleted: false },
        ],
        isCollapsed: false,
      },
      {
        id: '2',
        name: 'Bench Press',
        emoji: '🏋️‍♂️',
        equipment: 'Barbell',
        targetReps: 8,
        sets: [
          { id: '2-1', setNumber: 1, weight: '82', reps: '7', rir: '3', tenRM: '', isCompleted: false },
        ],
        isCollapsed: false,
      },
    ]);
  }, [sessionId]);

  const initializeSession = async () => {
    try {
      await database.initialize();
      
      if (sessionId) {
        // Load existing session
        const sessions = await database.getWorkoutSessions(100);
        const existingSession = sessions.find(s => s.id === sessionId);
        if (existingSession) {
          setSession(existingSession);
          setSets(existingSession.sets);
        }
      } else {
        // Create new session
        const newSession: WorkoutSession = {
          id: Date.now().toString(),
          date: new Date(),
          sets: [],
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await database.createWorkoutSession(newSession);
        setSession(newSession);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      Alert.alert('Error', 'Failed to initialize workout session');
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || !session) return;

    setIsLoading(true);
    
    try {
      const parsed = WorkoutParser.parseInput(input.trim());
      
      if (!parsed) {
        Alert.alert(
          'Invalid Format',
          'Try formats like:\n• "3x10 bench press @60kg"\n• "squat 100x5 rpe 8"\n• "deadlift 3x5 @100kg felt easy"'
        );
        setIsLoading(false);
        return;
      }

      const newSet: WorkoutSet = {
        id: Date.now().toString(),
        timestamp: new Date(),
        ...WorkoutParser.createWorkoutSet(parsed),
      };

      await database.addWorkoutSet(newSet, session.id);
      setSets(prev => [...prev, newSet]);
      setInput('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error adding set:', error);
      Alert.alert('Error', 'Failed to add exercise');
    }
    
    setIsLoading(false);
  };

  const getExerciseEmoji = (exercise: string) => {
    const exerciseLower = exercise.toLowerCase();
    if (exerciseLower.includes('bench') || exerciseLower.includes('press')) return '🏋️‍♂️';
    if (exerciseLower.includes('squat')) return '🦵';
    if (exerciseLower.includes('deadlift')) return '💪';
    if (exerciseLower.includes('pull')) return '🤲';
    if (exerciseLower.includes('row')) return '🚣‍♂️';
    if (exerciseLower.includes('curl')) return '💪';
    return '🏃‍♂️';
  };

  const renderSetItem = ({ item, index }: { item: WorkoutSet; index: number }) => (
    <View style={styles.setItem}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseTitleRow}>
          <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
            {getExerciseEmoji(item.exercise)} {item.exercise}
          </Text>
          <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
            {item.timestamp.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        
        <View style={styles.setDetailsRow}>
          <View style={[styles.setTag, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.setTagText, { color: theme.colors.primary }]}>
              {item.sets} × {item.reps}
            </Text>
          </View>
          
          {item.weight && (
            <View style={[styles.weightTag, { backgroundColor: theme.colors.accent + '15' }]}>
              <Text style={[styles.weightTagText, { color: theme.colors.accent }]}>
                {item.weight}kg
              </Text>
            </View>
          )}
          
          {item.rpe && (
            <View style={[styles.rpeTag, { backgroundColor: '#34C759' + '15' }]}>
              <Text style={[styles.rpeTagText, { color: '#34C759' }]}>
                RPE {item.rpe}
              </Text>
            </View>
          )}
        </View>
        
        {item.notes && (
          <Text style={[styles.setNotes, { color: theme.colors.textSecondary }]}>
            💭 {item.notes}
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="chatbubble-outline" 
        size={60} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Start logging your workout
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Type exercises like "3x10 bench press @60kg"
      </Text>
    </View>
  );

  const handleAddExercise = () => {
    const newExercise = {
      id: Date.now().toString(),
      name: 'New Exercise',
      emoji: '🏃‍♂️',
      equipment: 'Barbell',
      targetReps: 8,
      sets: [
        {
          id: (Date.now() + 1).toString(),
          setNumber: 1,
          weight: '',
          reps: '',
          rir: '',
          tenRM: '',
          isCompleted: false,
        },
      ],
      isCollapsed: false,
    };
    setManualExercises([...manualExercises, newExercise]);
  };

  const renderModeToggle = () => (
    <View style={[styles.modeToggle, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          inputMode === 'chat' && { backgroundColor: theme.colors.primary },
        ]}
        onPress={() => setInputMode('chat')}
      >
        <Ionicons 
          name="chatbubble" 
          size={16} 
          color={inputMode === 'chat' ? 'white' : theme.colors.textSecondary} 
        />
        <Text
          style={[
            styles.modeButtonText,
            { color: inputMode === 'chat' ? 'white' : theme.colors.textSecondary },
          ]}
        >
          Chat
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.modeButton,
          inputMode === 'manual' && { backgroundColor: theme.colors.primary },
        ]}
        onPress={() => setInputMode('manual')}
      >
        <Ionicons 
          name="grid" 
          size={16} 
          color={inputMode === 'manual' ? 'white' : theme.colors.textSecondary} 
        />
        <Text
          style={[
            styles.modeButtonText,
            { color: inputMode === 'manual' ? 'white' : theme.colors.textSecondary },
          ]}
        >
          Table
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderModeToggle()}
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {inputMode === 'chat' ? (
          <FlatList
            ref={flatListRef}
            data={sets}
            renderItem={renderSetItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              if (sets.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
          />
        ) : (
          <ScrollView 
            style={styles.manualContainer}
            contentContainerStyle={styles.manualContent}
            showsVerticalScrollIndicator={false}
          >
            <ManualWorkoutTable
              exercises={manualExercises}
              onUpdateExercises={setManualExercises}
              onAddExercise={handleAddExercise}
            />
          </ScrollView>
        )}
        
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { 
              color: theme.colors.text,
              backgroundColor: theme.isDark ? '#2C2C2E' : '#F2F2F7'
            }]}
            value={input}
            onChangeText={setInput}
            placeholder="💪 3x10 bench press @60kg..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={200}
            onSubmitEditing={handleSubmit}
            blurOnSubmit={false}
            returnKeyType="send"
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              { 
                backgroundColor: input.trim() ? theme.colors.primary : theme.colors.border,
                opacity: isLoading ? 0.6 : 1,
              }
            ]}
            onPress={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={input.trim() ? 'white' : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    margin: 16,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  manualContainer: {
    flex: 1,
  },
  manualContent: {
    paddingBottom: 20,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  setItem: {
    marginBottom: 24,
  },
  exerciseHeader: {
    gap: 12,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.2,
  },
  timestamp: {
    fontSize: 13,
    fontWeight: '400',
  },
  setDetailsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  setTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  setTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weightTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  weightTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rpeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rpeTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  setNotes: {
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    gap: 12,
    borderTopWidth: 0.5,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    maxHeight: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});