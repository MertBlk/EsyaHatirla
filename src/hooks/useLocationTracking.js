import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistanceFromLatLonInMeters } from '../../utils/distance';
import notificationManager from '../utils/notificationManager';

// Sabit değişkenleri tanımla
const STORAGE_KEYS = {
  SAVED_LOCATIONS: '@saved_locations',
  HOME_LOCATION: '@home_location'
};

export default function useLocationTracking(strings, currentLanguage, selectedItems) {
  const [homeLocation, setHomeLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  
  // Bildirim kontrolü için ref kullan
  const lastHomeLocationRef = useRef(null);
  const notificationShownRef = useRef(false);

  // Kullanıcının konum izinlerini isteme
  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          strings[currentLanguage]?.errors?.permission || "İzin Hatası", 
          strings[currentLanguage]?.errors?.location || "Konum izni verilmedi."
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("İzin hatası:", error);
      Alert.alert(
        strings[currentLanguage]?.errors?.error || "Hata", 
        strings[currentLanguage]?.errors?.permissionsError || "Konum izinleri alınırken bir hata oluştu."
      );
      return false;
    }
  };

  // Konum kaydetme fonksiyonu
  const saveLocation = async () => {
    try {
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      if (location?.coords) {
        const { latitude, longitude } = location.coords;
        
        Alert.prompt(
          strings[currentLanguage]?.location?.namePrompt || "Konum Adı",
          strings[currentLanguage]?.location?.nameDescription || "Bu konumu nasıl adlandırmak istersiniz?",
          [
            { 
              text: strings[currentLanguage]?.buttons?.cancel || "İptal", 
              style: "cancel" 
            },
            {
              text: strings[currentLanguage]?.buttons?.save || "Kaydet",
              onPress: async (name) => {
                if (!name) return;
                
                const newLocation = {
                  id: Date.now().toString(),
                  name,
                  latitude,
                  longitude,
                  items: [...selectedItems] // O anda seçili eşyaları bu konuma ekle
                };

                try {
                  const updatedLocations = [...savedLocations, newLocation];
                  setSavedLocations(updatedLocations);
                  await AsyncStorage.setItem(
                    STORAGE_KEYS.SAVED_LOCATIONS,
                    JSON.stringify(updatedLocations)
                  );
                  setHomeLocation(newLocation);
                } catch (error) {
                  console.error("Storage error:", error);
                  Alert.alert(
                    strings[currentLanguage]?.errors?.error || "Hata", 
                    strings[currentLanguage]?.errors?.locationSaveError || "Konum kaydedilemedi"
                  );
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Konum kaydetme hatası:", error);
      Alert.alert(
        strings[currentLanguage]?.errors?.error || "Hata", 
        strings[currentLanguage]?.errors?.locationSaveError || "Konum kaydedilemedi"
      );
    }
  };

  // Konum takibini başlatma fonksiyonu
  const startLocationTracking = useCallback(async (savedLocation) => {
    try {
      // savedLocation parametresini veya state'teki homeLocation'ı kullan
      const locationToTrack = savedLocation || homeLocation;
      
      if (!locationToTrack) {
        Alert.alert(
          strings[currentLanguage]?.errors?.error || "Hata", 
          strings[currentLanguage]?.location?.noHomeLocation || "Önce ev konumunuzu kaydetmelisiniz."
        );
        return;
      }

      // Eğer zaten takip varsa, yeni bir takip başlatmayalım
      if (locationSubscription) {
        return;
      }
      
      console.log("Takip başlatılıyor, konum:", locationToTrack);

      // Kullanıcı hareketine dayalı daha akıllı takip
      const foregroundPermission = await Location.requestForegroundPermissionsAsync();
      const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
      
      // Pil optimizasyonu için ayarları düzenleme
      const accuracy = backgroundPermission.status === 'granted' 
        ? Location.Accuracy.Balanced
        : Location.Accuracy.Low;
        
      const timeInterval = backgroundPermission.status === 'granted'
        ? 180000 // Arka planda 3 dakika
        : 90000;  // Ön planda 1.5 dakika
        
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: accuracy,
          timeInterval: timeInterval,
          distanceInterval: 15, // 15 metrede bir kontrol et (battarya tasarrufu)
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const distance = getDistanceFromLatLonInMeters(
            locationToTrack.latitude,
            locationToTrack.longitude,
            latitude,
            longitude
          );

          console.log("Mevcut mesafe:", distance);

          // 50 metre uzaklaşınca bildirim gönder ve konum takibini durdur
          if (distance >= 50 && !notificationShownRef.current) {
            notificationManager.sendAlert(strings, currentLanguage, selectedItems);
            Vibration.vibrate(1000);
            notificationShownRef.current = true;
            
            // Konum takibini durdur
            if (subscription) {
              subscription.remove();
              setLocationSubscription(null);
              setIsTracking(false);
              console.log("Konum takibi durduruldu: Kullanıcı konumdan 50+ metre uzaklaştı");
              
              // Kullanıcıya bildirim göster
              Alert.alert(
                strings[currentLanguage]?.alerts?.trackingStopped || "Takip Durduruldu", 
                strings[currentLanguage]?.alerts?.leftArea || "Belirtilen alandan uzaklaştınız. Konum takibi durduruldu."
              );
            }
          } else if (distance < 50) {
            notificationShownRef.current = false;
          }
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
    } catch (error) {
      console.error("Konum takibi hatası:", error);
      Alert.alert(
        strings[currentLanguage]?.errors?.error || "Hata",
        strings[currentLanguage]?.errors?.trackingError || "Konum takibi başlatılamadı: " + (error.message || "Bilinmeyen hata")
      );
    }
  }, [homeLocation, locationSubscription, strings, currentLanguage, selectedItems]);

  // Konum değişikliği simülasyonu (test için)
  const simulateLocationChange = useCallback(() => {
    // Önce ev konumu kontrolü yap
    if (!homeLocation) {
      Alert.alert(
        strings[currentLanguage]?.alerts?.warning || "Uyarı",
        strings[currentLanguage]?.location?.noLocation || "Önce bir konum kaydetmelisiniz",
        [{ 
          text: strings[currentLanguage]?.buttons?.ok || "Tamam", 
          onPress: () => saveLocation() 
        }]
      );
      return;
    }

    console.log("Konum değişikliği simüle ediliyor...");
    
    // Test koordinatları (Ev konumundan 100 metre uzakta)
    const testLocation = {
      coords: {
        latitude: homeLocation.latitude + 0.001, // Yaklaşık 100 metre kuzey
        longitude: homeLocation.longitude
      }
    };

    console.log("Simüle edilen konum:", testLocation.coords);
    
    const distance = getDistanceFromLatLonInMeters(
      homeLocation.latitude,
      homeLocation.longitude,
      testLocation.coords.latitude,
      testLocation.coords.longitude
    );

    console.log("Hesaplanan mesafe:", distance, "metre");
    
    if (distance >= 50) {
      // Bildirimi gönder ve kullanıcıya mesafeyi bildir
      notificationManager.sendAlert(strings, currentLanguage, selectedItems);
      Vibration.vibrate(1000);
      
      Alert.alert(
        strings[currentLanguage]?.alerts?.locationTest || "Test Başarılı",
        (strings[currentLanguage]?.alerts?.distanceFound || "Test mesafesi: ") + 
          Math.round(distance) + (strings[currentLanguage]?.alerts?.meters || " metre")
      );
    } else {
      Alert.alert(
        strings[currentLanguage]?.alerts?.locationTest || "Konum Testi",
        (strings[currentLanguage]?.alerts?.distanceTooSmall || "Hesaplanan mesafe 50m'den az: ") + 
          Math.round(distance) + (strings[currentLanguage]?.alerts?.meters || " metre")
      );
    }
    
    // Eğer varsa mevcut location subscription'ı temizle
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  }, [homeLocation, locationSubscription, strings, currentLanguage, selectedItems, saveLocation]);

  // Konuma ait eşyaları güncelle (sessiz mod ekleyelim)
  const updateLocationItems = async (locationId, silent = true) => {
    // Güncellenecek konumu bul
    const locationToUpdate = savedLocations.find(loc => loc.id === locationId);
    
    if (!locationToUpdate) return false;
    
    try {
      // Konum için seçili eşyaları güncelle
      const updatedLocation = {
        ...locationToUpdate,
        items: [...selectedItems]
      };
      
      // Tüm konumları güncelle
      const updatedLocations = savedLocations.map(loc => 
        loc.id === locationId ? updatedLocation : loc
      );
      
      // State ve AsyncStorage'ı güncelle
      setSavedLocations(updatedLocations);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(updatedLocations));
      
      // Sessiz mod değilse konsola bilgi ver
      if (!silent) {
        console.log(`"${updatedLocation.name}" konumu için eşyalar güncellendi:`, selectedItems);
      }
      return true;
    } catch (error) {
      console.error("Konum eşyaları güncellenirken hata:", error);
      return false;
    }
  };

  // Kaydedilmiş konumları yükleme
  useEffect(() => {
    const loadSavedLocations = async () => {
      try {
        const savedLocationsList = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
        const savedHomeLocation = await AsyncStorage.getItem(STORAGE_KEYS.HOME_LOCATION);
        
        if (savedLocationsList) {
          const locations = JSON.parse(savedLocationsList);
          setSavedLocations(locations);
        }
        
        if (savedHomeLocation) {
          const homeLocationData = JSON.parse(savedHomeLocation);
          setHomeLocation(homeLocationData);
        }
      } catch (error) {
        console.error("Konumlar yüklenirken hata:", error);
      }
    };
    
    loadSavedLocations();
  }, []);

  // locationSubscription'ı temizleme
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  // homeLocation state'ine yeni bir değer atandığında çalışacak fonksiyon
  useEffect(() => {
    // Son kaydedilen konum ID'si ile mevcut ID'yi karşılaştır
    const isNewLocation = homeLocation && (!lastHomeLocationRef.current || 
      homeLocation.id !== lastHomeLocationRef.current.id);
    
    // Sadece yeni bir konum eklendiyse ve manuel ise (isChangingLocation false ise) bildirim göster
    if (homeLocation && isNewLocation && !isChangingLocation) {
      // Kaydedilen konumu konsola yazdır
      console.log("Kaydedilen konum (yeni):", homeLocation.name);
      
      // Konum manüel olarak kaydedildiğinde bildirim göster
      Alert.alert(
        strings[currentLanguage]?.location?.success || "Başarılı",
        strings[currentLanguage]?.location?.locationSaved || "Ev konumunuz başarıyla kaydedildi!",
        [{
          text: strings[currentLanguage]?.buttons?.ok || "Tamam",
          onPress: () => startLocationTracking(homeLocation)
        }]
      );
      
      // Home konumunu AsyncStorage'a kaydet
      AsyncStorage.setItem(STORAGE_KEYS.HOME_LOCATION, JSON.stringify(homeLocation))
        .catch(error => console.error("Home konum kaydedilirken hata:", error));

    } else if (homeLocation && isChangingLocation) {
      // Konumu sessizce değiştir, sadece takibi başlat
      startLocationTracking(homeLocation);
      
      // Home konumunu sessizce kaydet
      AsyncStorage.setItem(STORAGE_KEYS.HOME_LOCATION, JSON.stringify(homeLocation))
        .catch(error => console.error("Home konum kaydedilirken hata:", error));
    }
    
    // Son konumu ref'te sakla
    if (homeLocation) {
      lastHomeLocationRef.current = homeLocation;
    }
  }, [homeLocation, startLocationTracking, strings, currentLanguage, isChangingLocation]);

  return {
    homeLocation,
    setHomeLocation,
    savedLocations,
    setSavedLocations,
    isTracking,
    isChangingLocation, 
    setIsChangingLocation,
    saveLocation,
    startLocationTracking,
    simulateLocationChange,
    updateLocationItems
  };
}