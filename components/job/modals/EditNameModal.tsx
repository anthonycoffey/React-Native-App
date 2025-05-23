import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, TextInput, Alert, View } from 'react-native';
import { View as ThemedView } from '@/components/Themed';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import { CardTitle } from '@/components/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getInputBackgroundColor,
  getTextColor,
  getBorderColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';
import globalStyles from '@/styles/globalStyles';

type Props = {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => Promise<void>;
};

export default function EditNameModal({
  visible,
  currentName,
  onClose,
  onSave,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const bgColor = getInputBackgroundColor(colorScheme);

  useEffect(() => {
    setName(currentName);
  }, [currentName, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      await onSave(name.trim());
      Alert.alert('Success', 'Customer name updated successfully.');
      onClose();
    } catch (error) {
      console.log('Failed to update name:', error);
      Alert.alert('Error', 'Failed to update customer name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const themedInputStyle = [
    globalStyles.themedFormInput,
    {
      backgroundColor: bgColor,
      color: getTextColor(colorScheme),
      borderColor: getBorderColor(colorScheme),
      marginBottom: 20,
    },
  ];

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <ThemedView style={[styles.modalView, { backgroundColor: bgColor }]}>
          <CardTitle
            style={[styles.modalText, { color: getTextColor(colorScheme) }]}
          >
            Edit Customer Name
          </CardTitle>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder='Enter customer name'
            placeholderTextColor={getPlaceholderTextColor(colorScheme)}
            style={themedInputStyle}
            editable={!loading}
          />
          <View style={[styles.buttonContainer, { backgroundColor: bgColor }]}>
            <OutlinedButton
              title='Cancel'
              onPress={onClose}
              disabled={loading}
              style={styles.button}
            />
            <PrimaryButton
              title={loading ? 'Saving...' : 'Save'}
              onPress={handleSave}
              disabled={loading}
              style={styles.button}
            />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
