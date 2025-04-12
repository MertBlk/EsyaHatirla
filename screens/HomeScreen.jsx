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

const HomeScreen = () => {
  // Dil kancasını kullan
  const { 
    currentLanguage, 
    setLanguage, 
    toggleLanguage, 
    safeGetString, 
    languages 
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
    homeLocation,
    setHomeLocation,
    savedLocations,
    setSavedLocations,
    isTracking,
    isChangingLocation,
    setIsChangingLocation,
    saveLocation,
    simulateLocationChange,
    updateLocationItems
  } = locationTracking;

  // Tema değişkenleri
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
  
  // Diller arası eşya çevirisi yapan yardımcı fonksiyon
  const translateItemsBetweenLanguages = useCallback((sourceItems, fromLang, toLang) => {
    if (!sourceItems || sourceItems.length === 0) return [];
    if (fromLang === toLang) return sourceItems;
    
    try {
      // Sonuç dizisi
      const translatedItems = [];
      
      // Her bir seçili eşya için
      sourceItems.forEach(item => {
        // Emoji karakterini bul (eşleştirme için kullanılacak)
        const emojiMatch = item.match(/^([\u{1F300}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]+)/u);
        if (!emojiMatch) {
          // Emoji bulunamadıysa, bu eşyayı atla
          console.warn(`Emoji bulunamadı: ${item}`);
          return;
        }
        
        // Seçili eşyanın emojisini al
        const itemEmoji = emojiMatch[0].trim();
        
        // Bütün kategorilerde bu emojiye sahip eşyayı ara
        const sourceLangCategories = items[fromLang] || items['en'];
        const targetLangCategories = items[toLang] || items['en'];
        
        // Kaynak dilde bu emojiye sahip tüm eşyaları bul
        let foundInCategory = null;
        let foundItem = null;
        
        // Kaynak dilde bu emojiye sahip eşyayı ve kategorisini bul
        Object.entries(sourceLangCategories).forEach(([category, categoryItems]) => {
          const matchingItem = categoryItems.find(i => i.startsWith(itemEmoji));
          if (matchingItem && matchingItem === item) {
            foundInCategory = category;
            foundItem = matchingItem;
          }
        });
        
        // Eğer kategori bulunamadıysa çevirme işlemi yapamıyoruz
        if (!foundInCategory) {
          console.warn(`Kategori bulunamadı: ${item}`);
          return;
        }
        
        // Hedef dildeki eşdeğer kategoriyi bul
        // NOT: Kategoriler arasında birebir eşleşme olup olmadığını kontrol et
        const targetCategory = Object.keys(targetLangCategories).find(category => {
          // Kategori eşleşme kontrolü yap (basit)
          // Hedef dildeki kategorileri kontrol et
          return targetLangCategories[category].some(i => i.startsWith(itemEmoji));
        });
        
        if (!targetCategory) {
          console.warn(`Hedef kategori bulunamadı: ${itemEmoji} - ${item}`);
          return;
        }
        
        // Hedef dildeki aynı emojiye sahip eşyayı bul
        const translatedItem = targetLangCategories[targetCategory].find(i => 
          i.startsWith(itemEmoji)
        );
        
        if (translatedItem) {
          translatedItems.push(translatedItem);
        } else {
          console.warn(`Çeviri bulunamadı: ${item}`);
        }
      });
      
      return translatedItems;
    } catch (error) {
      console.error("Eşya çevirisi hatası:", error);
      return sourceItems; // Hata durumunda orijinal diziyi döndür
    }
  }, []);

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
  }, []); 

  // Ayarlar modalı için render
  const renderSettings = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSettings(false)}
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
            onPress={() => setShowSettings(false)}
          >
            <Text style={styles.buttonText}>
              {safeGetString('buttons.close', 'Kapat')}
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
                    onPress={() => {
                      setLanguage(item.code);
                      setLanguageMenuVisible(false);
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
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </Modal>
  );

  // Dinamik stilleri oluştur
  const dynamicStyles = useMemo(() => createDynamicStyles(isDarkMode), [isDarkMode]);

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
            <TouchableOpacity
              style={[
                styles.itemContainer,
                dynamicStyles.itemContainer,
                selectedItems.includes(item) && dynamicStyles.selectedItem,
              ]}
              onPress={() => {
                setSelectedItems(prev => {
                  const newItems = prev.includes(item) 
                    ? prev.filter(i => i !== item) 
                    : [...prev, item];
                  
                  // Ev konumu varsa, eşyaları sessizce güncelle
                  if (homeLocation) {
                    // Konum güncelleme işleminde olduğumuzu belirt
                    setIsChangingLocation(true);
                    
                    setTimeout(() => {
                      // Eşyaları güncelle (sessizce)
                      updateLocationItems(homeLocation.id, true);
                      
                      // Bildirim artık gösterilmiyor
                      
                      // Güncelleme işlemi tamamlandı
                      setIsChangingLocation(false);
                    }, 100);
                  }
                  
                  return newItems;
                })
              }}
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
        
        {/* Ayarlar modalı */}
        {renderSettings()}

        {/* Bildirim kaldırıldı */}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;