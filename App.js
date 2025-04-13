import React, { useMemo, useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme, AppState, Platform, LogBox } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import { ThemeProvider } from './context/ThemeContext';
import notificationManager from './src/utils/notificationManager';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Bazı gereksiz uyarıları dikkate alma
LogBox.ignoreLogs([
  'Overwriting fontFamily style attribute preprocessor',
  'VirtualizedLists should never be nested', // FlatList iç içe kullanımı uyarısı
]);

// Splash ekranını göster


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

export default function App() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [isReady, setIsReady] = useState(false);
  const appState = useRef(AppState.currentState);
  
  // Tema ve dil ayarlarını eğer varsa hafızadan yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Promise.all kullanarak parallel işlemler yapma
        const [savedThemeValue, savedLanguageValue] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE)
        ]);
        
        // Temayı ayarla (eğer kayıtlı değer varsa)
        if (savedThemeValue) {
          setIsDarkMode(savedThemeValue === 'dark');
        } else {
          // Kayıtlı değer yoksa sistem temasını kullan ve kaydet
          setIsDarkMode(colorScheme === 'dark');
          AsyncStorage.setItem(
            STORAGE_KEYS.THEME, 
            colorScheme === 'dark' ? 'dark' : 'light'
          ).catch(console.error);
        }
        
        // Uygulama yeniden açıldığında bildirimleri düzgünce ayarla
        const lang = savedLanguageValue || 'tr';
        await notificationManager.setupNotifications(lang);
        
        // Ayarlar yüklendikten sonra uygulamanın hazır olduğunu işaretle
        setIsReady(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Ayarlar yüklenirken hata oluştu:', error);
        // Hata olsa da uygulamayı göster
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };
    
    loadSettings();
  }, [colorScheme]);
  
  // AppState değişikliklerini takip et - uygulama aktif hale geldiğinde kaynakları düzenle
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Ön plana geldiğinde yapılacak işlemler
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Uygulama tekrar aktif olduğunda bellek yönetimini optimize et
        notificationManager.cleanupOldNotifications();
        
        // Bildirimleri yenile
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE)
          .then(lang => notificationManager.setupNotifications(lang || 'tr'))
          .catch(console.error);
      }
      
      // Arka plana geçtiğinde yapılacak işlemler
      if (nextAppState.match(/inactive|background/) && appState.current === 'active') {
        // Arka planda gereksiz kaynakları temizle
      }
      
      // Mevcut durumu güncelle
      appState.current = nextAppState;
    });

    return () => {
      // Temizlik
      subscription.remove();
      notificationManager.cleanup();
    };
  }, []);
  
  // Tema değişikliğini kaydet
  const handleThemeChange = async (darkMode) => {
    setIsDarkMode(darkMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Tema kaydedilirken hata:', error);
    }
  };
  
  // Renkleri useMemo ile sarmalayarak optimize edelim
  const colors = useMemo(() => {
    return {
      ...(isDarkMode ? themeColors.dark : themeColors.light),
      ...themeColors.common,
    };
  }, [isDarkMode]);

  // Screen options'ı da useMemo ile sarmalayarak optimize edelim
  const screenOptions = useMemo(() => ({
    headerStyle: {
      backgroundColor: colors.background
    },
    headerTintColor: colors.text,
    headerShadowVisible: false,
    animation: Platform.OS === 'ios' ? 'default' : 'fade', // Android'de daha iyi performans
  }), [colors]);

  // Tema sağlayıcısı değerlerini optimize et
  const themeContextValue = useMemo(() => ({
    isDark: isDarkMode,
    toggleTheme: () => handleThemeChange(!isDarkMode),
    setIsDarkMode: handleThemeChange,
    colors
  }), [isDarkMode, colors, handleThemeChange]);

  // Uygulama hazır değilse boş bir görünüm göster
  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: isDarkMode ? '#000000' : '#FFFFFF' }} />
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