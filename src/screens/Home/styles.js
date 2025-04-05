import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // Ana container stiller
  safeArea: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  container: { 
    flex: 1, 
    padding: 10, 
    backgroundColor: "#1C1C1E"
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#FFFFFF",
    marginBottom: 12,
  },
  categoryWrapper: {
    height: 50,
    marginVertical: 12,
  },
  categoryScrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  categoryContainer: {
    height: 40,
    marginBottom: 8,
    paddingVertical: 0,    
  },
  categoryButton: {
    height: 40,
    paddingHorizontal: 18,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#2C2C2E', // Koyu tema için değişti
    borderWidth: 1.2,
    borderColor: '#3A3A3C', // Koyu tema için border rengi
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    shadowOpacity: 0.2,
    transform: [{ scale: 1.02 }],
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: '#EBEBF5', // Koyu tema için metin rengi
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Eşya listesi stil güncellemeleri
  itemContainer: { 
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "space-between", 
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#2C2C2E", // Koyu tema için değişti
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedItem: { 
    backgroundColor: "#1C1C1E", // Koyu arka plan
    borderWidth: 1,
    borderColor: "#34C759", // iOS yeşil renk
  },
  
  itemText: { 
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF" // Koyu tema için metin rengi
  },
  selectedItemText: { // Yeni stil ekle
    color: "#34C759", // Seçili durumda yeşil yazı
    fontWeight: "600"
  },
  checkIcon: { 
    fontSize: 20, 
    color: "#4CAF50"
  },

  // Input ve buton stil güncellemeleri
  input: { 
    backgroundColor: "#fff",
    borderWidth: 1, 
    borderColor: "#E0E0E0", 
    borderRadius: 12, 
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  homeButton: { 
    backgroundColor: "#34C759", 
    padding: 16,
    marginTop: 8,
    marginBottom: 10, 
    borderRadius: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    
    fontWeight: "600",
    textAlign: "center"
  },
  addButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600",
    textAlign: "center"
  },
  buttonModeText: {
    color: "#fff",
    height: 32,
    fontSize: 24,
    textAlign: "center",
  },

  // Modal stil güncellemeleri
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)', // Koyu modal arka planı
    justifyContent: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 24,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2E', // Koyu kart rengi
    borderRadius: 12,
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },

  // Stil eklemeleri
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E', // Koyu kart rengi
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center', 
    
    marginBottom: 16,
    shadowColor: "#000",
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
    color: '#EBEBF5', // Açık gri yazı
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#3A3A3C', // Koyu ayırıcı çizgi
    marginHorizontal: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)', // Koyu yükleme arka planı
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
    backgroundColor: "#34C759",
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
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
    color: "#fff",
    fontSize: 20, // Emoji boyutunu küçült
    textAlign: "center",
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 40,
    shadowColor: "#000",
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
    backgroundColor: "#FF9500", // Turuncu renk
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
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
    color: '#FF9500',
    textAlign: 'center',
    marginBottom: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 12,
  },
  locationItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#FF9500',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
});

// Ortak gölge stili
const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.2,
  shadowRadius: 3.84,
  elevation: 5,
};
