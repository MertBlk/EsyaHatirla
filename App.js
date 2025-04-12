import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme } from 'react-native';
import { useMemo } from 'react'; // useMemo eklenmiş
import HomeScreen from './screens/HomeScreen';
import { ThemeProvider } from './context/ThemeContext';

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
    headerShadowVisible: false
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