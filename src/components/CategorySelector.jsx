import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { getCategories, categoryIcons } from '../../src/data/items';
import { styles } from '../../src/styles/HomeScreen.styles';

const CategoryButton = memo(({ 
  category, 
  isSelected, 
  onPress, 
  isDarkMode, 
  categoryIcon 
}) => (
  <TouchableOpacity
    style={[
      styles.categoryButton,
      { backgroundColor: isDarkMode ? '#2C2E' : '#FFFFFF', 
        borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
      isSelected && { backgroundColor: '#007AFF', borderColor: '#007AFF' }
    ]}
    onPress={onPress}
    accessibilityLabel={category}
    accessibilityRole="button"
    accessibilityState={{ selected: isSelected }}
    accessibilityHint={isSelected ? 
      `${category} kategorisi seçili, başka bir kategori seçmek için dokunun` : 
      `${category} kategorisini seçmek için dokunun`}
  >
    <Text style={[
      styles.categoryButtonText,
      { color: isDarkMode ? '#FFFFFF' : '#000000' },
      isSelected && { color: '#FFFFFF' }
    ]}>
      {categoryIcon} {category}
    </Text>
  </TouchableOpacity>
));

// Kategori ikonları için eşleme tablosu
const CATEGORY_ICONS_MAP = {
  tr: { 
    'Tümü': '🗂️',
    'Günlük': '🔑', 
    'İş/Okul': '📚', 
    'Spor': '🏀', 
    'Seyahat': '✈️', 
    'Sağlık': '💊', 
    'Elektronik': '📱' 
  },
  en: { 
    'All': '🗂️',
    'Daily': '🔑', 
    'Work/School': '📚', 
    'Sports': '🏀', 
    'Travel': '✈️', 
    'Health': '💊', 
    'Electronics': '📱' 
  },
  default: '📁'
};

const CategorySelector = memo(({ 
  currentLanguage, 
  selectedCategory, 
  setSelectedCategory, 
  safeGetString, 
  isDarkMode 
}) => {
  // Her dil değişikliğinde güncel kategorileri al
  const categories = useMemo(() => 
    getCategories(currentLanguage), 
    [currentLanguage]
  );
  
  // Tümü kategori adını güvenli bir şekilde al
  const allCategoryName = useMemo(() => 
    safeGetString('categories.all', 'Tümü'), 
    [safeGetString]
  );
  
  // Yardımcı fonksiyon - kategori adına göre doğru ikonu al
  const getCategoryIcon = useCallback((categoryName) => {
    // Önce doğrudan eşleşmeyi dene
    if (categoryIcons[categoryName]) {
      return categoryIcons[categoryName];
    }
    
    // 'Tümü' veya 'All' gibi özel durumlar için kontrol
    if (categoryName === allCategoryName || 
        categoryName === 'Tümü' || 
        categoryName === 'All') {
      return '🗂️';
    }
    
    // Dil tabanlı kategori ikonu al
    if (CATEGORY_ICONS_MAP[currentLanguage] && 
        CATEGORY_ICONS_MAP[currentLanguage][categoryName]) {
      return CATEGORY_ICONS_MAP[currentLanguage][categoryName];
    }
    
    // Varsayılan ikon
    return CATEGORY_ICONS_MAP.default;
  }, [currentLanguage, allCategoryName]);
  
  // Kategori seçme işleyicisi
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
  }, [setSelectedCategory]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryWrapper}
      contentContainerStyle={styles.categoryScrollContent}
      accessibilityLabel="Kategori seçimi"
    >
      {/* Her zaman "Tümü" kategori butonunu göster */}
      <CategoryButton
        category={allCategoryName}
        isSelected={selectedCategory === allCategoryName}
        onPress={() => handleCategorySelect(allCategoryName)}
        isDarkMode={isDarkMode}
        categoryIcon={getCategoryIcon(allCategoryName)}
      />

      {/* Dile özgü kategorileri göster */}
      {categories.map(category => (
        <CategoryButton
          key={category}
          category={category}
          isSelected={selectedCategory === category}
          onPress={() => handleCategorySelect(category)}
          isDarkMode={isDarkMode}
          categoryIcon={getCategoryIcon(category)}
        />
      ))}
    </ScrollView>
  );
});

export default CategorySelector;