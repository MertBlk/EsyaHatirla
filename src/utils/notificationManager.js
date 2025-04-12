import * as Notifications from 'expo-notifications';

// Bildirim yönetimi için sınıf
class NotificationManager {
  constructor() {
    this.isProcessing = false;
    this.lastNotificationTime = 0;
    this.cooldownPeriod = 2000; // 2 saniye bekleme süresi
    this.notificationHistory = new Map(); // Bildirim geçmişini saklayacak map
  }

  async setupNotifications(currentLanguage) {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        return false;
      }

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
      return true;
    } catch (error) {
      console.error('Bildirim ayarları hatası:', error);
      return false;
    }
  }

  async updateNotificationButtons(currentLanguage) {
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
  }

  async send(config) {
    const now = Date.now();
    
    // Eğer işlem devam ediyorsa veya cooldown süresi dolmadıysa çık
    if (this.isProcessing || (now - this.lastNotificationTime) < this.cooldownPeriod) {
      console.log('Bildirim engellendi: İşlem devam ediyor veya cooldown süresi dolmadı');
      return;
    }
    
    try {
      this.isProcessing = true;
      this.lastNotificationTime = now;
      
      await Notifications.scheduleNotificationAsync(config);
      // Bildirimin işlenmesi için biraz bekleyelim
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Bildirim hatası:', error);
      return false;
    } finally {
      this.isProcessing = false;
    }
  }

  async sendAlert(strings, currentLanguage, selectedItems) {
    try {
      // Eğer son 5 saniye içinde aynı içerikle bildirim gönderildiyse çık
      const now = Date.now();
      const notificationKey = `${currentLanguage}-${selectedItems.join(',')}`;
      const lastSentTime = this.notificationHistory.get(notificationKey);
      
      if (lastSentTime && now - lastSentTime < 5000) {
        console.log('Aynı bildirim son 5 saniye içinde gönderildi, tekrar gönderilmiyor.');
        return false;
      }

      const itemsList = selectedItems.length > 0 
        ? `${selectedItems.join('\n• ')}` 
        : strings[currentLanguage].alerts.noItems;

      // Bildirim gönder
      const result = await this.send({
        content: {
          title: strings[currentLanguage].alerts.warning,
          body: `${strings[currentLanguage].alerts.items}\n• ${itemsList}`,
          sound: 'default',
          priority: 'high',
          categoryIdentifier: 'items',
          data: { 
            type: 'reminder',
            language: currentLanguage // Dil bilgisini data içinde saklayalım
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
}

export default new NotificationManager();