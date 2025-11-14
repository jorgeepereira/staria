import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Spacer from './spacer.jsx';
import ThemedButton from './themed-button.jsx';
import ThemedText from './themed-text.jsx';
import ThemedView from './themed-view.jsx';

// Our exercise service helper to get exercise details by ID
import { getExerciseById } from '../services/exercises.js';

// Our SetRow component
import SetRow from './set-row.jsx';

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
export default function ExerciseCard({
  exerciseId,
  sets,
  onAddSet,
}) {
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

  return (
    <ThemedView style={styles.card}>
      {/* Header: Exercise name + target muscle */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.title}>{name}</ThemedText>

          {targetMuscle ? (
            <ThemedText secondary style={styles.subtitle}>
              {targetMuscle}
            </ThemedText>
          ) : null}

          {error && (
            <ThemedText secondary style={{ marginTop: 4 }}>
              {error}
            </ThemedText>
          )}
        </View>

        {/* Optional: show a tiny loading hint while exercise is loading */}
        {loadingExercise && (
          <ThemedText secondary style={{ fontSize: 12 }}>
            Loading...
          </ThemedText>
        )}
      </View>

      <Spacer height={8} />

      {/* Column labels: Weight / Reps / Logged */}
      <View style={styles.labelsRow}>
        <View style={styles.indexColumn}>
          <ThemedText secondary style={styles.labelText}>
            Set
          </ThemedText>
        </View>

        <View style={styles.valuesColumn}>
          <View style={styles.valueBlock}>
            <ThemedText secondary style={styles.labelText}>
              Weight
            </ThemedText>
          </View>
          <View style={styles.valueBlock}>
            <ThemedText secondary style={styles.labelText}>
              Reps
            </ThemedText>
          </View>
          <View style={styles.valueBlock}>
            <ThemedText secondary style={styles.labelText}>
              Logged
            </ThemedText>
          </View>
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
        />
      ))}

      {/* Button to add another set to this exercise.
         This delegates the action up to the parent via onAddSet.
      */}
      <Spacer height={8} />
      <ThemedButton
        style={styles.addSetButton}
        onPress={() => onAddSet?.(exerciseId)}
      >
        <ThemedText style={{ fontWeight: '600' }}>
          Add Set
        </ThemedText>
      </ThemedButton>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  indexColumn: {
    width: 50,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  valuesColumn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  valueBlock: {
    alignItems: 'center',
    minWidth: 60,
  },
  addSetButton: {
    marginTop: 4,
  },
});