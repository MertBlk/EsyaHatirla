import React, { createContext, useContext } from 'react';

// Tema Bağlam API'si
const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
  setIsDarkMode: () => {},
  colors: {}
});

export const ThemeProvider = ({ value, children }) => {
  return (
    <ThemeContext.Provider value={value || {
      isDark: true,
      toggleTheme: () => {},
      setIsDarkMode: () => {},
      colors: {}
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Tema kancası - bileşenlerde tema değişkenlerine kolayca erişim sağlar
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};