import { useState, useEffect, useCallback, useColorScheme } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Vibration, Modal, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Sabit değişkenleri en üste ekle
const EARTH_RADIUS = 6371e3; // Dünya yarıçapı (metre)
const STORAGE_KEYS = {
  SAVED_LOCATIONS: '@saved_locations',
  HOME_LOCATION: '@home_location'
};

const HomeScreen = () => {
  const initialItems = [
    "🔑 Anahtar", "👝 Cüzdan", "🎧 Kulaklık", "📱 Telefon", "🏠 Ev Kartı",
    "💳 Banka Kartı", "🎟️ Toplu Taşıma Kartı", "🔋 Powerbank", "⌚ Akıllı Saat",
    "🕶️ Güneş Gözlüğü", "🚬 Sigara / Çakmak", "📚 Defter / Kitap",
    "🔑 Araba Anahtarı", "🎵 Kulaklık Kılıfı", "🛍️ Alışveriş Çantası",
    "💊 Vitamin / Takviye", "🧴 El Dezenfektanı / Kolonya", "🧻 Islak Mendil / Peçete",
    "🍬 Sakız / Şekerleme", "🏋️‍♂️ Spor Eşyaları", "📝 Not Defteri / Yapışkan Notlar",
    "🎟️ Otopark Kartı", "📮 Posta / Evrak / Fatura", "🧷 Küçük Dikiş Seti",
    "🍏 Sağlıklı Atıştırmalık", "🕹️ Taşınabilir Oyun Konsolu", "🪪 Çalışma Kartı",
    "🛏️ Yedek Çorap / İç Çamaşırı", "🧴 Dudak Koruyucu / Krem", "🕰️ Küçük Çalar Saat",
    "🔦 El Feneri", "🔌 Şarj Kablosu", "🪥 Diş Fırçası / Macun", "🔖 Kitap Ayracı",
    "🍫 Atıştırmalık", "🔑 Yedek Anahtar", "🖊️ Kalem", "🎨 Küçük Çizim Defteri",
    "💼 Laptop / Tablet", "🔌 Taşınabilir Adaptör / Priz", "📂 USB Bellek / Hard Disk"
  ];
  const categorizedItems = {
    'Günlük': [
      "🔑 Anahtar",
      "👝 Cüzdan",
      "📱 Telefon",
      "🔋 Powerbank",
      "⌚ Akıllı Saat",
      "🕶️ Güneş Gözlüğü",
      "🚬 Sigara / Çakmak",
      "🥤 Su Şişesi",
      "🔖 Kitap Ayracı",
      "🎧 Kulaklık",
    ],
    'İş/Okul': [
      "💼 Laptop",
      "📚 Defter / Kitap",
      "✏️ Kalem",
      
      "📂 USB Bellek / Hard Disk",
      "📝 Not Defteri / Yapışkan Notlar",
      "📮 Evrak / Dosya",
      "🪪 Çalışma Kartı / Personel Kartı"
    ],
    'Spor': [
      "👟 Spor Ayakkabı",
      "🎽 Spor Kıyafeti",
      "🧴 Havlu",
      "🥤 Su Şişesi",
      "🏋️‍♂️ Ağırlık Eldiveni",
      "🍏 Sağlıklı Atıştırmalık",
      "🎧 Spor İçin Kulaklık",
      "🧦 Yedek Çorap"
    ],
    'Seyahat': [
      "🎫 Kimlik / Pasaport",
      "🧳 Valiz",
      "🔌 Şarj Aleti",
      "💳 Banka Kartı",
      "📜 Uçuş / Otel Rezervasyon Belgeleri",
      "🗺️ Harita / Navigasyon Cihazı",
      "🧥 Mont / Şemsiye",
      "🔦 El Feneri",
      "💊 Seyahat İçin İlaçlar",
      "📷 Fotoğraf Makinesi"
    ],
    'Sağlık': [
      "🩹 İlaç",
      "🧴 El Dezenfektanı",
      "💊 Vitamin / Takviye",
      "🧻 Islak Mendil / Peçete",
      "🩹 Yara Bandı / Küçük İlk Yardım Kiti",
      "🪥 Diş Fırçası / Macun",
      "🧴 Dudak Koruyucu / Nemlendirici",
      "😷 Maske"
    ],
    'Elektronik': [
      "💻 Tablet / iPad",
      "🎮 Taşınabilir Oyun Konsolu",
      "📱 Yedek Telefon",
      "🔌 Şarj Kablosu",
      "🔊 Bluetooth Hoparlör",
      "📺 HDMI Kablosu",
      "🔋 Taşınabilir Batarya"
    ]
  };
  
    const categoryIcons = {
      'Tümü': '📋',
      'Günlük': '🌞',
      'İş/Okul': '💼',
      'Spor': '🏃',
      'Seyahat': '✈️',
      'Sağlık': '💊'
    };

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
          priority: 'high'
        }),
      });
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
      
      // Seçili eşyaları formatlı metne dönüştür
      const itemsList = selectedItems.length > 0 
        ? `${selectedItems.join('\n• ')}` // Her eşya için yeni satır ve madde işareti
        : 'Hiç eşya seçmedin!';
  
      // Bildirim gönder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Dikkat! Evden Uzaklaşıyorsun!",
          body: selectedItems.length > 0
            ? `Seçili Eşyaların:\n• ${itemsList}`
            : 'Hiç eşya seçmedin! Kontrol et!',
          sound: 'default',
          priority: 'high',
          badge: selectedItems.length
        },
        trigger: null,
      });
  
      console.log('Uyarı gönderildi - Seçili eşyalar:', itemsList); // Debug için
  
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
  const WarningModal = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={[styles.modalContainer, dynamicStyles.modalContainer]}>
        <Text style={styles.modalTitle}>
          <Text>⚠️</Text>
          <Text> Eşya Kontrol Listesi</Text>
        </Text>
        {selectedItems.map(item => (
          <View key={item} style={[styles.checklistItem, dynamicStyles.checklistItem]}>
            <Text style={[styles.itemText, dynamicStyles.text]}>{item}</Text>
            <CheckBox
              value={false}
              onValueChange={() => {}}
              tintColors={{ true: '#34C759', false: '#767577' }}
              style={styles.checkbox}
            />
          </View>
        ))}
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Kontrol Ettim</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

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
      return Object.values(categorizedItems).flat();
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

  const dynamicStyles = {
    container: {
      backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF'
    },
    safeArea: {
      backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF'
    },
    modalContainer: {
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'
    },
    modalContent: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF'
    },
    locationItem: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA'
    },
    locationItemText: {
      color: isDarkMode ? '#FFFFFF' : '#000000'
    },
    checklistItem: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA'
    },
    itemContainer: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA'
    },
    text: {
      color: isDarkMode ? '#FFFFFF' : '#000000'
    },
    categoryButton: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA'
    },
    categoryText: {
      color: isDarkMode ? '#EBEBF5' : '#666666'
    },
    selectedCategory: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF'
    },
    statsCard: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA'
    },
    selectedItem: {
      backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7',
      borderWidth: 2,
      borderColor: "#34C759"
    },
    modalBackground: {
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)'
    }
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#1C1C1E",
    },
    container: { 
      flex: 1, 
      padding: 10, 
      backgroundColor: "#1C1C1E"
    },
    title: { 
      fontSize: 28, 
      fontWeight: "bold", 
      color: "#FFFFFF",
      marginBottom: 12,
    },
    categoryWrapper: {
      height: 40,
      marginBottom:6,
    },
    categoryScrollContent: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    categoryContainer: {
      height: 40,
      marginBottom: 8,
      paddingVertical: 0,    
    },
    categoryButton: {
      width: 100,
      height: 36,
      marginRight: 8,
      borderRadius: 18,
      backgroundColor: '#2C2C2E', // Koyu kart rengi
      borderWidth: 1,
      borderColor: '#3A3A3C', // Koyu kenarlık
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    selectedCategoryButton: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#EBEBF5', // Açık gri yazı
    },
    selectedCategoryText: {
      color: '#fff',
      fontWeight: '600',
    },
  
    // Eşya listesi stil güncellemeleri
    itemContainer: { 
      flexDirection: "row", 
      alignItems: "center",
      justifyContent: "space-between", 
      padding: 18,
      borderRadius: 12,
      backgroundColor: "#2C2C2E", // Koyu kart rengi
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    selectedItem: { 
      backgroundColor: "#1C1C1E", // Koyu arka plan
      borderWidth: 1,
      borderColor: "#34C759", // iOS yeşil renk
    },
    
    itemText: { 
      fontSize: 16,
      fontWeight: "500",
      color: "#FFFFFF" // Beyaz yazı
    },
    selectedItemText: { // Yeni stil ekle
      color: "#34C759", // Seçili durumda yeşil yazı
      fontWeight: "600"
    },
    checkIcon: { 
      fontSize: 20, 
      color: "#4CAF50"
    },
  
    // Input ve buton stil güncellemeleri
    input: { 
      backgroundColor: "#fff",
      borderWidth: 1, 
      borderColor: "#E0E0E0", 
      borderRadius: 12, 
      padding: 15,
      marginBottom: 16,
      fontSize: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    
    homeButton: { 
      backgroundColor: "#34C759", 
      padding: 16,
      marginTop: 8,
      marginBottom: 10, 
      borderRadius: 40,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3.84,
      elevation: 5,
    },
    buttonText: { 
      color: "#fff", 
      fontSize: 16, 
      
      fontWeight: "600",
      textAlign: "center"
    },
    addButtonText: { 
      color: "#fff", 
      fontSize: 16, 
      fontWeight: "600",
      textAlign: "center"
    },
    buttonModeText: {
      color: "#fff",
      height: 32,
      fontSize: 24,
      textAlign: "center",
    },
  
    // Modal stil güncellemeleri
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)', // Koyu modal arka planı
      justifyContent: 'center',
      padding: 20,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FF3B30',
      textAlign: 'center',
      marginBottom: 24,
    },
    checklistItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#2C2C2E', // Koyu kart rengi
      borderRadius: 12,
      marginBottom: 12,
    },
    confirmButton: {
      backgroundColor: '#34C759',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 24,
    },
  
    // Stil eklemeleri
    statsCard: {
      flexDirection: 'row',
      backgroundColor: '#2C2C2E', // Koyu kart rengi
      borderRadius: 12,
      padding: 8,
      marginBottom: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    statItem: {
      flex: 1,
      alignItems: 'center', 
      
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#0A84FF', // iOS mavi
    },
    statLabel: {
      fontSize: 14,
      color: '#EBEBF5', // Açık gri yazı
      marginTop: 4,
    },
    statDivider: {
      width: 1,
      backgroundColor: '#3A3A3C', // Koyu ayırıcı çizgi
      marginHorizontal: 16,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', // Koyu yükleme arka planı
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeToggleButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 40, // Genişliği küçült
      height: 40, // Yüksekliği küçült
      borderRadius: 20, // Tam yuvarlak için width/2
      backgroundColor: "#34C759",
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 1, // Diğer elementlerin üzerinde görünmesi için
    },
    buttonModeText: {
      color: "#fff",
      fontSize: 20, // Emoji boyutunu küçült
      textAlign: "center",
    },
    testButton: {
      backgroundColor: '#007AFF',
      padding: 16,
      marginTop: 8,
      marginBottom: 8,
      borderRadius: 40,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3.84,
      elevation: 5,
    },
    currentLocationContainer: {
      flex: 1,
      padding: 8,
    },
    locationTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    locationName: {
      fontSize: 14,
      fontWeight: '500',
    },
    locationPickerButton: {
      position: 'absolute',
      top: 10,
      right: 60, // ThemeToggle'dan 50 + 10 pixel uzakta
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#FF9500", // Turuncu renk
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3.84,
      elevation: 5,
      zIndex: 1,
    },
    modalSafeArea: {
      flex: 1,
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
    },
    locationModalContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    locationModalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FF9500',
      textAlign: 'center',
      marginBottom: 20,
    },
    locationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#2C2C2E',
      borderRadius: 12,
      marginBottom: 12,
    },
    locationItemText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#FFFFFF',
    },
    closeButton: {
      backgroundColor: '#FF9500',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 'auto',
    },
  });

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
          

        <WarningModal />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;