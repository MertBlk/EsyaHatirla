import React, { createContext, useContext, useCallback } from 'react';

// Varsayılan tema değerleri
const defaultThemeContext = {
  isDark: false,
  toggleTheme: () => {},
  setIsDarkMode: () => {},
  colors: {}
};

// Tema context'ini oluştur
const ThemeContext = createContext(defaultThemeContext);

// ThemeProvider bileşeni
export const ThemeProvider = ({ value = defaultThemeContext, children }) => {
  // Tema değerlerini doğrula
  const safeValue = {
    isDark: value?.isDark ?? defaultThemeContext.isDark,
    toggleTheme: value?.toggleTheme ?? defaultThemeContext.toggleTheme,
    setIsDarkMode: value?.setIsDarkMode ?? defaultThemeContext.setIsDarkMode,
    colors: value?.colors ?? defaultThemeContext.colors
  };

  return (
    <ThemeContext.Provider value={safeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme hook'u
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme hook\'u bir ThemeProvider içinde kullanılmalıdır');
  }
  
  return {
    ...context,
    // Tema değişikliği için memoized callback
    toggleTheme: useCallback(context.toggleTheme, [context.toggleTheme]),
    setIsDarkMode: useCallback(context.setIsDarkMode, [context.setIsDarkMode])
  };
};