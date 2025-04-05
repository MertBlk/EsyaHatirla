import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import CheckBox from '@react-native-community/checkbox';

export const WarningModal = ({
  isModalVisible,
  setModalVisible,
  selectedItems,
  styles,
  dynamicStyles
}) => {
  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={[styles.modalContainer, dynamicStyles.modalContainer]}>
        <Text style={[styles.modalTitle, { color: '#FF3B30' }]}>
          <Text>⚠️</Text>
          <Text> Eşya Kontrol Listesi</Text>
        </Text>

        <ScrollView style={{ flex: 1 }}>
          {selectedItems.map(item => (
            <View 
              key={item} 
              style={[styles.checklistItem, dynamicStyles.surface]}
            >
              <Text style={[styles.itemText, dynamicStyles.text]}>
                {item}
              </Text>
              <CheckBox
                value={false}
                onValueChange={() => {}}
                tintColors={{ 
                  true: '#34C759', 
                  false: dynamicStyles.text.color 
                }}
                style={styles.checkbox}
              />
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={[styles.confirmButton, { backgroundColor: '#34C759' }]}
          onPress={() => setModalVisible(false)}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            Kontrol Ettim
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};