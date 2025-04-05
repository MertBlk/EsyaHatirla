import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Vibration } from 'react-native';
import { STORAGE_KEYS } from '../constants/categories';
import { useNotifications } from './useNotifications';  // Düzeltilen import

const useLocation = () => {
  const [homeLocation, setHomeLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const { sendAlert: sendLocationAlert } = useNotifications();

  // Kayıtlı konumları yükle
  useEffect(() => {
    const loadSavedLocations = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
        if (savedData) {
          setSavedLocations(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Konum yükleme hatası:', error);
      }
    };

    loadSavedLocations();
  }, []);

  const saveLocation = async (name) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Hatası', 'Konum izni verilmedi');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      if (location?.coords) {
        const { latitude, longitude } = location.coords;
        const newLocation = {
          id: Date.now().toString(),
          name,
          latitude,
          longitude
        };

        const updatedLocations = [...savedLocations, newLocation];
        setSavedLocations(updatedLocations);
        await AsyncStorage.setItem(
          STORAGE_KEYS.SAVED_LOCATIONS,
          JSON.stringify(updatedLocations)
        );
        return newLocation;
      }
      return null;
    } catch (error) {
      console.error('Konum kaydetme hatası:', error);
      Alert.alert('Hata', 'Konum kaydedilemedi');
      return null;
    }
  };

  const saveHomeLocation = async () => {
    try {
      // İzinleri kontrol et
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Hatası', 'Konum izni verilmedi');
        return;
      }

      // Mevcut konumu al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      if (!location?.coords) {
        Alert.alert('Hata', 'Konum alınamadı');
        return;
      }

      const { latitude, longitude } = location.coords;

      // Konum adını iste
      Alert.prompt(
        "Konum Adı",
        "Bu konumu nasıl adlandırmak istersiniz?",
        [
          { 
            text: "İptal", 
            style: "cancel" 
          },
          {
            text: "Kaydet",
            onPress: async (name) => {
              if (!name) {
                Alert.alert('Hata', 'Konum adı boş olamaz');
                return;
              }

              const newLocation = {
                id: Date.now().toString(),
                name,
                latitude,
                longitude
              };

              try {
                // Yeni konumu kaydet
                const updatedLocations = [...savedLocations, newLocation];
                setSavedLocations(updatedLocations);
                setHomeLocation(newLocation);
                
                await AsyncStorage.setItem(
                  STORAGE_KEYS.SAVED_LOCATIONS,
                  JSON.stringify(updatedLocations)
                );

                Alert.alert('Başarılı', 'Konum başarıyla kaydedildi!');
              } catch (error) {
                Alert.alert('Hata', 'Konum kaydedilemedi');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Hata', 'Konum işlemi başarısız oldu');
    }
  };

  const startLocationTracking = async (onDistanceChange) => {
    if (!homeLocation) {
      Alert.alert('Hata', 'Önce ev konumunuzu kaydetmelisiniz.');
      return;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000,
          distanceInterval: 10,
        },
        (location) => {
          if (onDistanceChange) {
            onDistanceChange(location);
          }
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
    } catch (error) {
      console.error('Konum takibi hatası:', error);
      Alert.alert('Hata', 'Konum takibi başlatılamadı');
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      setIsTracking(false);
    }
  };

  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
             Math.cos(φ1) * Math.cos(φ2) * 
             Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const simulateLocationChange = async (selectedItems) => {
    if (!homeLocation) {
      Alert.alert("Hata", "Önce ev konumunuzu kaydetmelisiniz!");
      return;
    }

    const testLocation = {
      coords: {
        latitude: homeLocation.latitude + 0.001, // Yaklaşık 100m kuzey
        longitude: homeLocation.longitude
      }
    };

    // Mesafe hesaplama
    const distance = getDistanceFromLatLonInMeters(
      homeLocation.latitude,
      homeLocation.longitude,
      testLocation.coords.latitude,
      testLocation.coords.longitude
    );

    if (distance >= 50) {
      const { sendLocationAlert } = useNotifications();
      await sendLocationAlert(selectedItems);
    }
  };

  return {
    homeLocation,
    setHomeLocation,
    savedLocations,
    setSavedLocations,
    locationSubscription,
    setLocationSubscription,
    isTracking,
    saveLocation,
    saveHomeLocation,
    startLocationTracking,
    stopLocationTracking,
    simulateLocationChange
  };
};

export default useLocation;