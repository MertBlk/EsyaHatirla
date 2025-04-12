import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { getCategories, categoryIcons } from '../../src/data/items';
import { styles } from '../../src/styles/HomeScreen.styles';

const CategoryButton = memo(({ category, isSelected, onPress, isDarkMode, categoryIcon }) => (
  <TouchableOpacity
    style={[
      styles.categoryButton,
      { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', 
        borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
      isSelected && { backgroundColor: '#007AFF', borderColor: '#007AFF' }
    ]}
    onPress={onPress}
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

const CategorySelector = memo(({ currentLanguage, selectedCategory, setSelectedCategory, safeGetString, isDarkMode }) => {
  // Her dil değişikliğinde güncel kategorileri al
  const categories = useMemo(() => getCategories(currentLanguage), [currentLanguage]);
  
  // Tümü kategori adını güvenli bir şekilde al
  const allCategoryName = safeGetString('categories.all', 'Tümü');
  
  // Yardımcı fonksiyon - kategori adına göre doğru ikonu al
  const getCategoryIcon = (categoryName) => {
    // Önce doğrudan eşleşmeyi dene
    if (categoryIcons[categoryName]) {
      return categoryIcons[categoryName];
    }
    
    // 'Tümü' veya 'All' gibi özel durumlar için kontrol
    if (categoryName === 'Tümü' || categoryName === 'All' || 
        categoryName === safeGetString('categories.all', 'Tümü')) {
      return '🗂️';
    }
    
    // Dile özgü eşleşmeleri kontrol et
    const languageSpecificIcons = {
      tr: { 'Günlük': '🔑', 'İş/Okul': '📚', 'Spor': '🏀', 'Seyahat': '✈️', 'Sağlık': '💊', 'Elektronik': '📱' },
      en: { 'Daily': '🔑', 'Work/School': '📚', 'Sports': '🏀', 'Travel': '✈️', 'Health': '💊', 'Electronics': '📱' }
    };
    
    // Dile özgü ikonları kontrol et
    if (languageSpecificIcons[currentLanguage] && languageSpecificIcons[currentLanguage][categoryName]) {
      return languageSpecificIcons[currentLanguage][categoryName];
    }
    
    // Uygun ikon bulunamazsa varsayılan olarak klasör ikonu kullan
    return '📁';
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryWrapper}
      contentContainerStyle={styles.categoryScrollContent}
    >
      {/* Her zaman "Tümü" kategori butonunu göster */}
      <CategoryButton
        category={allCategoryName}
        isSelected={selectedCategory === allCategoryName}
        onPress={() => setSelectedCategory(allCategoryName)}
        isDarkMode={isDarkMode}
        categoryIcon={getCategoryIcon(allCategoryName)}
      />

      {/* Dile özgü kategorileri göster */}
      {categories.map(category => (
        <CategoryButton
          key={category}
          category={category}
          isSelected={selectedCategory === category}
          onPress={() => setSelectedCategory(category)}
          isDarkMode={isDarkMode}
          categoryIcon={getCategoryIcon(category)}
        />
      ))}
    </ScrollView>
  );
});

export default CategorySelector;