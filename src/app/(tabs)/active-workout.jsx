import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, useColorScheme } from 'react-native';

// themed components
import ExerciseCard from '@/components/exercise-card';
import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';

// workout helper functions
import ThemedLoader from '@/components/themed-loader';
import { useAuth } from '@/contexts/AuthContext';
import { createExercise, getExercisesByUserId } from '@/services/exercises';
import { createSet, getWorkoutWithSets } from '@/services/workouts';


const ActiveWorkoutScreen = () => {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const { user } = useAuth();
  const { workoutId } = useLocalSearchParams(); // comes from the route parameters

  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState(null);
  const [sets, setSets] = useState([]);
  const [error, setError] = useState(null);

  // exercise picker states
  const [pickerOpen, setPickerOpen] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [creatingExercise, setCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [savingExercise, setSavingExercise] = useState(false);

  // Group sets by exerciseId so we can render one ExerciseCard per exercise
  const setsByExercise = useMemo(() => {
    const groups = {};
    for (const set of sets) {
      const exId = set.exerciseId;
      if (!groups[exId]) groups[exId] = [];
      groups[exId].push(set);
    }
    return groups;
  }, [sets]);

  // List of exercise IDs present in this workout (from sets)
  const exerciseIds = Object.keys(setsByExercise);

  // 1. Load workout + sets from Appwrite
  useEffect(() => {
    async function loadWorkout() {
      try {
        setLoading(true);
        setError(null);

        const { workout, sets } = await getWorkoutWithSets({ userId: user.$id, workoutId });

        setWorkout(workout);
        setSets(sets);
      } catch (error) {
        console.log('Failed to load workout', error);
        setError('Failed to load workout');
      } finally {
        setLoading(false);
      }
    }

    if (user && workoutId) {
      loadWorkout();
    }
  }, [user, workoutId]);

  // 2. Show loader while fetching
  if (loading) {
    return (
      <ThemedLoader />
    );
  }

  // 3. Basic error handling
  if (error || !workout) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>{error || 'Workout not found'}</ThemedText>
      </ThemedView>
    );
  }

  // Add another set for a given exercise in this workout
  async function handleAddSetForExercise(exerciseId) {
    try {
      const nextOrder = (sets?.length ?? 0) + 1;

      const newSet = await createSet({
        userId: user.$id,
        workoutId: workout.$id,
        exerciseId,
        order: nextOrder,
        reps: 1,
        weight: null,
        rpe: null,
        completed: false,
        notes: '',
      });

      setSets((prev) => [...prev, newSet]);
    } catch (error) {
      console.log('Failed to add set for exercise', error);
    }
  }

  // Exercise picker logic
  async function handleOpenExercisePicker() {
    try {
      
      // open picker UI
      setPickerOpen(true);
      setLoadingExercises(true);

      // fetch user exercises
      const exercises = await getExercisesByUserId(user.$id);
      setExercises(exercises);
      setCreatingExercise(exercises.length === 0); // open create form if empty

    } catch (error) {
      console.log('Failed to load exercises', error);
    } finally {
      setLoadingExercises(false);
    }
  }

  async function handleCreateAndAdd() {
    if (!newExerciseName.trim()) return;
    try {
      setSavingExercise(true);
      const ex = await createExercise({ userId: user.$id, name: newExerciseName.trim(), targetMuscle: 'chest', type: 'barbell' });
      setExercises((prev) => [...prev, ex]);
      setNewExerciseName('');
      // Immediately add the first set for this new exercise
      await handleSelectExercise(ex);
    } catch (e) {
      console.log('Failed to create exercise', e);
      console.log({userId: user.$id});
      
    } finally {
      setSavingExercise(false);
    }
  }

  // Handle exercise selection
  async function handleSelectExercise(exercise) {
    try {
      setPickerOpen(false);

      const nextOrder = (sets?.length ?? 0) + 1;

      const newSet = await createSet({
        userId: user.$id,
        workoutId: workout.$id,
        exerciseId: exercise.$id,
        order: nextOrder,
        reps: 1,
        weight: null,
        rpe: null,
        notes: '',
      });

      setSets((prevSets) => [...prevSets, newSet]);
    } catch (error) {
      console.log('Failed to add initial set', error);
    }
  }


  // Render the active workout screen
  return (
      <ThemedView style={styles.container} safe>
        <ScrollView style={{ padding: 16 }}>

          <Spacer />
          <ThemedText style={{ marginTop: 16 }}>
            Workout ID: {workout.$id}
          </ThemedText>

          <ThemedText secondary style={{ marginTop: 8 }}>
            Started at: {new Date(workout.startedAt).toLocaleString()}
          </ThemedText>

          <ThemedText style={{ marginTop: 16 }}>
            Total Sets: {sets?.length ?? 0}
          </ThemedText>

          <Spacer />

          <ThemedButton style={styles.buttonAddExercise} onPress={handleOpenExercisePicker}>
            <ThemedText style={{ fontWeight: '800' }}>Add an Exercise</ThemedText>
          </ThemedButton>

          <Spacer />

          {pickerOpen && (
            <ThemedView style={{ marginTop: 12, backgroundColor: theme.secondary}}>
              <ThemedText secondary style={{ marginBottom: 8 }}>
                Select an exercise:
              </ThemedText>

              {loadingExercises && (
                <ThemedText>Loading exercises...</ThemedText>
              )}

              {!loadingExercises && exercises.length === 0 && (
                  <ThemedText>No exercises yet. Create one:</ThemedText>
              )}


              <Spacer height={8} />
              <TextInput
                placeholder="Exercise name (e.g., Bench Press)"
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                style={{
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderRadius: 8,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: theme.border
                }}
              />
                  
              <Spacer height={8} />
              <ThemedButton
                style={styles.buttonAddExercise}
                disabled={savingExercise}
                onPress={handleCreateAndAdd}
              >
                <ThemedText style={{ fontWeight: '800' }}>
                  {savingExercise ? 'Saving...' : 'Create and Add'}
                </ThemedText>
              </ThemedButton>

              {!loadingExercises && exercises.length > 0 && (
                exercises.map((exercise) => (
                  <ThemedButton
                    key={exercise.$id}
                    style={styles.button}
                    onPress={() => handleSelectExercise(exercise)}
                  >
                    <ThemedText>{exercise.name}</ThemedText>
                  </ThemedButton>
                ))
              )}
            </ThemedView>
          )}

          {/* Render all exercises (each with its sets) */}
          {exerciseIds.length > 0 && (
            <>
              <Spacer height={16} />
              <ThemedText style={{ fontWeight: '700', marginBottom: 8 }}>
                Exercises in this workout
              </ThemedText>

              {exerciseIds.map((exerciseId) => (
                <ExerciseCard
                  key={exerciseId}
                  exerciseId={exerciseId}
                  sets={setsByExercise[exerciseId]}
                  onAddSet={handleAddSetForExercise}
                />
              ))}
            </>
          )}

          <Spacer />

          <ThemedButton style={styles.button}>
            <ThemedText style={{ fontWeight: '800' }}>Finish</ThemedText>
          </ThemedButton>
        </ScrollView>
      </ThemedView>
  )
}

export default ActiveWorkoutScreen;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.error,
  },
  buttonAddExercise: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
  },
  
})