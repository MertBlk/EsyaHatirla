import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert, Vibration } from 'react-native';

export const useNotifications = () => {
  useEffect(() => {
    const configureNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Hatası', 'Bildirim izni verilmedi');
        return;
      }

      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          priority: 'high'
        }),
      });
    };
    
    configureNotifications();
  }, []);

  const sendNotification = async (title, body, data = {}) => {
    try {
      Vibration.vibrate([500, 200, 500]);
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          priority: 'high',
        },
        trigger: null
      });
    } catch (error) {
      console.error('Bildirim hatası:', error);
    }
  };

  const sendLocationAlert = async (selectedItems) => {
    const itemsList = selectedItems?.length > 0 
      ? selectedItems.map(item => item.split(' ')[1]).join('\n• ')
      : 'Hiç eşya seçmedin!';

    await sendNotification(
      "⚠️ Dikkat! Evden Uzaklaşıyorsun!",
      selectedItems?.length > 0
        ? `Seçili Eşyaların:\n• ${itemsList}`
        : 'Hiç eşya seçmedin! Kontrol et!'
    );
  };

  return {
    sendNotification,
    sendLocationAlert
  };
};
export default useNotifications;