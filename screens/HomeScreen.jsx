import { useState, useEffect,useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Vibration } from "react-native";
import * as Location from 'expo-location';
import Notifications from 'expo-notifications';
import NetInfo from "@react-native-community/netinfo";

const HomeScreen = () => {
  const initialItems = [
    "🔑 Anahtar", "👝 Cüzdan", "🎧 Kulaklık", "📱 Telefon", "🏠 Ev Kartı",
    "💳 Banka Kartı", "🎟️ Toplu Taşıma Kartı", "🔋 Powerbank", "⌚ Akıllı Saat",
    "🕶️ Güneş Gözlüğü", "💄 Ruj", "🚬 Sigara / Çakmak", "📚 Defter / Kitap",
    "🩹 İlaç", "🧥 Mont / Şemsiye", "🥤 Su Şişesi", "🎫 Kimlik / Pasaport",
    "🔑 Araba Anahtarı"
  ];

  const [items, setItems] = useState(initialItems);
  const [customItem, setCustomItem] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [homeLocation, setHomeLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [isTracking, setIsTracking] = useState(false); // State ekleyin

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
        // State'i güncelledikten sonra callback'i çağır
        setHomeLocation({ latitude, longitude }, () => {
          Alert.alert(
            "Başarılı",
            "Ev konumunuz başarıyla kaydedildi!",
            [
              {
                text: "Tamam",
                onPress: () => {
                  console.log("Kaydedilen konum:", { latitude, longitude });
                  startLocationTracking({ latitude, longitude });
                }
              }
            ]
          );
        });
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
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * 
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // 📩 Bildirim Gönder
  const sendNotification = async () => {
  try {
      await Notifications.scheduleNotificationAsync({
      content: {
        title: "Eşyalarını Aldın mı?",
        body: `${selectedItems.length > 0 ? 
            `Seçili eşyalar: ${selectedItems.join(', ')}` : 
            'Hiç eşya seçmedin!'}`,
        sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { 
            distance: distance,
            timestamp: new Date().getTime() 
          },
      },
      trigger: null // Anlık bildirim için null kullan
      });
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error);
      Alert.alert(
        "Bildirim Hatası", 
        "Bildirim gönderilemedi. Lütfen izinleri kontrol edin."
      );
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
});

export default HomeScreen;