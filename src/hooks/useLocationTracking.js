import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert, Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistanceFromLatLonInMeters } from '../../utils/distance';
import notificationManager from '../utils/notificationManager';

console.log('useLocationTracking.js dosyası yükleniyor');

// Sabit değişkenleri tanımla
const STORAGE_KEYS = {
  SAVED_LOCATIONS: '@saved_locations',
  HOME_LOCATION: '@home_location'
};

// Konum takibi için minimum mesafe (metre)
const MIN_DISTANCE = 50;

export default function useLocationTracking(strings, currentLanguage, selectedItems) {
  console.log('useLocationTracking hook başladı');
  
  const [homeLocation, setHomeLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  
  // Bildirim kontrolü için ref kullan
  const lastHomeLocationRef = useRef(null);
  const notificationShownRef = useRef(false);
  const saveLocationTimeoutRef = useRef(null);

  // Kullanıcının konum izinlerini isteme - önemli değişiklikler içerir
  const requestPermissions = useCallback(async () => {
    console.log('İzinler talep ediliyor - başlangıç');
    
    // Eğer zaten izin isteme sürecindeyse, tekrar isteme
    if (isRequestingPermission) {
      console.log('Zaten izin isteniyor, tekrar isteme atlanıyor');
      return false;
    }
    
    try {
      setIsRequestingPermission(true);
      console.log('Konum izni isteniyor...');
      
      // İznin zaten verilip verilmediğini kontrol et (izin isteğini azaltmak için)
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      
      if (foregroundStatus === 'granted') {
        console.log('Konum izni zaten verilmiş');
        setIsRequestingPermission(false);
        return true;
      }
      
      // Platform bazlı yaklaşım
      if (Platform.OS === 'ios') {
        // iOS için daha güvenli yöntem
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('iOS izin sonucu:', status);
        
        if (status !== 'granted') {
          const errorMessage = strings[currentLanguage]?.errors?.location || "Konum izni verilmedi.";
          setLocationError(errorMessage);
          
          // Hafif gecikmeli Alert gösterimi (UI bloke olmasın diye)
          setTimeout(() => {
            Alert.alert(
              strings[currentLanguage]?.errors?.permission || "İzin Hatası", 
              errorMessage
            );
          }, 100);
          
          setIsRequestingPermission(false);
          return false;
        }
      } else {
        // Android için
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('Android izin sonucu:', status);
        
        if (status !== 'granted') {
          const errorMessage = strings[currentLanguage]?.errors?.location || "Konum izni verilmedi.";
          setLocationError(errorMessage);
          
          setTimeout(() => {
            Alert.alert(
              strings[currentLanguage]?.errors?.permission || "İzin Hatası", 
              errorMessage
            );
          }, 100);
          
          setIsRequestingPermission(false);
          return false;
        }
      }
      
      setLocationError(null);
      setIsRequestingPermission(false);
      console.log('İzin verme işlemi başarılı');
      return true;
    } catch (error) {
      console.error("İzin hatası:", error);
      const errorMessage = strings[currentLanguage]?.errors?.permissionsError || "Konum izinleri alınırken bir hata oluştu.";
      setLocationError(errorMessage);
      
      setTimeout(() => {
        Alert.alert(
          strings[currentLanguage]?.errors?.error || "Hata", 
          errorMessage
        );
      }, 100);
      
      setIsRequestingPermission(false);
      return false;
    }
  }, [currentLanguage, strings, isRequestingPermission]);

  // Konum kaydetme fonksiyonu - daha güvenli bir versiyonu
  const saveLocation = useCallback(async () => {
    console.log('saveLocation fonksiyonu başlatıldı');
    
    // Eğer zaten işlemde olan bir konum kaydetme varsa, tekrar başlatma
    if (saveLocationTimeoutRef.current) {
      console.log('Zaten aktif bir konum kaydetme işlemi var');
      return;
    }
    
    try {
      console.log('Konum izni isteniyor');
      
      // İzin isteme ve kontrol
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) {
        console.log('İzin verilmedi, çıkılıyor');
        return;
      }

      setLocationError(null);
      console.log('Mevcut konum alınıyor...');
      
      // Konum alma işlemini zamanla sınırla
      let locationTimeoutId = null;
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        locationTimeoutId = setTimeout(() => {
          console.log('Konum alma işlemi zaman aşımına uğradı');
          reject(new Error('Konum alma zaman aşımı'));
        }, 10000); // 10 sn zaman aşımı
      });
      
      const location = await Promise.race([locationPromise, timeoutPromise]);
      
      // Zaman aşımı temizle
      if (locationTimeoutId) clearTimeout(locationTimeoutId);
      
      console.log('Konum başarıyla alındı:', location?.coords);

      if (location?.coords) {
        const { latitude, longitude } = location.coords;
        
        console.log('Konum ismi sorgulanacak');
        
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
                  console.log('Konum isimlendirme iptal edildi');
                  saveLocationTimeoutRef.current = null;
                }
              },
              {
                text: strings[currentLanguage]?.buttons?.save || "Kaydet",
                onPress: async (name) => {
                  if (!name) {
                    console.log('İsim girilmedi, çıkılıyor');
                    saveLocationTimeoutRef.current = null;
                    return;
                  }
                  
                  console.log('Konum kaydediliyor, isim:', name);
                  
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
                      console.log('Konum başarıyla AsyncStorage\'a kaydedildi');
                    } catch (storageError) {
                      console.error("Storage error:", storageError);
                      // AsyncStorage hatası olsa bile çalışmaya devam et
                    }
                    
                    setHomeLocation(newLocation);
                    console.log('Home konumu güncellendi');
                  } catch (saveError) {
                    console.error("Konum kaydetme hatası:", saveError);
                    setTimeout(() => {
                      Alert.alert(
                        strings[currentLanguage]?.errors?.error || "Hata", 
                        strings[currentLanguage]?.errors?.locationSaveError || "Konum kaydedilemedi"
                      );
                    }, 100);
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
                  console.log('Konum isimlendirme iptal edildi');
                  saveLocationTimeoutRef.current = null;
                }
              },
              {
                text: strings[currentLanguage]?.buttons?.save || "Kaydet",
                onPress: () => {
                  // Basit bir isim atama
                  const defaultName = "Konum " + new Date().toLocaleTimeString();
                  
                  console.log('Konum kaydediliyor (Android), isim:', defaultName);
                  
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
                    ).catch(e => console.error("Storage error:", e));
                    
                    setHomeLocation(newLocation);
                    console.log('Home konumu güncellendi (Android)');
                  } catch (saveError) {
                    console.error("Konum kaydetme hatası (Android):", saveError);
                    Alert.alert(
                      strings[currentLanguage]?.errors?.error || "Hata", 
                      strings[currentLanguage]?.errors?.locationSaveError || "Konum kaydedilemedi"
                    );
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
      console.error("Konum kaydetme hatası:", error);
      const errorMessage = strings[currentLanguage]?.errors?.locationSaveError || "Konum kaydedilemedi";
      setLocationError(errorMessage);
      
      setTimeout(() => {
        Alert.alert(
          strings[currentLanguage]?.errors?.error || "Hata", 
          errorMessage
        );
      }, 100);
      
      saveLocationTimeoutRef.current = null;
    }
  }, [currentLanguage, requestPermissions, savedLocations, selectedItems, strings]);

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
          const errorMessage = strings[currentLanguage]?.location?.noHomeLocation || "Önce ev konumunuzu kaydetmelisiniz.";
          setLocationError(errorMessage);
          Alert.alert(
            strings[currentLanguage]?.errors?.error || "Hata", 
            errorMessage
          );
          return;
        }

        // Eğer zaten takip varsa, yeni bir takip başlatmayalım
        if (locationSubscription) {
          return;
        }
        
        console.log("Takip başlatılıyor, konum:", locationToTrack);
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

            console.log("Mevcut mesafe:", distance);

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
                console.log("Konum takibi durduruldu: Kullanıcı konumdan 50+ metre uzaklaştı");
                
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
      console.error('Konum takibi başlatılamadı:', error);
      // Devam etmeyi sağla
    }
  }, [currentLanguage, homeLocation, locationSubscription, selectedItems, strings]);

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
      console.log('updateLocationItems çağrıldı, ID:', locationId);
      
      // Güncellenecek konumu bul
      const locationToUpdate = savedLocations.find(loc => loc.id === locationId);
      
      if (!locationToUpdate) {
        console.log('Belirtilen ID ile konum bulunamadı');
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
        console.error("AsyncStorage güncelleme hatası:", storageError);
      }
      
      // Sessiz mod değilse konsola bilgi ver
      if (!silent) {
        console.log(`"${updatedLocation.name}" konumu için eşyalar güncellendi:`, selectedItems);
      }
      return true;
    } catch (error) {
      console.error("Konum eşyaları güncellenirken hata:", error);
      return false;
    }
  }, [savedLocations, selectedItems]);

  // Kaydedilmiş konumları yükleme
  useEffect(() => {
    console.log('locationTracking - kaydedilmiş konumları yükleme useEffect');
    
    const loadSavedLocations = async () => {
      try {
        console.log('Kaydedilmiş konumlar yükleniyor');
        const [savedLocationsList, savedHomeLocation] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS),
          AsyncStorage.getItem(STORAGE_KEYS.HOME_LOCATION)
        ]);
        
        if (savedLocationsList) {
          const locations = JSON.parse(savedLocationsList);
          console.log(`${locations.length} konum yüklendi`);
          setSavedLocations(locations);
        } else {
          console.log('Kaydedilmiş konum bulunamadı');
        }
        
        if (savedHomeLocation) {
          const homeLocationData = JSON.parse(savedHomeLocation);
          console.log('Kaydedilmiş ev konumu yüklendi:', homeLocationData.name);
          setHomeLocation(homeLocationData);
        } else {
          console.log('Kaydedilmiş ev konumu bulunamadı');
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
    if (!homeLocation) return;
    
    // Son kaydedilen konum ID'si ile mevcut ID'yi karşılaştır
    const isNewLocation = !lastHomeLocationRef.current || 
      homeLocation.id !== lastHomeLocationRef.current.id;
    
    // Sadece yeni bir konum eklendiyse ve manuel ise (isChangingLocation false ise) bildirim göster
    if (isNewLocation && !isChangingLocation) {
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

    } else if (isChangingLocation) {
      // Konumu sessizce değiştir, sadece takibi başlat
      startLocationTracking(homeLocation);
      
      // Home konumunu sessizce kaydet
      AsyncStorage.setItem(STORAGE_KEYS.HOME_LOCATION, JSON.stringify(homeLocation))
        .catch(error => console.error("Home konum kaydedilirken hata:", error));
    }
    
    // Son konumu ref'te sakla
    lastHomeLocationRef.current = homeLocation;
    
  }, [homeLocation, startLocationTracking, strings, currentLanguage, isChangingLocation]);

  console.log('useLocationTracking hook kurulumu tamamlandı');
  
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