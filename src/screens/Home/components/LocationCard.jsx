import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LocationCard = ({ 
  homeLocation, 
  setHomeLocation, 
  savedLocations = [], 
  styles, 
  dynamicStyles 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleLocationSelect = (location) => {
    if (location?.id) {
      setHomeLocation(location);
      setIsVisible(false);
    }
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.locationItem,
        dynamicStyles.locationItem,
        homeLocation?.id === item.id && styles.selectedLocationItem
      ]}
      onPress={() => handleLocationSelect(item)}
    >
      <Text style={[styles.locationItemText, dynamicStyles.text]}>
        {typeof item?.name === 'string' ? item.name : 'İsimsiz Konum'}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={[styles.locationName, dynamicStyles.textSecondary]}>
            {homeLocation?.name || 'Henüz konum seçilmedi'}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <SafeAreaView style={[styles.modalSafeArea, dynamicStyles.modalBackground]}>
          <View style={[styles.locationModalContainer, dynamicStyles.modalContent]}>
            <Text style={[styles.locationModalTitle, dynamicStyles.text]}>
              📍 Kayıtlı Konumlar
            </Text>
            
            <FlatList
              data={savedLocations}
              keyExtractor={item => item?.id?.toString() || Math.random().toString()}
              renderItem={renderLocationItem}
              ListEmptyComponent={
                <Text style={[styles.emptyText, dynamicStyles.textSecondary]}>
                  Henüz kayıtlı konum bulunmuyor
                </Text>
              }
            />

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.buttonText}>
                Kapat
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};