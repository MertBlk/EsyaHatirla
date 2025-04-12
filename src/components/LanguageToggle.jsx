import React, { memo, useState } from 'react';
import { TouchableOpacity, Text, Modal, View, FlatList } from 'react-native';
import { styles } from '../../src/styles/HomeScreen.styles';

const LanguageToggle = memo(({ 
  languages, 
  currentLanguage, 
  setLanguage, 
  strings,
  isDarkMode 
}) => {
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  
  return (
    <>
      <TouchableOpacity
        style={[styles.themeToggleButton]}
        onPress={() => setIsLanguageModalOpen(true)}
      >
        <Text style={styles.buttonModeText}>
          {languages.find(l => l.code === currentLanguage)?.flag || '🌐'}
        </Text>
      </TouchableOpacity>
      
      {/* Dil seçimi için modal */}
      <Modal
        visible={isLanguageModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsLanguageModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsLanguageModalOpen(false)}
        >
          <View 
            style={[styles.languageModalContainer, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            <Text style={[styles.modalSubTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              Dil Seçimi / Language
            </Text>
            
            <FlatList
              data={languages}
              initialNumToRender={8}
              keyExtractor={(item) => item.code}
              getItemLayout={(data, index) => (
                {length: 50, offset: 50 * index, index}
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.languageListItem,
                    currentLanguage === item.code && styles.selectedLanguageItem
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setIsLanguageModalOpen(false);
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
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsLanguageModalOpen(false)}
            >
              <Text style={styles.buttonText}>
                {strings[currentLanguage].buttons.close}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
});

export default LanguageToggle;