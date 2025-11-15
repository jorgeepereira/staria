import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useAuth } from '@/contexts/AuthContext';
import { createExercise, getExercisesByUserId } from '@/services/exercises';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme
} from 'react-native';
import ExerciseCreate from './exercise-create';
import ExerciseTypeChip from './exercise-type-chip';
import TargetMuscleChip from './target-muscle-chip';

/**
 * ExercisePicker
 * - Shows user's exercise library
 * - Allows creating a new exercise (adds to library)
 * - Selecting an exercise triggers onSelect(exercise)
 */
const ExercisePicker = ({
  visible,
  userId,
  onSelect,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false); // reused for modal action 

  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [filter, setFilter] = useState('');

  const { user } = useAuth();

  // Load user exercises when modal opens
  useEffect(() => {
    if (!visible || !userId) return;
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const list = await getExercisesByUserId(userId);
        if (active) setExercises(list);
      } catch (e) {
        console.warn('exercise picker load failed', e);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [visible, userId]);

  // Create from sub-modal
  const handleCreateFromModal = useCallback(async ({ name, targetMuscle, type }) => {
    setCreating(true);
    try {
      const ex = await createExercise({userId: user.$id, name, targetMuscle, type });
      setExercises(prev => [...prev, ex]);
      setShowCreate(false);
      // Do not auto-select; list updates and user can tap it. Uncomment to auto-select:
      // onSelect?.(ex); onClose?.();
    } catch (e) {
      console.warn('create exercise failed', e);
    } finally {
      setCreating(false);
    }
  }, [userId, onSelect, onClose]);

  const filtered = filter
    ? exercises.filter(e => e.name.toLowerCase().includes(filter.toLowerCase()))
    : exercises;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.headerRow}>

          <ThemedText heading>
            Your Exercises
          </ThemedText>

          <ThemedButton
            style={[styles.smallBtn, { backgroundColor: theme.accent }]}
            onPress={() => setShowCreate(true)}
          >
            <ThemedText style={{ fontWeight: '700' }}>New</ThemedText>
          </ThemedButton>

        </ThemedView>

        <TextInput
          placeholder="Search..."
          value={filter}
          onChangeText={setFilter}
          style={styles.input}
          placeholderTextColor={theme.textSecondary}
        />

        <Spacer height={12} />

        {loading && (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
        )}


        <ScrollView style={styles.scrollView}>

          {!loading && filtered.length === 0 && (
          <ThemedText secondary>No exercises yet.</ThemedText>
          )}

          {filtered.map(ex => (
            <Pressable
              key={ex.$id}
              style={({ pressed }) => [
                styles.exerciseItem,
                {
                  backgroundColor: pressed
                    ? theme.secondary
                    : theme.background,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => {
                onSelect?.(ex);
                onClose?.();
              }}
            >
              <ThemedView style={styles.exerciseNameContainer}>
                <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>{ex.name}</ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.exerciseChips}>
                <TargetMuscleChip group={ex.targetMuscle} compact />
                <ExerciseTypeChip type={ex.type} compact />
              </ThemedView>
            </Pressable>
          ))}
        </ScrollView>

        <Spacer height={12} />

        <ThemedButton
          style={[styles.closeBtn, { backgroundColor: theme.error }]}
          onPress={onClose}
        >
            <ThemedText style={{ fontWeight: '800' }}>Close</ThemedText>
        </ThemedButton>
      </ThemedView>

      {/* Nested, small centered modal for creating an exercise */}
      <ExerciseCreate
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreateFromModal}
        loading={creating}
      />
      
    </Modal>
  );
};

export default ExercisePicker;

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      alignItems: 'stretch',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    scrollView: {
      flex: 1,
      width: '100%',
      paddingTop: 12,
    },
    input: {
      backgroundColor: theme.background,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
    },
    smallBtn: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      padding: 14,
      marginBottom: 8,
    },
    exerciseNameContainer: {
      backgroundColor: 'transparent',
      flex: 1,
      paddingRight: 12,
    },
    exerciseChips: {
      backgroundColor: 'transparent',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 8,
    },
    closeBtn: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });