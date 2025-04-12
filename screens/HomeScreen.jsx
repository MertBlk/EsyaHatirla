import { useState, useEffect, useCallback, useColorScheme, useMemo, memo } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Vibration, Modal, ScrollView, StatusBar, ActivityIndicator, Switch } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDynamicStyles, styles } from '../src/styles/HomeScreen.styles';
import { getCategorizedItems, getInitialItems, categoryIcons, getCategories } from '../src/data/items';
import strings from '../src/localization/strings';
import { getDistanceFromLatLonInMeters } from '../utils/distance'; // Mesafe utility'sini import edelim

// 1. Sabit değişkenleri en üste ekle
const EARTH_RADIUS = 6371e3; // Dünya yarıçapı (metre)
const STORAGE_KEYS = {
  SAVED_LOCATIONS: '@saved_locations',
  HOME_LOCATION: '@home_location'
};

// Global bildirim dinleyicisini tanımla
let notificationListener = null;

const HomeScreen = () => {
  // Önce dil state'ini tanımlayın
  const [currentLanguage, setCurrentLanguage] = useState('tr');
  
  // Dil state'ini kullanan diğer state'ler sonra tanımlanmalı
  const [items, setItems] = useState(() => getInitialItems(currentLanguage));
  const [selectedItems, setSelectedItems] = useState([]);
  const [homeLocation, setHomeLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [isTracking, setIsTracking] = useState(false); // State ekleyin
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [isLoading, setIsLoading] = useState(false); // Yükleme durumu için state ekleyin
  const [isDarkMode, setIsDarkMode] = useState(false); // isDarkMode state'ini ekleyelim
  const [savedLocations, setSavedLocations] = useState([]);
  const [locationName, setLocationName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [saveNotification, setSaveNotification] = useState(false); // Yeni state eklendi
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  
  // Bu satırı ekleyin - languages ve languageMenuVisible tanımı
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  
  // languages array'ini ana bileşene taşıyın
  const languages = [
    { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
    { code: 'es', flag: '🇪🇸', name: 'Español' },
    { code: 'ar', flag: '🇸🇦', name: 'العربية' }, // Arapça
    { code: 'nl', flag: '🇳🇱', name: 'Nederlands' }, // Hollandaca
    { code: 'sv', flag: '🇸🇪', name: 'Svenska' }, // İsveççe
    { code: 'pl', flag: '🇵🇱', name: 'Polski' } // Lehçe
  ];

  // Filtreleme işlevi için getFilteredItems fonksiyonunu ekleyelim
  const getFilteredItems = useCallback(() => {
    // Seçilen kategoriye göre eşyaları filtrele
    const categorizedItems = getCategorizedItems(currentLanguage);
    
    let filteredItems = [];
    
    // Tümü kategorisi seçiliyse tüm kategorilerdeki eşyaları göster
    if (selectedCategory === 'Tümü' || selectedCategory === 'All' || 
        selectedCategory === safeGetString('categories.all', 'Tümü')) {
      // Tüm kategorilerdeki eşyaları düzleştir
      Object.values(categorizedItems).forEach(categoryItems => {
        filteredItems = [...filteredItems, ...categoryItems];
      });
    } else {
      // Belirli bir kategori seçilmişse sadece o kategorideki eşyaları göster
      filteredItems = categorizedItems[selectedCategory] || [];
    }
    
    // Arama filtresi uygulandıysa, eşyaları filtrele
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.toLowerCase().includes(lowerQuery)
      );
    }
    
    return filteredItems;
  }, [currentLanguage, selectedCategory, searchQuery, safeGetString]);

  // Dil değiştirme fonksiyonunu optimize edelim
  const toggleLanguage = async () => {
    try {
      // Mevcut dil kodunu bul
      const currentCode = currentLanguage;
      
      // Mevcut dilin index'ini bul
      const currentIndex = languages.findIndex(lang => lang.code === currentCode);
      
      // Bir sonraki dile geç (döngüsel olarak)
      const nextIndex = (currentIndex + 1) % languages.length;
      const newLang = languages[nextIndex].code;
      
      // Dili değiştir
      await setLanguage(newLang);
      console.log('Dil değiştirildi:', newLang);
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
    }
  };

  // HomeScreen bileşeninde toggleLanguage fonksiyonunun hemen altına ekleyin
const setLanguage = async (lang) => {
  try {
    setCurrentLanguage(lang);
    await AsyncStorage.setItem('user-language', lang);
    console.log('Dil değiştirildi:', lang);
  } catch (error) {
    console.error('Dil değiştirme hatası:', error);
  }
};

  // Uygulama başladığında kaydedilmiş dil tercihini yükle
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Dil yükleme hatası:', error);
      }
    };
    loadLanguage();
  }, []);

  const theme = {
    dark: {
      background: '#1C1C1E',
      surface: '#2C2C2E',
      text: '#FFFFFF',
      textSecondary: '#EBEBF5',
      border: '#3A3A3C'
    },
    light: {
      background: '#F2F2F7',
      surface: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E5E5EA'
    }
  };
  


  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Hatası', 'Bildirim izni verilmedi');
        return;
      }

      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          priority: 'high',
          categoryIdentifier: 'items' // Kategori tanımlayıcısı ekleyin
        }),
      });

      // Bildirim kategorisi ve butonları tanımlayın
      await Notifications.setNotificationCategoryAsync('items', [
        {
          identifier: 'yes',
          buttonTitle: '✅ Evet, Aldım',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          }
        },
        {
          identifier: 'no',
          buttonTitle: '❌ Hayır, Unuttum',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          }
        }
      ]);
    };
    
    setupNotifications();
  }, []);

  // Bildirim ayarlarını useEffect içinde güncelle
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          strings[currentLanguage].errors.permission,
          strings[currentLanguage].errors.notification
        );
        return;
      }
  
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          priority: 'high',
          categoryIdentifier: 'items'
        }),
      });
  
      // Bildirim butonlarını dile göre güncelle
      await Notifications.setNotificationCategoryAsync('items', [
        {
          identifier: 'yes',
          buttonTitle: currentLanguage === 'tr' ? '✅ Evet, Aldım' : '✅ Yes, I Have Them',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          }
        },
        {
          identifier: 'no',
          buttonTitle: currentLanguage === 'tr' ? '❌ Hayır, Unuttum' : '❌ No, I Forgot',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          }
        }
      ]);
    };
    
    setupNotifications();
  }, [currentLanguage]); // currentLanguage değiştiğinde yeniden çalıştır

  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  // homeLocation state'ini izleyen yeni bir useEffect ekleyin
  useEffect(() => {
    if (homeLocation) {
      console.log("Kaydedilen konum:", homeLocation);
      Alert.alert(
        "Başarılı",
        "Ev konumunuz başarıyla kaydedildi!",
        [
          {
            text: "Tamam",
            onPress: () => startLocationTracking(homeLocation)
          }
        ]
      );
    }
  }, [homeLocation]);
  const homeLocationArray = {};

 // HomeScreen bileşeni içinde, en üste ekleyin:
