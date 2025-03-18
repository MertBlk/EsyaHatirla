import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    
      <View style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ 
                  title: '',
                  headerStyle: {
                    backgroundColor: '#007AFF',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }} 
              />
            </Stack.Navigator>
            <StatusBar style="light" />
          </NavigationContainer>
        </SafeAreaProvider>
      </View>
    
  );
}