import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { getCategories, categoryIcons } from '../../src/data/items';
import { styles } from '../../src/styles/HomeScreen.styles';

const CategorySelector = memo(({ currentLanguage, selectedCategory, setSelectedCategory, safeGetString, isDarkMode }) => {
  // Her dil değişikliğinde güncel kategorileri al
  const categories = getCategories(currentLanguage);
  
  // Tümü kategori adını güvenli bir şekilde al
  const allCategoryName = safeGetString('categories.all', 'Tümü');
  
  // Yardımcı fonksiyon - kategori adına göre doğru ikonu al
  const getCategoryIcon = (categoryName) => {
    // Önce doğrudan eşleşmeyi dene
    if (categoryIcons[categoryName]) {
      return categoryIcons[categoryName];
    }
    
    // 'Tümü' veya 'All' gibi özel durumlar için kontrol
    if (categoryName === allCategoryName) {
      return categoryIcons['Tümü'] || categoryIcons['All'] || '🗂️';
    }
    
    // Kategorinin dile göre eşdeğerini bulmak için tüm kategorilerde ara
    const allCategories = Object.keys(categoryIcons);
    // Kategori türünü tahmin et (ilk kelimesine bakarak)
    const categoryFirstWord = categoryName.split(/[ /]/)[0].toLowerCase();
    
    // Benzer kategori bul
    for (const key of allCategories) {
      const keyFirstWord = key.split(/[ /]/)[0].toLowerCase();
      if (keyFirstWord === categoryFirstWord) {
        return categoryIcons[key];
      }
    }
    
    // Hiçbir eşleşme bulunamazsa varsayılan bir ikon döndür
    return '📋';
  };

  return (
    <View style={styles.categoryWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.categoryScrollContent}
      >
        {/* Her zaman "Tümü" kategori butonunu göster */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', 
              borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
            selectedCategory === allCategoryName && 
              { backgroundColor: '#007AFF', borderColor: '#007AFF' }
          ]}
          onPress={() => setSelectedCategory(allCategoryName)}
        >
          <Text style={[
            styles.categoryButtonText,
            { color: isDarkMode ? '#FFFFFF' : '#000000' },
            selectedCategory === allCategoryName && { color: '#FFFFFF' }
          ]}>
            {getCategoryIcon(allCategoryName)} {allCategoryName}
          </Text>
        </TouchableOpacity>

        {/* Dile özgü kategorileri göster */}
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', 
                borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
              selectedCategory === category && 
                { backgroundColor: '#007AFF', borderColor: '#007AFF' }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              { color: isDarkMode ? '#FFFFFF' : '#000000' },
              selectedCategory === category && { color: '#FFFFFF' }
            ]}>
              {getCategoryIcon(category)} {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

export default CategorySelector;