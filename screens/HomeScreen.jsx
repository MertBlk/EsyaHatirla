import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Vibration, Modal, ScrollView } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import NetInfo from "@react-native-community/netinfo";

const HomeScreen = () => {
  const initialItems = [
    "🔑 Anahtar", "👝 Cüzdan", "🎧 Kulaklık", "📱 Telefon", "🏠 Ev Kartı",
    "💳 Banka Kartı", "🎟️ Toplu Taşıma Kartı", "🔋 Powerbank", "⌚ Akıllı Saat",
    "🕶️ Güneş Gözlüğü", "🚬 Sigara / Çakmak", "📚 Defter / Kitap",
    "🩹 İlaç", "🧥 Mont / Şemsiye", "🥤 Su Şişesi", "🎫 Kimlik / Pasaport",
    "🔑 Araba Anahtarı"
  ];

  const [items, setItems] = useState(initialItems);
  const [customItem, setCustomItem] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [homeLocation, setHomeLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [isTracking, setIsTracking] = useState(false); // State ekleyin
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const categorizedItems = {
    'Günlük': [
      "🔑 Anahtar",
      "👝 Cüzdan",
      "📱 Telefon",
      "🔋 Powerbank",
      "⌚ Akıllı Saat"
    ],
    'İş/Okul': [
      "💼 Laptop",
      "📚 Defter / Kitap",
      "✏️ Kalem",
      "🎧 Kulaklık"
    ],
    'Spor': [
      "👟 Spor Ayakkabı",
      "🎽 Spor Kıyafeti",
      "🧴 Havlu",
      "🥤 Su Şişesi"
    ],
    'Seyahat': [
      "🎫 Kimlik / Pasaport",
      "🧳 Valiz",
      "🔌 Şarj Aleti",
      "💳 Banka Kartı"
    ],
    'Sağlık': [
      "🩹 İlaç",
      "😷 Maske",
      "🧴 El Dezenfektanı"
    ]
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

  // 📍 Kullanıcının mevcut konumunu al ve ev konumu olarak kaydet
  const saveHomeLocation = async () => {
    try {
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) {
        return;
      }

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          "Konum Servisleri Kapalı",
          "Lütfen cihazınızın konum servislerini açın."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      if (location && location.coords) {
        const { latitude, longitude } = location.coords;
        // State'i direkt olarak güncelle
        setHomeLocation({ latitude, longitude });
      } else {
        throw new Error("Konum bilgisi alınamadı");
      }
    } catch (error) {
      console.error("Konum alma hatası:", error);
      Alert.alert(
        "Hata",
        "Konum alınırken bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  // Yeni bir fonksiyon ekleyelim
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
          timeInterval: 5000, // 5 saniyede bir kontrol et
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

  // 📏 İki nokta arasındaki mesafeyi hesapla (Haversine Formülü)
  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon1 - lat1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * 
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // 📩 Bildirim Gönder
  const sendNotification = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("İzin Hatası", "Bildirim göndermek için izin gerekiyor");
        return;
      }

      // Bildirim içeriğini hazırla
      const notificationContent = {
        title: "Eşyalarını Aldın mı?",
        body: selectedItems && selectedItems.length > 0 
          ? `Unutma! ${selectedItems.join(', ')}` 
          : 'Hiç eşya seçmedin!',
        sound: 'default',
        priority: 'high',
      };

      console.log('Seçili eşyalar:', selectedItems); // Debug için log
      console.log('Bildirim içeriği:', notificationContent); // Debug için log

      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null
      });

    } catch (error) {
      console.error('Bildirim hatası:', error);
      Alert.alert("Bildirim Hatası", "Bildirim gönderilemedi: " + error.message);
    }
  };

  const sendAlert = async () => {
    try {
      // Titreşim paterni: 500ms açık, 200ms kapalı, 500ms açık
      Vibration.vibrate([500, 200, 500]);
      
      // Sesli uyarı için özel ses ekleyin
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Dikkat! Evden Uzaklaşıyorsun!",
          body: `${selectedItems.length} eşyan seçili. Kontrol et!`,
          sound: 'notification.wav', // özel ses dosyası
          priority: 'high',
        },
        trigger: null,
      });
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

  const addCustomItem = () => {
    if (customItem.trim()) {
      const newItem = customItem.trim();
      
      // Seçili kategoriye ekle
      if (selectedCategory !== 'Tümü') {
        categorizedItems[selectedCategory] = [
          ...categorizedItems[selectedCategory],
          newItem
        ];
      } else {
        // Varsayılan olarak Günlük kategorisine ekle
        categorizedItems['Günlük'] = [
          ...categorizedItems['Günlük'],
          newItem
        ];
      }
      
      setCustomItem("");
      // State'i güncelle
      forceUpdate({}); // Component'i yeniden render etmek için
    }
  };

  const WarningModal = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>⚠️ Eşya Kontrol Listesi</Text>
        {selectedItems.map(item => (
          <View key={item} style={styles.checklistItem}>
            <Text style={styles.itemText}>{item}</Text>
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
          <Text style={styles.buttonText}>Kontrol Ettim</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const CategorySelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'Tümü' && styles.selectedCategoryButton
        ]}
        onPress={() => setSelectedCategory('Tümü')}
      >
        <Text style={[
          styles.categoryButtonText,
          selectedCategory === 'Tümü' && styles.selectedCategoryText
        ]}>📋 Tümü</Text>
      </TouchableOpacity>
      {Object.keys(categorizedItems).map(category => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.selectedCategoryButton
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === category && styles.selectedCategoryText
          ]}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const getFilteredItems = () => {
    if (selectedCategory === 'Tümü') {
      return Object.values(categorizedItems).flat();
    }
    return categorizedItems[selectedCategory] || [];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unutma! Yanına al:</Text>

      <CategorySelector />

      <FlatList
        data={getFilteredItems()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              selectedItems.includes(item) && styles.selectedItem,
            ]}
            onPress={() =>
              setSelectedItems(prev =>
                prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
              )
            }
          >
            <Text style={styles.itemText}>{item}</Text>
            {selectedItems.includes(item) && <Text style={styles.checkIcon}>✔️</Text>}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => item + index.toString()}
      />
      

      <TextInput
        value={customItem}
        onChangeText={setCustomItem}
        placeholder="Yeni eşya ekle..."
        style={styles.input}
      />

      <TouchableOpacity style={styles.addButton} onPress={addCustomItem}>
        <Text style={styles.addButtonText}>+ Ürün Ekle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton} onPress={saveHomeLocation}>
        <Text style={styles.buttonText}>🏠 Ev Konumunu Kaydet</Text>
      </TouchableOpacity>

      <WarningModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FAF9F6" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#aaa", borderRadius: 10, padding: 12, marginBottom: 12 },
  addButton: { backgroundColor: "#007BFF", padding: 12, borderRadius: 10, alignItems: "center" },
  homeButton: { backgroundColor: "#28A745", padding: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  itemContainer: { flexDirection: "row", justifyContent: "space-between", padding: 12, borderRadius: 8, backgroundColor: "#fff", marginBottom: 8 },
  selectedItem: { backgroundColor: "#DFF6DD" },
  itemText: { fontSize: 18 },
  checkIcon: { fontSize: 18, color: "green" },
  checkbox: {
    width: 24,
    height: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  // styles içine ekleyin
categoryContainer: {
  marginBottom: 15,
  marginTop: 10,
},
categoryButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginRight: 8,
  borderRadius: 20,
  backgroundColor: '#f0f0f0',
  borderWidth: 1,
  borderColor: '#ddd',
},
selectedCategoryButton: {
  backgroundColor: '#007BFF',
  borderColor: '#007BFF',
},
categoryButtonText: {
  fontSize: 14,
  color: '#333',
},
selectedCategoryText: {
  color: '#fff',
  fontWeight: 'bold',
},
});

export default HomeScreen;