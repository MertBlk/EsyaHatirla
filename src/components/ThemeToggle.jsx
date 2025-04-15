import React, { memo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../../src/styles/HomeScreen.styles';
import { useTheme } from '../../context/ThemeContext';
const ThemeToggle = memo(() => {
  const { isDark: isDarkMode, toggleTheme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[styles.themeToggleButton]} 
      onPress={toggleTheme}
      accessibilityLabel={isDarkMode ? "Açık temaya geç" : "Koyu temaya geç"}
      accessibilityRole="button"
    >
      <Text style={styles.buttonModeText}>
        {isDarkMode ? '☀️' : '🌙'}
      </Text>
    </TouchableOpacity>
  );
});
export default ThemeToggle;