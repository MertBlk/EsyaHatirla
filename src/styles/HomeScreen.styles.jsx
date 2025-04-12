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
    warning: 'red',
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
  },
  languageButton: {
    backgroundColor: isDarkMode ? colors.dark.surface : colors.light.surface,
    padding: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center'
  },
  languageButtonText: {
    color: isDarkMode ? colors.dark.text : colors.light.text,
    fontSize: 16
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
    backgroundColor: isDarkMode ? colors.dark.surface : colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? colors.dark.border : colors.light.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: colors.common.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 12,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.common.primary,
  },
  navButtonIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
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
    textAlign: "center",  
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
 
  themeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10, // Başlık yazısının altına gelecek şekilde
    right: 10, // Sağ üst köşe
    zIndex: 1,
  },
  buttonModeText: {
    fontSize: 20,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0, // Başlık yazısının altına gelecek şekilde
    right: 15, // Sağ üst köşe
    zIndex: 1,
  },
  settingsModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignSelf: 'center',
    marginTop: '20%',
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },

  // Alt menü butonları için stil
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
    backgroundColor: colors.dark.surface, // Koyu kart rengi
    borderTopWidth: 1,
    borderTopColor: colors.dark.border, // Koyu kenarlık
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: colors.common.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 12,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.common.primary,
  },
  navButtonIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // styles.js içine ekleyin
modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
languageModalContainer: {
  width: '90%',
  maxHeight: '100%',
  borderRadius: 12,
  padding: 16,
  alignItems: 'center',
},
languageListItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginVertical: 4,
  width: '100%',
  minWidth: 250,
},
selectedLanguageItem: {
  backgroundColor: 'rgba(0, 122, 255, 0.1)',
},
languageItemFlag: {
  fontSize: 24,
  marginRight: 12,
},
languageItemText: {
  fontSize: 16,
  flex: 1,
  flexWrap: 'nowrap',
  flexShrink: 1,
  marginRight: 8,
},
selectedLanguageText: {
  fontWeight: 'bold',
},
checkmarkText: {
  fontSize: 16,
  color: '#007AFF',
  marginLeft: 8,
},
languageSelector: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 8,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#E5E5EA',
},
languageSelectText: {
  marginRight: 8,
},
dropdownArrow: {
  fontSize: 10,
  color: '#8E8E93',
},
});

export default {
  colors,
  createDynamicStyles,
  styles
};