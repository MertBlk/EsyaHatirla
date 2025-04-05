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
    textAlign: 'center' // Başlığı ortala
  },

  // Kategori stiller
  categoryWrapper: {
    height: 40,
    marginBottom: 6,
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
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EBEBF5',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Stats card stiller
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center', // İçerikleri dikeyde ortala
    justifyContent: 'center', // İçerikleri yatayda ortala
  },
  statItem: {
    flex: 1,
    alignItems: 'center', // Stat içeriklerini ortala
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A84FF',
    textAlign: 'center' // Sayıları ortala
  },
  statLabel: {
    fontSize: 14,
    color: '#EBEBF5',
    marginTop: 4,
    textAlign: 'center' // Etiketleri ortala
  },
  statDivider: {
    width: 1,
    backgroundColor: '#3A3A3C',
    marginHorizontal: 16,
  },

  // Liste item stiller
  itemContainer: { 
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "space-between", 
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
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
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "#34C759",
  },
  itemText: { 
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF"
  },
  selectedItemText: {
    color: "#34C759",
    fontWeight: "600"
  },
  checkIcon: { 
    fontSize: 20, 
    color: "#4CAF50"
  },

  // Buton stiller
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
  testButton: {
    backgroundColor: '#007AFF',
    padding: 16,
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
    textAlign: "center" // Buton yazılarını ortala
  },

  // Theme toggle stiller
  themeToggleButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
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
    zIndex: 1,
  },
  buttonModeText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
  },

  // Modal stiller
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    backgroundColor: '#2C2C2E',
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

  // Konum stiller
  locationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center', // Konum başlığını ortala
    color: '#FFFFFF',
    letterSpacing: 0.3, // Harfler arası mesafe
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center', // Konum adını ortala
    color: '#EBEBF5',
    letterSpacing: 0.2,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    marginBottom: 6,
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
  locationModalContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  locationModalTitle: {
    fontSize: 20, // Başlık boyutunu küçült
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
    color: '#FF9500',
  },

  // LocationCard stilleri
  currentLocationContainer: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    Height: 10, // Yüksekliği sınırla
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  selectedLocationItem: {
    borderColor: '#34C759',
    borderWidth: 1.5, // Border kalınlığını azalt
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 1, // Gölge boyutunu azalt
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  emptyText: {
    fontSize:16,
    textAlign: 'center',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#FF9500',
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center' // Buton yazılarını ortala
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
