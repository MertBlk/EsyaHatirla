import React from 'react';
import { View, Text } from 'react-native';
import { categorizedItems } from '../../../constants/categories';

export const StatsCard = ({ 
  selectedItems, 
  selectedCategory,
  styles, 
  dynamicStyles 
}) => {
  const totalItems = selectedCategory === 'Tümü' 
    ? Object.values(categorizedItems).flat().length 
    : categorizedItems[selectedCategory]?.length || 0;

  const selectedCount = selectedItems.length;

  return (
    <View style={[styles.statsCard, dynamicStyles.statsCard]}>
      <View style={[styles.statItem, dynamicStyles.statItem]}>
        <Text style={[styles.statNumber, dynamicStyles.statNumber]}>
          {selectedCount}
        </Text>
        <Text style={[styles.statLabel, dynamicStyles.statLabel]}>
          Seçili
        </Text>
      </View>

      <View style={dynamicStyles.statDivider} />

      <View style={[styles.statItem, dynamicStyles.statItem]}>
        <Text style={[styles.statNumber, dynamicStyles.statNumber]}>
          {totalItems}
        </Text>
        <Text style={[styles.statLabel, dynamicStyles.statLabel]}>
          Toplam
        </Text>
      </View>
    </View>
  );
};