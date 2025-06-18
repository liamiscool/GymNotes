import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme, ThemeContextValue } from '../types';

const createTheme = (isDark: boolean, mode: 'system' | 'light' | 'dark' = 'system'): AppTheme => ({
  isDark,
  mode,
  colors: isDark ? {
    // Core colors (dark)
    primary: '#0A84FF',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    accent: '#30D158',
    
    // Semantic colors (dark)
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#0A84FF',
    
    // Interactive colors (dark)
    buttonBackground: '#0A84FF',
    buttonText: '#FFFFFF',
    inputBackground: '#1C1C1E',
    placeholderText: '#48484A',
    
    // Workout-specific colors (dark)
    exerciseBackground: '#1C1C1E',
    setCompleted: '#30D158',
    setPending: '#48484A',
    restBackground: '#2C2C2E',
    streakActive: '#30D158',
  } : {
    // Core colors (light)
    primary: '#007AFF',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#E5E5EA',
    accent: '#34C759',
    
    // Semantic colors (light)
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    
    // Interactive colors (light)
    buttonBackground: '#007AFF',
    buttonText: '#FFFFFF',
    inputBackground: '#F2F2F7',
    placeholderText: '#C7C7CC',
    
    // Workout-specific colors (light)
    exerciseBackground: '#F2F2F7',
    setCompleted: '#34C759',
    setPending: '#C7C7CC',
    restBackground: '#E5E5EA',
    streakActive: '#34C759',
  }
});

const THEME_STORAGE_KEY = '@theme_mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<'system' | 'light' | 'dark'>('system');
  const [isSystemDark, setIsSystemDark] = useState(false);

  // Load saved theme preference on startup
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['system', 'light', 'dark'].includes(savedMode)) {
          setThemeModeState(savedMode as 'system' | 'light' | 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsSystemDark(colorScheme === 'dark');
    });
    
    // Initial system theme
    setIsSystemDark(Appearance.getColorScheme() === 'dark');
    
    return () => subscription?.remove();
  }, []);

  // Save theme preference when it changes
  const setThemeMode = async (mode: 'system' | 'light' | 'dark') => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
      // Still update state even if saving fails
      setThemeModeState(mode);
    }
  };

  // Calculate effective theme
  const effectiveTheme = React.useMemo(() => {
    const shouldUseDark = themeMode === 'dark' || 
      (themeMode === 'system' && isSystemDark);
    
    return createTheme(shouldUseDark, themeMode);
  }, [themeMode, isSystemDark]);

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 
                   themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{
      theme: effectiveTheme,
      themeMode,
      setThemeMode,
      toggleTheme,
      isSystemDark
    }}>
      {children}
    </ThemeContext.Provider>
  );
};