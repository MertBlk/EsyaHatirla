import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { categoryIcons } from '../../../constants/categories';

export const CategorySelector = ({ 
  selectedCategory, 
  setSelectedCategory, 
  styles, 
  dynamicStyles 
}) => {
  // Tüm kategorileri birleştir
  const allCategories = ['Tümü', ...Object.keys(categoryIcons).filter(cat => cat !== 'Tümü')];

  return (
    <View style={styles.categoryWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.categoryScrollContent}
      >
        {allCategories.map(category => (
          <TouchableOpacity
            key={`category-${category}`} // Unique key eklendi
            style={[
              styles.categoryButton,
              dynamicStyles.categoryButton,
              selectedCategory === category && dynamicStyles.selectedCategory
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              dynamicStyles.categoryText,
              selectedCategory === category && styles.selectedCategoryText
            ]}>
              {categoryIcons[category] || '📋'} {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};