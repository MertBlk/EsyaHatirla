import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    safeArea: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.dark.background : theme.light.background,
    },
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: isDarkMode ? theme.dark.background : theme.light.background,
    },
    text: {
      color: isDarkMode ? theme.dark.text : theme.light.text,
    },
    selectedItemText: {
      color: '#34C759', // Her iki tema için de yeşil renk
      fontWeight: '600'
    },
    textSecondary: {
      color: isDarkMode ? theme.dark.textSecondary : theme.light.textSecondary,
    },
    statsCard: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDarkMode ? 0.2 : 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
    categoryButton: {
      height: 36,
      paddingHorizontal: 16,
      marginRight: 8,
      borderRadius: 18,
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      shadowColor: "#000",
      shadowOffset: { 
        width: 0, 
        height: 1 
      },
      shadowOpacity: isDarkMode ? 0.2 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    categoryButtonText: {
      fontSize: 15,
      fontWeight: '500',
      
      color: isDarkMode ? '#EBEBF5' : '#000000',
    },
    selectedCategoryButton: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    selectedCategoryText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    itemContainer: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
    selectedItem: {
      backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
      borderWidth: 1,
      borderColor: '#34C759',
    },
    modalBackground: {
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
    },
    modalContent: {
      backgroundColor: isDarkMode ? theme.dark.background : theme.light.background,
    },
    locationItem: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
    locationText: {
      color: isDarkMode ? '#FFFFFF' : '#000000',
      fontSize: 16,
      fontWeight: '500',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      width: 100, // Sabit genişlik
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: isDarkMode ? '#FFFFFF' : '#000000',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? '#EBEBF5' : '#666666',
    },
    statDivider: {
      width: 1,
      backgroundColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
      marginHorizontal: 12,
      alignSelf: 'stretch',
    },
  };

  return { 
    isDarkMode, 
    setIsDarkMode, 
    toggleTheme, 
    dynamicStyles,
    theme 
  };
};