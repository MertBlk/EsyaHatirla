import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Vibration, Modal } from "react-native";
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
          distanceInterval: 10 // 10 metrede bir güncelle
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
      // Önce bildirim izinlerini kontrol edelim
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "İzin Hatası",
          "Bildirim göndermek için izin gerekiyor"
        );
        return;
      }

      // Bildirim ayarlarını yapılandır
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Bildirimi gönder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Eşyalarını Aldın mı?",
          body: selectedItems.length > 0 
            ? `Seçili eşyalar: ${selectedItems.join(', ')}`
            : 'Hiç eşya seçmedin!',
          sound: 'default',
        },
        trigger: null // Anlık bildirim için
      });

    } catch (error) {
      console.error('Bildirim hatası:', error);
      Alert.alert(
        "Bildirim Hatası",
        "Bildirim gönderilemedi: " + error.message
      );
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
      if (items.includes(customItem.trim())) {
        Alert.alert("Hata", "Bu eşya zaten listede mevcut!");
        return;
      }
      setItems(prevItems => [...prevItems, customItem.trim()]);
      setCustomItem("");
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unutma! Yanına al:</Text>

      <FlatList
        data={items}
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
});

export default HomeScreen;