import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Vibration, Modal, ScrollView, StatusBar, ActivityIndicator, Switch } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDynamicStyles, styles } from '../src/styles/HomeScreen.styles';
import { getCategorizedItems, getInitialItems, categoryIcons, getCategories, items } from '../src/data/items';
import strings from '../src/localization/strings';

// Kendi oluşturduğumuz bileşenler ve kancalar
import CategorySelector from '../src/components/CategorySelector';
import StatsCard from '../src/components/StatsCard';
import CurrentLocationCard from '../src/components/CurrentLocationCard';
import LanguageToggle from '../src/components/LanguageToggle';
import ThemeToggle from '../src/components/ThemeToggle';
import useLanguage from '../src/hooks/useLanguage';
import useLocationTracking from '../src/hooks/useLocationTracking';
import notificationManager from '../src/utils/notificationManager';

// Global bildirim dinleyicisini tanımla
let notificationListener = null;
// Konum bildirimini kontrol etmek için bayrak
let locationSaveNotified = false;

// Memoize edilmiş liste öğesi bileşeni
const ItemComponent = memo(({ item, selectedItems, toggleItem, isDarkMode, dynamicStyles }) => (
  <TouchableOpacity
    style={[
      styles.itemContainer,
      dynamicStyles.itemContainer,
      selectedItems.includes(item) && dynamicStyles.selectedItem,
    ]}
    onPress={() => toggleItem(item)}
    accessibilityLabel={item}
    accessibilityRole="button"
    accessibilityHint={selectedItems.includes(item) ? "Seçilmiş eşya, kaldırmak için dokunun" : "Seçmek için dokunun"}
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
));

