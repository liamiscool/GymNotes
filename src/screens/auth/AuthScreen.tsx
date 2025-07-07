import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { SupabaseDatabaseService } from '../../services/supabaseDatabase';

type AuthMode = 'signin' | 'signup';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const { theme } = useTheme();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (authMode === 'signup' && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (authMode === 'signin') {
        result = await SupabaseDatabaseService.signInWithEmail(email, password);
      } else {
        result = await SupabaseDatabaseService.signUpWithEmail(email, password);
      }

      if (result.success) {
        if (authMode === 'signup') {
          Alert.alert(
            'Check Your Email',
            'We sent you a verification link. Please verify your email to continue.',
            [{ text: 'OK', onPress: () => setAuthMode('signin') }]
          );
        } else {
          onAuthSuccess();
        }
      } else {
        // Better error handling
        let errorMessage = result.error || 'Authentication failed';
        let errorTitle = 'Error';
        
        if (errorMessage.includes('Invalid login credentials')) {
          if (authMode === 'signin') {
            errorTitle = 'Login Failed';
            errorMessage = 'Incorrect email or password. Try signing up if you don\'t have an account yet.';
            Alert.alert(
              errorTitle, 
              errorMessage,
              [
                { text: 'Try Again', style: 'cancel' },
                { text: 'Sign Up Instead', onPress: () => setAuthMode('signup') }
              ]
            );
            return;
          } else {
            errorTitle = 'Sign Up Failed';
            errorMessage = 'This email might already be registered. Try signing in instead.';
            Alert.alert(
              errorTitle, 
              errorMessage,
              [
                { text: 'Try Again', style: 'cancel' },
                { text: 'Sign In Instead', onPress: () => setAuthMode('signin') }
              ]
            );
            return;
          }
        } else if (errorMessage.includes('Email not confirmed')) {
          errorTitle = 'Email Not Verified';
          errorMessage = 'Please check your email and click the verification link before signing in.';
        } else if (errorMessage.includes('User already registered')) {
          errorTitle = 'Account Exists';
          errorMessage = 'This email is already registered. Try signing in instead.';
        } else if (errorMessage.includes('Invalid email')) {
          errorTitle = 'Invalid Email';
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('Password should be at least 6 characters')) {
          errorTitle = 'Weak Password';
          errorMessage = 'Password must be at least 6 characters long.';
        }
        
        Alert.alert(errorTitle, errorMessage);
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
  };

  const isSignUp = authMode === 'signup';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {isSignUp 
                ? 'Start tracking your workouts' 
                : 'Sign in to continue your fitness journey'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Email
              </Text>
              <TextInput
                style={[styles.input, { 
                  color: theme.colors.text,
                  backgroundColor: theme.isDark ? '#2C2C2E' : '#F2F2F7',
                  borderColor: theme.colors.border
                }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Password
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { 
                    color: theme.colors.text,
                    backgroundColor: theme.isDark ? '#2C2C2E' : '#F2F2F7',
                    borderColor: theme.colors.border
                  }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry={!showPassword}
                  textContentType={isSignUp ? "newPassword" : "password"}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Mode */}
            <TouchableOpacity style={styles.toggleButton} onPress={toggleAuthMode}>
              <Text style={[styles.toggleText, { color: theme.colors.textSecondary }]}>
                {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
                <Text style={[styles.toggleLink, { color: theme.colors.primary }]}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    padding: 16,
    paddingRight: 50,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontWeight: '600',
  },
});