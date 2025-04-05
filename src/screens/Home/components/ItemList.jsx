import React from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { categorizedItems } from '../../../constants/categories';

export const ItemList = ({ 
  selectedCategory,
  selectedItems, 
  setSelectedItems, 
  styles, 
  dynamicStyles 
}) => {
  const getFilteredItems = () => {
    if (selectedCategory === 'Tümü') {
      return Object.values(categorizedItems).flat();
    }
    return categorizedItems[selectedCategory] || [];
  };

  return (
    <FlatList
      data={getFilteredItems()}
      keyExtractor={(item, index) => `item-${item}-${index}`}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.itemContainer,
            dynamicStyles.itemContainer,
            selectedItems.includes(item) && styles.selectedItem,
          ]}
          onPress={() =>
            setSelectedItems(prev =>
              prev.includes(item) 
                ? prev.filter(i => i !== item) 
                : [...prev, item]
            )
          }
        >
          <Text style={[
            styles.itemText,
            dynamicStyles.text,
            selectedItems.includes(item) && dynamicStyles.selectedItemText
          ]}>
            {item}
          </Text>
          {selectedItems.includes(item) && (
            <Text style={styles.checkIcon}>✔️</Text>
          )}
        </TouchableOpacity>
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};