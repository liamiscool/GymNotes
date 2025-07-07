interface ParsedWorkout {
  exercise: string;
  sets: number;
  reps: number;
  weight?: number;
  unit?: 'kg' | 'lbs';
  rpe?: number;
  notes?: string;
  tempo?: string;
  restTime?: number;
}

interface AIParsingResponse {
  success: boolean;
  data?: ParsedWorkout;
  error?: string;
  suggestions?: string[];
}

export class AIWorkoutParser {
  private static readonly OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static readonly MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

  static async parseWorkoutInput(input: string): Promise<AIParsingResponse> {
    // First try regex parsing for common patterns
    const regexResult = this.parseWithRegex(input);
    if (regexResult.success) {
      return regexResult;
    }

    // If regex fails, try AI parsing
    try {
      const apiKey = process.env.OPENROUTER_API_KEY || global.process?.env?.OPENROUTER_API_KEY;
      if (!apiKey) {
        console.log('No API key found, using regex fallback');
        return regexResult; // Return regex result even if it failed
      }

      const prompt = this.createParsingPrompt(input);
      
      const response = await fetch(this.OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://gymnotes.app',
          'X-Title': 'GymNotes - Workout Tracker',
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      return this.parseAIResponse(aiResponse, input);
    } catch (error) {
      console.error('AI parsing error, falling back to regex:', error);
      return regexResult; // Return regex result as fallback
    }
  }

  // Simple regex-based parsing for common patterns
  private static parseWithRegex(input: string): AIParsingResponse {
    const inputLower = input.toLowerCase().trim();
    
    // Pattern 1: "3x10 bench press @60kg"
    const pattern1 = /(\d+)x(\d+)\s+(.+?)\s*@?\s*(\d+(?:\.\d+)?)\s*(kg|lbs)?/i;
    const match1 = inputLower.match(pattern1);
    
    if (match1) {
      const [, sets, reps, exercise, weight, unit] = match1;
      return {
        success: true,
        data: {
          exercise: this.normalizeExerciseName(exercise),
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: parseFloat(weight),
          unit: (unit as 'kg' | 'lbs') || 'kg',
        }
      };
    }

    // Pattern 2: "squat 100x5" or "100x5 squat"
    const pattern2 = /(?:(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?)x(\d+))|(?:(\d+(?:\.\d+)?)x(\d+)\s+(\w+(?:\s+\w+)*))/i;
    const match2 = inputLower.match(pattern2);
    
    if (match2) {
      const [, exercise1, weight1, reps1, weight2, reps2, exercise2] = match2;
      const exercise = exercise1 || exercise2;
      const weight = parseFloat(weight1 || weight2);
      const reps = parseInt(reps1 || reps2);
      
      return {
        success: true,
        data: {
          exercise: this.normalizeExerciseName(exercise),
          sets: 1,
          reps: reps,
          weight: weight,
          unit: 'kg',
        }
      };
    }

    // Pattern 3: "exercise name 3 sets 5 reps 120kg"
    const pattern3 = /(.+?)\s+(\d+)\s+sets?\s+(\d+)\s+reps?\s+(\d+(?:\.\d+)?)\s*(kg|lbs)?/i;
    const match3 = inputLower.match(pattern3);
    
    if (match3) {
      const [, exercise, sets, reps, weight, unit] = match3;
      return {
        success: true,
        data: {
          exercise: this.normalizeExerciseName(exercise),
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: parseFloat(weight),
          unit: (unit as 'kg' | 'lbs') || 'kg',
        }
      };
    }

    // If no pattern matches, return failure with suggestions
    return {
      success: false,
      error: 'Could not parse workout input',
      suggestions: this.generateFallbackSuggestions(input)
    };
  }

  private static getSystemPrompt(): string {
    return `You are a workout parsing assistant. Parse user workout inputs into structured JSON format.

RULES:
1. Extract exercise name, sets, reps, weight, and any additional info
2. Handle various formats: "3x10 bench press @60kg", "squat 100x5", "deadlift 3 sets 5 reps 120kg"
3. Default weight unit is kg unless specified otherwise
4. RPE should be a number 1-10 if mentioned
5. Extract any notes/feelings from the input
6. If input is unclear, suggest corrections

RESPONSE FORMAT (JSON only):
{
  "success": true|false,
  "exercise": "Exercise Name",
  "sets": number,
  "reps": number,
  "weight": number|null,
  "unit": "kg"|"lbs",
  "rpe": number|null,
  "notes": "any additional notes",
  "suggestions": ["suggestion1", "suggestion2"] // only if parsing failed
}

EXAMPLES:
Input: "3x10 bench press @60kg"
Output: {"success": true, "exercise": "Bench Press", "sets": 3, "reps": 10, "weight": 60, "unit": "kg"}

Input: "squat 100x5 rpe 8"
Output: {"success": true, "exercise": "Squat", "sets": 1, "reps": 5, "weight": 100, "unit": "kg", "rpe": 8}

Input: "did 5 sets of 8 reps deadlift with 120kg felt heavy"
Output: {"success": true, "exercise": "Deadlift", "sets": 5, "reps": 8, "weight": 120, "unit": "kg", "notes": "felt heavy"}`;
  }

  private static createParsingPrompt(input: string): string {
    return `Parse this workout input: "${input}"

Return only valid JSON with the workout data.`;
  }

  private static parseAIResponse(aiResponse: string, originalInput: string): AIParsingResponse {
    try {
      // Clean up the response - remove any markdown formatting
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanResponse);

      if (!parsed.success) {
        return {
          success: false,
          error: 'Could not parse workout input',
          suggestions: parsed.suggestions || this.generateFallbackSuggestions(originalInput)
        };
      }

      // Validate required fields
      if (!parsed.exercise || !parsed.sets || !parsed.reps) {
        return {
          success: false,
          error: 'Missing required workout information',
          suggestions: this.generateFallbackSuggestions(originalInput)
        };
      }

      return {
        success: true,
        data: {
          exercise: this.normalizeExerciseName(parsed.exercise),
          sets: parseInt(parsed.sets),
          reps: parseInt(parsed.reps),
          weight: parsed.weight ? parseFloat(parsed.weight) : undefined,
          unit: parsed.unit || 'kg',
          rpe: parsed.rpe ? parseInt(parsed.rpe) : undefined,
          notes: parsed.notes || undefined,
          tempo: parsed.tempo || undefined,
          restTime: parsed.restTime ? parseInt(parsed.restTime) : undefined,
        }
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        success: false,
        error: 'Failed to parse AI response',
        suggestions: this.generateFallbackSuggestions(originalInput)
      };
    }
  }

