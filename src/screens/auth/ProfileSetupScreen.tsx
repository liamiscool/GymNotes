import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { SupabaseDatabaseService } from '../../services/supabaseDatabase';

interface ProfileSetupScreenProps {
  onComplete: () => void;
}

// Gradient avatar colors
const AVATAR_GRADIENTS = [
  ['#FF6B6B', '#4ECDC4'],
  ['#A8E6CF', '#DCEDC1'],
  ['#FFD93D', '#6BCF7F'],
  ['#4ECDC4', '#44A08D'],
  ['#F093FB', '#F5576C'],
  ['#4FACFE', '#00F2FE'],
  ['#43E97B', '#38F9D7'],
  ['#FA709A', '#FEE140'],
  ['#A18CD1', '#FBC2EB'],
  ['#667eea', '#764ba2'],
];

const generateUsername = () => {
  const adjectives = ['Strong', 'Fast', 'Power', 'Iron', 'Mighty', 'Swift', 'Bold', 'Elite', 'Pro', 'Peak'];
  const nouns = ['Lifter', 'Athlete', 'Trainer', 'Beast', 'Champion', 'Warrior', 'Tiger', 'Lion', 'Eagle', 'Wolf'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective}${noun}${number}`;
};

export default function ProfileSetupScreen({ onComplete }: ProfileSetupScreenProps) {
  const { theme } = useTheme();
  const [username, setUsername] = useState(generateUsername());
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    try {
      const user = await SupabaseDatabaseService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }

      // Update user profile with username and avatar
      const { data, error } = await SupabaseDatabaseService.supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          username: username.trim(),
          avatar_url: `gradient:${selectedGradient}`, // Store gradient index
          preferences: {
            avatar_gradient: selectedGradient
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        Alert.alert('Error', 'Failed to save profile');
        return;
      }

      onComplete();
    } catch (error) {
      console.error('Profile setup error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Use default values and continue
    handleSave();
  };

  const generateNewUsername = () => {
    setUsername(generateUsername());
  };

  const renderGradientAvatar = (gradientIndex: number, size: number = 60, isSelected: boolean = false) => {
    const gradient = AVATAR_GRADIENTS[gradientIndex];
    
    return (
      <View style={[
        styles.avatarContainer,
        { width: size, height: size, borderRadius: size / 2 },
        isSelected && { borderWidth: 3, borderColor: theme.colors.primary }
      ]}>
        <LinearGradient
          colors={gradient}
          style={[styles.gradientAvatar, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>
            {username.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Set Up Your Profile
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Customize your avatar and username (you can change these later)
          </Text>
        </View>

        {/* Current Avatar Preview */}
        <View style={styles.avatarPreview}>
          {renderGradientAvatar(selectedGradient, 120)}
        </View>

        {/* Avatar Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Choose Avatar
          </Text>
          <View style={styles.avatarGrid}>
            {AVATAR_GRADIENTS.map((gradient, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedGradient(index)}
              >
                {renderGradientAvatar(index, 50, selectedGradient === index)}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Username */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Username
          </Text>
          <View style={styles.usernameContainer}>
            <TextInput
              style={[styles.usernameInput, { 
                color: theme.colors.text,
                backgroundColor: theme.isDark ? '#2C2C2E' : '#F2F2F7',
                borderColor: theme.colors.border
              }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={20}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.regenerateButton, { backgroundColor: theme.colors.surface }]}
              onPress={generateNewUsername}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.usernameHint, { color: theme.colors.textSecondary }]}>
            Tap the refresh button to generate a new username
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Profile</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
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
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  gradientAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  usernameContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  usernameInput: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  regenerateButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameHint: {
    fontSize: 12,
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
    gap: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    padding: 8,
  },
  skipButtonText: {
    fontSize: 14,
  },
});