const safeGetString = useCallback((path, fallback = '') => {
  try {
    const parts = path.split('.');
    let result = strings[currentLanguage];
    
    for (const part of parts) {
      if (result === undefined || result === null) return fallback;
      result = result[part];
    }
    
    return result || fallback;
  } catch (e) {
    return fallback;
  }
}, [currentLanguage]);

// Örnek kullanım:
// safeGetString('categories.all', 'Tümü')
 

  // 📍 Kullanıcının konum izinlerini isteme
  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("İzin Hatası", "Konum izni verilmedi.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("İzin hatası:", error);
      Alert.alert("Hata", "Konum izinleri alınırken bir hata oluştu.");
      return false;
    }
  };

  // 2. saveLocation ve saveHomeLocation fonksiyonlarını birleştir
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
        "Konum Adı",
        "Bu konumu nasıl adlandırmak istersiniz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Kaydet",
            onPress: async (name) => {
              if (!name) return;
              
              const newLocation = {
                id: Date.now().toString(),
                name,
                latitude,
                longitude
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
                Alert.alert("Hata", "Konum kaydedilemedi");
              }
            }
          }
        ]
      );
    }
  } catch (error) {
    console.error("Konum kaydetme hatası:", error);
    Alert.alert("Hata", "Konum kaydedilemedi");
  }
};

  
  const startLocationTracking = useCallback(async (savedLocation) => {
    try {
      // savedLocation parametresini veya state'teki homeLocation'ı kullan
      const locationToTrack = savedLocation || homeLocation;
      
      if (!locationToTrack) {
        Alert.alert("Hata", "Önce ev konumunuzu kaydetmelisiniz.");
        return;
      }

      // Eğer zaten takip varsa, yeni bir takip başlatmayalım
      if (locationSubscription) {
        return;
      }
     

      console.log("Takip başlatılıyor, konum:", locationToTrack);

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000, // 60 saniyede bir kontrol et
          distanceInterval: 10, // 10 metrede bir kontrol et
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

          // 50 metre uzaklaşınca bildirim gönder
          if (distance >= 50) {
            sendNotification();
            Vibration.vibrate(1000);
          }
        }
      );

      setLocationSubscription(subscription);
      setIsTracking(true);
    } catch (error) {
      console.error("Konum takibi hatası:", error);
      Alert.alert(
        "Hata",
        "Konum takibi başlatılamadı: " + (error.message || "Bilinmeyen hata")
      );
    }
  }, [homeLocation, locationSubscription, sendNotification]); // Bağımlılıkları ekledik

  const simulateLocationChange = () => {
  // Önce ev konumu kontrolü yap
  if (!homeLocation) {
    Alert.alert(
      safeGetString('alerts.warning', 'Uyarı'),
      safeGetString('location.noLocation', 'Önce bir konum kaydetmelisiniz'),
      [{ text: safeGetString('buttons.ok', 'Tamam'), onPress: () => saveHomeLocation() }]
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

  // Takip var mı yok mu önemli değil, direkt bildirim gönder
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
    sendAlert();
    Vibration.vibrate(1000);
    
    Alert.alert(
      safeGetString('alerts.locationTest', 'Test Başarılı'),
      safeGetString('alerts.distanceFound', 'Test mesafesi: ') + Math.round(distance) + 
      safeGetString('alerts.meters', ' metre')
    );
  } else {
    Alert.alert(
      safeGetString('alerts.locationTest', 'Konum Testi'),
      safeGetString('alerts.distanceTooSmall', 'Hesaplanan mesafe 50m\'den az: ') + 
      Math.round(distance) + safeGetString('alerts.meters', ' metre')
    );
  }
  
  // Eğer varsa mevcut location subscription'ı temizle
  if (locationSubscription) {
    locationSubscription.remove();
    setLocationSubscription(null);
  }
};

  // 📏 İki nokta arasındaki mesafeyi hesapla (Haversine Formülü)
  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Dünya'nın yarıçapı (metre)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon1 - lon1) * Math.PI) / 180; // Burası düzeltildi
  
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
             Math.cos(φ1) * Math.cos(φ2) * 
             Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Mesafe metre cinsinden
  };

  // 📩 Bildirim Gönder
  const sendNotification = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          strings[currentLanguage].errors.permission,
          strings[currentLanguage].errors.notification
        );
        return;
      }
  
      // Seçili eşyaları kontrol et ve formatlı metin oluştur
      const itemsList = selectedItems.length > 0 
        ? selectedItems.map(item => item.split(' ')[1]).join(', ')
        : strings[currentLanguage].alerts.noItems;
  
      const notificationContent = {
        title: strings[currentLanguage].alerts.checkItems,
        body: selectedItems.length > 0 
          ? `${strings[currentLanguage].alerts.rememberItems}: ${itemsList}`
          : itemsList,
        sound: 'default',
        priority: 'high',
        badge: selectedItems.length,
      };
  
      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null
      });
  
    } catch (error) {
      console.error('Bildirim hatası:', error);
      Alert.alert(
        strings[currentLanguage].errors.notification,
        error.message
      );
    }
  };

  const sendAlert = async () => {
    try {
      Vibration.vibrate([500, 200, 500]);
      
      // Güncel dil durumunu saklayalım
      const currentLang = currentLanguage;
      const itemsList = selectedItems.length > 0 
        ? `${selectedItems.join('\n• ')}` 
        : strings[currentLang].alerts.noItems;
  
      // Sadece bir bildirim gönder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: strings[currentLang].alerts.warning,
          body: `${strings[currentLang].alerts.items}\n• ${itemsList}`,
          sound: 'default',
          priority: 'high',
          categoryIdentifier: 'items',
          data: { 
            type: 'reminder',
            language: currentLang // Dil bilgisini data içinde saklayalım
          }
        },
        trigger: null
      });
  
    } catch (error) {
      console.error('Uyarı hatası:', error);
    }
  };

  const checkDistance = (distance) => {
    if (distance >= 50 && distance < 100) {
      sendAlert(strings[currentLanguage].alerts.firstWarning);
    } else if (distance >= 100 && distance < 200) {
      sendAlert(strings[currentLanguage].alerts.lastWarning);
    } else if (distance >= 200) {
      sendAlert(strings[currentLanguage].alerts.criticalWarning);
    }
  };
  // HomeScreen.jsx içine yeni fonksiyon ekleyin
    
  const saveHomeLocation = async () => {
    try {
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) return;
  
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
  
      if (location && location.coords) {
        const { latitude, longitude } = location.coords;
        
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
                if (!name) return;
                
                // Mevcut seçili eşyaları bu konuma kaydet
                const newLocation = {
                  id: Date.now().toString(),
                  name,
                  latitude,
                  longitude,
                  items: [...selectedItems] // O anda seçili eşyaları bu konuma ekle
                };
  
                const updatedLocations = [...savedLocations, newLocation];
                setSavedLocations(updatedLocations);
                
                // AsyncStorage'a kaydet
                await AsyncStorage.setItem(
                  '@saved_locations',
                  JSON.stringify(updatedLocations)
                );
  
                setHomeLocation(newLocation);
                
                // Test için bir mesaj göster
                console.log(`"${name}" konumu için kaydedilen eşyalar:`, selectedItems);
                Alert.alert(
                  "Konum ve Eşyalar Kaydedildi",
                  `"${name}" konumuna ${selectedItems.length} eşya kaydedildi.`
                );
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Konum kaydetme hatası:", error);
      Alert.alert("Hata", "Konum kaydedilemedi");
    }
  };
  

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
    await AsyncStorage.setItem('@saved_locations', JSON.stringify(updatedLocations));
    
    // Kısa bildirim göster
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 1500);

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

