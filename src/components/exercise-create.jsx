import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import ThemedTextInput from './themed-textInput';

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
    setName('');
    setTargetMuscle('');
    setExType('');
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
          <ThemedView style={{alignItems: 'center', backgroundColor: 'transparent', marginBottom: 20}}>
            <ThemedText heading style={{ fontFamily: 'Orbitron', fontWeight: '500'}}>
              Create Exercise
            </ThemedText>
          </ThemedView>

          {/* Name */}
          <ThemedText style={styles.label}>Name</ThemedText>
          <View
              style={{
                width: 50, // adjust to match text width
                height: 2,
                backgroundColor: theme.accent,
                borderRadius: 1,
                marginBottom: 8,
              }}
            />
          <ThemedTextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Bench Press"
            placeholderTextColor={theme.textSecondary}
            style={styles.input}
          />

          <Spacer height={12} />

          {/* Target Muscle dropdown */}
          <ThemedText style={styles.label}>Target Muscle</ThemedText>
          <View
              style={{
                width: 110, // adjust to match text width
                height: 2,
                backgroundColor: theme.accent,
                borderRadius: 1,
                marginBottom: 8,
              }}
            />
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
          <ThemedText style={styles.label}>Equipment</ThemedText>
          {/* Underline */}
            <View
              style={{
                width: 85, // adjust to match text width
                height: 2,
                backgroundColor: theme.accent,
                borderRadius: 1,
                marginBottom: 8,
              }}
            />
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
    backgroundColor: 'rgba(12, 11, 11, 0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#212121',
  },
  label: {
    marginBottom: 2,
    fontWeight: '600',
    color: theme.text,
  },
  input: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 16,
    color: theme.text,
    backgroundColor: theme.background,
  },
  select: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  menu: {
    maxHeight: 200,
    marginTop: 6,
    borderRadius: 2,
    borderColor: theme.secondary,
    borderWidth: 2,
    backgroundColor: theme.background,
  },
  menuItem: {
    marginHorizontal: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});