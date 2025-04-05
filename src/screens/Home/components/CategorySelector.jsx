import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { categoryIcons } from '../../../constants/categories';

export const CategorySelector = ({ 
  selectedCategory, 
  setSelectedCategory, 
  styles, 
  dynamicStyles 
}) => {
  const allCategories = ['Tümü', ...Object.keys(categoryIcons).filter(cat => cat !== 'Tümü')];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryWrapper}
      contentContainerStyle={styles.categoryScrollContent}
    >
      {allCategories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            dynamicStyles.categoryButton,
            selectedCategory === category && {
              backgroundColor: '#007AFF',
              borderColor: '#007AFF',
              // transform efekti kaldırıldı
            }
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text 
            style={[
              styles.categoryButtonText,
              selectedCategory === category 
                ? { color: '#FFFFFF', fontWeight: '600' }
                : dynamicStyles.text
            ]}
          >
            {categoryIcons[category] || '📋'} {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};