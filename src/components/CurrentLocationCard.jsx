import React, { memo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { styles } from '../../src/styles/HomeScreen.styles';

const CurrentLocationCard = memo(({ 
  homeLocation, 
  strings, 
  currentLanguage, 
  isDarkMode,
  savedLocations, 
  setSavedLocations,
  setIsChangingLocation,
  setSelectedItems,
  setHomeLocation
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Güvenli bir şekilde konum değiştir
  const safelyChangeLocation = useCallback((location) => {
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
    
    // Kısa bir gecikmeyle bayrağı kapat
    setTimeout(() => {
      setIsChangingLocation(false);
    }, 1000);
  }, [setIsChangingLocation, setSelectedItems, setHomeLocation]);

  return (
    <>
      <TouchableOpacity 
        style={[styles.statsCard, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
        onPress={() => setIsVisible(true)}
      >
        <View style={styles.currentLocationContainer}>
          <Text style={[styles.locationTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            {strings[currentLanguage]?.location?.title || "Konum"}
          </Text>
          <Text style={[styles.locationName, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}>
            {homeLocation?.name || strings[currentLanguage]?.location?.noLocation || "Konum seçilmedi"}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.modalSafeArea, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.locationModalContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}>
            <Text style={styles.locationModalTitle}>
              {strings[currentLanguage]?.location?.savedLocations || "Kaydedilmiş Konumlar"}
            </Text>
            
            {savedLocations.length > 0 ? (
              <FlatList
                data={savedLocations}
                keyExtractor={(item) => item.id}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                getItemLayout={(data, index) => (
                  {length: 70, offset: 70 * index, index}
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.locationListItem,
                      homeLocation?.id === item.id && styles.selectedLocationItem
                    ]}
                    onPress={() => safelyChangeLocation(item)}
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
                          {item.items.length} {strings[currentLanguage]?.location?.itemCount || "eşya"}
                        </Text>
                      )}
                    </View>
                    {homeLocation?.id === item.id && (
                      <Text style={styles.checkmarkText}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyListContainer}>
                <Text style={[styles.emptyListText, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}>
                  {strings[currentLanguage]?.location?.noSavedLocations || "Henüz kaydedilmiş konum yok"}
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.buttonText}>
                {strings[currentLanguage]?.buttons?.close || "Kapat"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
});

export default CurrentLocationCard;