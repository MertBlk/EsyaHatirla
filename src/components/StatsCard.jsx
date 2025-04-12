import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../src/styles/HomeScreen.styles';

const StatsCard = memo(({ selectedItems, getFilteredItems, safeGetString, isDarkMode }) => (
  <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}>
    <View style={styles.statItem}>
      <Text style={[styles.statNumber, { color: '#007AFF' }]}>
        {selectedItems.length}
      </Text>
      <Text style={[styles.statLabel, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}>
        {safeGetString('stats.selected', 'Seçili')}
      </Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={[styles.statNumber, { color: isDarkMode ? '#64D2FF' : '#0A84FF' }]}>
        {getFilteredItems().length}
      </Text>
      <Text style={[styles.statLabel, { color: isDarkMode ? '#EBEBF5' : '#666666' }]}>
        {safeGetString('stats.total', 'Toplam')}
      </Text>
    </View>
  </View>
));

export default StatsCard;