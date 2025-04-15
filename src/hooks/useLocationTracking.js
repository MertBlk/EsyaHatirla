import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert, Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistanceFromLatLonInMeters } from '../../utils/distance';
import notificationManager from '../utils/notificationManager';

// Sabit değişkenleri tanımla
const STORAGE_KEYS = {
  SAVED_LOCATIONS: '@saved_locations',
  HOME_LOCATION: '@home_location'
};

// Konum takibi için minimum mesafe (metre)
const MIN_DISTANCE = 50;

export default function useLocationTracking(strings, currentLanguage, selectedItems) {
  // states
  const [homeLocation, setHomeLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);

  // refs
  const lastHomeLocationRef = useRef(null);
  const notificationShownRef = useRef(false);
  const saveLocationTimeoutRef = useRef(null);

  // Hata mesajlarını merkezi olarak yönet
  const getErrorMessage = useCallback((errorKey, fallback) => {
    try {
      return strings[currentLanguage]?.errors?.[errorKey] || fallback;
    } catch (error) {
      return fallback;
    }
  }, [currentLanguage, strings]);

  // Kullanıcıya hata gösterme yardımcı fonksiyonu
  const showError = useCallback((errorKey, fallbackMessage, delay = 100) => {
    const errorMessage = getErrorMessage(errorKey, fallbackMessage);
    setLocationError(errorMessage);
    
    setTimeout(() => {
      Alert.alert(
        getErrorMessage('error', 'Hata'), 
        errorMessage
      );
    }, delay);
    
    return errorMessage;
  }, [getErrorMessage]);

  // Kullanıcının konum izinlerini isteme - önemli değişiklikler içerir
  const requestPermissions = useCallback(async () => {
    
    // Eğer zaten izin isteme sürecindeyse, tekrar isteme
    if (isRequestingPermission) {
      return false;
    }
    
    try {
      setIsRequestingPermission(true);
      
      // İznin zaten verilip verilmediğini kontrol et (izin isteğini azaltmak için)
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      
      if (foregroundStatus === 'granted') {
        setIsRequestingPermission(false);
        return true;
      }
      
      // Platform bazlı yaklaşım
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        showError('location', 'Konum izni verilmedi.');
        setIsRequestingPermission(false);
        return false;
      }
      
      setLocationError(null);
      setIsRequestingPermission(false);
      return true;
    } catch (error) {
      showError('permissionsError', 'Konum izinleri alınırken bir hata oluştu.');
      setIsRequestingPermission(false);
      return false;
    }
  }, [currentLanguage, showError, isRequestingPermission]);

  // Konum kaydetme fonksiyonu - daha güvenli bir versiyonu
  const saveLocation = useCallback(async () => {
    
    // Eğer zaten işlemde olan bir konum kaydetme varsa, tekrar başlatma
    if (saveLocationTimeoutRef.current) {
      return;
    }
    
    try {
      
      // İzin isteme ve kontrol
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) {
        return;
      }

      setLocationError(null);
      
      // Konum alma işlemini zamanla sınırla
      let locationTimeoutId = null;
      
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        locationTimeoutId = setTimeout(() => {
          reject(new Error('Konum alma zaman aşımı'));
        }, 10000); // 10 sn zaman aşımı
      });
      
      const location = await Promise.race([locationPromise, timeoutPromise]);
      
      // Zaman aşımı temizle
      if (locationTimeoutId) clearTimeout(locationTimeoutId);

      if (location?.coords) {
        const { latitude, longitude } = location.coords;
        
        // Platform bazlı Alert.prompt yaklaşımı (Android'de yok)
        if (Platform.OS === 'ios') {
          Alert.prompt(
            strings[currentLanguage]?.location?.namePrompt || "Konum Adı",
            strings[currentLanguage]?.location?.nameDescription || "Bu konumu nasıl adlandırmak istersiniz?",
            [
              { 
                text: strings[currentLanguage]?.buttons?.cancel || "İptal", 
                style: "cancel",
                onPress: () => {
                  saveLocationTimeoutRef.current = null;
                }
              },
              {
                text: strings[currentLanguage]?.buttons?.save || "Kaydet",
                onPress: async (name) => {
                  if (!name) {
                    saveLocationTimeoutRef.current = null;
                    return;
                  }
                  
                  try {
                    const newLocation = {
                      id: Date.now().toString(),
                      name,
                      latitude,
                      longitude,
                      items: [...selectedItems], // O anda seçili eşyaları bu konuma ekle
                      createdAt: new Date().toISOString()
                    };

                    const updatedLocations = [...savedLocations, newLocation];
                    setSavedLocations(updatedLocations);
                    
                    // Asenkron işlemleri try-catch içinde yap
                    try {
                      await AsyncStorage.setItem(
                        STORAGE_KEYS.SAVED_LOCATIONS,
                        JSON.stringify(updatedLocations)
                      );
                    } catch (storageError) {
                      // AsyncStorage hatası olsa bile çalışmaya devam et
                      console.warn('Konum kaydedilirken storage hatası:', storageError);
                    }
                    
                    setHomeLocation(newLocation);
                  } catch (saveError) {
                    showError('locationSaveError', 'Konum kaydedilemedi');
                  }
                  
                  saveLocationTimeoutRef.current = null;
                }
              }
            ]
          );
        } else {
          // Android için basit bir alternatif
          Alert.alert(
            strings[currentLanguage]?.location?.namePrompt || "Konum Adı",
            strings[currentLanguage]?.location?.nameDescription || "Bu konumu nasıl adlandırmak istersiniz?",
            [
              { 
                text: strings[currentLanguage]?.buttons?.cancel || "İptal", 
                style: "cancel",
                onPress: () => {
                  saveLocationTimeoutRef.current = null;
                }
              },
              {
                text: strings[currentLanguage]?.buttons?.save || "Kaydet",
                onPress: () => {
                  // Basit bir isim atama
                  const defaultName = "Konum " + new Date().toLocaleTimeString();
                  
                  try {
                    const newLocation = {
                      id: Date.now().toString(),
                      name: defaultName,
                      latitude,
                      longitude,
                      items: [...selectedItems],
                      createdAt: new Date().toISOString()
                    };

                    const updatedLocations = [...savedLocations, newLocation];
                    setSavedLocations(updatedLocations);
                    
                    // Asenkron işlemleri try-catch içinde yap
                    AsyncStorage.setItem(
                      STORAGE_KEYS.SAVED_LOCATIONS,
                      JSON.stringify(updatedLocations)
                    ).catch(e => {
                      console.warn('AsyncStorage hatası:', e);
                    });
                    
                    setHomeLocation(newLocation);
                  } catch (saveError) {
                    showError('locationSaveError', 'Konum kaydedilemedi');
                  }
                  
                  saveLocationTimeoutRef.current = null;
                }
              }
            ]
          );
        }
        
        // İşlem için timeout ref ayarla
        saveLocationTimeoutRef.current = setTimeout(() => {
          saveLocationTimeoutRef.current = null;
        }, 30000); // 30 sn sonra temizle (uzun sürebilir)
      }
    } catch (error) {
      showError('locationSaveError', 'Konum kaydedilemedi');
      console.error('Konum kaydetme hatası:', error);
      saveLocationTimeoutRef.current = null;
    }
  }, [currentLanguage, requestPermissions, savedLocations, selectedItems, showError]);

  // Konum takibini başlatma fonksiyonu
  const startLocationTracking = useCallback(async (savedLocation) => {
    try {
      // İşlem zaman aşımı ekleyin
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Konum izleme zaman aşımı')), 10000)
      );
      
      // Gerçek işlem
      const trackingPromise = async () => {
        // savedLocation parametresini veya state'teki homeLocation'ı kullan
        const locationToTrack = savedLocation || homeLocation;
        
        if (!locationToTrack) {
          showError('noHomeLocation', 'Önce ev konumunuzu kaydetmelisiniz.');
          return;
        }
        
        // Eğer zaten takip varsa, yeni bir takip başlatmayalım
        if (locationSubscription) {
          locationSubscription.remove();
          setLocationSubscription(null);
        }
        
        setLocationError(null);

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

            // 50 metre uzaklaşınca bildirim gönder ve konum takibini durdur
            if (distance >= MIN_DISTANCE && !notificationShownRef.current) {
              notificationManager.sendAlert(strings, currentLanguage, selectedItems);
              Vibration.vibrate(1000);
              notificationShownRef.current = true;
              
              // Konum takibini durdur
              if (subscription) {
                subscription.remove();
                setLocationSubscription(null);
                setIsTracking(false);
                
                // Kullanıcıya bildirim göster
                Alert.alert(
                  strings[currentLanguage]?.alerts?.trackingStopped || "Takip Durduruldu", 
                  strings[currentLanguage]?.alerts?.leftArea || "Belirtilen alandan uzaklaştınız. Konum takibi durduruldu."
                );
              }
            } else if (distance < MIN_DISTANCE) {
              notificationShownRef.current = false;
            }
          }
        );

        setLocationSubscription(subscription);
        setIsTracking(true);
      };
      
      // Hangisi önce tamamlanırsa
      await Promise.race([trackingPromise(), timeoutPromise]);
    } catch (error) {
      console.error('Konum takibi başlatılırken hata:', error);
      setLocationError('Konum takibi başlatılamadı');
    }
  }, [currentLanguage, homeLocation, locationSubscription, selectedItems, showError]);

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

    // Test koordinatları (Ev konumundan 100 metre uzakta)
    const testLocation = {
      coords: {
        latitude: homeLocation.latitude + 0.001, // Yaklaşık 100 metre kuzey
        longitude: homeLocation.longitude
      }
    };
    
    const distance = getDistanceFromLatLonInMeters(
      homeLocation.latitude,
      homeLocation.longitude,
      testLocation.coords.latitude,
      testLocation.coords.longitude
    );
    
    if (distance >= MIN_DISTANCE) {
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
    
  }, [currentLanguage, homeLocation, locationSubscription, saveLocation, selectedItems, strings]);

  // Konuma ait eşyaları güncelle (sessiz mod ekleyelim)
  const updateLocationItems = useCallback(async (locationId, silent = true) => {
    try {
      // Güncellenecek konumu bul
      const locationToUpdate = savedLocations.find(loc => loc.id === locationId);
      
      if (!locationToUpdate) {
        return false;
      }
      
      // Konum için seçili eşyaları güncelle
      const updatedLocation = {
        ...locationToUpdate,
        items: [...selectedItems],
        updatedAt: new Date().toISOString()
      };
      
      // Tüm konumları güncelle
      const updatedLocations = savedLocations.map(loc => 
        loc.id === locationId ? updatedLocation : loc
      );
      
      // State ve AsyncStorage'ı güncelle
      setSavedLocations(updatedLocations);
      
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(updatedLocations));
      } catch (storageError) {
        console.warn('Konum güncellemede storage hatası:', storageError);
      }
      
      // Sessiz mod değilse konsola bilgi ver
      if (!silent) {
        console.log('Konum eşyaları güncellendi:', locationId);
      }
      return true;
    } catch (error) {
      console.error('Konum güncellenirken hata:', error);
      return false;
    }
  }, [savedLocations, selectedItems]);

  // Kaydedilmiş konumları yükleme
  useEffect(() => {
    const loadSavedLocations = async () => {
      try {
        const [savedLocationsList, savedHomeLocation] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.HOME_LOCATION)
        ]);

        if (savedLocationsList) {
          const locations = JSON.parse(savedLocationsList);
          setSavedLocations(locations);
        }

        if (savedHomeLocation) {
          const homeLocationData = JSON.parse(savedHomeLocation);
          setHomeLocation(homeLocationData);
          // İlk yüklendiğinde lastHomeLocationRef'i ayarla
          lastHomeLocationRef.current = homeLocationData;
        }
      } catch (error) {
        console.error('Kayıtlı konumlar yüklenirken hata:', error);
        showError('locationLoadError', 'Konumlar yüklenirken bir hata oluştu.');
      }
    };

    loadSavedLocations();
  }, [showError]);

  // locationSubscription'ı temizleme
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
        setLocationSubscription(null);
      }
      if (saveLocationTimeoutRef.current) {
        clearTimeout(saveLocationTimeoutRef.current);
      }
    };
  }, [locationSubscription]);

  // homeLocation state'ine yeni bir değer atandığında çalışacak fonksiyon
  useEffect(() => {
    if (!homeLocation) return;
    
    // Son kaydedilen konum ID'si ile mevcut ID'yi karşılaştır
    const isNewLocation = !lastHomeLocationRef.current || 
      homeLocation.id !== lastHomeLocationRef.current.id;
    
    // Sadece yeni bir konum eklendiyse ve manuel ise (isChangingLocation false ise) bildirim göster
    if (isNewLocation && !isChangingLocation) {
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
        .catch(error => {
          console.warn('Home konum kaydetme hatası:', error);
        });

    } else if (isChangingLocation) {
      // Konumu sessizce değiştir, sadece takibi başlat
      startLocationTracking(homeLocation);
      
      // Home konumunu sessizce kaydet
      AsyncStorage.setItem(STORAGE_KEYS.HOME_LOCATION, JSON.stringify(homeLocation))
        .catch(error => {
          console.warn('Home konum kaydetme hatası:', error);
        });
    }
    
    // Son konumu ref'te sakla
    lastHomeLocationRef.current = homeLocation;
    
  }, [homeLocation, startLocationTracking, strings, currentLanguage, isChangingLocation]);

  // cleanup useEffect
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (saveLocationTimeoutRef.current) {
        clearTimeout(saveLocationTimeoutRef.current);
      }
    };
  }, []);

  return {
    homeLocation,
    setHomeLocation,
    savedLocations,
    setSavedLocations,
    isTracking,
    locationError,
    isChangingLocation, 
    setIsChangingLocation,
    saveLocation,
    startLocationTracking,
    simulateLocationChange,
    updateLocationItems
  };
}