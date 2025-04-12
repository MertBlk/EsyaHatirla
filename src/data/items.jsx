// Tüm diller için kategorileri tanımlayalım
export const categories = {
  tr: ['Günlük', 'İş/Okul', 'Spor', 'Seyahat', 'Sağlık', 'Elektronik'],
  en: ['Daily', 'Work/School', 'Sports', 'Travel', 'Health', 'Electronics'],
  de: ['Täglich', 'Arbeit/Schule', 'Sport', 'Reisen', 'Gesundheit', 'Elektronik'],
  fr: ['Quotidien', 'Travail/École', 'Sports', 'Voyage', 'Santé', 'Électronique'],
  es: ['Diario', 'Trabajo/Escuela', 'Deportes', 'Viajes', 'Salud', 'Electrónica'],
  it: ['Quotidiano', 'Lavoro/Scuola', 'Sport', 'Viaggio', 'Salute', 'Elettronica'],
  pt: ['Diário', 'Trabalho/Escola', 'Esportes', 'Viagem', 'Saúde', 'Eletrônicos'],
  ru: ['Ежедневно', 'Работа/Школа', 'Спорт', 'Путешествия', 'Здоровье', 'Электроника'],
  ja: ['日常', '仕事/学校', 'スポーツ', '旅行', '健康', '電子機器'],
  zh: ['日常', '工作/学校', '运动', '旅行', '健康', '电子产品'],
  pl: ['Codzienne', 'Praca/Szkoła', 'Sport', 'Podróż', 'Zdrowie', 'Elektronika'],
  ar: ['يومي', 'العمل/المدرسة', 'رياضة', 'سفر', 'صحة', 'إلكترونيات'],
  nl: ['Dagelijks', 'Werk/School', 'Sport', 'Reizen', 'Gezondheid', 'Elektronika'],
  sv: ['Dagligen', 'Arbete/Skola', 'Sport', 'Resa', 'Hälsa', 'Elektronik']
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
  // Almanca
  'Täglich': '🔑',
  'Arbeit/Schule': '📚',
  'Sport': '🏀',
  'Reisen': '✈️',
  'Gesundheit': '💊',
  'Elektronik': '📱',
  // Fransızca
  'Quotidien': '🔑',
  'Travail/École': '📚',
  'Sports': '🏀',
  'Voyage': '✈️',
  'Santé': '💊',
  'Électronique': '📱',
  // İspanyolca
  'Diario': '🔑',
  'Trabajo/Escuela': '📚',
  'Deportes': '🏀',
  'Viajes': '✈️',
  'Salud': '💊',
  'Electrónica': '📱',
  // İtalyanca
  'Quotidiano': '🔑',
  'Lavoro/Scuola': '📚',
  'Sport': '🏀',
  'Viaggio': '✈️',
  'Salute': '💊',
  'Elettronica': '📱',
  // Portekizce
  'Diário': '🔑',
  'Trabalho/Escola': '📚',
  'Esportes': '🏀',
  'Viagem': '✈️',
  'Saúde': '💊',
  'Eletrônicos': '📱',
  // Rusça
  'Ежедневно': '🔑',
  'Работа/Школа': '📚',
  'Спорт': '🏀',
  'Путешествия': '✈️',
  'Здоровье': '💊',
  'Электроника': '📱',
  // Japonca
  '日常': '🔑',
  '仕事/学校': '📚',
  'スポーツ': '🏀',
  '旅行': '✈️',
  '健康': '💊',
  '電子機器': '📱',
  // Çince
  '日常': '🔑',
  '工作/学校': '📚',
  '运动': '🏀',
  '旅行': '✈️',
  '健康': '💊',
  '电子产品': '📱',
  // Tümü için
  'Tümü': '🗂️',
  'All': '🗂️',
  'Alle': '🗂️',
  'Tout': '🗂️',
  'Todo': '🗂️'
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
  de: {
    'Täglich': [
      '🔑 Schlüssel',
      '💳 Geldbörse',
      '📱 Handy',
      '🕶 Brille',
      '⌚️ Uhr',
      '🔋 Powerbank',
      '🧴 Handcreme',
      '🧢 Hut'
    ],
    'Arbeit/Schule': [
      '💻 Laptop',
      '📝 Notizbuch',
      '🖊 Stift',
      '📂 Unterlagen',
      '🎧 Kopfhörer',
      '🔌 Ladegerät',
      '💼 Tasche'
    ],
    'Sport': [
      '👟 Sportschuhe',
      '🏐 Sporttasche',
      '👕 Sportkleidung',
      '🧦 Socken',
      '🧴 Duschgel',
      '🧪 Deodorant',
      '🚿 Handtuch',
      '💧 Wasserflasche'
    ],
    'Reisen': [
      '🧳 Koffer',
      '🪥 Zahnbürste',
      '🧦 Socken',
      '👕 T-Shirt',
      '🧥 Jacke',
      '👖 Hose',
      '👙 Badeanzug',
      '📱 Handy-Ladegerät',
      '⌚️ Uhr-Ladegerät',
      '🛂 Reisepass',
      '💯 Hotelbuchung'
    ],
    'Gesundheit': [
      '💊 Medikamente',
      '😷 Maske',
      '💧 Handdesinfektionsmittel',
      '🧬 Vitamine',
      '🩺 Krankenversicherungskarte'
    ],
    'Elektronik': [
      '📱 Handy-Ladegerät',
      '💻 Laptop-Ladegerät',
      '🎧 Kopfhörer',
      '🔌 Adapter',
      '📸 Kamera',
      '🎮 Powerbank'
    ]
  },
  fr: {
    'Quotidien': [
      '🔑 Clés',
      '💳 Portefeuille',
      '📱 Téléphone',
      '🕶 Lunettes',
      '⌚️ Montre',
      '🔋 Batterie externe',
      '🧴 Crème pour les mains',
      '🧢 Chapeau'
    ],
    'Travail/École': [
      '💻 Ordinateur portable',
      '📝 Cahier',
      '🖊 Stylo',
      '📂 Dossiers',
      '🎧 Écouteurs',
      '🔌 Chargeur',
      '💼 Sac'
    ],
    'Sports': [
      '👟 Chaussures de sport',
      '🏐 Sac de sport',
      '👕 Vêtements de sport',
      '🧦 Chaussettes',
      '🧴 Gel douche',
      '🧪 Déodorant',
      '🚿 Serviette',
      '💧 Bouteille d\'eau'
    ],
    'Voyage': [
      '🧳 Valise',
      '🪥 Brosse à dents',
      '🧦 Chaussettes',
      '👕 T-shirt',
      '🧥 Veste',
      '👖 Pantalon',
      '👙 Maillot de bain',
      '📱 Chargeur de téléphone',
      '⌚️ Chargeur de montre',
      '🛂 Passeport',
      '💯 Réservation d\'hôtel'
    ],
    'Santé': [
      '💊 Médicaments',
      '😷 Masque',
      '💧 Désinfectant pour les mains',
      '🧬 Vitamines',
      '🩺 Carte d\'assurance maladie'
    ],
    'Électronique': [
      '📱 Chargeur de téléphone',
      '💻 Chargeur d\'ordinateur portable',
      '🎧 Écouteurs',
      '🔌 Adaptateur',
      '📸 Appareil photo',
      '🎮 Batterie externe'
    ]
  },
  es: {
    'Diario': [
      '🔑 Llaves',
      '💳 Cartera',
      '📱 Teléfono',
      '🕶 Gafas',
      '⌚️ Reloj',
      '🔋 Batería externa',
      '🧴 Crema de manos',
      '🧢 Sombrero'
    ],
    'Trabajo/Escuela': [
      '💻 Portátil',
      '📝 Cuaderno',
      '🖊 Bolígrafo',
      '📂 Archivos',
      '🎧 Auriculares',
      '🔌 Cargador',
      '💼 Bolsa'
    ],
    'Deportes': [
      '👟 Zapatillas deportivas',
      '🏐 Bolsa deportiva',
      '👕 Ropa deportiva',
      '🧦 Calcetines',
      '🧴 Gel de ducha',
      '🧪 Desodorante',
      '🚿 Toalla',
      '💧 Botella de agua'
    ],
    'Viajes': [
      '🧳 Maleta',
      '🪥 Cepillo de dientes',
      '🧦 Calcetines',
      '👕 Camiseta',
      '🧥 Chaqueta',
      '👖 Pantalones',
      '👙 Traje de baño',
      '📱 Cargador de teléfono',
      '⌚️ Cargador de reloj',
      '🛂 Pasaporte',
      '💯 Reserva de hotel'
    ],
    'Salud': [
      '💊 Medicamentos',
      '😷 Mascarilla',
      '💧 Desinfectante de manos',
      '🧬 Vitaminas',
      '🩺 Tarjeta de seguro médico'
    ],
    'Electrónica': [
      '📱 Cargador de teléfono',
      '💻 Cargador de portátil',
      '🎧 Auriculares',
      '🔌 Adaptador',
      '📸 Cámara',
      '🎮 Batería externa'
    ]
  },
  it: {
    'Quotidiano': [
      '🔑 Chiavi',
      '💳 Portafoglio',
      '📱 Telefono',
      '🕶 Occhiali',
      '⌚️ Orologio',
      '🔋 Powerbank',
      '🧴 Crema per le mani',
      '🧢 Cappello'
    ],
    'Lavoro/Scuola': [
      '💻 Laptop',
      '📝 Quaderno',
      '🖊 Penna',
      '📂 Documenti',
      '🎧 Cuffie',
      '🔌 Caricabatterie',
      '💼 Borsa'
    ],
    'Sport': [
      '👟 Scarpe da ginnastica',
      '🏐 Borsa sportiva',
      '👕 Abbigliamento sportivo',
      '🧦 Calzini',
      '🧴 Gel doccia',
      '🧪 Deodorante',
      '🚿 Asciugamano',
      '💧 Bottiglia d\'acqua'
    ],
    'Viaggio': [
      '🧳 Valigia',
      '🪥 Spazzolino da denti',
      '🧦 Calzini',
      '👕 Maglietta',
      '🧥 Giacca',
      '👖 Pantaloni',
      '👙 Costume da bagno',
      '📱 Caricabatterie per telefono',
      '⌚️ Caricabatterie per orologio',
      '🛂 Passaporto',
      '💯 Prenotazione alberghiera'
    ],
    'Salute': [
      '💊 Medicinali',
      '😷 Maschera',
      '💧 Disinfettante per le mani',
      '🧬 Vitamine',
      '🩺 Tessera sanitaria'
    ],
    'Elettronica': [
      '📱 Caricabatterie per telefono',
      '💻 Caricabatterie per laptop',
      '🎧 Cuffie',
      '🔌 Adattatore',
      '📸 Fotocamera',
      '🎮 Powerbank'
    ]
  },
  pt: {
    'Diário': [
      '🔑 Chaves',
      '💳 Carteira',
      '📱 Telefone',
      '🕶 Óculos',
      '⌚️ Relógio',
      '🔋 Powerbank',
      '🧴 Creme para as mãos',
      '🧢 Chapéu'
    ],
    'Trabalho/Escola': [
      '💻 Laptop',
      '📝 Caderno',
      '🖊 Caneta',
      '📂 Arquivos',
      '🎧 Fones de ouvido',
      '🔌 Carregador',
      '💼 Bolsa'
    ],
    'Esportes': [
      '👟 Tênis esportivo',
      '🏐 Bolsa esportiva',
      '👕 Roupas esportivas',
      '🧦 Meias',
      '🧴 Gel de banho',
      '🧪 Desodorante',
      '🚿 Toalha',
      '💧 Garrafa de água'
    ],
    'Viagem': [
      '🧳 Mala',
      '🪥 Escova de dentes',
      '🧦 Meias',
      '👕 Camiseta',
      '🧥 Jaqueta',
      '👖 Calças',
      '👙 Maiô',
      '📱 Carregador de telefone',
      '⌚️ Carregador de relógio',
      '🛂 Passaporte',
      '💯 Reserva de hotel'
    ],
    'Saúde': [
      '💊 Medicamentos',
      '😷 Máscara',
      '💧 Desinfetante para as mãos',
      '🧬 Vitaminas',
      '🩺 Cartão de seguro de saúde'
    ],
    'Eletrônicos': [
      '📱 Carregador de telefone',
      '💻 Carregador de laptop',
      '🎧 Fones de ouvido',
      '🔌 Adaptador',
      '📸 Câmera',
      '🎮 Powerbank'
    ]
  },
  ru: {
    'Ежедневно': [
      '🔑 Ключи',
      '💳 Кошелек',
      '📱 Телефон',
      '🕶 Очки',
      '⌚️ Часы',
      '🔋 Повербанк',
      '🧴 Крем для рук',
      '🧢 Шляпа'
    ],
    'Работа/Школа': [
      '💻 Ноутбук',
      '📝 Блокнот',
      '🖊 Ручка',
      '📂 Файлы',
      '🎧 Наушники',
      '🔌 Зарядное устройство',
      '💼 Сумка'
    ],
    'Спорт': [
      '👟 Спортивная обувь',
      '🏐 Спортивная сумка',
      '👕 Спортивная одежда',
      '🧦 Носки',
      '🧴 Гель для душа',
      '🧪 Дезодорант',
      '🚿 Полотенце',
      '💧 Бутылка воды'
    ],
    'Путешествия': [
      '🧳 Чемодан',
      '🪥 Зубная щетка',
      '🧦 Носки',
      '👕 Футболка',
      '🧥 Куртка',
      '👖 Штаны',
      '👙 Купальник',
      '📱 Зарядное устройство для телефона',
      '⌚️ Зарядное устройство для часов',
      '🛂 Паспорт',
      '💯 Бронирование отеля'
    ],
    'Здоровье': [
      '💊 Лекарства',
      '😷 Маска',
      '💧 Дезинфицирующее средство для рук',
      '🧬 Витамины',
      '🩺 Карта медицинского страхования'
    ],
    'Электроника': [
      '📱 Зарядное устройство для телефона',
      '💻 Зарядное устройство для ноутбука',
      '🎧 Наушники',
      '🔌 Адаптер',
      '📸 Камера',
      '🎮 Повербанк'
    ]
  },
  ja: {
    '日常': [
      '🔑 鍵',
      '💳 財布',
      '📱 携帯電話',
      '🕶 眼鏡',
      '⌚️ 時計',
      '🔋 モバイルバッテリー',
      '🧴 ハンドクリーム',
      '🧢 帽子'
    ],
    '仕事/学校': [
      '💻 ノートパソコン',
      '📝 ノート',
      '🖊 ペン',
      '📂 ファイル',
      '🎧 ヘッドホン',
      '🔌 充電器',
      '💼 バッグ'
    ],
    'スポーツ': [
      '👟 スポーツシューズ',
      '🏐 スポーツバッグ',
      '👕 スポーツウェア',
      '🧦 靴下',
      '🧴 シャワージェル',
      '🧪 デオドラント',
      '🚿 タオル',
      '💧 ウォーターボトル'
    ],
    '旅行': [
      '🧳 スーツケース',
      '🪥 歯ブラシ',
      '🧦 靴下',
      '👕 Tシャツ',
      '🧥 ジャケット',
      '👖 パンツ',
      '👙 水着',
      '📱 携帯電話の充電器',
      '⌚️ 時計の充電器',
      '🛂 パスポート',
      '💯 ホテル予約'
    ],
    '健康': [
      '💊 薬',
      '😷 マスク',
      '💧 ハンドサニタイザー',
      '🧬 ビタミン',
      '🩺 健康保険証'
    ],
    '電子機器': [
      '📱 携帯電話の充電器',
      '💻 ノートパソコンの充電器',
      '🎧 ヘッドホン',
      '🔌 アダプター',
      '📸 カメラ',
      '🎮 モバイルバッテリー'
    ]
  },
  zh: {
    '日常': [
      '🔑 钥匙',
      '💳 钱包',
      '📱 手机',
      '🕶 眼镜',
      '⌚️ 手表',
      '🔋 移动电源',
      '🧴 护手霜',
      '🧢 帽子'
    ],
    '工作/学校': [
      '💻 笔记本电脑',
      '📝 笔记本',
      '🖊 笔',
      '📂 文件',
      '🎧 耳机',
      '🔌 充电器',
      '💼 包'
    ],
    '运动': [
      '👟 运动鞋',
      '🏐 运动包',
      '👕 运动服',
      '🧦 袜子',
      '🧴 沐浴露',
      '🧪 除臭剂',
      '🚿 毛巾',
      '💧 水瓶'
    ],
    '旅行': [
      '🧳 行李箱',
      '🪥 牙刷',
      '🧦 袜子',
      '👕 T恤',
      '🧥 夹克',
      '👖 裤子',
      '👙 泳衣',
      '📱 手机充电器',
      '⌚️ 手表充电器',
      '🛂 护照',
      '💯 酒店预订'
    ],
    '健康': [
      '💊 药物',
      '😷 口罩',
      '💧 洗手液',
      '🧬 维生素',
      '🩺 健康保险卡'
    ],
    '电子产品': [
      '📱 手机充电器',
      '💻 笔记本电脑充电器',
      '🎧 耳机',
      '🔌 适配器',
      '📸 相机',
      '🎮 移动电源'
    ]
  },
  // Arapça (ar) için eşyalar
  ar: {
    'الكل': [],
    'يومي': [
      '🔑 المفاتيح',
      '💳 المحفظة',
      '📱 الهاتف',
      '🕶 النظارات',
      '⌚️ الساعة',
      '🔋 بنك الطاقة',
      '🧴 كريم اليدين',
      '🧢 قبعة'
    ],
    'العمل/المدرسة': [
      '💻 الكمبيوتر المحمول',
      '📝 دفتر الملاحظات',
      '🖊 قلم',
      '📂 الملفات',
      '🎧 سماعات الرأس',
      '🔌 الشاحن',
      '💼 الحقيبة'
    ],
    'رياضة': [
      '👟 أحذية رياضية',
      '🏐 حقيبة رياضية',
      '👕 ملابس رياضية',
      '🧦 جوارب',
      '🧴 جل استحمام',
      '🧪 مزيل عرق',
      '🚿 منشفة',
      '💧 زجاجة ماء'
    ],
    'سفر': [
      '🧳 حقيبة سفر',
      '🪥 فرشاة أسنان',
      '🧦 جوارب',
      '👕 قميص',
      '🧥 جاكيت',
      '👖 بنطلون',
      '👙 ملابس سباحة',
      '📱 شاحن هاتف',
      '⌚️ شاحن ساعة',
      '🛂 جواز سفر',
      '💯 حجز الفندق'
    ],
    'صحة': [
      '💊 أدوية',
      '😷 كمامة',
      '💧 معقم يدين',
      '🧬 فيتامينات',
      '🩺 بطاقة التأمين الصحي'
    ],
    'إلكترونيات': [
      '📱 شاحن هاتف',
      '💻 شاحن كمبيوتر محمول',
      '🎧 سماعات الرأس',
      '🔌 محول كهرباء',
      '📸 كاميرا',
      '🎮 بنك الطاقة'
    ]
  },
  
  // Hollandaca (nl) için eşyalar
  nl: {
    'Alles': [],
    'Dagelijks': [
      '🔑 Sleutels',
      '💳 Portemonnee',
      '📱 Telefoon',
      '🕶 Bril',
      '⌚️ Horloge',
      '🔋 Powerbank',
      '🧴 Handcrème',
      '🧢 Hoed'
    ],
    'Werk/School': [
      '💻 Laptop',
      '📝 Notitieblok',
      '🖊 Pen',
      '📂 Documenten',
      '🎧 Koptelefoon',
      '🔌 Oplader',
      '💼 Tas'
    ],
    'Sport': [
      '👟 Sportschoenen',
      '🏐 Sporttas',
      '👕 Sportkleding',
      '🧦 Sokken',
      '🧴 Douchegel',
      '🧪 Deodorant',
      '🚿 Handdoek',
      '💧 Waterfles'
    ],
    'Reizen': [
      '🧳 Koffer',
      '🪥 Tandenborstel',
      '🧦 Sokken',
      '👕 T-shirt',
      '🧥 Jas',
      '👖 Broek',
      '👙 Zwemkleding',
      '📱 Telefoonlader',
      '⌚️ Horlogelader',
      '🛂 Paspoort',
      '💯 Hotelreservering'
    ],
    'Gezondheid': [
      '💊 Medicijnen',
      '😷 Mondkapje',
      '💧 Handdesinfectiemiddel',
      '🧬 Vitamines',
      '🩺 Zorgverzekeringspas'
    ],
    'Elektronica': [
      '📱 Telefoonlader',
      '💻 Laptoplader',
      '🎧 Koptelefoon',
      '🔌 Adapter',
      '📸 Camera',
      '🎮 Powerbank'
    ]
  },
  
  // İsveççe (sv) için eşyalar
  sv: {
    'Alla': [],
    'Dagligen': [
      '🔑 Nycklar',
      '💳 Plånbok',
      '📱 Telefon',
      '🕶 Glasögon',
      '⌚️ Klocka',
      '🔋 Powerbank',
      '🧴 Handkräm',
      '🧢 Hatt'
    ],
    'Arbete/Skola': [
      '💻 Laptop',
      '📝 Anteckningsbok',
      '🖊 Penna',
      '📂 Dokument',
      '🎧 Hörlurar',
      '🔌 Laddare',
      '💼 Väska'
    ],
    'Sport': [
      '👟 Sportskor',
      '🏐 Sportväska',
      '👕 Sportkläder',
      '🧦 Strumpor',
      '🧴 Duschgel',
      '🧪 Deodorant',
      '🚿 Handduk',
      '💧 Vattenflaska'
    ],
    'Resa': [
      '🧳 Resväska',
      '🪥 Tandborste',
      '🧦 Strumpor',
      '👕 T-shirt',
      '🧥 Jacka',
      '👖 Byxor',
      '👙 Badkläder',
      '📱 Telefonladdare',
      '⌚️ Klockladdare',
      '🛂 Pass',
      '💯 Hotellbokning'
    ],
    'Hälsa': [
      '💊 Mediciner',
      '😷 Mask',
      '💧 Handsprit',
      '🧬 Vitaminer',
      '🩺 Sjukförsäkringskort'
    ],
    'Elektronik': [
      '📱 Telefonladdare',
      '💻 Laptopladdare',
      '🎧 Hörlurar',
      '🔌 Adapter',
      '📸 Kamera',
      '🎮 Powerbank'
    ]
  },
  
  // Lehçe (pl) için eşyalar
  pl: {
    'Wszystkie': [],
    'Codzienne': [
      '🔑 Klucze',
      '💳 Portfel',
      '📱 Telefon',
      '🕶 Okulary',
      '⌚️ Zegarek',
      '🔋 Powerbank',
      '🧴 Krem do rąk',
      '🧢 Czapka'
    ],
    'Praca/Szkoła': [
      '💻 Laptop',
      '📝 Notes',
      '🖊 Długopis',
      '📂 Dokumenty',
      '🎧 Słuchawki',
      '🔌 Ładowarka',
      '💼 Torba'
    ],
    'Sport': [
      '👟 Buty sportowe',
      '🏐 Torba sportowa',
      '👕 Odzież sportowa',
      '🧦 Skarpety',
      '🧴 Żel pod prysznic',
      '🧪 Dezodorant',
      '🚿 Ręcznik',
      '💧 Butelka wody'
    ],
    'Podróż': [
      '🧳 Walizka',
      '🪥 Szczoteczka do zębów',
      '🧦 Skarpety',
      '👕 Koszulka',
      '🧥 Kurtka',
      '👖 Spodnie',
      '👙 Strój kąpielowy',
      '📱 Ładowarka do telefonu',
      '⌚️ Ładowarka do zegarka',
      '🛂 Paszport',
      '💯 Rezerwacja hotelu'
    ],
    'Zdrowie': [
      '💊 Leki',
      '😷 Maska',
      '💧 Środek do dezynfekcji rąk',
      '🧬 Witaminy',
      '🩺 Karta ubezpieczenia zdrowotnego'
    ],
    'Elektronika': [
      '📱 Ładowarka do telefonu',
      '💻 Ładowarka do laptopa',
      '🎧 Słuchawki',
      '🔌 Adapter',
      '📸 Aparat',
      '🎮 Powerbank'
    ]
  }
};

