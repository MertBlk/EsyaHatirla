import React, { memo, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { styles } from '../../src/styles/HomeScreen.styles';
import { useTheme } from '../../context/ThemeContext';

/**
 * Mevcut konum kartı bileşeni - konum seçimi ve konum listesi görünümünü sağlar
 */
const CurrentLocationCard = memo(({ 
  homeLocation, 
  strings, 
  currentLanguage, 
  savedLocations, 
  setSavedLocations,
  setIsChangingLocation,
  setSelectedItems,
  setHomeLocation
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isDark: isDarkMode } = useTheme();
  
  // Yerelleştirilmiş metinleri güvenli şekilde alma
  const safeGetString = useCallback((path, fallback) => {
    try {
      const parts = path.split('.');
      let result = strings[currentLanguage];
      
      for (const part of parts) {
        if (result === undefined || result === null) return fallback;
        result = result[part];
      }
      
      return result || fallback;
    } catch (error) {
      return fallback;
    }
  }, [strings, currentLanguage]);
  
  // Yerelleştirilmiş metinleri memoize et
  const localizedText = useMemo(() => ({
    locationTitle: safeGetString('location.title', 'Konum'),
    noLocation: safeGetString('location.noLocation', 'Konum seçilmedi'),
    savedLocations: safeGetString('location.savedLocations', 'Kaydedilmiş Konumlar'),
    itemCount: safeGetString('location.itemCount', 'eşya'),
    noSavedLocations: safeGetString('location.noSavedLocations', 'Henüz kaydedilmiş konum yok'),
    close: safeGetString('buttons.close', 'Kapat')
  }), [safeGetString]);

  // Güvenli bir şekilde konum değiştir
  const safelyChangeLocation = useCallback(async (location) => {
    try {
      setIsLoading(true);
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
    } catch (error) {
      // Hata durumunda sessizce devam et
    } finally {
      // İşlem tamamlandığında bayrağı kapat
      setIsChangingLocation(false); 
      setIsLoading(false);
    }
  }, [setIsChangingLocation, setSelectedItems, setHomeLocation]);
  
  // Konum listesi öğesi render edici - performans için ayırılmış
  const renderLocationItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.locationListItem,
        homeLocation?.id === item.id && styles.selectedLocationItem,
        { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }
      ]}
      onPress={() => safelyChangeLocation(item)}
      disabled={isLoading}
      accessibilityLabel={`${item.name} konumu`}
      accessibilityRole="button"
      accessibilityState={{ selected: homeLocation?.id === item.id }}
      accessibilityHint="Bu konumu seçmek için dokunun"
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
            {item.items.length} {localizedText.itemCount}
          </Text>
        )}
      </View>
      {homeLocation?.id === item.id && (
        <Text style={[styles.checkmarkText, { color: isDarkMode ? '#007AFF' : '#007AFF' }]}>✓</Text>
      )}
    </TouchableOpacity>
  ), [homeLocation, isDarkMode, localizedText, safelyChangeLocation, isLoading]);

  // Konum listesi için boş bileşen
  const EmptyListComponent = useMemo(() => (
    <View style={styles.emptyListContainer}>
      <Text style={[styles.emptyListText, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}>
        {localizedText.noSavedLocations}
      </Text>
    </View>
  ), [isDarkMode, localizedText]);

  // FlatList için keyExtractor
  const keyExtractor = useCallback((item) => item.id, []);
  
  // Öğe boyutları sabit olduğu için getItemLayout tanımla - daha iyi performans
  const getItemLayout = useCallback((data, index) => (
    {length: 70, offset: 70 * index, index}
  ), []);

  return (
    <>
      <TouchableOpacity 
        style={[styles.statsCard, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
        onPress={() => setIsVisible(true)}
        accessibilityLabel={localizedText.locationTitle}
        accessibilityRole="button"
        accessibilityHint="Konum seçim modalını açmak için dokunun"
      >
        <View style={styles.currentLocationContainer}>
          <Text style={[styles.locationTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {localizedText.locationTitle}
          </Text>
          <Text style={[styles.locationName, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}>
            {homeLocation?.name || localizedText.noLocation}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View 
          style={[styles.modalSafeArea, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}
          accessibilityViewIsModal={true}
        >
          <View style={[styles.locationModalContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}>
            <Text 
              style={[styles.locationModalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
              accessibilityRole="header"
            >
              {localizedText.savedLocations}
            </Text>
            
            {isLoading && (
              <ActivityIndicator 
                size="large" 
                color="#007AFF" 
                style={{ marginVertical: 20 }} 
              />
            )}
            
            <FlatList
              data={savedLocations}
              keyExtractor={keyExtractor}
              renderItem={renderLocationItem}
              ListEmptyComponent={EmptyListComponent}
              removeClippedSubviews={true}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              getItemLayout={getItemLayout}
              contentContainerStyle={{ 
                flexGrow: 1, 
                paddingBottom: 20
              }}
            />

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
              accessibilityLabel={localizedText.close}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>
                {localizedText.close}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
});

export default CurrentLocationCard;