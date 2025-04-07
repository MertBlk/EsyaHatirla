import { useState, useEffect, useCallback, useColorScheme } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Vibration, Modal, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDynamicStyles, styles } from '../src/styles/HomeScreen.styles';
import { initialItems, categorizedItems, categoryIcons } from '../src/data/items';
// 1. Sabit değişkenleri en üste ekle
const EARTH_RADIUS = 6371e3; // Dünya yarıçapı (metre)
const STORAGE_KEYS = {
  SAVED_LOCATIONS: '@saved_locations',
  HOME_LOCATION: '@home_location'
};

const HomeScreen = () => {
  

  const [items, setItems] = useState(initialItems);
  const [selectedItems, setSelectedItems] = useState([]);
  const [homeLocation, setHomeLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [isTracking, setIsTracking] = useState(false); // State ekleyin
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [isLoading, setIsLoading] = useState(false); // Yükleme durumu için state ekleyin
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [savedLocations, setSavedLocations] = useState([]);
  const [locationName, setLocationName] = useState('');

  

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
    checkInternetConnection();
    requestPermissions();
  }, []);

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
  const checkInternetConnection = () => {
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        Alert.alert("Bağlantı Sorunu", "Lütfen internet bağlantınızı kontrol edin!");
      }
    });
  };

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
    const Δλ = ((lon2 - lon1) * Math.PI) / 180; // Burası düzeltildi
  
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
        Alert.alert("İzin Hatası", "Bildirim göndermek için izin gerekiyor");
        return;
      }
  
      // Seçili eşyaları kontrol et ve formatlı metin oluştur
      const itemsList = selectedItems.length > 0 
        ? selectedItems.map(item => item.split(' ')[1]).join(', ') // Emoji'leri kaldır
        : 'Hiç eşya seçmedin!';
  
      const notificationContent = {
        title: "📝 Eşyalarını Aldın mı?",
        body: selectedItems.length > 0 
          ? `Unutma! Yanında olması gerekenler: ${itemsList}`
          : itemsList,
        sound: 'default',
        priority: 'high',
        badge: selectedItems.length,
      };
  
      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null // Hemen gönder
      });
  
      console.log('Bildirim gönderildi:', notificationContent);
  
    } catch (error) {
      console.error('Bildirim hatası:', error);
      Alert.alert("Bildirim Hatası", "Bildirim gönderilemedi: " + error.message);
    }
  };

  const sendAlert = async () => {
    try {
      // Titreşim paterni
      Vibration.vibrate([500, 200, 500]);
      
      const itemsList = selectedItems.length > 0 
        ? `${selectedItems.join('\n• ')}` 
        : 'Hiç eşya seçmedin!';

      // Bildirimi gönder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Dikkat! Evden Uzaklaşıyorsun!",
          body: `Seçili Eşyaların:\n• ${itemsList}`,
          sound: 'default',
          priority: 'high',
          badge: selectedItems.length,
          categoryIdentifier: 'items', // Kategori tanımlayıcısını ekleyin
          data: { type: 'reminder' }
        },
        trigger: null
      });

      // Bildirim yanıtlarını dinle
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const { actionIdentifier } = response;
        
        if (actionIdentifier === 'yes') {
          // Evet'e tıklandığında
          Notifications.scheduleNotificationAsync({
            content: {
              title: "✅ Harika! İyi yolculuklar!",
              body: "Tüm eşyalarını aldığını onayladın.",
              sound: 'default'
            },
            trigger: null
          });
        } else if (actionIdentifier === 'no') {
          // Hayır'a tıklandığında
          Vibration.vibrate([1000, 500, 1000]);
          Notifications.scheduleNotificationAsync({
            content: {
              title: "🚨 Acil! Eşyalarını Unutuyorsun!",
              body: `Lütfen geri dön ve şunları al:\n• ${itemsList}`,
              sound: 'default',
              priority: 'high'
            },
            trigger: null
          });
        }
      });

      // Temizlik fonksiyonu
      return () => subscription.remove();

    } catch (error) {
      console.error('Uyarı hatası:', error);
    }
  };

  const checkDistance = (distance) => {
    if (distance >= 50 && distance < 100) {
      sendAlert("İlk Uyarı: Evden uzaklaşıyorsun!");
    } else if (distance >= 100 && distance < 200) {
      sendAlert("Son Uyarı: Eşyalarını kontrol et!");
    } else if (distance >= 200) {
      sendAlert("Kritik Uyarı: Çok uzaklaştın!");
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
  const CategorySelector = () => (
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
            selectedCategory === 'Tümü' && dynamicStyles.selectedCategory
          ]}
          onPress={() => setSelectedCategory('Tümü')}
        >
          <Text style={[
            styles.categoryButtonText,
            dynamicStyles.categoryText,
            selectedCategory === 'Tümü' && styles.selectedCategoryText
          ]}>
            {categoryIcons['Tümü']} Tümü
          </Text>
        </TouchableOpacity>
        {Object.keys(categorizedItems).map(category => (
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

  const getFilteredItems = () => {
    if (selectedCategory === 'Tümü') {
      return initialItems;
    }
    return categorizedItems[selectedCategory] || [];
  };

  // StatsCard bileşenini güncelle
  const StatsCard = () => (
    <View style={[styles.statsCard, dynamicStyles.statsCard]}>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, dynamicStyles.text]}>
          {selectedItems.length}
        </Text>
        <Text style={[styles.statLabel, dynamicStyles.categoryText]}>
          Seçili
        </Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, dynamicStyles.text]}>
          {getFilteredItems().length}
        </Text>
        <Text style={[styles.statLabel, dynamicStyles.categoryText]}>
          Toplam
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
              📍 Seçili Konum
            </Text>
            <Text style={[styles.locationName, dynamicStyles.categoryText]}>
              {homeLocation?.name || 'Henüz konum seçilmedi'}
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
                📍 Kayıtlı Konumlar
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
                <Text style={styles.buttonText}>Kapat</Text>
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

  const dynamicStyles = createDynamicStyles(isDarkMode);

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Text style={[styles.title, dynamicStyles.text]}>
        Unutma! Yanına al
      </Text>
        
        <ThemeToggle /> {/* Tema değiştirme butonu */}
        
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
        <TouchableOpacity style={styles.homeButton} onPress={saveHomeLocation}> 
          <Text style={styles.buttonText}>🏠 Konumunu Kaydet</Text>
        </TouchableOpacity>
       
        <TouchableOpacity 
            style={[styles.homeButton, { backgroundColor: '#007AFF' }]} 
            onPress={simulateLocationChange}
          >
            <Text style={styles.buttonText}>🔄 Konum Değişimini Test Et</Text>
          </TouchableOpacity>
          

       
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;