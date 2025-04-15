// Tüm diller için kategorileri tanımlayalım
export const categories = {
  tr: ['Günlük', 'İş/Okul', 'Spor', 'Seyahat', 'Sağlık', 'Elektronik'],
  en: ['Daily', 'Work/School', 'Sports', 'Travel', 'Health', 'Electronics'],
};

// Kategori emojilerini tanımlayalım (tüm diller için aynı emoji kullanılabilir)
export const categoryIcons = {
  'Günlük': '🔑',
  'İş/Okul': '📚',
  'Spor': '🏀',
  'Seyahat': '✈️',
  'Sağlık': '💊',
  'Elektronik': '📱',
  // İngilizce
  'Daily': '🔑',
  'Work/School': '📚',
  'Sports': '🏀',
  'Travel': '✈️',
  'Health': '💊',
  'Electronics': '📱',
};

// Kategorilere göre eşyaları tanımlayalım
export const items = {
  tr: {
    'Günlük': [
      '🔑 Anahtarlar',
      '💳 Cüzdan',
      '📱 Telefon',
      '🕶 Gözlük',
      '⌚️ Saat',
      '🔋 Powerbank',
      '🧴 El kremi',
      '🧢 Şapka'
    ],
    'İş/Okul': [
      '💻 Laptop',
      '📝 Defter',
      '🖊 Kalem',
      '📂 Dosyalar',
      '🎧 Kulaklık',
      '🔌 Şarj Aleti',
      '💼 Çanta'
    ],
    'Spor': [
      '👟 Spor Ayakkabı',
      '🏐 Spor Çantası',
      '👕 Spor Kıyafeti',
      '🧦 Çorap',
      '🧴 Duş Jeli',
      '🧪 Deodorant',
      '🚿 Havlu',
      '💧 Su Şişesi'
    ],
    'Seyahat': [
      '🧳 Bavul',
      '🪥 Diş Fırçası',
      '🧦 Çorap',
      '👕 Tişört',
      '🧥 Ceket',
      '👖 Pantolon',
      '👙 Mayo',
      '📱 Telefon Şarj Aleti',
      '⌚️ Saat Şarj Aleti',
      '🛂 Pasaport',
      '💯 Otel Rezervasyonu'
    ],
    'Sağlık': [
      '💊 İlaçlar',
      '😷 Maske',
      '💧 El Dezenfektanı',
      '🧬 Vitaminler',
      '🩺 Sağlık Sigortası Kartı'
    ],
    'Elektronik': [
      '📱 Telefon Şarj Aleti',
      '💻 Laptop Şarj Aleti',
      '🎧 Kulaklık',
      '🔌 Priz Adaptörü',
      '📸 Kamera',
      '🎮 Powerbank'
    ]
  },
  en: {
    'Daily': [
      '🔑 Keys',
      '💳 Wallet',
      '📱 Phone',
      '🕶 Glasses',
      '⌚️ Watch',
      '🔋 Powerbank',
      '🧴 Hand cream',
      '🧢 Hat'
    ],
    'Work/School': [
      '💻 Laptop',
      '📝 Notebook',
      '🖊 Pen',
      '📂 Files',
      '🎧 Headphones',
      '🔌 Charger',
      '💼 Bag'
    ],
    'Sports': [
      '👟 Sports Shoes',
      '🏐 Sports Bag',
      '👕 Sports Clothes',
      '🧦 Socks',
      '🧴 Shower Gel',
      '🧪 Deodorant',
      '🚿 Towel',
      '💧 Water Bottle'
    ],
    'Travel': [
      '🧳 Suitcase',
      '🪥 Toothbrush',
      '🧦 Socks',
      '👕 T-shirt',
      '🧥 Jacket',
      '👖 Pants',
      '👙 Swimsuit',
      '📱 Phone Charger',
      '⌚️ Watch Charger',
      '🛂 Passport',
      '💯 Hotel Reservation'
    ],
    'Health': [
      '💊 Medication',
      '😷 Mask',
      '💧 Hand Sanitizer',
      '🧬 Vitamins',
      '🩺 Health Insurance Card'
    ],
    'Electronics': [
      '📱 Phone Charger',
      '💻 Laptop Charger',
      '🎧 Headphones',
      '🔌 Adapter',
      '📸 Camera',
      '🎮 Powerbank'
    ]
  },
};