  private static normalizeExerciseName(exercise: string): string {
    // Capitalize first letter of each word
    return exercise
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private static generateFallbackSuggestions(input: string): string[] {
    const suggestions = [];
    
    if (!input.trim()) {
      suggestions.push('Type your workout like "3x10 bench press @60kg"');
      return suggestions;
    }

    const hasNumbers = /\d/.test(input);
    const hasExerciseWords = /bench|squat|deadlift|press|curl|row|pull/i.test(input);

    if (!hasNumbers) {
      suggestions.push('Add sets and reps like "3x10"');
      suggestions.push('Try: "3x10 ' + input + '"');
    }

    if (!hasExerciseWords) {
      suggestions.push('Include exercise name like "bench press" or "squat"');
    }

    if (hasNumbers && hasExerciseWords) {
      suggestions.push('Try: "3x10 exercise name @weight"');
      suggestions.push('Or: "exercise name 3x10 60kg"');
    }

    suggestions.push('Examples: "3x10 bench press @60kg", "squat 100x5", "deadlift 3x5 @120kg"');

    return suggestions;
  }

  // Get exercise emoji for display
  static getExerciseEmoji(exerciseName: string): string {
    const exerciseLower = exerciseName.toLowerCase();
    
    if (exerciseLower.includes('bench') || exerciseLower.includes('press')) return '🏋️‍♂️';
    if (exerciseLower.includes('squat')) return '🦵';
    if (exerciseLower.includes('deadlift')) return '💪';
    if (exerciseLower.includes('pull')) return '🤲';
    if (exerciseLower.includes('row')) return '🚣‍♂️';
    if (exerciseLower.includes('curl')) return '💪';
    if (exerciseLower.includes('dip')) return '💪';
    if (exerciseLower.includes('push')) return '💪';
    
    return '🏃‍♂️';
  }

  // Validate parsed workout data
  static validateWorkoutData(data: ParsedWorkout): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.exercise?.trim()) {
      errors.push('Exercise name is required');
    }

    if (!data.sets || data.sets <= 0 || data.sets > 50) {
      errors.push('Sets must be between 1 and 50');
    }

    if (!data.reps || data.reps <= 0 || data.reps > 1000) {
      errors.push('Reps must be between 1 and 1000');
    }

    if (data.weight !== undefined && (data.weight < 0 || data.weight > 1000)) {
      errors.push('Weight must be between 0 and 1000');
    }

    if (data.rpe !== undefined && (data.rpe < 1 || data.rpe > 10)) {
      errors.push('RPE must be between 1 and 10');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}