// Modal bileşenlerini ana bileşenden ayıralım
const SettingsModal = memo(({ 
  visible, 
  onClose, 
  isDarkMode, 
  setIsDarkMode, 
  currentLanguage, 
  languages, 
  setLanguage, 
  languageMenuVisible, 
  setLanguageMenuVisible,
  simulateLocationChange,
  safeGetString 
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
      <View style={[styles.settingsModalContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}>
        <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
          {safeGetString('settings.title', 'Ayarlar')}
        </Text>

        {/* Tema Ayarı */}
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {safeGetString('settings.darkMode', 'Karanlık Mod')}
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
          <Text style={[styles.settingLabel, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {safeGetString('settings.language', 'Dil')}
          </Text>
          <TouchableOpacity
            style={styles.languageSelector}
            onPress={() => setLanguageMenuVisible(true)}
          >
            <Text style={[styles.languageSelectText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
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
            {safeGetString('buttons.testLocation', '🔄 Konum Değişikliğini Test Et')}
          </Text>
        </TouchableOpacity>
       
        <TouchableOpacity 
          style={[styles.closeButton, { marginTop: 20 }]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>
            {safeGetString('buttons.close', 'Kapat')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Dil Seçimi Modalı */}
      <LanguageSelectionModal
        visible={languageMenuVisible}
        onClose={() => setLanguageMenuVisible(false)}
        languages={languages}
        currentLanguage={currentLanguage}
        setLanguage={(langCode) => {
          setLanguage(langCode);
          setLanguageMenuVisible(false);
        }}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  </Modal>
));

// Dil seçimi modalını da ayrı bir bileşen olarak oluşturalım
const LanguageSelectionModal = memo(({ 
  visible, 
  onClose, 
  languages, 
  currentLanguage, 
  setLanguage, 
  isDarkMode 
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View 
        style={[styles.languageModalContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
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
              onPress={() => setLanguage(item.code)}
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
      </View>
    </TouchableOpacity>
  </Modal>
));

const HomeScreen = () => {
  const { 
    currentLanguage, setLanguage, toggleLanguage, safeGetString, languages 
  } = useLanguage();
  
  // Diğer state'ler 
  const [items, setItems] = useState(() => getInitialItems(currentLanguage));
  const [selectedItems, setSelectedItems] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [saveNotification, setSaveNotification] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  
  // Konum takibi kancasını kullan
  const locationTracking = useLocationTracking(strings, currentLanguage, selectedItems);
  
  const {
    homeLocation, setHomeLocation,
    savedLocations, setSavedLocations,
    isTracking, isChangingLocation, 
    setIsChangingLocation, saveLocation,
    simulateLocationChange, updateLocationItems
  } = locationTracking;

  // Bildirim ayarlarını kurma
  useEffect(() => {
    notificationManager.setupNotifications(currentLanguage);
  }, [currentLanguage]);

  // Filtreleme işlevi için getFilteredItems fonksiyonu
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

  // useEffect içindeki bildirim dinleyicisini düzenle
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
  }, [selectedItems, currentLanguage]); // Bağımlılık dizisini düzeltme

  // Dinamik stilleri oluştur
  const dynamicStyles = useMemo(() => createDynamicStyles(isDarkMode), [isDarkMode]);

  // useCallback ile performans iyileştirmesi
  const toggleItem = useCallback((item) => {
    setSelectedItems(prev => {
      const newItems = prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item];
      
      // Ev konumu varsa, eşyaları hemen güncelle
      if (homeLocation) {
        // Konum güncelleme işleminde olduğumuzu belirt
        setIsChangingLocation(true);
        
        // Eşyaları güncelle (sessizce) ve işlem tamamlandığında flag'i kaldır
        updateLocationItems(homeLocation.id, true)
          .then(() => setIsChangingLocation(false))
          .catch(() => setIsChangingLocation(false));
      }
      
      return newItems;
    });
  }, [homeLocation, updateLocationItems, setIsChangingLocation]);

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.safeArea]}>
      <View style={[styles.container, dynamicStyles.container, { paddingBottom: 70 }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        
        {/* Üst kısımdaki başlık ve bilgi alanı */}
        <Text style={[styles.title, dynamicStyles.text]}>
          {safeGetString('appName', 'Unutma!')}
        </Text>
        
        {/* Kategori seçici bileşeni */}
        <CategorySelector 
          currentLanguage={currentLanguage}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          safeGetString={safeGetString}
          isDarkMode={isDarkMode}
        />
        
        {/* İstatistik kartı bileşeni */}
        <StatsCard 
          selectedItems={selectedItems}
          getFilteredItems={getFilteredItems}
          safeGetString={safeGetString}
          isDarkMode={isDarkMode}
        />
        
        {/* Mevcut konum kartı bileşeni */}
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
        
        {/* Eşya listesi */}
        <FlatList
          data={getFilteredItems()}
          contentContainerStyle={{ paddingBottom: 60 }}
          // Optimize edilmiş FlatList ayarları
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          getItemLayout={(data, index) => (
            {length: 60, offset: 60 * index, index}
          )}
          keyExtractor={(item, index) => `item-${index}-${item.substring(0,3)}`}
          renderItem={({ item }) => (
            <ItemComponent 
              item={item}
              selectedItems={selectedItems}
              toggleItem={toggleItem}
              isDarkMode={isDarkMode}
              dynamicStyles={dynamicStyles}
            />
          )}
        />
        
        {/* Yükleme göstergesi */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {/* Alt Menü */}
        <View style={[styles.bottomNav, dynamicStyles.bottomNav]}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={saveLocation}
            accessibilityLabel="Konum Kaydet"
            accessibilityRole="button"
          >
            <Text style={[styles.navButtonIcon, dynamicStyles.text]}>🏠</Text>
            <Text style={[styles.navButtonText, dynamicStyles.text]}>
              {safeGetString('buttons.saveLocation', 'Konum Kaydet')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setShowSettings(true)}
            accessibilityLabel="Ayarlar"
            accessibilityRole="button"
          >
            <Text style={[styles.navButtonIcon, dynamicStyles.text]}>⚙️</Text>
            <Text style={[styles.navButtonText, dynamicStyles.text]}>
              {safeGetString('settings.title', 'Ayarlar')}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Ayarlar modalı */}
        <SettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentLanguage={currentLanguage}
          languages={languages}
          setLanguage={setLanguage}
          languageMenuVisible={languageMenuVisible}
          setLanguageMenuVisible={setLanguageMenuVisible}
          simulateLocationChange={simulateLocationChange}
          safeGetString={safeGetString}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;