// Cached results için boş objeler oluşturalım
const cachedInitialItems = {};
const cachedCategorizedItems = {};
const cachedCategories = {};

// Veri setlerini asenkron olarak yükleme fonksiyonları
const loadItems = (language = 'tr') => {
  if (!items[language]) {
    console.warn(`'${language}' dili için eşya tanımlaması bulunamadı, varsayılan olarak İngilizce eşyalar kullanılıyor.`);
    return items['en']; // Varsayılan olarak İngilizce eşyalar
  }
  return items[language];
};

// Kategori listesini döndür - performans iyileştirmesi için cache kullanımı
export const getCategories = (language = 'tr') => {
  try {
    // Eğer daha önce hesaplanmışsa, önbelleği döndür
    if (cachedCategories[language]) {
      return cachedCategories[language];
    }
    
    // Dil kodu categories objesinde bir key olarak var mı kontrol et
    if (categories[language]) {
      cachedCategories[language] = categories[language];
      return categories[language];
    }
    
    // Eğer dil kodu yoksa ve tr'den farklıysa console'a warning bas
    if (language !== 'tr') {
      console.warn(`'${language}' dili için kategori tanımlaması bulunamadı, varsayılan olarak İngilizce kategoriler kullanılıyor.`);
      cachedCategories[language] = categories['en'];
      return categories['en']; // Varsayılan olarak İngilizce kategoriler
    }
    
    cachedCategories[language] = categories['tr'];
    return categories['tr']; // Son çare olarak Türkçe kategoriler
  } catch (error) {
    console.error("Kategori yükleme hatası:", error);
    return []; // Hata durumunda boş dizi döndür
  }
};

// Tüm eşyaları dil parametresine göre döndür (memoized)
export const getInitialItems = (language = 'tr') => {
  try {
    // Eğer daha önce hesaplanmışsa, önbelleği döndür
    if (cachedInitialItems[language]) {
      return cachedInitialItems[language];
    }
    
    // Dil kodu items objesinde bir key olarak var mı kontrol et
    const languageItems = loadItems(language);
    const allItems = [];
    
    // Tüm kategorilerdeki eşyaları birleştir
    Object.values(languageItems).forEach(categoryItems => {
      if (Array.isArray(categoryItems)) {
        allItems.push(...categoryItems);
      }
    });
    
    // Sonucu önbelleğe al
    cachedInitialItems[language] = allItems;
    
    return allItems;
  } catch (error) {
    console.error("İlk eşyaları yükleme hatası:", error);
    return [];
  }
};

// Kategorilere göre gruplandırılmış eşyaları döndür (memoized)
export const getCategorizedItems = (language = 'tr') => {
  try {
    // Eğer daha önce hesaplanmışsa, önbelleği döndür
    if (cachedCategorizedItems[language]) {
      return cachedCategorizedItems[language];
    }
    
    // Dil kodu items objesinde bir key olarak var mı kontrol et
    let result;
    if (items[language]) {
      result = items[language];
    } else {
      // Eğer dil kodu yoksa ve tr'den farklıysa console'a warning bas
      if (language !== 'tr') {
        console.warn(`'${language}' dili için eşya tanımlaması bulunamadı, varsayılan olarak İngilizce eşyalar kullanılıyor.`);
        result = items['en']; // Varsayılan olarak İngilizce eşyalar
      } else {
        result = items['tr']; // Son çare olarak Türkçe eşyalar
      }
    }
    
    // Sonucu önbelleğe al
    cachedCategorizedItems[language] = result;
    
    return result;
  } catch (error) {
    console.error("Kategorize eşyaları yükleme hatası:", error);
    return {};
  }
};

// Önbelleği temizleme fonksiyonu - gerektiğinde çağrılabilir
export const clearItemCache = () => {
  Object.keys(cachedInitialItems).forEach(key => delete cachedInitialItems[key]);
  Object.keys(cachedCategorizedItems).forEach(key => delete cachedCategorizedItems[key]);
  Object.keys(cachedCategories).forEach(key => delete cachedCategories[key]);
};
