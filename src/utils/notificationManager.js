import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Bildirim tipleri için sabitler
const NOTIFICATION_TYPES = {
  REMINDER: 'reminder',
  ALERT: 'alert',
  INFO: 'info'
};

// Bildirim yönetimi için sınıf
class NotificationManager {
  constructor() {
    this.isProcessing = false;
    this.lastNotificationTime = 0;
    this.cooldownPeriod = 2000; // 2 saniye bekleme süresi
    this.notificationHistory = new Map(); // Bildirim geçmişini saklayacak map
    this.notificationCooldowns = new Map(); // Bildirim cooldown'ları için map
    this.maxHistorySize = 50; // Maksimum tarih geçmişi boyutunu azalttık (bellek optimizasyonu)
    this.cleanupInterval = null; // Temizleme işlemi için interval
    this.isSetup = false; // Kurulum durumunu takip etmek için
  }

  /**
   * Bildirimleri ayarla ve gerekli izinleri al
   * @param {string} currentLanguage - Mevcut dil kodu
   * @returns {Promise<boolean>} - İşlem başarılı oldu mu
   */
  async setupNotifications(currentLanguage) {
    try {
      // Zaten kurulmuşsa ve dil değişmemişse tekrar yapılandırma
      if (this.isSetup && this.currentLanguage === currentLanguage) {
        return true;
      }
      
      // İzinleri iste
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      // Eğer zaten izin varsa tekrar istemeye gerek yok
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Bildirim izinleri verilmedi!');
        return false;
      }

      // Bildirim işleyiciyi yapılandır
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          priority: 'high',
          categoryIdentifier: 'items'
        }),
      });

      // Bildirim butonlarını dile göre güncelle
      await this.updateNotificationButtons(currentLanguage);
      
      // Hafızayı yönetmek için periyodik temizleme işlemi başlat
      this.startHistoryCleanup();
      
      // Kurulum durumunu ve dili güncelle
      this.isSetup = true;
      this.currentLanguage = currentLanguage;
      
      return true;
    } catch (error) {
      console.error('Bildirim ayarları hatası:', error);
      return false;
    }
  }

  /**
   * Bellek optimizasyonu için bildirim geçmişi temizliği başlat
   */
  startHistoryCleanup() {
    // Önce eski interval'i temizle
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Her 15 dakikada bir eski bildirimleri temizle (daha sık temizleme)
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldNotifications();
    }, 15 * 60 * 1000);
  }
  
  /**
   * Eski bildirimleri temizle
   */
  cleanupOldNotifications() {
    try {
      const now = Date.now();
      const thirtyMinutesAgo = now - (30 * 60 * 1000); // 30 dakikadan eski bildirimleri temizle
      
      let deletedCount = 0;
      
      // 30 dakikadan eski bildirimleri temizle
      for (const [key, timestamp] of this.notificationHistory) {
        if (timestamp < thirtyMinutesAgo) {
          this.notificationHistory.delete(key);
          deletedCount++;
        }
      }
      
      // Notifikasyon cooldown süresini de temizle
      for (const [key, timestamp] of this.notificationCooldowns) {
        if (timestamp < thirtyMinutesAgo) {
          this.notificationCooldowns.delete(key);
        }
      }
      
      // Eğer tarihçe çok büyüdüyse, en eski kayıtları sil
      if (this.notificationHistory.size > this.maxHistorySize) {
        const entries = Array.from(this.notificationHistory.entries())
          .sort((a, b) => a[1] - b[1]);
        
        const entriesToDelete = entries.slice(0, entries.length - this.maxHistorySize);
        entriesToDelete.forEach(([key]) => {
          this.notificationHistory.delete(key);
          deletedCount++;
        });
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Bildirim temizleme hatası:', error);
      return 0;
    }
  }

  /**
   * Bildirim butonlarını güncelle
   * @param {string} currentLanguage - Mevcut dil kodu
   * @returns {Promise<boolean>}
   */
  async updateNotificationButtons(currentLanguage) {
    try {
      // Güvenli dil kontrolü
      const lang = currentLanguage && typeof currentLanguage === 'string' ? currentLanguage : 'tr';
      
      const yesText = lang === 'tr' ? '✅ Evet, Aldım' : '✅ Yes, I Have Them';
      const noText = lang === 'tr' ? '❌ Hayır, Unuttum' : '❌ No, I Forgot';

      await Notifications.setNotificationCategoryAsync('items', [
        {
          identifier: 'yes',
          buttonTitle: yesText,
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          }
        },
        {
          identifier: 'no',
          buttonTitle: noText,
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          }
        }
      ]);
      
      return true;
    } catch (error) {
      console.error('Bildirim butonları güncellenirken hata:', error);
      return false;
    }
  }

  /**
   * Bildirim gönder
   * @param {Object} config - Bildirim yapılandırması
   * @returns {Promise<string|boolean>} - Bildirim ID'si veya işlem başarısı
   */
  async send(config) {
    const now = Date.now();
    
    // Eğer işlem devam ediyorsa veya cooldown süresi dolmadıysa çık
    if (this.isProcessing || (now - this.lastNotificationTime) < this.cooldownPeriod) {
      return false; // İşlem devam ediyor veya cooldown süresi dolmadı
    }
    
    try {
      this.isProcessing = true;
      this.lastNotificationTime = now;
      
      // Konfigürasyon nesnesini kontrol et
      if (!config || !config.content) {
        throw new Error('Geçersiz bildirim konfigürasyonu');
      }
      
      // Platform bazlı düzenlemeler (iOS için ses desteği)
      if (Platform.OS === 'ios') {
        if (!config.content.sound) {
          config.content.sound = 'default';
        }
      }

      // Bildirim ID'si oluştur
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          ...config.content,
          // Geçersiz değerler olması durumunda varsayılan değerler ata
          title: config.content.title || 'Bildirim',
          body: config.content.body || '',
        },
        trigger: config.trigger || null
      });
      
      return notificationId;
    } catch (error) {
      console.error('Bildirim gönderme hatası:', error);
      return false;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Hatırlatıcı bildirim gönder
   * @param {Object} strings - Dil stringleri
   * @param {string} currentLanguage - Mevcut dil kodu
   * @param {Array} selectedItems - Seçili eşyaların listesi
   * @returns {Promise<boolean>} - İşlem başarılı oldu mu
   */
  async sendAlert(strings, currentLanguage, selectedItems) {
    try {
      // Parametre kontrolü
      if (!strings || !currentLanguage) {
        console.warn('Bildirim için gerekli parametreler eksik');
        return false;
      }
      
      // Kurulum kontrolü
      if (!this.isSetup) {
        await this.setupNotifications(currentLanguage);
      }
      
      // Dil değiştiyse, bildirim butonlarını güncelle
      if (this.currentLanguage !== currentLanguage) {
        await this.updateNotificationButtons(currentLanguage);
        this.currentLanguage = currentLanguage;
      }
      
      // Güvenli dil seçimi
      const lang = currentLanguage && typeof currentLanguage === 'string' ? currentLanguage : 'tr';
      
      // Eğer son 5 saniye içinde aynı içerikle bildirim gönderildiyse çık
      const now = Date.now();
      const notificationKey = `${lang}-${Array.isArray(selectedItems) ? selectedItems.join(',') : 'empty'}`;
      const lastSentTime = this.notificationCooldowns.get(notificationKey);
      
      if (lastSentTime && now - lastSentTime < 5000) {
        return false; // Son 5 saniye içinde aynı bildirim gönderilmiş
      }

      // Eşya listesini güvenli bir şekilde hazırla
      let itemsList = '';
      if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
        itemsList = strings?.[lang]?.alerts?.noItems || "Seçili eşya yok";
      } else {
        // Uzun listeleri kısaltarak performans iyileştirmesi yap
        const MAX_ITEMS = 10;
        const displayItems = selectedItems.slice(0, MAX_ITEMS);
        itemsList = displayItems.join('\n• ');
        
        if (selectedItems.length > MAX_ITEMS) {
          const remaining = selectedItems.length - MAX_ITEMS;
          const moreTxt = strings?.[lang]?.alerts?.moreItems || `ve ${remaining} eşya daha...`;
          itemsList += `\n• ${moreTxt}`;
        }
      }

      // Bildirim başlığı ve metni güvenli bir şekilde al
      const title = strings?.[lang]?.alerts?.warning || "Uyarı";
      const body = `${strings?.[lang]?.alerts?.items || "Eşyalarınız:"}\n• ${itemsList}`;

      // Bildirim gönder
      const result = await this.send({
        content: {
          title,
          body,
          sound: 'default',
          priority: 'high',
          categoryIdentifier: 'items',
          vibrate: [1000, 500, 1000], // Android için titreşim
          data: { 
            type: NOTIFICATION_TYPES.REMINDER,
            language: lang,
            timestamp: now,
            items: selectedItems ? [...selectedItems] : [] // Kopya oluşturarak daha güvenli
          }
        },
        trigger: null
      });

      // Başarılı gönderilen bildirim için cooldown ayarla
      if (result) {
        this.notificationHistory.set(notificationKey, now);
        this.notificationCooldowns.set(notificationKey, now);
      }
      
      return !!result;
    } catch (error) {
      console.error('Uyarı gönderme hatası:', error);
      return false;
    }
  }
  
  /**
   * Component unmount edildiğinde temizleme yapmak için
   */
  cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Gereksiz bellek kullanımını azalt
    this.notificationHistory.clear();
    this.notificationCooldowns.clear();
    this.isProcessing = false;
    
    // Garbage collection'ı teşvik et
    this.notificationHistory = new Map();
    this.notificationCooldowns = new Map();
  }
  
  /**
   * Tüm bekleyen bildirimleri iptal et
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error('Bildirim iptal hatası:', error);
      return false;
    }
  }
  
  /**
   * Belirli bir tipteki tüm bildirimleri getir
   * @param {string} type - Bildirim tipi (NOTIFICATION_TYPES sabitinden)
   * @returns {Promise<Array>} - İlgili tipteki bildirimler
   */
  async getNotificationsOfType(type) {
    try {
      // Tip kontrolü
      if (!type || !Object.values(NOTIFICATION_TYPES).includes(type)) {
        return [];
      }
      
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications.filter(notification => 
        notification?.content?.data?.type === type
      );
    } catch (error) {
      console.error('Bildirim getirme hatası:', error);
      return [];
    }
  }
}

export default new NotificationManager();