import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useMemo, useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
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
    'Barbell', 'Machine', 'Cable', 'Dumbbell', 'Bodyweight', 'Smith', 'Other'
  ], []);

  const [name, setName] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
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
            <ThemedText heading style={{ fontWeight: 'bold', fontSize: 24}}>
              Create Exercise
            </ThemedText>
          </ThemedView>

          {/* Name */}
          <ThemedText style={styles.label}>Name</ThemedText>
          <ThemedTextInput
            value={name}
            onChangeText={setName}
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            placeholder="e.g., Bench Press"
            enterKeyType="done"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, isNameFocused && { borderColor: theme.text }]}
          />

          <Spacer height={16} />

          {/* Target Muscle dropdown */}
          <ThemedText style={styles.label}>Target Muscle</ThemedText>
          <Pressable
            onPress={() => { Keyboard.dismiss(); setMuscleOpen(o => !o); setTypeOpen(false); }}
            style={[styles.select, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}
          >
            <ThemedText secondary={!targetMuscle}>{targetMuscle || 'Select Muscle'}</ThemedText>
          </Pressable>
          {muscleOpen && (
            <ScrollView style={styles.menu}>
              {MUSCLE_OPTIONS.map(opt => (
                <Pressable
                  key={opt}
                  onPress={() => { setTargetMuscle(opt); setMuscleOpen(false); }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { backgroundColor: pressed ? theme.background : theme.cardBackground, borderColor: theme.border },
                  ]}
                >
                  <ThemedText>{opt}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <Spacer height={16} />

          {/* Type dropdown */}
          <ThemedText style={styles.label}>Equipment</ThemedText>
          <Pressable
            onPress={() => { Keyboard.dismiss(); setTypeOpen(o => !o); setMuscleOpen(false); }}
            style={[styles.select, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}
          >
            <ThemedText secondary={!exType}>{exType || 'Select Equipment'}</ThemedText>
          </Pressable>
          {typeOpen && (
            <ScrollView style={styles.menu}>
              {TYPE_OPTIONS.map(opt => (
                <Pressable
                  key={opt}
                  onPress={() => { setExType(opt); setTypeOpen(false); }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { backgroundColor: pressed ? theme.background : theme.cardBackground, borderColor: theme.border },
                  ]}
                >
                  <ThemedText>{opt}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <Spacer height={24} />

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <ThemedButton
              style={styles.btnJustText}
              onPress={onClose}
            >
              <ThemedText style={{ color: theme.error, fontWeight: '600' }}>Cancel</ThemedText>
            </ThemedButton>

            <Pressable
              style={({pressed}) => [
                styles.btnCreate, 
                pressed && styles.buttonPressed,
                (!canCreate || loading) && styles.btnDisabled
              ]}
              disabled={!canCreate || loading}
              onPress={submit}
            >
              <ThemedText style={{ color: theme.accent, fontWeight: 'bold' }}>
                {loading ? 'Creating...' : 'Create'}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    padding: 20,
    backgroundColor: theme.background,
    borderWidth: 0.5,
    borderColor: theme.border,
  },
  label: {
    marginBottom: 2,
    fontWeight: '600',
    color: theme.text,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 4,
    paddingHorizontal: 12,
    marginTop: 4,
    paddingVertical: 12,
    color: theme.text,
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
  },
  select: {
    marginTop: 4,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  menu: {
    maxHeight: 200,
    marginTop: 6,
    borderRadius: 8,
    borderColor: theme.text,
    borderWidth: 1,
    backgroundColor: theme.cardBackground,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  btnCreate: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.accent,
    backgroundColor: theme.accent + '20',
  },
  btnDisabled: {
    opacity: 0.5,
    borderColor: theme.accent,
    backgroundColor: theme.cardBackground,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  btnJustText: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});