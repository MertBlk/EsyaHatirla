import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const theme = {
    dark: {
      background: '#1C1C1E',
      surface: '#2C2C2E',
      text: '#FFFFFF',
      textSecondary: '#EBEBF5',
      border: '#3A3A3C'
    },
    light: {
      background: '#F2F2F7',
      surface: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E5E5EA'
    },
    toggleTheme: () => setIsDark(!isDark),
    isDark
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);