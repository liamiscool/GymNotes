// Test suite for the enhanced WorkoutParser
// This file contains comprehensive tests for all parsing scenarios

import { WorkoutParser } from './workoutParser';

interface TestCase {
  input: string;
  expected: {
    exercise: string;
    sets: number;
    reps: number;
    weight?: number;
    rpe?: number;
    notes?: string;
    unit?: 'kg' | 'lbs';
  };
  description: string;
}

export const parserTestCases: TestCase[] = [
  // Basic format tests
  {
    input: "3x10 bench press @60kg",
    expected: { exercise: "Bench Press", sets: 3, reps: 10, weight: 60, unit: "kg" },
    description: "Standard format: sets x reps exercise @ weight"
  },
  {
    input: "bench press 3x10 60kg",
    expected: { exercise: "Bench Press", sets: 3, reps: 10, weight: 60, unit: "kg" },
    description: "Exercise first format"
  },
  {
    input: "deadlift 100x5 rpe 8",
    expected: { exercise: "Deadlift", sets: 1, reps: 5, weight: 100, rpe: 8, unit: "kg" },
    description: "Weight x reps with RPE"
  },
  {
    input: "squat 3x5 @100kg felt easy",
    expected: { exercise: "Squat", sets: 3, reps: 5, weight: 100, notes: "felt easy", unit: "kg" },
    description: "With notes"
  },
  
  // Alias recognition tests
  {
    input: "3x10 bp @60kg",
    expected: { exercise: "Bench Press", sets: 3, reps: 10, weight: 60, unit: "kg" },
    description: "Exercise alias: bp -> Bench Press"
  },
  {
    input: "5x5 dl 140kg",
    expected: { exercise: "Deadlift", sets: 5, reps: 5, weight: 140, unit: "kg" },
    description: "Exercise alias: dl -> Deadlift"
  },
  {
    input: "ohp 3x8 50kg",
    expected: { exercise: "Overhead Press", sets: 3, reps: 8, weight: 50, unit: "kg" },
    description: "Exercise alias: ohp -> Overhead Press"
  },
  
  // Natural language tests
  {
    input: "did 3 sets of 10 reps on bench press with 70kg",
    expected: { exercise: "Bench Press", sets: 3, reps: 10, weight: 70, unit: "kg" },
    description: "Natural language: did X sets of Y reps"
  },
  {
    input: "bench press for 4 sets of 8 reps with 80kg",
    expected: { exercise: "Bench Press", sets: 4, reps: 8, weight: 80, unit: "kg" },
    description: "Natural language: exercise for X sets of Y reps"
  },
  
  // Flexible format tests
  {
    input: "squat 5 sets 8 reps 120kg",
    expected: { exercise: "Squat", sets: 5, reps: 8, weight: 120, unit: "kg" },
    description: "Flexible format: exercise X sets Y reps weight"
  },
  {
    input: "deadlift: 5 reps x 3 sets @ 150kg",
    expected: { exercise: "Deadlift", sets: 3, reps: 5, weight: 150, unit: "kg" },
    description: "Flexible format with colon and reversed order"
  },
  
  // Weight unit tests
  {
    input: "bench press 3x10 135lbs",
    expected: { exercise: "Bench Press", sets: 3, reps: 10, weight: 135, unit: "lbs" },
    description: "Pounds unit recognition"
  },
  {
    input: "squat 5x5 @200 pounds",
    expected: { exercise: "Squat", sets: 5, reps: 5, weight: 200, unit: "lbs" },
    description: "Full 'pounds' unit recognition"
  },
  
  // Bodyweight exercises
  {
    input: "3x15 push ups",
    expected: { exercise: "Push-ups", sets: 3, reps: 15 },
    description: "Bodyweight exercise recognition"
  },
  {
    input: "pull ups 4x8",
    expected: { exercise: "Pull-ups", sets: 4, reps: 8 },
    description: "Pull-ups alias recognition"
  },
  
  // Complex cases with multiple components
  {
    input: "3x10 incline bench @70kg rpe 7 felt good",
    expected: { exercise: "Incline Bench Press", sets: 3, reps: 10, weight: 70, rpe: 7, notes: "felt good", unit: "kg" },
    description: "Complex: sets x reps exercise @ weight rpe X notes"
  }
];

