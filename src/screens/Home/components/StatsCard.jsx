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
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, dynamicStyles.text]}>
          {selectedCount}
        </Text>
        <Text style={[styles.statLabel, dynamicStyles.textSecondary]}>
          Seçili
        </Text>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Text style={[styles.statNumber, dynamicStyles.text]}>
          {totalItems}
        </Text>
        <Text style={[styles.statLabel, dynamicStyles.textSecondary]}>
          Toplam
        </Text>
      </View>
    </View>
  );
};