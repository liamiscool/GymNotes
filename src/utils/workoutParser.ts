import { WorkoutSet } from '../types';

interface ParsedWorkout {
  exercise: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
  rpe?: number;
}

export class WorkoutParser {
  static parseInput(input: string): ParsedWorkout | null {
    const trimmedInput = input.trim().toLowerCase();
    
    // Common patterns to match:
    // "3x10 bench press @60kg"
    // "bench press 3x10 60kg"
    // "deadlift 100x5 rpe 8"
    // "squat 3x5 @100kg felt easy"
    
    // Pattern 1: [sets]x[reps] [exercise] [@][weight][unit] [notes/rpe]
    let pattern1 = /^(\d+)x(\d+)\s+([a-zA-Z\s]+?)(?:\s+@?(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?)?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/;
    let match = trimmedInput.match(pattern1);
    
    if (match) {
      return {
        exercise: this.normalizeExerciseName(match[3]),
        sets: parseInt(match[1]),
        reps: parseInt(match[2]),
        weight: match[4] ? parseFloat(match[4]) : undefined,
        rpe: match[5] ? parseInt(match[5]) : undefined,
        notes: match[6] ? match[6].trim() : undefined,
      };
    }
    
    // Pattern 2: [exercise] [sets]x[reps] [@][weight][unit] [notes/rpe]
    let pattern2 = /^([a-zA-Z\s]+?)\s+(\d+)x(\d+)(?:\s+@?(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?)?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/;
    match = trimmedInput.match(pattern2);
    
    if (match) {
      return {
        exercise: this.normalizeExerciseName(match[1]),
        sets: parseInt(match[2]),
        reps: parseInt(match[3]),
        weight: match[4] ? parseFloat(match[4]) : undefined,
        rpe: match[5] ? parseInt(match[5]) : undefined,
        notes: match[6] ? match[6].trim() : undefined,
      };
    }
    
    // Pattern 3: [exercise] [weight]x[reps] (single set format)
    let pattern3 = /^([a-zA-Z\s]+?)\s+(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?\s*x\s*(\d+)(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/;
    match = trimmedInput.match(pattern3);
    
    if (match) {
      return {
        exercise: this.normalizeExerciseName(match[1]),
        sets: 1,
        reps: parseInt(match[3]),
        weight: parseFloat(match[2]),
        rpe: match[4] ? parseInt(match[4]) : undefined,
        notes: match[5] ? match[5].trim() : undefined,
      };
    }
    
    return null;
  }

  static normalizeExerciseName(exercise: string): string {
    const normalized = exercise.trim().toLowerCase();
    
    // Common exercise name mappings
    const exerciseMap: { [key: string]: string } = {
      'bp': 'Bench Press',
      'bench': 'Bench Press',
      'squat': 'Squat',
      'deadlift': 'Deadlift',
      'dl': 'Deadlift',
      'ohp': 'Overhead Press',
      'press': 'Overhead Press',
      'pullup': 'Pull-up',
      'pullups': 'Pull-ups',
      'chinup': 'Chin-up',
      'chinups': 'Chin-ups',
      'row': 'Barbell Row',
      'rows': 'Barbell Rows',
      'dips': 'Dips',
      'pushup': 'Push-up',
      'pushups': 'Push-ups',
    };
    
    if (exerciseMap[normalized]) {
      return exerciseMap[normalized];
    }
    
    // Capitalize first letter of each word
    return normalized
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  static createWorkoutSet(parsed: ParsedWorkout): Omit<WorkoutSet, 'id' | 'timestamp'> {
    return {
      exercise: parsed.exercise,
      sets: parsed.sets,
      reps: parsed.reps,
      weight: parsed.weight,
      notes: parsed.notes,
      rpe: parsed.rpe,
    };
  }

  static formatWorkoutSet(set: WorkoutSet): string {
    let formatted = `${set.exercise}\n`;
    formatted += `• ${set.sets}×${set.reps}`;
    
    if (set.weight) {
      formatted += ` @ ${set.weight}kg`;
    }
    
    if (set.rpe) {
      formatted += ` RPE ${set.rpe}`;
    }
    
    if (set.notes) {
      formatted += `\n  (${set.notes})`;
    }
    
    return formatted;
  }
}