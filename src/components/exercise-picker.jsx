import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useAuth } from '@/contexts/AuthContext';
import { createExercise, deleteExercise, getExercisesByUserId } from '@/services/exercises';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
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

  const handleDelete = useCallback(async (ex, rowMap) => {
    // Optional confirm
    Alert.alert('Delete exercise', `Delete "${ex.name}"?`, [
      { text: 'Cancel', style: 'cancel', onPress: () => rowMap?.[ex.$id]?.closeRow() },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExercise(ex.$id);
          } catch (e) {
            console.warn('delete exercise failed', e);
          } finally {
            setExercises(prev => prev.filter(x => x.$id !== ex.$id));
            rowMap?.[ex.$id]?.closeRow();
          }
        },
      },
    ]);
  }, []);

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

        <ThemedView style={styles.headerContainer}>
          <ThemedView style={styles.headerRow}>

            <ThemedText heading>
              Exercises
            </ThemedText>

            <Pressable onPress={() => setShowCreate(true)}>
              {({ pressed }) => (
              <Ionicons 
                name={pressed ? "create" : "create-outline"}
                size={32}
                color={theme.text}
              />
              )}
            </Pressable>

          </ThemedView>

          <TextInput
            placeholder="Search..."
            value={filter}
            onChangeText={setFilter}
            style={styles.input}
            placeholderTextColor={theme.textSecondary}
          />
        </ThemedView>

        {loading && (
          <ActivityIndicator color={theme.accent} style={{ marginTop: 20 }} />
        )}


        {/* Swipe list replacing ScrollView */}
        {!loading && (
          <SwipeListView
            data={filtered}
            keyExtractor={(item) => item.$id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            // FRONT ROW: your existing item UI
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.exerciseItem,
                  { borderColor: pressed ? theme.accent : theme.background },
                ]}
                onPress={() => {
                  onSelect?.(item);
                  onClose?.();
                }}
              >
                <ThemedView style={styles.exerciseNameContainer}>
                  <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>{item.name}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.exerciseChips}>
                  <TargetMuscleChip group={item.targetMuscle} compact />
                  <ExerciseTypeChip type={item.type} compact />
                </ThemedView>
              </Pressable>
            )}
            // HIDDEN ROW: right-side delete
            renderHiddenItem={({ item, rowMap }) => (
              <ThemedView style={styles.hiddenRow}>
                <Pressable
                  style={styles.deleteAction}
                  onPress={() => handleDelete(item, rowMap)}
                >
                  <Ionicons name="trash" size={28} color="#fff" />
                </Pressable>
              </ThemedView>
            )}
            rightOpenValue={-96}     // how far to reveal the delete action
            disableLeftSwipe={false} // allow right swipe
            disableRightSwipe={true} // block left swipe (optional)
          />
        )}
        
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
      alignItems: 'stretch',
      backgroundColor: theme.cardBackground,
    },
    headerContainer: {
      padding: 16,
      borderBottomColor: theme.border,
      borderWidth: 1,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      backgroundColor: 'transparent',
    },
    scrollView: {
      flex: 1,
      width: '100%',
      padding: 8,
    },
    input: {
      backgroundColor: theme.cardBackground,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 2,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
    },
    // SwipeListView
    listContent: {
      padding: 8,
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      padding: 14,
      marginBottom: 8,
      backgroundColor: theme.background,
    },
    hiddenRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: 8,
      backgroundColor: theme.background,
    },
    deleteAction: {
      width: 80,
      height: '100%',
      backgroundColor: theme.error,
      borderRadius: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteText: {
      color: '#fff',
      fontWeight: '700',
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
  });