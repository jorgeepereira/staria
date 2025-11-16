import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, useColorScheme, View } from 'react-native';

// themed components
import ExerciseCard from '@/components/exercise-card';
import ExercisePicker from '@/components/exercise-picker';
import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedLoader from '@/components/themed-loader';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';

// workout helper functions
import { useAuth } from '@/contexts/AuthContext';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';



const ActiveWorkoutScreen = () => {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const router = useRouter();
  const { user } = useAuth();
  const { workoutId } = useLocalSearchParams(); // comes from the route parameters

  const [pickerVisible, setPickerVisible] = useState(false);

  // use the hook – it loads itself (no manual call in render)
  const {
    loading,
    error,
    workout,
    setsByExercise,
    refresh,          // call this if you want to reload on demand
    addSet,
    renameWorkout,
    updateSet,
    deleteSet,
    finish,
  } = useActiveWorkout(user?.$id, workoutId);

  // open picker
  const openExercisePicker = () => setPickerVisible(true);
  const closeExercisePicker = () => setPickerVisible(false);

  // inline name editing state
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);

  // keep draft in sync when not editing
  useEffect(() => {
    if (!editingName) {
      setNameDraft(workout?.workoutName || '');
    }
  }, [workout?.workoutName, editingName]);

  async function handleEndEditingName() {
    const next = String(nameDraft ?? '').trim().slice(0, 24);
    if (next !== (workout.workoutName || '')) {
      try {
        setSavingName(true);
        await renameWorkout(next);   // optimistic in hook; persists to DB
      } catch (e) {
        console.warn('rename failed', e);
        setNameDraft(workout?.workoutName || '');
      } finally {
        setSavingName(false);
      }
    }
    setEditingName(false);
  }

  // when exercise selected: just add a set for it
  async function handleSelectExercise(ex) {
    try {
      await addSet(ex.$id);
    } catch (e) {
      console.warn('add set failed', e);
    }
  }

  // 2. Show loader while fetching
  if (loading) {
    return (
      <ThemedLoader />
    );
  }

  if (error || !workout) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Error: {String(error || 'Workout not found')}</ThemedText>
        <Spacer />
        <ThemedButton style={styles.button} onPress={refresh}>
          <ThemedText style={{ fontWeight: '800' }}>Retry</ThemedText>
        </ThemedButton>
      </ThemedView>
    );
  }

  const exerciseIds = Object.keys(setsByExercise);
  const totalSets = Object.values(setsByExercise).reduce((n, arr) => n + arr.length, 0);


  // Handle finish workout
  async function handleFinishWorkout() {
    try {
      const safeName = String(workout?.workoutName ?? 'My Workout').slice(0, 24);
      await finish( safeName, 'End of workout - Note' );
      router.replace('(tabs)');
    } catch (error) {
      console.log('Failed to finish workout', error);
    }
  }


  // Render the active workout screen
  return (
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <Spacer />

          <ThemedView style={styles.headerContainer}>
              {/* Editable workout name */}
            <View style={styles.nameRow}>
              {!editingName ? (
                <ThemedText
                  style={styles.nameText}
                  onPress={() => setEditingName(true)}
                >
                  {workout.workoutName?.length ? workout.workoutName : 'My Workout'}
                </ThemedText>
              ) : (
                <TextInput
                  style={styles.nameInput}
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  placeholder="My Workout"
                  autoFocus
                  maxLength={16}
                  returnKeyType="done"
                  onSubmitEditing={handleEndEditingName}
                  onEndEditing={handleEndEditingName}
                />
              )}
            </View>

            <ThemedView style={styles.subNameRow}>
              <ThemedText>
                <MaterialCommunityIcons name="calendar-start" size={16} color={theme.textSecondary} />
              </ThemedText>
              <ThemedText secondary>
                {new Date(workout.startedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
              </ThemedText>
              
            </ThemedView>

          </ThemedView>

          <ThemedButton style={styles.buttonAddExercise} onPress={openExercisePicker}>
            <ThemedText style={{ fontWeight: '800' }}>Add an Exercise</ThemedText>
          </ThemedButton>

          <Spacer />

          {/* Render all exercises (each with its sets) */}
          {exerciseIds.length > 0 && (
            <>
              {exerciseIds.map((exerciseId) => (
                <ExerciseCard
                  key={exerciseId}
                  exerciseId={exerciseId}
                  sets={setsByExercise[exerciseId]}
                  onAddSet={addSet}
                  onRemoveSet={deleteSet}
                  onUpdateSet={updateSet}
                />
              ))}
            </>
          )}

          <Spacer />

          <ThemedButton style={styles.finishButton} onPress={handleFinishWorkout}>
            <ThemedText style={{ fontWeight: '800' }}>Finish</ThemedText>
          </ThemedButton>

          <Spacer />
        </ScrollView>

        <ExercisePicker
          visible={pickerVisible}
          userId={user?.$id}
          onSelect={handleSelectExercise}
          onClose={closeExercisePicker}
        />
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
  headerContainer: {
    padding: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    flex: 1,
    fontWeight: '800',
    fontSize: 32,
    color: theme.text,
  },
  nameInput: {
    backgroundColor: 'transparent',
    flex: 1,
    fontWeight: '800',
    fontSize: 32,
    color: theme.text,
  },
  subNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finishButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.error,
    marginHorizontal: 16,
  },
  buttonAddExercise: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.secondary,
    marginHorizontal: 16,
  },
  
})