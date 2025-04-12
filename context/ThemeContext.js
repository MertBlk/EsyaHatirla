import React, { createContext, useContext, useState, useMemo } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  // useMemo ile theme objesinin gereksiz yere yeniden oluşturulmasını engelliyoruz
  const theme = useMemo(() => ({
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
  }), [isDark]); // Sadece isDark değiştiğinde yeniden hesapla

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);