const CategorySelector = memo(({ currentLanguage, selectedCategory, setSelectedCategory, safeGetString, isDarkMode }) => {
  // Her dil değişikliğinde güncel kategorileri al
  const categories = getCategories(currentLanguage);
  
  // Tümü kategori adını güvenli bir şekilde al
  const allCategoryName = safeGetString('categories.all', 'Tümü');
  
  // Yardımcı fonksiyon - kategori adına göre doğru ikonu al
  const getCategoryIcon = (categoryName) => {
    // Önce doğrudan eşleşmeyi dene
    if (categoryIcons[categoryName]) {
      return categoryIcons[categoryName];
    }
    
    // 'Tümü' veya 'All' gibi özel durumlar için kontrol
    if (categoryName === allCategoryName) {
      return categoryIcons['Tümü'] || categoryIcons['All'] || '🗂️';
    }
    
    // Kategorinin dile göre eşdeğerini bulmak için tüm kategorilerde ara
    const allCategories = Object.keys(categoryIcons);
    // Kategori türünü tahmin et (ilk kelimesine bakarak)
    const categoryFirstWord = categoryName.split(/[ /]/)[0].toLowerCase();
    
    // Benzer kategori bul
    for (const key of allCategories) {
      const keyFirstWord = key.split(/[ /]/)[0].toLowerCase();
      if (keyFirstWord === categoryFirstWord) {
        return categoryIcons[key];
      }
    }
    
    // Hiçbir eşleşme bulunamazsa varsayılan bir ikon döndür
    return '📋';
  };

  return (
    <View style={styles.categoryWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.categoryScrollContent}
      >
        {/* Her zaman "Tümü" kategori butonunu göster */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', 
              borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
            selectedCategory === allCategoryName && 
              { backgroundColor: '#007AFF', borderColor: '#007AFF' }
          ]}
          onPress={() => setSelectedCategory(allCategoryName)}
        >
          <Text style={[
            styles.categoryButtonText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' },
            selectedCategory === allCategoryName && { color: '#FFFFFF' }
          ]}>
            {getCategoryIcon(allCategoryName)} {allCategoryName}
          </Text>
        </TouchableOpacity>

        {/* Dile özgü kategorileri göster */}
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', 
                borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
              selectedCategory === category && 
                { backgroundColor: '#007AFF', borderColor: '#007AFF' }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              { color: isDarkMode ? '#FFFFFF' : '#000000' },
              selectedCategory === category && { color: '#FFFFFF' }
            ]}>
              {getCategoryIcon(category)} {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const StatsCard = memo(({ selectedItems, getFilteredItems, safeGetString, isDarkMode }) => (
  <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}>
    <View style={styles.statItem}>
      <Text style={[styles.statNumber, { color: '#007AFF' }]}>
        {selectedItems.length}
      </Text>
      <Text style={[styles.statLabel, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}>
        {safeGetString('stats.selected', 'Seçili')}
      </Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={[styles.statNumber, { color: isDarkMode ? '#64D2FF' : '#0A84FF' }]}>
        {getFilteredItems().length}
      </Text>
      <Text style={[styles.statLabel, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}>
        {safeGetString('stats.total', 'Toplam')}
      </Text>
    </View>
  </View>
));

const CurrentLocationCard = memo(({ 
  homeLocation, 
  strings, 
  currentLanguage, 
  isDarkMode,
  savedLocations, 
  setSavedLocations,
  setIsChangingLocation,
  setSelectedItems,
  setHomeLocation
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Güvenli bir şekilde konum değiştir
  const safelyChangeLocation = useCallback((location) => {
    setIsChangingLocation(true); // İşlemi başlat
    
    // Eşyaları yükle
    if (location.items && Array.isArray(location.items)) {
      setSelectedItems(location.items);
    } else {
      // Konum için tanımlı eşya yoksa boş liste
      setSelectedItems([]);
    }
    
    // Yeni konumu seç
    setHomeLocation(location);
    
    // Modal'ı kapat
    setIsVisible(false);
    
    // Kısa bir gecikmeyle bayrağı kapat
    setTimeout(() => {
      setIsChangingLocation(false);
    }, 1000);
  }, [setIsChangingLocation, setSelectedItems, setHomeLocation]);

  return (
    <>
      <TouchableOpacity 
        style={[styles.statsCard, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
        onPress={() => setIsVisible(true)}
      >
        <View style={styles.currentLocationContainer}>
          <Text style={[styles.locationTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {strings[currentLanguage]?.location?.title || "Konum"}
          </Text>
          <Text style={[styles.locationName, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}>
            {homeLocation?.name || strings[currentLanguage]?.location?.noLocation || "Konum seçilmedi"}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.modalSafeArea, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.locationModalContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}>
            <Text style={styles.locationModalTitle}>
              {strings[currentLanguage]?.location?.savedLocations || "Kaydedilmiş Konumlar"}
            </Text>
            
            {savedLocations.length > 0 ? (
              <FlatList
                data={savedLocations}
                keyExtractor={(item) => item.id}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                getItemLayout={(data, index) => (
                  {length: 70, offset: 70 * index, index}
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.locationListItem,
                      homeLocation?.id === item.id && styles.selectedLocationItem
                    ]}
                    onPress={() => safelyChangeLocation(item)}
                  >
                    <Text style={styles.locationItemIcon}>📍</Text>
                    <View style={styles.locationItemContent}>
                      <Text style={[
                        styles.locationItemName, 
                        { color: isDarkMode ? '#FFFFFF' : '#000000' }
                      ]}>
                        {item.name}
                      </Text>
                      {item.items && (
                        <Text style={[
                          styles.locationItemInfo,
                          { color: isDarkMode ? '#EBEBF5' : '#666666' }
                        ]}>
                          {item.items.length} {strings[currentLanguage]?.location?.itemCount || "eşya"}
                        </Text>
                      )}
                    </View>
                    {homeLocation?.id === item.id && (
                      <Text style={styles.checkmarkText}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyListContainer}>
                <Text style={[styles.emptyListText, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}>
                  {strings[currentLanguage]?.location?.noSavedLocations || "Henüz kaydedilmiş konum yok"}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.buttonText}>
                {strings[currentLanguage]?.buttons?.close || "Kapat"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
});

const LanguageToggle = memo(({ 
  languages, 
  currentLanguage, 
  setLanguage, 
  strings,
  isDarkMode 
}) => {
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  
  return (
    <>
      <TouchableOpacity
        style={[styles.themeToggleButton]}
        onPress={() => setIsLanguageModalOpen(true)}
      >
        <Text style={styles.buttonModeText}>
          {languages.find(l => l.code === currentLanguage)?.flag || '🌐'}
        </Text>
      </TouchableOpacity>
      
      {/* Dil seçimi için modal */}
      <Modal
        visible={isLanguageModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsLanguageModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsLanguageModalOpen(false)}
        >
          <View 
            style={[styles.languageModalContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            <Text style={[styles.modalSubTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Dil Seçimi / Language
            </Text>
            
            <FlatList
              data={languages}
              initialNumToRender={8}
              keyExtractor={(item) => item.code}
              getItemLayout={(data, index) => (
                {length: 50, offset: 50 * index, index}
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageListItem,
                    currentLanguage === item.code && styles.selectedLanguageItem
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setIsLanguageModalOpen(false);
                  }}
                >
                  <Text style={styles.languageItemFlag}>{item.flag}</Text>
                  <Text style={[
                    styles.languageItemText, 
                    { color: isDarkMode ? '#FFFFFF' : '#000000' },
                    currentLanguage === item.code && styles.selectedLanguageText
                  ]}>
                    {item.name}
                  </Text>
                  {currentLanguage === item.code && (
                    <Text style={styles.checkmarkText}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsLanguageModalOpen(false)}
            >
              <Text style={styles.buttonText}>
                {strings[currentLanguage].buttons.close}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
});

const ThemeToggle = memo(({ isDarkMode, setIsDarkMode }) => (
  <TouchableOpacity
    style={[styles.themeToggleButton]} 
    onPress={() => setIsDarkMode(!isDarkMode)}
  >
    <Text style={styles.buttonModeText}>
      {isDarkMode ? '☀️' : '🌙'}
    </Text>
  </TouchableOpacity>
));

const dynamicStyles = createDynamicStyles(isDarkMode);

// Global değişken olarak bildirim durumunu takip edelim
let isNotificationActive = false;

// Global notification manager'ı güncelle
const notificationManager = {
  isProcessing: false,
  lastNotificationTime: 0,
  cooldownPeriod: 2000, // 2 saniye bekleme süresi

  async send(config) {
    const now = Date.now();
    
    // Eğer işlem devam ediyorsa veya cooldown süresi dolmadıysa çık
    if (this.isProcessing || (now - this.lastNotificationTime) < this.cooldownPeriod) {
      console.log('Bildirim engellendi: İşlem devam ediyor veya cooldown süresi dolmadı');
      return;
    }
    
    try {
      this.isProcessing = true;
      this.lastNotificationTime = now;
      
      await Notifications.scheduleNotificationAsync(config);
      // Bildirimin işlenmesi için biraz bekleyelim
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Bildirim hatası:', error);
    } finally {
      this.isProcessing = false;
    }
  }
};

// useEffect içindeki bildirim dinleyicisini güncelle - diğer useEffect'i kaldır
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
    const { actionIdentifier, notification } = response;
    const notificationLang = notification.request.content.data?.language || currentLanguage;
    const itemsList = selectedItems.length > 0 
      ? `${selectedItems.join('\n• ')}` 
      : strings[notificationLang].alerts.noItems;

    if (actionIdentifier === 'yes') {
      await notificationManager.send({
        content: {
          title: strings[notificationLang].alerts.confirm,
          body: strings[notificationLang].alerts.itemsConfirmed,
          sound: 'default',
          data: { language: notificationLang }
        },
        trigger: null
      });
    } else if (actionIdentifier === 'no') {
      Vibration.vibrate([1000, 500, 1000]);
      await notificationManager.send({
        content: {
          title: strings[notificationLang].alerts.forgot,
          body: `${strings[notificationLang].alerts.goBack}\n• ${itemsList}`,
          sound: 'default',
          priority: 'high',
          data: { language: notificationLang }
        },
        trigger: null
      });
    }
  });

  return () => subscription.remove();
}, []); // Sadece component mount olduğunda çalışsın

// Ayarlar modalı için render
const renderSettings = () => (
  <Modal
    visible={showSettings}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setShowSettings(false)}
  >
    <SafeAreaView style={[styles.modalSafeArea, dynamicStyles.modalBackground]}>
      <View style={[styles.settingsModalContainer, dynamicStyles.modalContent]}>
        <Text style={[styles.modalTitle, dynamicStyles.text]}>
          {strings[currentLanguage]?.settings?.title || "Ayarlar"}
        </Text>

        {/* Tema Ayarı */}
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, dynamicStyles.text]}>
            {strings[currentLanguage]?.settings?.darkMode || "Karanlık Mod"}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        {/* Dil Ayarı */}
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, dynamicStyles.text]}>
            {strings[currentLanguage]?.settings?.language || "Dil"}
          </Text>
          <TouchableOpacity
            style={styles.languageSelector}
            onPress={() => setLanguageMenuVisible(true)}
          >
            <Text style={[styles.languageSelectText, dynamicStyles.text]}>
              {languages.find(l => l.code === currentLanguage)?.flag} {languages.find(l => l.code === currentLanguage)?.name}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.homeButton, { backgroundColor: '#007AFF' }]} 
          onPress={simulateLocationChange}
        >
          <Text style={styles.buttonText}>
            {strings[currentLanguage]?.buttons?.testLocation || "🔄 Konum Değişikliğini Test Et"}
          </Text>
        </TouchableOpacity>
       
        <TouchableOpacity 
          style={[styles.closeButton, { marginTop: 20 }]}
          onPress={() => setShowSettings(false)}
        >
          <Text style={styles.buttonText}>
            {strings[currentLanguage]?.buttons?.close || "Kapat"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Dil Seçimi Modalı */}
      <Modal
        visible={languageMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageMenuVisible(false)}
        >
          <View 
            style={[styles.languageModalContainer, dynamicStyles.modalContent]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageListItem,
                    currentLanguage === item.code && styles.selectedLanguageItem
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setLanguageMenuVisible(false);
                  }}
                >
                  <Text style={styles.languageItemFlag}>{item.flag}</Text>
                  <Text style={[
                    styles.languageItemText, 
                    dynamicStyles.text,
                    currentLanguage === item.code && styles.selectedLanguageText
                  ]}>
                    {item.name}
                  </Text>
                  {currentLanguage === item.code && (
                    <Text style={styles.checkmarkText}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  </Modal>
);

return (
  <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
    <View style={[styles.container, dynamicStyles.container, { paddingBottom: 70 }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Üst kısımdaki başlık ve bilgi alanı */}
      <Text style={[styles.title, dynamicStyles.text]}>
        {strings[currentLanguage]?.appName || "Unutma!"}
      </Text>
      
      <CategorySelector 
        currentLanguage={currentLanguage}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        safeGetString={safeGetString}
        isDarkMode={isDarkMode}
      />
      
      <StatsCard 
        selectedItems={selectedItems}
        getFilteredItems={getFilteredItems}
        safeGetString={safeGetString}
        isDarkMode={isDarkMode}
      />
      
      <CurrentLocationCard 
        homeLocation={homeLocation}
        strings={strings}
        currentLanguage={currentLanguage}
        isDarkMode={isDarkMode}
        savedLocations={savedLocations}
        setSavedLocations={setSavedLocations}
        setIsChangingLocation={setIsChangingLocation}
        setSelectedItems={setSelectedItems}
        setHomeLocation={setHomeLocation}
      />
      
      <FlatList
        data={getFilteredItems()}
        contentContainerStyle={{ paddingBottom: 60 }}
        // Optimize edilmiş FlatList ayarları
        removeClippedSubviews={true} // Ekran dışındaki öğeleri bellekten kaldırır
        initialNumToRender={10} // Başlangıçta kaç öğe render edileceğini belirler
        maxToRenderPerBatch={5} // Her batch'te kaç öğenin render edileceğini belirler
        updateCellsBatchingPeriod={50} // Batch arasındaki bekleme süresi (ms)
        windowSize={5} // Görünüm penceresi boyutu (ekranın kaç katı öğenin bellekte tutulacağı)
        getItemLayout={(data, index) => (
          // Sabit yükseklikli öğeler için boyut hesaplaması önceden yapılır
          {length: 60, offset: 60 * index, index}
        )}
        keyExtractor={(item, index) => `item-${index}-${item.substring(0,3)}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              dynamicStyles.itemContainer,
              selectedItems.includes(item) && dynamicStyles.selectedItem,
            ]}
            onPress={() =>
              setSelectedItems(prev =>
                prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
              )
            }
          >
            <Text style={[
              styles.itemText, 
              dynamicStyles.text,
              selectedItems.includes(item) && dynamicStyles.selectedItemText
            ]}>
              {item}
            </Text>
            {selectedItems.includes(item) && (
              <Text style={styles.checkIcon}>✔️</Text>
            )}
          </TouchableOpacity>
        )}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {/* Alt Menü - Daha belirgin */}
      <View style={[styles.bottomNav, dynamicStyles.bottomNav]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={saveHomeLocation}
        >
          <Text style={[styles.navButtonIcon, dynamicStyles.text]}>🏠</Text>
         <Text style={[styles.navButtonText, dynamicStyles.text]}>
            {safeGetString('buttons.saveLocation', 'Konum Kaydet')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setShowSettings(true)}
        >
          <Text style={[styles.navButtonIcon, dynamicStyles.text]}>⚙️</Text>
          <Text style={[styles.navButtonText, dynamicStyles.text]}>
            {safeGetString('settings.title', 'Ayarlar')}
          </Text>
        </TouchableOpacity>
      </View>
      {renderSettings()}

      {saveNotification && (
        <View style={styles.saveNotification}>
          <Text style={styles.saveNotificationText}>
            ✓ {safeGetString('alerts.itemsSaved', 'Eşyalar otomatik kaydedildi')}
          </Text>
        </View>
      )}
    </View>
  </SafeAreaView>
);
};

export default HomeScreen;