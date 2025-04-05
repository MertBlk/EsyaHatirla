import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export const ThemeToggle = ({ 
  isDarkMode, 
  setIsDarkMode, 
  styles 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.themeToggleButton,
        { backgroundColor: isDarkMode ? '#34C759' : '#007AFF' }
      ]}
      onPress={() => setIsDarkMode(!isDarkMode)}
    >
      <Text style={styles.buttonModeText}>
        {isDarkMode ? '☀️' : '🌙'}
      </Text>
    </TouchableOpacity>
  );
};