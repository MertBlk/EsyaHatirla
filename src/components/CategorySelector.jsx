import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { getCategories, categoryIcons } from '../../src/data/items';
import { styles } from '../../src/styles/HomeScreen.styles';
import { useTheme } from '../../context/ThemeContext';

const CategoryButton = memo(({ 
  category, 
  isSelected, 
  onPress, 
  categoryIcon 
}) => {
  const { isDark: isDarkMode } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', 
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
      <Text style={styles.categoryIcon}>{categoryIcon || '📁'}</Text>
      <Text style={[
        styles.categoryText, 
        { color: isDarkMode ? '#EBEBF5' : '#666666' },
        isSelected && { color: '#FFFFFF' }
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );
});

// Kategorileri sözlükte ara, yoksa varsayılan değeri döndür
const mapCategoryIcons = {
  'Günlük': '🔑', 
  'İş/Okul': '📚', 
  'Spor': '🏀', 
  'Seyahat': '✈️', 
  'Sağlık': '💊', 
  'Elektronik': '📱', 
  // İngilizce
  'Daily': '🔑', 
  'Work/School': '📚', 
  'Sports': '🏀', 
  'Travel': '✈️', 
  'Health': '💊', 
  'Electronics': '📱' 
};

const CategorySelector = memo(({ 
  currentLanguage, 
  selectedCategory, 
  setSelectedCategory, 
  safeGetString
}) => {
  // ThemeContext'ten tema durumunu al
  const { isDark: isDarkMode } = useTheme();
  
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
    // Sonra mapCategoryIcons'ta ara
    if (mapCategoryIcons[categoryName]) {
      return mapCategoryIcons[categoryName];
    }
    // Varsayılan ikonu döndür
    return '📁';
  }, []);

  return (
    <View style={styles.categoriesContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollView}
      >
        {/* "Tümü" kategorisi butonu */}
        <CategoryButton
          category={allCategoryName}
          isSelected={selectedCategory === allCategoryName || 
                    selectedCategory === 'Tümü' || 
                    selectedCategory === 'All'}
          onPress={() => setSelectedCategory(allCategoryName)}
          isDarkMode={isDarkMode}
          categoryIcon="🗂️"
        />
        
        {/* Dinamik kategoriler */}
        {categories.map((category) => (
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
    </View>
  );
});

export default CategorySelector;