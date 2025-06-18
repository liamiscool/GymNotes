import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  style?: ViewStyle;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  style, 
  showLabel = true, 
  size = 'medium' 
}) => {
  const { theme, themeMode, setThemeMode } = useTheme();
  
  const options = [
    { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' }
  ] as const;

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const containerHeight = size === 'small' ? 32 : size === 'large' ? 48 : 40;

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Theme
        </Text>
      )}
      <View style={[
        styles.segmentedControl, 
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          height: containerHeight
        }
      ]}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.segment,
              themeMode === option.key && [styles.activeSegment, {
                backgroundColor: theme.colors.accent
              }]
            ]}
            onPress={() => setThemeMode(option.key)}
            accessibilityRole="button"
            accessibilityLabel={`Set theme to ${option.label}`}
            accessibilityState={{ selected: themeMode === option.key }}
          >
            <Ionicons 
              name={option.icon}
              size={iconSize}
              color={
                themeMode === option.key 
                  ? theme.colors.background 
                  : theme.colors.textSecondary
              }
            />
            {showLabel && size !== 'small' && (
              <Text style={[
                styles.segmentText,
                { 
                  color: themeMode === option.key 
                    ? theme.colors.background 
                    : theme.colors.textSecondary,
                  fontSize: size === 'large' ? 16 : 14
                }
              ]}>
                {option.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  activeSegment: {
    // Background color set dynamically
  },
  segmentText: {
    fontWeight: '500',
  },
});

export default ThemeToggle;