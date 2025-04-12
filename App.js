import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme, AppState, Platform } from 'react-native';
import { useMemo, useEffect, useRef } from 'react'; // useMemo eklenmiş
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
    border: '#3A3A3C'
  },
  light: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#000000',
    border: '#E5E5EA'
  }
};

export default function App() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const appState = useRef(AppState.currentState);
  
  // Tema ve dil ayarlarını eğer varsa hafızadan yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_preference');
        const savedLanguage = await AsyncStorage.getItem('@language_preference');
        
        // Uygulama yeniden açıldığında bildirimleri düzgünce ayarla
        const lang = savedLanguage || 'tr';
        notificationManager.setupNotifications(lang);
      } catch (error) {
        console.error('Ayarlar yüklenirken hata oluştu:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // AppState değişikliklerini takip et - uygulama aktif hale geldiğinde kaynakları düzenle
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Uygulama tekrar aktif olduğunda bellek yönetimini optimize et
        notificationManager.cleanupOldNotifications();
      }
      
      // Eğer uygulama arka plana geçerse bellekten tasarruf et
      if (nextAppState.match(/inactive|background/) && appState.current === 'active') {
        // Arka plana geçerken yapılması gerekenler
      }
      
      appState.current = nextAppState;
    });

    return () => {
      // Temizlik
      subscription.remove();
      notificationManager.cleanup();
    };
  }, []);
  
  // Renkleri useMemo ile sarmalayarak optimize edelim
  const colors = useMemo(() => {
    return isDarkMode ? themeColors.dark : themeColors.light;
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

  return (
    <ThemeProvider>
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