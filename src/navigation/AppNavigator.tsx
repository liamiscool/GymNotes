import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { RootStackParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { database } from '../services/database';

// Import screens
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import OnboardingMethodSelectionScreen from '../screens/onboarding/OnboardingMethodSelectionScreen';
import OnboardingTextImportScreen from '../screens/onboarding/OnboardingTextImportScreen';
import OnboardingTemplateSelectionScreen from '../screens/onboarding/OnboardingTemplateSelectionScreen';
import OnboardingExerciseBuilderScreen from '../screens/onboarding/OnboardingExerciseBuilderScreen';
import OnboardingManualCreationScreen from '../screens/onboarding/OnboardingManualCreationScreen';
import OnboardingCompletionScreen from '../screens/onboarding/OnboardingCompletionScreen';
import WorkoutPlansScreen from '../screens/WorkoutPlansScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import WorkoutInputScreen from '../screens/workout/WorkoutInputScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { theme } = useTheme();
  const [initialRouteName, setInitialRouteName] = useState<keyof RootStackParamList>('WorkoutPlans');
  const [initialRouteParams, setInitialRouteParams] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      await database.initialize();
      
      // Check if onboarding is completed
      const isOnboardingCompleted = await database.isOnboardingCompleted();
      
      if (!isOnboardingCompleted) {
        setInitialRouteName('Onboarding');
        setIsLoading(false);
        return;
      }
      
      // If onboarding is completed, check for last selected plan
      const lastPlanId = await database.getLastSelectedPlan();
      
      if (lastPlanId) {
        const plan = await database.getWorkoutPlan(lastPlanId);
        if (plan) {
          setInitialRouteName('Workouts');
          setInitialRouteParams({ planId: plan.id, planName: plan.name });
        } else {
          // Plan doesn't exist anymore, go to WorkoutPlans
          setInitialRouteName('WorkoutPlans');
        }
      } else {
        // No last selected plan, go to WorkoutPlans
        setInitialRouteName('WorkoutPlans');
      }
    } catch (error) {
      console.error('Error checking initial route:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: '600',
          },
          headerBackTitle: '',
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="OnboardingMethodSelection" 
          component={OnboardingMethodSelectionScreen}
          options={{ 
            title: 'Get Started',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen 
          name="OnboardingTextImport" 
          component={OnboardingTextImportScreen}
          options={{ 
            title: 'Import Text',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen 
          name="OnboardingTemplateSelection" 
          component={OnboardingTemplateSelectionScreen}
          options={{ 
            title: 'Templates',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen 
          name="OnboardingExerciseBuilder" 
          component={OnboardingExerciseBuilderScreen}
          options={{ 
            title: 'Exercise Builder',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen 
          name="OnboardingManualCreation" 
          component={OnboardingManualCreationScreen}
          options={{ 
            title: 'Manual Creation',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen 
          name="OnboardingCompletion" 
          component={OnboardingCompletionScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="WorkoutPlans" 
          component={WorkoutPlansScreen}
          options={{ title: 'GymNotes' }}
        />
        <Stack.Screen 
          name="Workouts" 
          component={WorkoutsScreen}
          options={({ route }) => ({ 
            title: route.params?.planName || 'Workouts'
          })}
          initialParams={initialRouteName === 'Workouts' ? initialRouteParams : undefined}
        />
        <Stack.Screen 
          name="WorkoutInput" 
          component={WorkoutInputScreen}
          options={{ 
            title: 'New Workout',
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ 
            title: 'Profile',
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            title: 'Settings',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}