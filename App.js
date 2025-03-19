import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme } from 'react-native';
import HomeScreen from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

// Tema renkleri
const theme = {
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
  const colors = isDarkMode ? theme.dark : theme.light;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{
            headerStyle: {
              backgroundColor: colors.background
            },
            headerTintColor: colors.text,
            headerShadowVisible: false // Header çizgisini kaldırır
          }}>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ 
                title: '',
                headerShown: false // Header'ı tamamen gizler
              }} 
            />
          </Stack.Navigator>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
        </NavigationContainer>
      </SafeAreaProvider>
    </View>
  );
}