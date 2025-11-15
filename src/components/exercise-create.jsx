import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, useColorScheme, View } from 'react-native';

/**
 * Small centered modal to create an Exercise.
 * Props:
 *  - visible: boolean
 *  - onClose: () => void
 *  - onCreate: ({ name, targetMuscle, type }) => Promise<void> | void
 *  - loading: boolean (optional) to show "Creating..." state
 *
 * Dropdowns are simple press-to-toggle lists; replace options with your real ones later.
 */
export default function ExerciseCreate({ visible, onClose, onCreate, loading = false }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const MUSCLE_OPTIONS = useMemo(() => [
    'Abs', 'Back', 'Biceps', 'Chest', 'Forearms', 'Glutes', 'Quads', 'Triceps', 'Calves', 'Hamstrings', 'Front Delts', 'Side Delts', 'Rear Delts'
  ], []);
  const TYPE_OPTIONS = useMemo(() => [
    'Barbell', 'Machine', 'Cable', 'Dumbbell', 'Bodyweight', 'Other'
  ], []);

  const [name, setName] = useState('');
  const [muscleOpen, setMuscleOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [targetMuscle, setTargetMuscle] = useState('');
  const [exType, setExType] = useState('');

  const canCreate = name.trim().length > 0;

  const submit = async () => {
    if (!canCreate) return;
    await onCreate?.({ name: name.trim(), targetMuscle: targetMuscle.toLowerCase().trim(), type: exType.toLowerCase().trim() });
    // Keep fields; parent decides whether to keep modal open or not.
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <View style={styles.backdrop}>
        {/* Card */}
        <ThemedView style={styles.card}>
          <ThemedText heading style={{ marginBottom: 10 }}>Create Exercise</ThemedText>

          {/* Name */}
          <ThemedText style={{ marginBottom: 6 }}>Name</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Bench Press"
            placeholderTextColor={theme.textSecondary}
            style={styles.input}
          />

          <Spacer height={12} />

          {/* Target Muscle dropdown */}
          <ThemedText style={{ marginBottom: 6 }}>Target Muscle</ThemedText>
          <Pressable
            onPress={() => { setMuscleOpen(o => !o); setTypeOpen(false); }}
            style={[styles.select, { borderColor: theme.border, backgroundColor: theme.background }]}
          >
            <ThemedText secondary={!targetMuscle}>{targetMuscle || 'Select target muscle'}</ThemedText>
          </Pressable>
          {muscleOpen && (
            <ScrollView style={styles.menu}>
              {MUSCLE_OPTIONS.map(opt => (
                <Pressable
                  key={opt}
                  onPress={() => { setTargetMuscle(opt); setMuscleOpen(false); }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { backgroundColor: pressed ? theme.secondary : theme.background, borderColor: theme.border },
                  ]}
                >
                  <ThemedText>{opt}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <Spacer height={12} />

          {/* Type dropdown */}
          <ThemedText style={{ marginBottom: 6 }}>Type</ThemedText>
          <Pressable
            onPress={() => { setTypeOpen(o => !o); setMuscleOpen(false); }}
            style={[styles.select, { borderColor: theme.border, backgroundColor: theme.background }]}
          >
            <ThemedText secondary={!exType}>{exType || 'Select type'}</ThemedText>
          </Pressable>
          {typeOpen && (
            <ScrollView style={styles.menu}>
              {TYPE_OPTIONS.map(opt => (
                <Pressable
                  key={opt}
                  onPress={() => { setExType(opt); setTypeOpen(false); }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { backgroundColor: pressed ? theme.secondary : theme.background, borderColor: theme.border },
                  ]}
                >
                  <ThemedText>{opt}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <Spacer height={16} />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <ThemedButton
              style={[styles.btn, { backgroundColor: theme.error, flex: 1 }]}
              onPress={onClose}
            >
              <ThemedText style={{ fontWeight: '800' }}>Cancel</ThemedText>
            </ThemedButton>
            <ThemedButton
              style={[styles.btn, { backgroundColor: theme.accent, flex: 1, opacity: canCreate && !loading ? 1 : 0.6 }]}
              disabled={!canCreate || loading}
              onPress={submit}
            >
              <ThemedText style={{ fontWeight: '800' }}>
                {loading ? 'Creating...' : 'Create'}
              </ThemedText>
            </ThemedButton>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#0008',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.text,
    backgroundColor: theme.background,
  },
  select: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  menu: {
    maxHeight: 160,
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: theme.border,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});