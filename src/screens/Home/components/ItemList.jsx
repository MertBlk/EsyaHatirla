import React from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { categorizedItems } from '../../../constants/categories';

export const ItemList = ({ 
  items, 
  selectedItems, 
  setSelectedItems, 
  styles, 
  dynamicStyles 
}) => {
  const toggleItem = (item) => {
    setSelectedItems(prev =>
      prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item]
    );
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item, index) => `item-${item}-${index}`}
      renderItem={({ item }) => {
        const isSelected = selectedItems.includes(item);
        return (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              dynamicStyles.itemContainer,
              isSelected && dynamicStyles.selectedItem // styles.selectedItem yerine dynamicStyles.selectedItem kullan
            ]}
            onPress={() => toggleItem(item)}
          >
            <Text style={[
              styles.itemText,
              !isSelected && dynamicStyles.text, // Seçili değilse tema rengini kullan
              isSelected && dynamicStyles.selectedItemText // Seçiliyse dinamik seçili rengi kullan
            ]}>
              {item}
            </Text>
            {isSelected && (
              <Text style={styles.checkIcon}>✔️</Text>
            )}
          </TouchableOpacity>
        );
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};