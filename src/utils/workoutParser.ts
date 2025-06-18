import { WorkoutSet, ParsedWorkoutPlan } from '../types';

interface ParsedWorkout {
  exercise: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
  rpe?: number;
  unit?: 'kg' | 'lbs';
  restTime?: number;
  tempo?: string;
  completed?: boolean;
}

interface ExerciseDatabase {
  [key: string]: {
    name: string;
    category: string;
    aliases: string[];
    equipment?: string;
    emoji?: string;
  };
}

interface ParsingContext {
  previousExercise?: string;
  sessionExercises: string[];
  commonPatterns: string[];
}

export class WorkoutParser {
  // Enhanced exercise database with comprehensive mappings
  private static exerciseDatabase: ExerciseDatabase = {
    // Chest exercises
    'bench_press': {
      name: 'Bench Press',
      category: 'chest',
      aliases: ['bench', 'bp', 'bench press', 'flat bench', 'barbell bench'],
      equipment: 'barbell',
      emoji: '🏋️‍♂️'
    },
    'incline_bench': {
      name: 'Incline Bench Press',
      category: 'chest',
      aliases: ['incline', 'incline bench', 'incline press', 'incline bp'],
      equipment: 'barbell',
      emoji: '🏋️‍♂️'
    },
    'push_ups': {
      name: 'Push-ups',
      category: 'chest',
      aliases: ['pushup', 'pushups', 'push up', 'push ups', 'press ups'],
      equipment: 'bodyweight',
      emoji: '💪'
    },
    // Leg exercises
    'squat': {
      name: 'Squat',
      category: 'legs',
      aliases: ['squat', 'squats', 'back squat', 'barbell squat'],
      equipment: 'barbell',
      emoji: '🦵'
    },
    'deadlift': {
      name: 'Deadlift',
      category: 'legs',
      aliases: ['deadlift', 'dl', 'dead lift', 'conventional deadlift'],
      equipment: 'barbell',
      emoji: '💪'
    },
    'leg_press': {
      name: 'Leg Press',
      category: 'legs',
      aliases: ['leg press', 'legpress', 'leg-press'],
      equipment: 'machine',
      emoji: '🦵'
    },
    // Back exercises
    'pull_ups': {
      name: 'Pull-ups',
      category: 'back',
      aliases: ['pullup', 'pullups', 'pull up', 'pull ups', 'chin up', 'chinup', 'chin ups', 'chinups'],
      equipment: 'bodyweight',
      emoji: '🤲'
    },
    'barbell_row': {
      name: 'Barbell Row',
      category: 'back',
      aliases: ['row', 'rows', 'barbell row', 'bent over row', 'bb row'],
      equipment: 'barbell',
      emoji: '🚣‍♂️'
    },
    // Shoulder exercises
    'overhead_press': {
      name: 'Overhead Press',
      category: 'shoulders',
      aliases: ['ohp', 'press', 'overhead press', 'military press', 'shoulder press'],
      equipment: 'barbell',
      emoji: '🏋️‍♂️'
    },
    // Arms
    'bicep_curls': {
      name: 'Bicep Curls',
      category: 'arms',
      aliases: ['curl', 'curls', 'bicep curl', 'bicep curls', 'bb curl', 'barbell curl'],
      equipment: 'barbell',
      emoji: '💪'
    },
    'dips': {
      name: 'Dips',
      category: 'arms',
      aliases: ['dip', 'dips', 'tricep dips'],
      equipment: 'bodyweight',
      emoji: '💪'
    }
  };

  static parseInput(input: string, context?: ParsingContext): ParsedWorkout | null {
    const original = input.trim();
    const normalized = original.toLowerCase();
    
    // Try multiple parsing strategies in order of specificity
    const strategies = [
      this.parseDetailedFormat,
      this.parseStandardFormat,
      this.parseFlexibleFormat,
      this.parseCompactFormat,
      this.parseNaturalLanguage
    ];
    
    for (const strategy of strategies) {
      const result = strategy.call(this, normalized, original);
      if (result) {
        return this.enrichParsedWorkout(result, context);
      }
    }
    
    return null;
  }

