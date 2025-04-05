import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      } else {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Tema yükleme hatası:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('@theme_preference', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Tema kaydetme hatası:', error);
    }
  };

  const theme = {
    dark: {
      background: '#1C1C1E',
      surface: '#2C2C2E',
      text: '#FFFFFF',
      textSecondary: '#EBEBF5',
      border: '#3A3A3C'
    },
    light: {
      background: '#F2F2F7',
      surface: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E5E5EA'
    }
  };

  const dynamicStyles = {
    container: {
      backgroundColor: isDarkMode ? theme.dark.background : theme.light.background
    },
    safeArea: {
      backgroundColor: isDarkMode ? theme.dark.background : theme.light.background
    },
    text: {
      color: isDarkMode ? theme.dark.text : theme.light.text
    },
    surface: {
      backgroundColor: isDarkMode ? theme.dark.surface : theme.light.surface,
      borderColor: isDarkMode ? theme.dark.border : theme.light.border
    },
    categoryText: {
      color: isDarkMode ? theme.dark.textSecondary : theme.light.textSecondary
    },
    selectedCategory: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF'
    },
    modalBackground: {
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'
    },
    modalContent: {
      backgroundColor: isDarkMode ? theme.dark.background : theme.light.background
    },
    shadow: {
      shadowColor: isDarkMode ? '#000' : '#999',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.25 : 0.15,
      shadowRadius: 3.84,
      elevation: 5
    },
    statsCard: {
      backgroundColor: isDarkMode ? theme.dark.surface : theme.light.surface,
      borderColor: isDarkMode ? theme.dark.border : theme.light.border,
    },
    locationItem: {
      backgroundColor: isDarkMode ? theme.dark.surface : theme.light.surface,
      borderColor: isDarkMode ? theme.dark.border : theme.light.border,
    },
    button: {
      backgroundColor: isDarkMode ? '#FF9500' : '#FF9500',
    }
  };

  return { 
    isDarkMode, 
    setIsDarkMode, 
    toggleTheme, 
    dynamicStyles,
    theme 
  };
};