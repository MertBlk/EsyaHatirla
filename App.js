import React, { useMemo, useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme, AppState, Platform, LogBox, ActivityIndicator, Text } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import { ThemeProvider } from './context/ThemeContext';
import notificationManager from './src/utils/notificationManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

// Tema renklerini bileşen dışında sabit olarak tanımlayalım
const themeColors = {
  dark: {
    background: '#1C1C1E',
    surface: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    border: '#3A3A3C',
    modalBackground: 'rgba(0,0,0,0.8)'
  },
  light: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E5E5EA',
    modalBackground: 'rgba(0,0,0,0.5)'
  },
  common: {
    primary: '#007AFF',
    success: '#34C759', 
    warning: '#FF9500',
    error: '#FF3B30',
    shadow: '#000000'
  }
};

// Sabit storage anahtarları
const STORAGE_KEYS = {
  THEME: '@theme_preference',
  LANGUAGE: '@language_preference',
};

// App bileşeni
export default function App() {
  // Hook'ları en üstte tanımla
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(() => colorScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);
  const appStateRef = useRef(AppState.currentState);
  
  // Tema ve dil ayarlarını yükleme
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Promise.all kullanarak parallel işlemler yapma
        const [savedThemeValue, savedLanguageValue] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE)
        ]);
        
        // Temayı ayarla
        if (savedThemeValue) {
          setIsDarkMode(savedThemeValue === 'dark');
        } else {
          setIsDarkMode(colorScheme === 'dark');
          await AsyncStorage.setItem(STORAGE_KEYS.THEME, colorScheme === 'dark' ? 'dark' : 'light');
        }
        
        // Uygulama yeniden açıldığında bildirimleri düzgünce ayarla
        const lang = savedLanguageValue || 'tr';
        try {
          await notificationManager.setupNotifications(lang);
        } catch (error) {
          console.warn('Bildirim ayarları yüklenirken hata:', error);
        }
        
      } catch (error) {
        console.error('Ayarlar yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [colorScheme]);
  
  // AppState değişikliklerini takip et
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Ön plana geldiğinde yapılacak işlemler
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // Uygulama tekrar aktif olduğunda bellek yönetimini optimize et
        notificationManager.cleanupOldNotifications();
        
        // Bildirimleri yenile
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE)
          .then(lang => notificationManager.setupNotifications(lang || 'tr'))
          .catch(console.warn);
      }
      
      // Mevcut durumu güncelle
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
      notificationManager.cleanup();
    };
  }, []);
  
  // Tema değişikliği işleyici
  const handleThemeChange = async (darkMode) => {
    setIsDarkMode(darkMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, darkMode ? 'dark' : 'light');
    } catch (error) {
      console.warn('Tema tercihi kaydedilemedi:', error);
    }
  };
  
  // Renkleri optimize et
  const colors = useMemo(() => ({
    ...(isDarkMode ? themeColors.dark : themeColors.light),
    ...themeColors.common,
  }), [isDarkMode]);

  // Screen options'ı optimize et
  const screenOptions = useMemo(() => ({
    headerStyle: {
      backgroundColor: colors.background
    },
    headerTintColor: colors.text,
    headerShadowVisible: false,
    animation: Platform.OS === 'ios' ? 'default' : 'fade'
  }), [colors]);

  // Tema context değerlerini optimize et
  const themeContextValue = useMemo(() => ({
    isDark: isDarkMode,
    toggleTheme: () => handleThemeChange(!isDarkMode),
    setIsDarkMode: handleThemeChange,
    colors
  }), [isDarkMode, colors, handleThemeChange]);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 20, color: isDarkMode ? '#FFFFFF' : '#000000' }}>
          Uygulama yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={themeContextValue}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={screenOptions}>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ 
                  title: '',
                  headerShown: false 
                }} 
              />
            </Stack.Navigator>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
          </NavigationContainer>
        </SafeAreaProvider>
      </View>
    </ThemeProvider>
  );
}