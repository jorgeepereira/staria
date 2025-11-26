import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, useColorScheme } from 'react-native';

import HalfScreenModal from '@/components/half-screen-modal';
import Spacer from '@/components/spacer';
import ThemedText from '@/components/themed-text';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { createSplit } from '@/services/splits';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function SplitCreateModal({ visible, onClose, onSplitCreated }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a split name');
      return;
    }

    try {
      setSaving(true);
      await createSplit(user.$id, name.trim());
      onSplitCreated?.();
      handleClose();
    } catch (error) {
      console.error('Failed to save split', error);
      alert('Failed to save split');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <HalfScreenModal
      visible={visible}
      onClose={handleClose}
      height="62%"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose}>
            <MaterialCommunityIcons name="close" size={24} color={theme.error} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>New Split</ThemedText>
          <Pressable onPress={handleSave} disabled={saving}>
            <Ionicons name="checkmark-done-sharp" size={24} color={theme.success} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.nameContainer}>
            <ThemedText style={styles.label}>Split Name</ThemedText>
            <TextInput
              style={styles.nameInput}
              placeholder="eg. PPL, Bro Split, etc."
              placeholderTextColor={theme.textSecondary}
              returnKeyType="done"
              value={name}
              onChangeText={setName}
              maxLength={20}
              autoFocus
            />
          </View>
          <Spacer height={20} />
        </View>
      </View>
    </HalfScreenModal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Orbitron',
  },
  content: {
    // padding: 16, // HalfScreenModal already has padding
  },
  nameContainer: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Orbitron',
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  nameInput: {
    fontWeight: '800',
    fontSize: 24,
    color: theme.text,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
});
