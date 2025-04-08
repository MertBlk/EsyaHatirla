import { useState, useEffect, useCallback, useColorScheme } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Vibration, Modal, ScrollView, StatusBar, ActivityIndicator,Switch } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDynamicStyles, styles } from '../src/styles/HomeScreen.styles';
import {  getCategorizedItems,  getInitialItems, categoryIcons,getCategories } from '../src/data/items';
import strings from '../src/localization/strings';

// 1. Sabit değişkenleri en üste ekle
const EARTH_RADIUS = 6371e3; // Dünya yarıçapı (metre)
const STORAGE_KEYS = {
  SAVED_LOCATIONS: '@saved_locations',
  HOME_LOCATION: '@home_location'
};

// Global bildirim dinleyicisini tanımla
let notificationListener = null;

const HomeScreen = () => {
  

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
  const [currentLanguage, setCurrentLanguage] = useState('tr');
  const [showSettings, setShowSettings] = useState(false);

  // Dil değiştirme fonksiyonunu ekleyelim
  const toggleLanguage = async () => {
    try {
      const newLang = currentLanguage === 'tr' ? 'en' : 'tr';
      setCurrentLanguage(newLang);
      
      // Dil tercihini AsyncStorage'a kaydet
      await AsyncStorage.setItem('user-language', newLang);
      
      console.log('Dil değiştirildi:', newLang);
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

  // 📡 İnternet bağlantısını kontrol et
 

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

  
  const startLocationTracking = async (savedLocation) => {
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
  };
  const simulateLocationChange = () => {
    // Test koordinatları (Ev konumundan 100 metre uzakta)
    const testLocation = {
      coords: {
        latitude: (homeLocation?.latitude || 0) + 0.001, // Yaklaşık 100 metre kuzey
        longitude: homeLocation?.longitude || 0
      }
    };

    // Konum değişimini simüle et
    if (locationSubscription) {
      console.log("Simüle edilen konum:", testLocation);
      locationSubscription.remove();
      
      const distance = getDistanceFromLatLonInMeters(
        homeLocation.latitude,
        homeLocation.longitude,
        testLocation.coords.latitude,
        testLocation.coords.longitude
      );

      console.log("Hesaplanan mesafe:", distance, "metre");
      
      if (distance >= 50) {
        sendAlert();
        Vibration.vibrate(1000);
      }
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
        
        // Konum adını almak için modal göster
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
                
                const newLocation = {
                  id: Date.now().toString(),
                  name,
                  latitude,
                  longitude
                };
  
                const updatedLocations = [...savedLocations, newLocation];
                setSavedLocations(updatedLocations);
                
                // AsyncStorage'a kaydet
                await AsyncStorage.setItem(
                  '@saved_locations',
                  JSON.stringify(updatedLocations)
                );
  
                setHomeLocation(newLocation);
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
  


// CategorySelector bileşenini güncelle
const CategorySelector = () => {
  const categories = getCategories(currentLanguage);
  const items = getCategorizedItems(currentLanguage);
  const allCategoryName = strings[currentLanguage].categories.all;

  return (
    <View style={styles.categoryWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.categoryScrollContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            dynamicStyles.categoryButton,
            selectedCategory === allCategoryName && dynamicStyles.selectedCategory
          ]}
          onPress={() => setSelectedCategory(allCategoryName)}
        >
          <Text style={[
            styles.categoryButtonText,
            dynamicStyles.categoryText,
            selectedCategory === allCategoryName && styles.selectedCategoryText
          ]}>
            {categoryIcons[currentLanguage === 'tr' ? 'Tümü' : 'All']} {allCategoryName}
          </Text>
        </TouchableOpacity>

        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              dynamicStyles.categoryButton,
              selectedCategory === category && dynamicStyles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              dynamicStyles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {categoryIcons[category]} {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// getFilteredItems fonksiyonunu güncelle
const getFilteredItems = () => {
  const items = getCategorizedItems(currentLanguage);
  const allCategoryName = strings[currentLanguage].categories.all;
  
  if (!selectedCategory || selectedCategory === allCategoryName) {
    return getInitialItems(currentLanguage);
  }
  
  return items[selectedCategory] || [];
};

// useEffect'i güncelle
useEffect(() => {
  setItems(getInitialItems(currentLanguage));
  // Kategoriyi de sıfırla
  setSelectedCategory(strings[currentLanguage].categories.all);
}, [currentLanguage]);

const StatsCard = () => (
  <View style={[styles.statsCard, dynamicStyles.statsCard]}>
    <View style={styles.statItem}>
      <Text style={[styles.statNumber, dynamicStyles.text]}>
        {selectedItems.length}
      </Text>
      <Text style={[styles.statLabel, dynamicStyles.categoryText]}>
        {strings[currentLanguage].stats.selected}
      </Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={[styles.statNumber, dynamicStyles.text]}>
        {getFilteredItems().length}
      </Text>
      <Text style={[styles.statLabel, dynamicStyles.categoryText]}>
        {strings[currentLanguage].stats.total}
      </Text>
    </View>
  </View>
);

const CurrentLocationCard = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <TouchableOpacity 
        style={[styles.statsCard, dynamicStyles.statsCard]}
        onPress={() => setIsVisible(true)}
      >
        <View style={styles.currentLocationContainer}>
          <Text style={[styles.locationTitle, dynamicStyles.text]}>
            {strings[currentLanguage].location.title}
          </Text>
          <Text style={[styles.locationName, dynamicStyles.categoryText]}>
            {homeLocation?.name || strings[currentLanguage].location.noLocation}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView style={[styles.modalSafeArea, dynamicStyles.modalBackground]}>
          <View style={[styles.locationModalContainer, dynamicStyles.modalContent]}>
            <Text style={styles.locationModalTitle}>
              {strings[currentLanguage].location.savedLocations}
            </Text>
            
            <FlatList
                data={savedLocations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.locationItem, dynamicStyles.locationItem, { 
                      backgroundColor: homeLocation?.id === item.id ? '#34C759' : dynamicStyles.locationItem.backgroundColor 
                    }]}
                    onPress={() => {
                      setHomeLocation(item);
                      setIsVisible(false);
                    }}
                  >
                    <Text style={[styles.locationItemText, dynamicStyles.locationItemText, { 
                      color: homeLocation?.id === item.id ? '#FFF' : dynamicStyles.locationItemText.color 
                    }]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.buttonText}>
                {strings[currentLanguage].buttons.close}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

// ThemeToggle bileşenini güncelle
const ThemeToggle = () => (
  <TouchableOpacity
    style={[styles.themeToggleButton]} // homeButton yerine yeni stil
    onPress={() => setIsDarkMode(!isDarkMode)}
  >
    <Text style={styles.buttonModeText}>
      {isDarkMode ? '☀️' : '🌙'}
      
    </Text>
  </TouchableOpacity>
);

const LanguageToggle = () => (
  <TouchableOpacity
    style={[styles.themeToggleButton]}
    onPress={toggleLanguage}
  >
    <Text style={styles.buttonModeText}>
      {currentLanguage === 'tr' ? '🇬🇧' : '🇹🇷'}
    </Text>
  </TouchableOpacity>
);

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
          {strings[currentLanguage].settings.title}
        </Text>

        {/* Tema Ayarı */}
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, dynamicStyles.text]}>
            {strings[currentLanguage].settings.darkMode}
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
            {strings[currentLanguage].settings.language}
          </Text>
          {/* Dinamik stil eklendi */}
          <TouchableOpacity
            style={[styles.languageButton, dynamicStyles.languageButton]}
            onPress={toggleLanguage}
          >
            <Text style={[styles.languageButtonText, dynamicStyles.text]}>
              {currentLanguage === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.homeButton, { backgroundColor: '#007AFF' }]} 
          onPress={simulateLocationChange}
        >
          <Text style={styles.buttonText}>
            {strings[currentLanguage].buttons.testLocation}
          </Text>
        </TouchableOpacity>
       

        <TouchableOpacity 
          style={[styles.closeButton, { marginTop: 20 }]}
          onPress={() => setShowSettings(false)}
        >
          <Text style={styles.buttonText}>
            {strings[currentLanguage].buttons.close}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </Modal>
);

return (
  <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Üst kısımdaki ayarlar butonu */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.settingsButton]}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.buttonModeText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, dynamicStyles.text]}>
        {strings[currentLanguage].appName}
      </Text>
      
      <CategorySelector />
      <StatsCard />
      <CurrentLocationCard />
      
      <FlatList
        data={getFilteredItems()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              dynamicStyles.itemContainer,
              selectedItems.includes(item) && dynamicStyles.selectedItem, // styles.selectedItem yerine dynamicStyles.selectedItem kullanıyoruz
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
              selectedItems.includes(item) && dynamicStyles.selectedItemText // Seçili durum için metin stili
            ]}>
              {item}
            </Text>
            {selectedItems.includes(item) && (
              <Text style={styles.checkIcon}>✔️</Text>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => item + index.toString()}
      />
      
      {isLoading && ( // Yükleme göstergesi
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity 
          style={[styles.homeButton, { backgroundColor: '#34C759' }]} 
          onPress={saveHomeLocation}
        > 
          <Text style={styles.buttonText}>
            {strings[currentLanguage].buttons.saveLocation}
          </Text>
        </TouchableOpacity>
      
        
      </View>

      {renderSettings()}
    </View>
  </SafeAreaView>
);
};

export default HomeScreen;