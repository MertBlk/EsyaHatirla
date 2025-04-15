import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../src/styles/HomeScreen.styles';
import { useTheme } from '../../context/ThemeContext';

const StatsCard = memo(({ selectedItems, getFilteredItems, safeGetString }) => {
  const { isDark: isDarkMode } = useTheme();

  // Performans için filtrelenmiş öğelerin sayısını önbelleğe al
  const filteredItemsCount = useMemo(() => {
    return getFilteredItems().length;
  }, [getFilteredItems]);
  
  return (
    <View 
      style={[styles.statsCard, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
      accessibilityLabel="İstatistik bilgileri"
      accessibilityRole="summary"
    >
      <View 
        style={styles.statItem}
        accessibilityLabel={`${selectedItems.length} ${safeGetString('stats.selected', 'Seçili')} eşya`}
      >
        <Text 
          style={[styles.statNumber, { color: '#007AFF' }]}
          accessibilityRole="text"
        >
          {selectedItems.length}
        </Text>
        <Text 
          style={[styles.statLabel, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}
          accessibilityRole="text"
        >
          {safeGetString('stats.selected', 'Seçili')}
        </Text>
      </View>
      
      <View 
        style={styles.statDivider} 
        importantForAccessibility="no"
      />
      
      <View 
        style={styles.statItem}
        accessibilityLabel={`${filteredItemsCount} ${safeGetString('stats.total', 'Toplam')} eşya`}
      >
        <Text 
          style={[styles.statNumber, { color: isDarkMode ? '#64D2FF' : '#0A84FF' }]}
          accessibilityRole="text"
        >
          {filteredItemsCount}
        </Text>
        <Text 
          style={[styles.statLabel, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}
          accessibilityRole="text"
        >
          {safeGetString('stats.total', 'Toplam')}
        </Text>
      </View>
    </View>
  );
});

export default StatsCard;