  // Strategy 1: Detailed format with all possible components
  // "3x10 bench press @60kg rpe 8 rest 90s tempo 2-1-2-1 felt easy"
  private static parseDetailedFormat(input: string, original: string): ParsedWorkout | null {
    const pattern = /^(\d+)x(\d+)\s+([a-zA-Z\s]+?)(?:\s+@?(\d+(?:\.\d+)?)\s*(kg|lbs?|pounds?)?)?(?:\s+rpe\s*(\d+))?(?:\s+rest\s*(\d+)\s*(?:s|sec|seconds?)?)?(?:\s+tempo\s*([\d-]+))?(?:\s+(.+))?$/;
    const match = input.match(pattern);
    
    if (match) {
      return {
        exercise: match[3].trim(),
        sets: parseInt(match[1]),
        reps: parseInt(match[2]),
        weight: match[4] ? parseFloat(match[4]) : undefined,
        unit: this.parseUnit(match[5]),
        rpe: match[6] ? parseInt(match[6]) : undefined,
        restTime: match[7] ? parseInt(match[7]) : undefined,
        tempo: match[8] ? match[8].trim() : undefined,
        notes: match[9] ? match[9].trim() : undefined,
      };
    }
    
    return null;
  }

  // Strategy 2: Standard format (existing patterns)
  private static parseStandardFormat(input: string, original: string): ParsedWorkout | null {
    // Pattern 1: [sets]x[reps] [exercise] [@][weight][unit] [notes/rpe]
    let pattern1 = /^(\d+)x(\d+)\s+([a-zA-Z\s]+?)(?:\s+@?(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?)?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/;
    let match = input.match(pattern1);
    
    if (match) {
      return {
        exercise: match[3].trim(),
        sets: parseInt(match[1]),
        reps: parseInt(match[2]),
        weight: match[4] ? parseFloat(match[4]) : undefined,
        unit: this.parseUnit(match[4] ? input.substring(input.indexOf(match[4]) + match[4].length) : ''),
        rpe: match[5] ? parseInt(match[5]) : undefined,
        notes: match[6] ? match[6].trim() : undefined,
      };
    }
    
    // Pattern 2: [exercise] [sets]x[reps] [@][weight][unit] [notes/rpe]
    let pattern2 = /^([a-zA-Z\s]+?)\s+(\d+)x(\d+)(?:\s+@?(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?)?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/;
    match = input.match(pattern2);
    
    if (match) {
      return {
        exercise: match[1].trim(),
        sets: parseInt(match[2]),
        reps: parseInt(match[3]),
        weight: match[4] ? parseFloat(match[4]) : undefined,
        unit: this.parseUnit(match[4] ? input.substring(input.indexOf(match[4]) + match[4].length) : ''),
        rpe: match[5] ? parseInt(match[5]) : undefined,
        notes: match[6] ? match[6].trim() : undefined,
      };
    }
    
    return null;
  }

  // Strategy 3: Flexible format with various separators
  private static parseFlexibleFormat(input: string, original: string): ParsedWorkout | null {
    // Handle formats like "bench 3 sets 10 reps 60kg" or "deadlift: 5 reps x 3 sets @ 100kg"
    const flexPatterns = [
      /^([a-zA-Z\s]+?)\s+(\d+)\s+sets?\s+(\d+)\s+reps?(?:\s+@?(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?)?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/,
      /^([a-zA-Z\s]+?)\s*:?\s*(\d+)\s+reps?\s*x\s*(\d+)\s+sets?(?:\s+@?(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?)?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/,
      /^([a-zA-Z\s]+?)\s+(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)\s*x\s*(\d+)\s*(?:x\s*(\d+))?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/
    ];
    
    for (const pattern of flexPatterns) {
      const match = input.match(pattern);
      if (match) {
        return {
          exercise: match[1].trim(),
          sets: parseInt(match[2]),
          reps: parseInt(match[3]),
          weight: match[4] ? parseFloat(match[4]) : undefined,
          unit: this.parseUnit(match[4] ? input.substring(input.indexOf(match[4]) + match[4].length) : ''),
          rpe: match[5] ? parseInt(match[5]) : undefined,
          notes: match[6] ? match[6].trim() : undefined,
        };
      }
    }
    
    return null;
  }

  // Strategy 4: Compact format (weight x reps)
  private static parseCompactFormat(input: string, original: string): ParsedWorkout | null {
    // Pattern: [exercise] [weight]x[reps] or [exercise] [weight] x [reps]
    const pattern = /^([a-zA-Z\s]+?)\s+(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?\s*x\s*(\d+)(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/;
    const match = input.match(pattern);
    
    if (match) {
      return {
        exercise: match[1].trim(),
        sets: 1,
        reps: parseInt(match[3]),
        weight: parseFloat(match[2]),
        unit: this.parseUnit(input),
        rpe: match[4] ? parseInt(match[4]) : undefined,
        notes: match[5] ? match[5].trim() : undefined,
      };
    }
    
    return null;
  }

  // Strategy 5: Natural language parsing
  private static parseNaturalLanguage(input: string, original: string): ParsedWorkout | null {
    // Handle more conversational inputs like "did 5 sets of 8 reps on bench press with 70kg"
    const naturalPatterns = [
      /(?:did|performed?)\s+(\d+)\s+sets?\s+of\s+(\d+)\s+reps?\s+(?:on\s+|of\s+)?([a-zA-Z\s]+?)(?:\s+(?:with|at|@)\s+(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?)?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/,
      /([a-zA-Z\s]+?)\s+for\s+(\d+)\s+sets?\s+of\s+(\d+)\s+reps?(?:\s+(?:with|at|@)\s+(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?)?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/,
      /(\d+)\s+sets?\s+of\s+(\d+)\s+reps?\s+([a-zA-Z\s]+?)(?:\s+(?:with|at|@)\s+(\d+(?:\.\d+)?)\s*(?:kg|lbs?|pounds?)?)?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/
    ];
    
    for (const pattern of naturalPatterns) {
      const match = input.match(pattern);
      if (match) {
        // Different capture groups based on pattern
        const isFirstPattern = pattern === naturalPatterns[0];
        const isSecondPattern = pattern === naturalPatterns[1];
        
        return {
          exercise: isFirstPattern ? match[3].trim() : (isSecondPattern ? match[1].trim() : match[3].trim()),
          sets: isFirstPattern ? parseInt(match[1]) : (isSecondPattern ? parseInt(match[2]) : parseInt(match[1])),
          reps: isFirstPattern ? parseInt(match[2]) : (isSecondPattern ? parseInt(match[3]) : parseInt(match[2])),
          weight: match[4] ? parseFloat(match[4]) : undefined,
          unit: this.parseUnit(input),
          rpe: match[5] ? parseInt(match[5]) : undefined,
          notes: match[6] ? match[6].trim() : undefined,
        };
      }
    }
    
    return null;
  }

  // Helper method to parse weight units
  private static parseUnit(text: string): 'kg' | 'lbs' | undefined {
    if (!text) return 'kg'; // Default unit
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('lbs') || lowerText.includes('lb') || lowerText.includes('pounds')) {
      return 'lbs';
    }
    
    return 'kg';
  }

  // Enrich parsed workout with database information and context
  private static enrichParsedWorkout(parsed: ParsedWorkout, context?: ParsingContext): ParsedWorkout {
    // Normalize exercise name using database
    const normalizedExercise = this.normalizeExerciseName(parsed.exercise);
    
    return {
      ...parsed,
      exercise: normalizedExercise,
      unit: parsed.unit || 'kg',
      completed: parsed.completed ?? true
    };
  }

  // Enhanced exercise name normalization using the database
  static normalizeExerciseName(exercise: string): string {
    const normalized = exercise.trim().toLowerCase();
    
    // First, try exact database lookup
    for (const [key, data] of Object.entries(this.exerciseDatabase)) {
      if (data.aliases.includes(normalized)) {
        return data.name;
      }
    }
    
    // Fuzzy matching for partial matches
    const fuzzyMatches = this.findFuzzyMatches(normalized);
    if (fuzzyMatches.length > 0) {
      return fuzzyMatches[0].name; // Return best match
    }
    
    // Fallback: capitalize first letter of each word
    return normalized
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Find fuzzy matches for exercise names
  private static findFuzzyMatches(input: string): Array<{name: string, score: number}> {
    const matches: Array<{name: string, score: number}> = [];
    
    for (const [key, data] of Object.entries(this.exerciseDatabase)) {
      for (const alias of data.aliases) {
        const score = this.calculateSimilarity(input, alias);
        if (score > 0.6) { // Threshold for fuzzy matching
          matches.push({ name: data.name, score });
        }
      }
    }
    
    return matches.sort((a, b) => b.score - a.score);
  }

  // Simple similarity calculation (Levenshtein-like)
  private static calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    // Check if one string contains the other
    if (str1.includes(str2) || str2.includes(str1)) {
      return Math.max(str2.length / str1.length, str1.length / str2.length) * 0.8;
    }
    
    // Simple word overlap scoring
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  // Get exercise information from database
  static getExerciseInfo(exerciseName: string): typeof WorkoutParser.exerciseDatabase[string] | null {
    const normalized = exerciseName.toLowerCase();
    
    for (const [key, data] of Object.entries(this.exerciseDatabase)) {
      if (data.name.toLowerCase() === normalized || data.aliases.includes(normalized)) {
        return data;
      }
    }
    
    return null;
  }

  // Get exercise emoji based on name or category
  static getExerciseEmoji(exerciseName: string): string {
    const info = this.getExerciseInfo(exerciseName);
    if (info?.emoji) {
      return info.emoji;
    }
    
    // Fallback emoji based on exercise name patterns
    const exerciseLower = exerciseName.toLowerCase();
    if (exerciseLower.includes('bench') || exerciseLower.includes('press')) return '🏋️‍♂️';
    if (exerciseLower.includes('squat')) return '🦵';
    if (exerciseLower.includes('deadlift')) return '💪';
    if (exerciseLower.includes('pull')) return '🤲';
    if (exerciseLower.includes('row')) return '🚣‍♂️';
    if (exerciseLower.includes('curl')) return '💪';
    return '🏃‍♂️';
  }

  // Validate parsed workout data
  static validateParsedWorkout(parsed: ParsedWorkout): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!parsed.exercise || parsed.exercise.trim().length === 0) {
      errors.push('Exercise name is required');
    }
    
    if (parsed.sets <= 0 || parsed.sets > 50) {
      errors.push('Sets must be between 1 and 50');
    }
    
    if (parsed.reps <= 0 || parsed.reps > 1000) {
      errors.push('Reps must be between 1 and 1000');
    }
    
    if (parsed.weight !== undefined && (parsed.weight < 0 || parsed.weight > 1000)) {
      errors.push('Weight must be between 0 and 1000');
    }
    
    if (parsed.rpe !== undefined && (parsed.rpe < 1 || parsed.rpe > 10)) {
      errors.push('RPE must be between 1 and 10');
    }
    
    if (parsed.restTime !== undefined && (parsed.restTime < 0 || parsed.restTime > 3600)) {
      errors.push('Rest time must be between 0 and 3600 seconds');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static createWorkoutSet(parsed: ParsedWorkout): Omit<WorkoutSet, 'id' | 'timestamp'> {
    // Validate before creating
    const validation = this.validateParsedWorkout(parsed);
    if (!validation.isValid) {
      throw new Error(`Invalid workout data: ${validation.errors.join(', ')}`);
    }
    
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
    const emoji = this.getExerciseEmoji(set.exercise);
    let formatted = `${emoji} ${set.exercise}\n`;
    formatted += `• ${set.sets}×${set.reps}`;
    
    if (set.weight) {
      formatted += ` @ ${set.weight}kg`;
    }
    
    if (set.rpe) {
      formatted += ` RPE ${set.rpe}`;
    }
    
    if (set.notes) {
      formatted += `\n  💭 ${set.notes}`;
    }
    
    return formatted;
  }

  // Generate parsing suggestions based on failed inputs
  static generateParsingSuggestions(input: string): string[] {
    const suggestions: string[] = [];
    const normalized = input.toLowerCase().trim();
    
    // Check if input contains exercise names but wrong format
    const hasNumbers = /\d/.test(normalized);
    const hasExercise = Object.values(this.exerciseDatabase).some(data => 
      data.aliases.some(alias => normalized.includes(alias))
    );
    
    if (hasExercise && hasNumbers) {
      suggestions.push('Try format: "3x10 exercise name @weight"');
      suggestions.push('Or: "exercise name 3x10 weight"');
      suggestions.push('Example: "3x10 bench press @60kg"');
    } else if (hasExercise && !hasNumbers) {
      suggestions.push('Add sets and reps: "3x10 ' + normalized + '"');
      suggestions.push('Or with weight: "3x10 ' + normalized + ' @60kg"');
    } else if (!hasExercise && hasNumbers) {
      suggestions.push('Add exercise name before or after numbers');
      suggestions.push('Example: "3x10 bench press" or "bench press 3x10"');
    } else {
      suggestions.push('Include: exercise name, sets, and reps');
      suggestions.push('Format: "3x10 exercise name"');
      suggestions.push('With weight: "3x10 exercise @weight"');
    }
    
    return suggestions;
  }

  // Get similar exercises for suggestions
  static getSimilarExercises(partialName: string, limit = 5): string[] {
    const matches = this.findFuzzyMatches(partialName.toLowerCase());
    return matches.slice(0, limit).map(match => match.name);
  }

  // Advanced parsing with context awareness
  static parseWithContext(input: string, context?: ParsingContext): ParsedWorkout | null {
    const result = this.parseInput(input, context);
    
    if (!result && context) {
      // Try parsing with previous exercise context
      if (context.previousExercise) {
        // Check if input might be just sets/reps for previous exercise
        const setsRepsPattern = /^(\d+)x(\d+)(?:\s+@?(\d+(?:\.\d+)?)\s*(?:kg|lbs?)?)?(?:\s+rpe\s*(\d+))?(?:\s+(.+))?$/;
        const match = input.toLowerCase().match(setsRepsPattern);
        
        if (match) {
          return {
            exercise: context.previousExercise,
            sets: parseInt(match[1]),
            reps: parseInt(match[2]),
            weight: match[3] ? parseFloat(match[3]) : undefined,
            rpe: match[4] ? parseInt(match[4]) : undefined,
            notes: match[5] ? match[5].trim() : undefined,
            unit: 'kg'
          };
        }
      }
    }
    
    return result;
  }

  // Export all exercises from database for autocomplete
  static getAllExercises(): Array<{name: string, category: string, aliases: string[]}> {
    return Object.values(this.exerciseDatabase).map(data => ({
      name: data.name,
      category: data.category,
      aliases: data.aliases
    }));
  }

  // Get exercises by category
  static getExercisesByCategory(category: string): string[] {
    return Object.values(this.exerciseDatabase)
      .filter(data => data.category === category)
      .map(data => data.name);
  }

  // Get all available categories
  static getCategories(): string[] {
    const categories = new Set(Object.values(this.exerciseDatabase).map(data => data.category));
    return Array.from(categories);
  }

  // Parse full workout plan from text (for text import feature)
  static parseWorkoutPlan(text: string): ParsedWorkoutPlan | null {
    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) return null;

      const plan: ParsedWorkoutPlan = {
        name: 'Imported Workout Plan',
        description: 'Imported from text',
        days: [],
        estimatedDifficulty: 'intermediate'
      };

      let currentDay: { name: string; exercises: Array<any> } | null = null;
      let planNameFound = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        // Try to identify plan name (first line if it doesn't contain exercise patterns)
        if (i === 0 && !planNameFound && !this.containsExercisePattern(line)) {
          plan.name = line;
          planNameFound = true;
          continue;
        }

        // Check if this is a day header
        if (this.isDayHeader(line)) {
          // Save previous day if exists
          if (currentDay && currentDay.exercises.length > 0) {
            plan.days.push(currentDay);
          }
          
          currentDay = {
            name: this.extractDayName(line),
            exercises: []
          };
          continue;
        }

        // Try to parse as exercise
        const parsedExercise = this.parseInput(line);
        if (parsedExercise) {
          // If no day header found yet, create a default one
          if (!currentDay) {
            currentDay = {
              name: plan.days.length === 0 ? 'Day 1' : `Day ${plan.days.length + 1}`,
              exercises: []
            };
          }

          currentDay.exercises.push({
            name: parsedExercise.exercise,
            sets: parsedExercise.sets,
            reps: parsedExercise.reps,
            weight: parsedExercise.weight,
            notes: parsedExercise.notes
          });
        }
      }

      // Add final day if exists
      if (currentDay && currentDay.exercises.length > 0) {
        plan.days.push(currentDay);
      }

      // Estimate difficulty based on exercise complexity and volume
      plan.estimatedDifficulty = this.estimatePlanDifficulty(plan);

      return plan.days.length > 0 ? plan : null;
    } catch (error) {
      console.error('Error parsing workout plan:', error);
      return null;
    }
  }

  // Helper method to check if line contains exercise patterns
  private static containsExercisePattern(line: string): boolean {
    const exercisePatterns = [
      /\d+x\d+/,  // sets x reps
      /\d+\s+sets?/,  // X sets
      /\d+\s+reps?/,  // X reps
      /@\d+/,  // @weight
      /\d+\s*kg/,  // weight in kg
      /\d+\s*lbs?/  // weight in lbs
    ];
    
    return exercisePatterns.some(pattern => pattern.test(line.toLowerCase()));
  }

  // Helper method to identify day headers
  private static isDayHeader(line: string): boolean {
    const dayPatterns = [
      /^day\s+\d+/i,
      /^workout\s+[a-z]/i,
      /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /^(push|pull|legs?|upper|lower|full\s*body|chest|back|shoulders?|arms?)/i,
      /^(beginner|intermediate|advanced)/i,
      /^\d+\.\s*[a-z]/i,  // numbered lists
      /^-\s*[a-z]/i,      // bullet points
      /^#\s*/i,           // markdown headers
      /^[A-Z\s]+:?\s*$/   // ALL CAPS headers
    ];
    
    return dayPatterns.some(pattern => pattern.test(line)) && 
           !this.containsExercisePattern(line);
  }

  // Helper method to extract day name
  private static extractDayName(line: string): string {
    // Remove common prefixes and suffixes
    let dayName = line
      .replace(/^(day\s+\d+:?\s*)/i, '')
      .replace(/^(workout\s+[a-z]:?\s*)/i, '')
      .replace(/^(\d+\.\s*)/i, '')
      .replace(/^(-\s*)/i, '')
      .replace(/^(#\s*)/i, '')
      .replace(/:?\s*$/, '')
      .trim();
    
    // If empty after cleaning, generate a default name
    if (!dayName) {
      dayName = 'Workout Day';
    }
    
    return dayName;
  }

  // Estimate plan difficulty based on exercises and volume
  private static estimatePlanDifficulty(plan: ParsedWorkoutPlan): 'beginner' | 'intermediate' | 'advanced' {
    let complexityScore = 0;
    let totalVolume = 0;
    let exerciseCount = 0;

    for (const day of plan.days) {
      for (const exercise of day.exercises) {
        exerciseCount++;
        totalVolume += exercise.sets * exercise.reps;
        
        // Add complexity based on exercise type
        const exerciseInfo = this.getExerciseInfo(exercise.name);
        if (exerciseInfo) {
          if (exerciseInfo.equipment === 'barbell') complexityScore += 2;
          else if (exerciseInfo.equipment === 'dumbbell') complexityScore += 1;
          else if (exerciseInfo.equipment === 'bodyweight') complexityScore += 0.5;
        }
        
        // Add complexity for compound movements
        const exerciseLower = exercise.name.toLowerCase();
        if (exerciseLower.includes('deadlift') || exerciseLower.includes('squat') || 
            exerciseLower.includes('press') || exerciseLower.includes('row')) {
          complexityScore += 2;
        }
      }
    }

    const avgVolumePerExercise = totalVolume / exerciseCount;
    const avgComplexityPerExercise = complexityScore / exerciseCount;

    // Determine difficulty based on volume and complexity
    if (avgVolumePerExercise > 40 || avgComplexityPerExercise > 2 || plan.days.length > 4) {
      return 'advanced';
    } else if (avgVolumePerExercise > 20 || avgComplexityPerExercise > 1 || plan.days.length > 2) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  // Validate parsed workout plan
  static validateParsedPlan(plan: ParsedWorkoutPlan): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!plan.name || plan.name.trim().length === 0) {
      errors.push('Plan name is required');
    }

    if (plan.days.length === 0) {
      errors.push('Plan must have at least one workout day');
    }

    for (let i = 0; i < plan.days.length; i++) {
      const day = plan.days[i];
      
      if (!day.name || day.name.trim().length === 0) {
        errors.push(`Day ${i + 1} must have a name`);
      }

      if (day.exercises.length === 0) {
        errors.push(`Day "${day.name}" must have at least one exercise`);
      }

      for (let j = 0; j < day.exercises.length; j++) {
        const exercise = day.exercises[j];
        
        if (!exercise.name || exercise.name.trim().length === 0) {
          errors.push(`Exercise ${j + 1} in "${day.name}" must have a name`);
        }

        if (exercise.sets <= 0 || exercise.sets > 50) {
          errors.push(`Exercise "${exercise.name}" sets must be between 1 and 50`);
        }

        if (exercise.reps <= 0 || exercise.reps > 1000) {
          errors.push(`Exercise "${exercise.name}" reps must be between 1 and 1000`);
        }

        if (exercise.weight !== undefined && (exercise.weight < 0 || exercise.weight > 1000)) {
          errors.push(`Exercise "${exercise.name}" weight must be between 0 and 1000`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate workout plan suggestions for failed parsing
  static generatePlanParsingSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    
    if (text.trim().length === 0) {
      suggestions.push('Paste your workout plan text here');
      suggestions.push('Include exercise names, sets, and reps');
      return suggestions;
    }

    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const hasExercisePatterns = lines.some(line => this.containsExercisePattern(line));
    const hasDayHeaders = lines.some(line => this.isDayHeader(line));

    if (!hasExercisePatterns) {
      suggestions.push('Add exercise details with sets and reps');
      suggestions.push('Example: "3x10 Bench Press" or "Squat 3x8 @60kg"');
    }

    if (!hasDayHeaders && lines.length > 5) {
      suggestions.push('Consider adding day headers like "Day 1" or "Push Day"');
      suggestions.push('This helps organize your workout plan');
    }

    if (hasExercisePatterns) {
      suggestions.push('Try different exercise formats:');
      suggestions.push('• "3x10 exercise name"');
      suggestions.push('• "exercise name 3x10 @weight"');
      suggestions.push('• "3 sets of 10 reps exercise"');
    }

    return suggestions;
  }
}