import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from '../localization/strings';

export const languages = [
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' }, // Arapça
  { code: 'nl', flag: '🇳🇱', name: 'Nederlands' }, // Hollandaca
  { code: 'sv', flag: '🇸🇪', name: 'Svenska' }, // İsveççe
  { code: 'pl', flag: '🇵🇱', name: 'Polski' } // Lehçe
];

export default function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState('tr');

  // Uygulama başladığında kaydedilmiş dil tercihini yükle
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Dil yükleme hatası:', error);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang) => {
    try {
      setCurrentLanguage(lang);
      await AsyncStorage.setItem('user-language', lang);
      console.log('Dil değiştirildi:', lang);
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
    }
  }, []);

  const toggleLanguage = useCallback(async () => {
    try {
      // Mevcut dil kodunu bul
      const currentCode = currentLanguage;
      
      // Mevcut dilin index'ini bul
      const currentIndex = languages.findIndex(lang => lang.code === currentCode);
      
      // Bir sonraki dile geç (döngüsel olarak)
      const nextIndex = (currentIndex + 1) % languages.length;
      const newLang = languages[nextIndex].code;
      
      // Dili değiştir
      await setLanguage(newLang);
      return newLang;
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
      return currentLanguage;
    }
  }, [currentLanguage, setLanguage]);

  // String getirme için güvenli bir yol sağla
  const safeGetString = useCallback((path, fallback = '') => {
    try {
      const parts = path.split('.');
      let result = strings[currentLanguage];
      
      for (const part of parts) {
        if (result === undefined || result === null) return fallback;
        result = result[part];
      }
      
      return result || fallback;
    } catch (e) {
      return fallback;
    }
  }, [currentLanguage]);

  return {
    currentLanguage,
    setLanguage,
    toggleLanguage,
    safeGetString,
    languages
  };
}