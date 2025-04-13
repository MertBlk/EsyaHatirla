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
    this.maxHistorySize = 100; // Maksimum tarih geçmişi boyutu
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
    
    // Her 30 dakikada bir eski bildirimleri temizle
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldNotifications();
    }, 30 * 60 * 1000);
  }
  
  /**
   * Eski bildirimleri temizle
   */
  cleanupOldNotifications() {
    try {
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      
      let deletedCount = 0;
      
      // 1 saatten eski bildirimleri temizle
      for (const [key, timestamp] of this.notificationHistory) {
        if (timestamp < oneHourAgo) {
          this.notificationHistory.delete(key);
          deletedCount++;
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
      
      if (deletedCount > 0) {
        console.log(`${deletedCount} adet eski bildirim temizlendi. Kalan: ${this.notificationHistory.size}`);
      }
    } catch (error) {
      console.error('Bildirim temizleme hatası:', error);
    }
  }

  /**
   * Bildirim butonlarını güncelle
   * @param {string} currentLanguage - Mevcut dil kodu
   * @returns {Promise<void>}
   */
  async updateNotificationButtons(currentLanguage) {
    try {
      const yesText = currentLanguage === 'tr' ? '✅ Evet, Aldım' : '✅ Yes, I Have Them';
      const noText = currentLanguage === 'tr' ? '❌ Hayır, Unuttum' : '❌ No, I Forgot';

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
    } catch (error) {
      console.error('Bildirim butonları güncellenirken hata:', error);
    }
  }

  /**
   * Bildirim gönder
   * @param {Object} config - Bildirim yapılandırması
   * @returns {Promise<boolean>} - İşlem başarılı oldu mu
   */
  async send(config) {
    const now = Date.now();
    
    // Eğer işlem devam ediyorsa veya cooldown süresi dolmadıysa çık
    if (this.isProcessing || (now - this.lastNotificationTime) < this.cooldownPeriod) {
      console.log('Bildirim engellendi: İşlem devam ediyor veya cooldown süresi dolmadı');
      return false;
    }
    
    try {
      this.isProcessing = true;
      this.lastNotificationTime = now;
      
      // Platform bazlı düzenlemeler (iOS için ses desteği)
      if (Platform.OS === 'ios' && !config.content.sound) {
        config.content.sound = 'default';
      }

      // Bildirim ID'si oluştur ve saklayacağımız bir referans oluştur
      const notificationId = await Notifications.scheduleNotificationAsync(config);
      
      // Bildirimin işlenebilmesi için kısa bir süre bekle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return !!notificationId;
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
      if (!this.isSetup) {
        await this.setupNotifications(currentLanguage);
      }
      
      // Dil değiştiyse, bildirim butonlarını güncelle
      if (this.currentLanguage !== currentLanguage) {
        await this.updateNotificationButtons(currentLanguage);
        this.currentLanguage = currentLanguage;
      }
      
      // Eğer son 5 saniye içinde aynı içerikle bildirim gönderildiyse çık
      const now = Date.now();
      const notificationKey = `${currentLanguage}-${selectedItems?.join(',') || 'empty'}`;
      const lastSentTime = this.notificationHistory.get(notificationKey);
      
      if (lastSentTime && now - lastSentTime < 5000) {
        console.log('Aynı bildirim son 5 saniye içinde gönderildi, tekrar gönderilmiyor.');
        return false;
      }

      // Eğer selectedItems boş veya geçersizse, varsayılan metin göster
      let itemsList;
      if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
        itemsList = strings?.[currentLanguage]?.alerts?.noItems || "Seçili eşya yok";
      } else {
        itemsList = selectedItems.join('\n• ');
      }

      // Bildirim gönder (Güvenlik kontrolü ile)
      const result = await this.send({
        content: {
          title: strings?.[currentLanguage]?.alerts?.warning || "Uyarı",
          body: `${strings?.[currentLanguage]?.alerts?.items || "Eşyalarınız:"}\n• ${itemsList}`,
          sound: 'default',
          priority: 'high',
          categoryIdentifier: 'items',
          vibrate: [1000, 500, 1000], // Android için titreşim
          data: { 
            type: NOTIFICATION_TYPES.REMINDER,
            language: currentLanguage, // Dil bilgisini data içinde saklayalım
            timestamp: now,
            items: selectedItems || []
          }
        },
        trigger: null
      });

      // Başarılı gönderilen bildirimleri geçmişe ekle
      if (result) {
        this.notificationHistory.set(notificationKey, now);
      }
      
      return result;
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
    this.isProcessing = false;
  }
  
  /**
   * Tüm bekleyen bildirimleri iptal et
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Tüm bildirimler iptal edildi');
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