// Kategori listesini döndür
export const getCategories = (language = 'tr') => {
  try {
    // Dil kodu categories objesinde bir key olarak var mı kontrol et
    if (categories[language]) {
      return categories[language];
    }
    
    // Eğer dil kodu yoksa ve tr'den farklıysa console'a warning bas
    if (language !== 'tr') {
      console.warn(`'${language}' dili için kategori tanımlaması bulunamadı, varsayılan olarak İngilizce kategoriler kullanılıyor.`);
      return categories['en']; // Varsayılan olarak İngilizce kategoriler
    }
    
    return categories['tr']; // Son çare olarak Türkçe kategoriler
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    return []; // Hata durumunda boş dizi döndür
  }
};

// Cached results için boş objeler oluşturalım
const cachedInitialItems = {};
const cachedCategorizedItems = {};

// Tüm eşyaları dil parametresine göre döndür (memoized)
export const getInitialItems = (language = 'tr') => {
  try {
    // Eğer daha önce hesaplanmışsa, önbelleği döndür
    if (cachedInitialItems[language]) {
      return cachedInitialItems[language];
    }
    
    // Dil kodu items objesinde bir key olarak var mı kontrol et
    const languageItems = items[language] || items['en']; // Dil yoksa İngilizce'ye geri dön
    const allItems = [];
    
    // Tüm kategorilerdeki eşyaları birleştir
    Object.values(languageItems).forEach(categoryItems => {
      allItems.push(...categoryItems);
    });
    
    // Sonucu önbelleğe al
    cachedInitialItems[language] = allItems;
    
    return allItems;
  } catch (error) {
    console.error('Eşya getirme hatası:', error);
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
    console.error('Kategorize eşya getirme hatası:', error);
    return {};
  }
};
