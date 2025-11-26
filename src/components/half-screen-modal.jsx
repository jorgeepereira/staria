import { darkTheme, lightTheme } from '@/constants/theme.js';
import { Modal, StyleSheet, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

const HalfScreenModal = ({ visible, onClose, children, height = '50%' }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  return (
    <Modal 
      animationType='slide'
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1, width: '100%' }} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalContent, { height }]}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default HalfScreenModal;

const getStyles = (theme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.cardBackground,
    padding: 16,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
});