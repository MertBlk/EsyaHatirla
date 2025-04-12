import React, { memo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../../src/styles/HomeScreen.styles';

const ThemeToggle = memo(({ isDarkMode, setIsDarkMode }) => (
  <TouchableOpacity
    style={[styles.themeToggleButton]} 
    onPress={() => setIsDarkMode(!isDarkMode)}
  >
    <Text style={styles.buttonModeText}>
      {isDarkMode ? '☀️' : '🌙'}
    </Text>
  </TouchableOpacity>
));

export default ThemeToggle;