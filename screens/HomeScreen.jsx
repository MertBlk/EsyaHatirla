import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export default function HomeScreen() {
  const [homeLocation, setHomeLocation] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(0);

  useEffect(() => {
    setupPermissions();
  }, []);

  const setupPermissions = async () => {
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      Alert.alert('İzin Gerekli', 'Konum izni verilmedi');
      return;
    }

    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
    if (notificationStatus !== 'granted') {
      Alert.alert('İzin Gerekli', 'Bildirim izni verilmedi');
    }
  };

  const saveHomeLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setHomeLocation(location.coords);
      Alert.alert('Başarılı', 'Ev konumu kaydedildi!');
    } catch (error) {
      Alert.alert('Hata', 'Konum alınamadı');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={saveHomeLocation}
      >
        <Text style={styles.buttonText}>Ev Konumunu Kaydet</Text>
      </TouchableOpacity>
      
      <Text style={styles.text}>
        Eve olan uzaklık: {Math.round(currentDistance)} metre
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
  },
});