// Test function to run all parser tests
export function runParserTests(): { passed: number, failed: number, failures: string[] } {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  console.log('🧪 Running WorkoutParser Tests...\n');

  parserTestCases.forEach((testCase, index) => {
    try {
      const result = WorkoutParser.parseInput(testCase.input);
      
      if (!result) {
        failed++;
        failures.push(`Test ${index + 1} FAILED: No result for "${testCase.input}"`);
        return;
      }

      // Compare all expected fields
      let testPassed = true;
      const errors: string[] = [];

      if (result.exercise !== testCase.expected.exercise) {
        testPassed = false;
        errors.push(`Exercise: expected "${testCase.expected.exercise}", got "${result.exercise}"`);
      }

      if (result.sets !== testCase.expected.sets) {
        testPassed = false;
        errors.push(`Sets: expected ${testCase.expected.sets}, got ${result.sets}`);
      }

      if (result.reps !== testCase.expected.reps) {
        testPassed = false;
        errors.push(`Reps: expected ${testCase.expected.reps}, got ${result.reps}`);
      }

      if (testCase.expected.weight !== undefined && result.weight !== testCase.expected.weight) {
        testPassed = false;
        errors.push(`Weight: expected ${testCase.expected.weight}, got ${result.weight}`);
      }

      if (testCase.expected.rpe !== undefined && result.rpe !== testCase.expected.rpe) {
        testPassed = false;
        errors.push(`RPE: expected ${testCase.expected.rpe}, got ${result.rpe}`);
      }

      if (testCase.expected.notes !== undefined && result.notes !== testCase.expected.notes) {
        testPassed = false;
        errors.push(`Notes: expected "${testCase.expected.notes}", got "${result.notes}"`);
      }

      if (testCase.expected.unit !== undefined && result.unit !== testCase.expected.unit) {
        testPassed = false;
        errors.push(`Unit: expected "${testCase.expected.unit}", got "${result.unit}"`);
      }

      if (testPassed) {
        passed++;
        console.log(`✅ Test ${index + 1}: ${testCase.description}`);
      } else {
        failed++;
        failures.push(`Test ${index + 1} FAILED: ${testCase.description}\n   Input: "${testCase.input}"\n   Errors: ${errors.join(', ')}`);
        console.log(`❌ Test ${index + 1}: ${testCase.description}`);
        console.log(`   Input: "${testCase.input}"`);
        console.log(`   Errors: ${errors.join(', ')}`);
      }

    } catch (error) {
      failed++;
      failures.push(`Test ${index + 1} ERROR: ${testCase.description}\n   Input: "${testCase.input}"\n   Error: ${error}`);
      console.log(`💥 Test ${index + 1}: ${testCase.description} - ERROR: ${error}`);
    }
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

  return { passed, failed, failures };
}

// Additional feature tests
export function testAdditionalFeatures(): void {
  console.log('🧪 Testing Additional Features...\n');

  // Test exercise emoji
  console.log('Testing exercise emoji...');
  console.log(`Bench Press: ${WorkoutParser.getExerciseEmoji('Bench Press')}`);
  console.log(`Squat: ${WorkoutParser.getExerciseEmoji('Squat')}`);
  console.log(`Deadlift: ${WorkoutParser.getExerciseEmoji('Deadlift')}`);

  // Test exercise suggestions
  console.log('\nTesting parsing suggestions...');
  const badInputs = ['bench', '3x10', 'bench press', 'asdf 3x10 60kg'];
  badInputs.forEach(input => {
    const suggestions = WorkoutParser.generateParsingSuggestions(input);
    console.log(`Input: "${input}" -> Suggestions: ${suggestions.slice(0, 2).join(', ')}`);
  });

  // Test exercise database
  console.log('\nTesting exercise database...');
  console.log(`All exercises: ${WorkoutParser.getAllExercises().length} total`);
  console.log(`Categories: ${WorkoutParser.getCategories().join(', ')}`);
  console.log(`Chest exercises: ${WorkoutParser.getExercisesByCategory('chest').join(', ')}`);

  console.log('\n✅ Additional feature tests completed\n');
}