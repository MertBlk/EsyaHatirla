import { StyleSheet } from 'react-native';

// Tema renkleri
const colors = {
  dark: {
    background: '#1C1C1E',
    surface: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    border: '#3A3A3C',
    modalBackground: 'rgba(0,0,0,0.8)'
  },
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E5E5EA',
    modalBackground: 'rgba(255,255,255,0.9)'
  },
  common: {
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    shadow: '#000000'
  }
};

// Dinamik stiller
export const createDynamicStyles = (isDarkMode) => ({
  container: {
    backgroundColor: isDarkMode ? colors.dark.background : colors.light.background
  },
  safeArea: {
    backgroundColor: isDarkMode ? colors.dark.background : colors.light.background
  },
  modalContainer: {
    backgroundColor: isDarkMode ? colors.dark.modalBackground : colors.light.modalBackground
  },
  modalContent: {
    backgroundColor: isDarkMode ? colors.dark.surface : colors.light.surface
  },
  locationItem: {
    backgroundColor: isDarkMode ? colors.dark.surface : colors.light.surface,
    borderColor: isDarkMode ? colors.dark.border : colors.light.border
  },
  locationItemText: {
    color: isDarkMode ? colors.dark.text : colors.light.text
  },
  checklistItem: {
    backgroundColor: isDarkMode ? colors.dark.surface : colors.light.surface,
    borderColor: isDarkMode ? colors.dark.border : colors.light.border
  },
  itemContainer: {
    backgroundColor: isDarkMode ? colors.dark.surface : colors.light.surface,
    borderColor: isDarkMode ? colors.dark.border : colors.light.border
  },
  text: {
    color: isDarkMode ? colors.dark.text : colors.light.text
  },
  categoryButton: {
    backgroundColor: isDarkMode ? colors.dark.surface : colors.light.surface,
    borderColor: isDarkMode ? colors.dark.border : colors.light.border
  },
  categoryText: {
    color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary
  },
  selectedCategory: {
    backgroundColor: colors.common.primary,
    borderColor: colors.common.primary
  },
  statsCard: {
    backgroundColor: isDarkMode ? colors.dark.surface : colors.light.surface,
    borderColor: isDarkMode ? colors.dark.border : colors.light.border
  },
  selectedItem: {
    backgroundColor: isDarkMode ? colors.dark.background : colors.light.surface,
    borderWidth: 2,
    borderColor: colors.common.success
  },
  modalBackground: {
    backgroundColor: isDarkMode ? colors.dark.modalBackground : colors.light.modalBackground
  }
});

// Sabit stiller (StyleSheet.create içindeki tüm mevcut stiller aynen korundu)
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  container: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: colors.dark.background
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: colors.dark.text,
    marginBottom: 12,
  },
  categoryWrapper: {
    height: 40,
    marginBottom:6,
  },
  categoryScrollContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  categoryContainer: {
    height: 40,
    marginBottom: 8,
    paddingVertical: 0,    
  },
  categoryButton: {
    width: 100,
    height: 36,
    marginRight: 8,
    borderRadius: 18,
    backgroundColor: colors.dark.surface, // Koyu kart rengi
    borderWidth: 1,
    borderColor: colors.dark.border, // Koyu kenarlık
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.common.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategoryButton: {
    backgroundColor: colors.common.primary,
    borderColor: colors.common.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark.textSecondary, // Açık gri yazı
  },
  selectedCategoryText: {
    color: colors.dark.text,
    fontWeight: '600',
  },

  // Eşya listesi stil güncellemeleri
  itemContainer: { 
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "space-between", 
    padding: 18,
    borderRadius: 12,
    backgroundColor: colors.dark.surface, // Koyu kart rengi
    marginBottom: 10,
    shadowColor: colors.common.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedItem: { 
    backgroundColor: colors.dark.background, // Koyu arka plan
    borderWidth: 1,
    borderColor: colors.common.success, // iOS yeşil renk
  },
  
  itemText: { 
    fontSize: 16,
    fontWeight: "500",
    color: colors.dark.text // Beyaz yazı
  },
  selectedItemText: { // Yeni stil ekle
    color: colors.common.success, // Seçili durumda yeşil yazı
    fontWeight: "600"
  },
  checkIcon: { 
    fontSize: 20, 
    color: "#4CAF50"
  },

  // Input ve buton stil güncellemeleri
  input: { 
    backgroundColor: colors.light.background,
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 12, 
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    shadowColor: colors.common.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  homeButton: { 
    backgroundColor: colors.common.success, 
    padding: 16,
    marginTop: 8,
    marginBottom: 10, 
    borderRadius: 40,
    shadowColor: colors.common.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: { 
    color: colors.dark.text, 
    fontSize: 16, 
    
    fontWeight: "600",
    textAlign: "center"
  },
  addButtonText: { 
    color: colors.dark.text, 
    fontSize: 16, 
    fontWeight: "600",
    textAlign: "center"
  },
  buttonModeText: {
    color: colors.dark.text,
    height: 32,
    fontSize: 24,
    textAlign: "center",
  },

  // Modal stil güncellemeleri
  modalContainer: {
    flex: 1,
    backgroundColor: colors.dark.modalBackground, // Koyu modal arka planı
    justifyContent: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.common.error,
    textAlign: 'center',
    marginBottom: 24,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.dark.surface, // Koyu kart rengi
    borderRadius: 12,
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: colors.common.success,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },

  // Stil eklemeleri
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.dark.surface, // Koyu kart rengi
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    shadowColor: colors.common.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center', 
    
    marginBottom: 16,
    shadowColor: colors.common.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A84FF', // iOS mavi
  },
  statLabel: {
    fontSize: 14,
    color: colors.dark.textSecondary, // Açık gri yazı
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.dark.border, // Koyu ayırıcı çizgi
    marginHorizontal: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.dark.modalBackground, // Koyu yükleme arka planı
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40, // Genişliği küçült
    height: 40, // Yüksekliği küçült
    borderRadius: 20, // Tam yuvarlak için width/2
    backgroundColor: colors.common.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.common.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1, // Diğer elementlerin üzerinde görünmesi için
  },
  buttonModeText: {
    color: colors.dark.text,
    fontSize: 20, // Emoji boyutunu küçült
    textAlign: "center",
  },
  testButton: {
    backgroundColor: colors.common.primary,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 40,
    shadowColor: colors.common.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentLocationContainer: {
    flex: 1,
    padding: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationPickerButton: {
    position: 'absolute',
    top: 10,
    right: 60, // ThemeToggle'dan 50 + 10 pixel uzakta
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.common.warning, // Turuncu renk
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.common.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.dark.modalBackground,
  },
  locationModalContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  locationModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.common.warning,
    textAlign: 'center',
    marginBottom: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  locationItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.dark.text,
  },
  closeButton: {
    backgroundColor: colors.common.warning,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    gap: 8, // Butonlar arası boşluk
  },
  themeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8, // Sol boşluk ekle
  },
  
  buttonModeText: {
    fontSize: 20,
  },
});

export default {
  colors,
  createDynamicStyles,
  styles
};