import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  StatusBar, 
  Alert, 
  Vibration,
  Text,
  TouchableOpacity
} from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

import useLocation from '../../hooks/useLocation';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { 
  categoryIcons, 
  categorizedItems, 
  initialItems, 
  STORAGE_KEYS 
} from '../../constants/categories';

// Bileşen importları
import { CategorySelector } from './components/CategorySelector';
import { StatsCard } from './components/StatsCard';
import { ItemList } from './components/ItemList';
import { WarningModal } from './components/WarningModal';
import { ThemeToggle } from './components/ThemeToggle';
import styles from './styles';
import { LocationCard } from './components/LocationCard';


const HomeScreen = () => {
  const { sendLocationAlert } = useNotifications();
  // Location hook'undan tüm değerleri çekelim
  const { 
    homeLocation, 
    setHomeLocation,
    savedLocations,
    setSavedLocations,
    saveHomeLocation, 
    startLocationTracking,
    stopLocationTracking,
    simulateLocationChange
  } = useLocation();

  const { isDarkMode, setIsDarkMode, dynamicStyles } = useTheme();
  const { sendNotification, sendAlert } = useNotifications();

  // States
  const [items] = useState(initialItems);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // İnternet bağlantısı kontrolü
  useEffect(() => {
    const checkConnection = async () => {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        Alert.alert("Bağlantı Sorunu", "Lütfen internet bağlantınızı kontrol edin!");
      }
    };
    checkConnection();
  }, []);

  // Konum izinleri ve bildirim izinleri
  useEffect(() => {
    const setupPermissions = async () => {
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      const notificationPermission = await Notifications.requestPermissionsAsync();

      if (locationPermission.status !== 'granted' || notificationPermission.status !== 'granted') {
        Alert.alert("İzin Hatası", "Uygulama için gerekli izinler verilmedi!");
      }
    };
    setupPermissions();
  }, []);

  // Kayıtlı konumları yükle
  useEffect(() => {
    const loadSavedLocations = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
        if (savedData) {
          setSavedLocations(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Konum yükleme hatası:', error);
      }
    };
    loadSavedLocations();
  }, []);

  // useEffect ile savedLocations'ı kontrol edelim
  useEffect(() => {
    if (savedLocations) {
      console.log('Kayıtlı konumlar:', savedLocations);
    }
  }, [savedLocations]);

  // Filtreleme fonksiyonu
  const getFilteredItems = () => {
    if (selectedCategory === 'Tümü') {
      return items;
    }
    return categorizedItems[selectedCategory] || [];
  };

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <View style={[styles.container, dynamicStyles.container]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <Text style={[styles.title, dynamicStyles.text]}>
          Unutma! Yanına al
        </Text>
        
        <ThemeToggle 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          styles={styles}
        />

        <CategorySelector 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          styles={styles}
          dynamicStyles={dynamicStyles}
        />

        <StatsCard 
          selectedItems={selectedItems}
          selectedCategory={selectedCategory}
          styles={styles}
          dynamicStyles={dynamicStyles}
        />

        <LocationCard 
          homeLocation={homeLocation}
          setHomeLocation={setHomeLocation}
          savedLocations={savedLocations}
          styles={styles}
          dynamicStyles={dynamicStyles}
        />

        <ItemList 
          items={getFilteredItems()}
          selectedCategory={selectedCategory}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          styles={styles}
          dynamicStyles={dynamicStyles}
        />

        <WarningModal 
          isModalVisible={isModalVisible}
          setModalVisible={setModalVisible}
          selectedItems={selectedItems}
          styles={styles}
          dynamicStyles={dynamicStyles}
        />

        <TouchableOpacity style={styles.homeButton} onPress={saveHomeLocation}>
          <Text style={styles.buttonText}>🏠 Konumunu Kaydet</Text>
        </TouchableOpacity>

        {/* Test butonunu düzelt */}
        <TouchableOpacity 
          style={[styles.homeButton, { backgroundColor: '#007AFF' }]} 
          onPress={() => {
            if (!homeLocation) {
              Alert.alert("Hata", "Önce ev konumunuzu kaydetmelisiniz!");
              return;
            }
            simulateLocationChange(); // selectedItems parametresini kaldır
          }}
        >
          <Text style={styles.buttonText}>🔄 Konum Değişimini Test Et</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;