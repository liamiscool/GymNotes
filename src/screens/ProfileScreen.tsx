import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList, UserProfile } from '../types';
import { database } from '../services/database';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      await database.initialize();
      const profile = await database.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );

  const renderMenuItem = (
    icon: string, 
    title: string, 
    subtitle?: string, 
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity 
      style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon as any} size={24} color={theme.colors.primary} />
        <View style={styles.menuItemText}>
          <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Profile Stats */}
        {renderSection('Stats', (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {userProfile?.currentStreak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Current Streak
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {userProfile?.totalWorkouts || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Total Workouts
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {userProfile?.longestStreak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Longest Streak
              </Text>
            </View>
          </View>
        ))}

        {/* App Settings */}
        {renderSection('Settings', (
          <>
            {renderMenuItem(
              'moon-outline',
              'Dark Mode',
              theme.isDark ? 'Enabled' : 'Disabled',
              toggleTheme,
              <TouchableOpacity onPress={toggleTheme}>
                <View style={[
                  styles.toggle,
                  { backgroundColor: theme.isDark ? theme.colors.primary : theme.colors.border }
                ]}>
                  <View style={[
                    styles.toggleKnob,
                    { backgroundColor: 'white' },
                    theme.isDark && styles.toggleKnobActive
                  ]} />
                </View>
              </TouchableOpacity>
            )}
            {renderMenuItem(
              'notifications-outline',
              'Notifications',
              'Workout reminders and progress updates'
            )}
            {renderMenuItem(
              'cloud-upload-outline',
              'Data Sync',
              'Backup and sync across devices'
            )}
            {renderMenuItem(
              'download-outline',
              'Export Data',
              'Download your workout history'
            )}
          </>
        ))}

        {/* Subscription */}
        {renderSection('Subscription', (
          <>
            {renderMenuItem(
              'star-outline',
              'GymNotes Pro',
              userProfile?.isPro ? 'Active subscription' : 'Upgrade for premium features',
              () => Alert.alert('Coming Soon', 'Pro subscription features will be available in the next update.')
            )}
            {userProfile?.isPro && renderMenuItem(
              'card-outline',
              'Billing',
              'Manage subscription and payment'
            )}
          </>
        ))}

        {/* About */}
        {renderSection('About', (
          <>
            {renderMenuItem(
              'help-circle-outline',
              'Help & Support',
              'Get help with using GymNotes'
            )}
            {renderMenuItem(
              'information-circle-outline',
              'About GymNotes',
              'Version 1.0.0'
            )}
            {renderMenuItem(
              'document-text-outline',
              'Privacy Policy',
              'How we handle your data'
            )}
          </>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
});