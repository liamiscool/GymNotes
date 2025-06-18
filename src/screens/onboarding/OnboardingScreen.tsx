import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { RootStackParamList } from '../../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Auto-navigate to method selection after a brief delay
    const timer = setTimeout(() => {
      navigation.navigate('OnboardingMethodSelection');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏋️‍♂️</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome to GymNotes
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Simple. Fast. Effective workout tracking.
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});