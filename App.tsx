import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-gesture-handler';

import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/auth/AuthScreen';
import ProfileSetupScreen from './src/screens/auth/ProfileSetupScreen';
import { SupabaseDatabaseService } from './src/services/supabaseDatabase';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize and check auth state
    const initializeAuth = async () => {
      try {
        const currentUser = await SupabaseDatabaseService.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Check if user has completed profile setup
          const profile = await SupabaseDatabaseService.getUserProfile();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = SupabaseDatabaseService.subscribeToAuthChanges(async (user) => {
      setUser(user);
      
      if (user) {
        // Check profile when user signs in
        const profile = await SupabaseDatabaseService.getUserProfile();
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = () => {
    // Auth state will be updated via the subscription
  };

  const handleProfileSetupComplete = async () => {
    // Refresh user profile
    const profile = await SupabaseDatabaseService.getUserProfile();
    setUserProfile(profile);
  };

  if (loading) {
    return (
      <ThemeProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {!user ? (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      ) : !userProfile?.username ? (
        <ProfileSetupScreen onComplete={handleProfileSetupComplete} />
      ) : (
        <AppNavigator />
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
