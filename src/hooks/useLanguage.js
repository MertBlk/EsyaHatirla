import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from '../localization/strings';

// Dil seçeneklerini dışarıya açıyoruz
export const languages = [
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
];

// Sabit storage anahtarını tanımlıyoruz
const LANGUAGE_STORAGE_KEY = '@language_preference';

export default function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState('tr'); // Varsayılan dil
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Uygulama başladığında kaydedilmiş dil tercihini yükle
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        
        // Eğer kaydedilmiş bir dil varsa ve desteklenen dil listesinde ise kullan
        if (savedLanguage && languages.some(lang => lang.code === savedLanguage)) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Dil yükleme hatası:', error);
        setError('Kaydedilmiş dil tercihi yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLanguage();
  }, []);

  // Dil değiştirme fonksiyonu
  const setLanguage = useCallback(async (lang) => {
    try {
      // Geçerli bir dil kodu olup olmadığını kontrol et
      if (!languages.some(language => language.code === lang)) {
        throw new Error(`Desteklenmeyen dil kodu: ${lang}`);
      }
      
      setCurrentLanguage(lang);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      console.log('Dil değiştirildi:', lang);
      
      return true;
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
      setError(`Dil değiştirilemedi: ${error.message}`);
      return false;
    }
  }, []);

  // Dili sırayla değiştirme fonksiyonu
  const toggleLanguage = useCallback(async () => {
    try {
      // Mevcut dil kodunu bul
      const currentCode = currentLanguage;
      
      // Mevcut dilin index'ini bul
      const currentIndex = languages.findIndex(lang => lang.code === currentCode);
      
      // Eğer mevcut dil bulunamadıysa varsayılan olarak ilk dili kullan
      if (currentIndex === -1) {
        await setLanguage(languages[0].code);
        return languages[0].code;
      }
      
      // Bir sonraki dile geç (döngüsel olarak)
      const nextIndex = (currentIndex + 1) % languages.length;
      const newLang = languages[nextIndex].code;
      
      // Dili değiştir
      const success = await setLanguage(newLang);
      
      // Başarılı değiştirme durumunda yeni dili, aksi halde mevcut dili döndür
      return success ? newLang : currentLanguage;
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
      return currentLanguage;
    }
  }, [currentLanguage, setLanguage]);

  // String getirme için güvenli bir yol sağla
  const safeGetString = useCallback((path, fallback = '') => {
    if (!path || typeof path !== 'string') return fallback;
    
    try {
      const parts = path.split('.');
      let result = strings[currentLanguage];
      
      // Undefined veya null kontrolleri ile birlikte derin özelliğe eriş
      for (const part of parts) {
        if (result === undefined || result === null) return fallback;
        result = result[part];
      }
      
      // Sonuç string dışında bir tip ise, fallback'e dön
      return typeof result === 'string' ? result : (result || fallback);
    } catch (error) {
      console.warn(`String yüklenirken hata oluştu (${path}):`, error);
      return fallback;
    }
  }, [currentLanguage]);

  // Bir string'in tüm desteklenen dillerde çevirilerini getir
  const getAllTranslations = useCallback((path, fallback = {}) => {
    if (!path) return fallback;
    
    try {
      const translations = {};
      const parts = path.split('.');
      
      // Her dil için çeviriyi getir
      languages.forEach(lang => {
        let result = strings[lang.code];
        
        for (const part of parts) {
          if (result === undefined || result === null) {
            result = undefined;
            break;
          }
          result = result[part];
        }
        
        translations[lang.code] = result || fallback[lang.code] || '';
      });
      
      return translations;
    } catch (error) {
      console.error('Çeviri getirme hatası:', error);
      return fallback;
    }
  }, []);

  return {
    currentLanguage,
    setLanguage,
    toggleLanguage,
    safeGetString,
    getAllTranslations,
    languages,
    isLoading,
    error
  };
}