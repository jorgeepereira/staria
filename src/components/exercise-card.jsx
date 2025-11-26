import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';


import { darkTheme, lightTheme } from '@/constants/theme.js';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getExerciseById } from '../services/exercises.js';
import SetRow from './set-row.jsx';
import Spacer from './spacer.jsx';
import TargetMuscleChip from './target-muscle-chip.jsx';
import ThemedText from './themed-text.jsx';
import ThemedView from './themed-view.jsx';


/**
 * ExerciseCard
 *
 * Represents ONE exercise inside a workout.
 * Responsibilities:
 *  - Show exercise name and target muscle group in the header
 *  - Show column labels (Weight / Reps / Logged)
 *  - Render all sets for this exercise as SetRow components
 *  - Expose an "Add Set" button that delegates to a callback from the parent
 *
 * It does NOT:
 *  - Talk to Appwrite for sets (those are passed in as props)
 *  - Manage workout-level state (that belongs to the ActiveWorkout hook/screen)
 */
const ExerciseCard = forwardRef(({
  exerciseId,
  sets,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onLongPress, // Add this prop
  onDeleteExercise, // Add this prop
  onSwipeableOpen, // Add this prop
}, ref) => {

  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const swipeableRef = useRef(null);

  useImperativeHandle(ref, () => ({
    close: () => {
      swipeableRef.current?.close();
    }
  }));

  
  // Local state for exercise details (name, targetMuscle, etc.)
  const [exercise, setExercise] = useState(null);
  const [loadingExercise, setLoadingExercise] = useState(true);
  const [error, setError] = useState(null);

  // When exerciseId changes, fetch exercise details from Appwrite
  useEffect(() => {
    let cancelled = false;

    async function loadExercise() {
      try {
        setLoadingExercise(true);
        setError(null);

        const doc = await getExerciseById(exerciseId);

        if (!cancelled) {
          setExercise(doc);
        }
      } catch (err) {
        console.error('Failed to load exercise', err);
        if (!cancelled) {
          setError('Could not load exercise');
        }
      } finally {
        if (!cancelled) {
          setLoadingExercise(false);
        }
      }
    }

    if (exerciseId) {
      loadExercise();
    }

    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  // Derive some display values from the exercise doc (if loaded)
  const name = exercise?.name ?? 'Exercise';
  const targetMuscle = exercise?.targetMuscle ?? '';
  const typeUpperCase = (exercise?.type ?? '').toUpperCase();

  const renderRightActions = (progress, dragX) => {
    return (
      <View style={styles.deleteActionContainer}>
        <Pressable 
          style={styles.deleteActionButton}
          onPress={() => onDeleteExercise?.(exerciseId)}
        >
          <MaterialIcons name="delete-outline" size={32} color="white" />
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      onSwipeableWillOpen={onSwipeableOpen}
      onSwipeableOpenStartDrag={onSwipeableOpen}
    >
    <ThemedView style={styles.card}>
      {/* Header: Exercise name + target muscle */}
      <Pressable 
        style={styles.headerRow}
        onLongPress={onLongPress} // Use it here
        delayLongPress={300}
      >
        
        <ThemedView style={{ backgroundColor: 'transparent', flex: 1, paddingRight: 8 }}>
          <ThemedText style={styles.title}>{name}</ThemedText>
          <ThemedText secondary style={styles.subtitle}>{typeUpperCase}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.exerciseChips}>
          <TargetMuscleChip group={targetMuscle} compact />
        </ThemedView>

        {error && (
          <ThemedText secondary style={{ marginTop: 4 }}>
            {error}
          </ThemedText>
        )}

        {/* Optional: show a tiny loading hint while exercise is loading */}
        {loadingExercise && (
          <ThemedText secondary style={{ fontSize: 12 }}>
            Loading...
          </ThemedText>
        )}
      </Pressable>


      <Spacer height={8} />

      {/* Column labels: Set | Weight | Reps | LOG */}
      <View style={styles.labelsRow}>
        <View style={styles.deleteColumn}>
          <Pressable
            style={styles.addSetButton}
            onPress={() => onAddSet?.(exerciseId)}
          >
          {({ pressed }) => (
            <MaterialIcons 
            name="format-list-bulleted-add" 
            size={24} 
            color= {pressed ? theme.success : theme.text}/>
          )}
          </Pressable>
        </View>
        <View style={styles.valueColumn}>
          <ThemedText style={styles.labelText}>WEIGHT</ThemedText>
        </View>
        <View style={styles.valueColumn}>
          <ThemedText style={styles.labelText}>REPS</ThemedText>
        </View>
        <View style={styles.statusColumn}>
          <ThemedText style={styles.labelText}>LOG</ThemedText>
        </View>
      </View>

      <Spacer height={4} />

      {/* List of sets for this exercise. We assume `sets` is already filtered for this exercise. */}
      {(!sets || sets.length === 0) && (
        <ThemedText secondary style={{ marginVertical: 8 }}>
          No sets yet.
        </ThemedText>
      )}

      {sets?.map((set, idx) => (
        <SetRow
          key={set.$id}
          set={set}
          index={idx}
          onRemove={() => onRemoveSet?.(set.$id)}
          onChange={(patch) => onUpdateSet?.(set.$id, patch)}
        />
      ))}

      {/* Button to add another set to this exercise.
         This delegates the action up to the parent via onAddSet.
      */}
      <Spacer height={8} />
      
    </ThemedView>
    </Swipeable>
  );
});

export default ExerciseCard;

const getStyles = (theme) => StyleSheet.create({
  card: {
    marginBottom: 16,
    paddingBottom: 8,
    backgroundColor: '#212121',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 10,
  },
  exerciseChips: {
    marginBottom: 16,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 12,
  },
  // Make these match SetRow
  deleteColumn: {
    width: 50,
    alignItems: 'center',
  },
  valueColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statusColumn: {
    width: 60,
    marginRight: 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addSetButton: {
    backgroundColor: 'transparent',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionContainer: {
    marginBottom: 16,
    backgroundColor: theme.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100, // Width of the swipe action area
  },
  deleteActionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});