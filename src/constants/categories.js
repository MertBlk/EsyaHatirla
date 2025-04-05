export const initialItems = [
  "🔑 Anahtar", 
  "👝 Cüzdan", 
  "📱 Telefon",
  "💳 Banka Kartı",
  "🎧 Kulaklık",
  "🔋 Powerbank",
  "📚 Kitap",
  "💻 Laptop"
];

export const categorizedItems = {
  'Günlük': [
    "🔑 Anahtar",
    "👝 Cüzdan",
    "🎧 Kulaklık",
    "📱 Telefon",
    "🏠 Ev Kartı",
    "💳 Banka Kartı",
    "🎟️ Toplu Taşıma Kartı",
    "🔋 Powerbank",
    "⌚ Akıllı Saat",
    "🕶️ Güneş Gözlüğü"
  ],
  'İş/Okul': [
    "💼 Laptop / Tablet",
    "📚 Defter / Kitap",
    "✏️ Kalem",
    "📂 USB Bellek / Hard Disk",
    "📝 Not Defteri",
    "🪪 Çalışma Kartı",
    "📮 Evrak / Dosya"
  ],
  'Spor': [
    "👟 Spor Ayakkabı",
    "🎽 Spor Kıyafeti",
    "🧴 Havlu",
    "🥤 Su Şişesi",
    "🏋️‍♂️ Spor Eldiveni",
    "🎧 Spor Kulaklığı",
    "🧦 Yedek Çorap"
  ],
  'Seyahat': [
    "🎫 Kimlik / Pasaport",
    "🧳 Valiz",
    "🔌 Şarj Aleti",
    "💳 Banka Kartı",
    "🗺️ Navigasyon",
    "🧥 Mont / Şemsiye",
    "💊 Seyahat İlaçları"
  ],
  'Sağlık': [
    "💊 İlaçlar",
    "🧴 El Dezenfektanı",
    "💊 Vitamin / Takviye",
    "🧻 Islak Mendil",
    "🩹 İlk Yardım Kiti",
    "😷 Maske"
  ],
  'Elektronik': [
    "💻 Tablet / iPad",
    "🎮 Oyun Konsolu",
    "🔌 Şarj Kablosu",
    "🔊 Bluetooth Hoparlör",
    "🔋 Taşınabilir Batarya"
  ]
};

export const categoryIcons = {
  'Tümü': '📋',
  'Günlük': '🌞',
  'İş/Okul': '💼',
  'Spor': '🏃',
  'Seyahat': '✈️',
  'Sağlık': '💊',
  'Elektronik': '💻'
};

export const STORAGE_KEYS = {
  SAVED_LOCATIONS: '@saved_locations',
  HOME_LOCATION: '@home_location',
  SELECTED_ITEMS: '@selected_items'
};