import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, useColorScheme, View } from 'react-native';

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
import { SimpleLineIcons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


function formatDuration(totalSeconds) {
  if (totalSeconds == null || Number.isNaN(totalSeconds)) return '00:00:00';
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}


const ActiveWorkoutScreen = () => {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const router = useRouter();
  const { user } = useAuth();
  const { workoutId } = useLocalSearchParams(); // comes from the route parameters

  const [pickerVisible, setPickerVisible] = useState(false);
  const [headerLayout, setHeaderLayout] = useState({ y: 0, height: 0 }); // large header position/height
  const [isHeaderStuck, setIsHeaderStuck] = useState(false);            // true once scrolled past large header

  // use the hook – it loads itself (no manual call in render)
  const {
    loading,
    error,
    workout,
    setsByExercise,
    durationSec,
    isPaused,
    refresh,          // call this if you want to reload on demand
    addSet,
    renameWorkout,
    updateSet,
    deleteSet,
    finish,
    pause,
    resume,
  } = useActiveWorkout(user?.$id, workoutId);

  // open picker
  const openExercisePicker = () => setPickerVisible(true);
  const closeExercisePicker = () => setPickerVisible(false);

    // inline name editing state
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);

  // workout note (saved on finish)
  const [note, setNote] = useState('');

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
      await finish(safeName, note);
      router.replace('(tabs)');
    } catch (error) {
      console.log('Failed to finish workout', error);
    }
  }


  // track scroll to toggle stuck state once header has been scrolled past
  const handleScroll = (e) => {
    const y = e?.nativeEvent?.contentOffset?.y ?? 0;
    // Show sticky header once scrolled past the large header
    if (headerLayout.height > 0) {
      setIsHeaderStuck(y > headerLayout.height);
    }
  };

  // Render the active workout screen
  return (
    <KeyboardAvoidingView style={styles.keyboardContainer} behavior="padding">
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          // Children order: 0 HiddenStickyHeader, 1 LargeHeader => sticky index 0
          stickyHeaderIndices={[0]}
        >
          {/* Hidden sticky header: initially visually hidden, becomes visible once scrolled past large header */}
          <View
            style={[
              styles.hiddenStickyContainer,
              isHeaderStuck ? styles.hiddenStickyVisible : styles.hiddenStickyHidden,
            ]}
          >
            <View style={styles.hiddenStickyRow}>
              <View style={styles.hiddenStickyTimerContainer}>
                <Pressable onPress={isPaused ? resume : pause}>
                  <MaterialCommunityIcons 
                    name={isPaused ? "play-box" : "pause-box"} 
                    size={32}
                    color={theme.textSecondary}
                  />
                </Pressable>
                <ThemedText style={styles.hiddenStickyTimer}>{formatDuration(durationSec)}</ThemedText>
              </View>
              <View style={styles.hiddenStickyTimerContainer}>
                <Pressable onPress={openExercisePicker}>
                  {({ pressed }) => (
                    <MaterialCommunityIcons 
                      name={pressed ? "plus-box" : "plus"}
                      size={32}
                      color={theme.accent}
                    />
                  )}
                </Pressable>
                <ThemedButton style={styles.finishButton} onPress={handleFinishWorkout}>
                  <ThemedText style={{ fontWeight: '800' }}>Finish</ThemedText>
                </ThemedButton>
              </View>
            </View>
          </View>

          <View
            style={styles.headerContainer}
            onLayout={(e) => {
              const { y, height } = e.nativeEvent.layout;
              setHeaderLayout({ y, height });
            }}
          >
            {/* Editable workout name */}
            <View style={styles.nameRow}>
              {!editingName ? (
                <ThemedText
                  style={[styles.nameText, isHeaderStuck && styles.nameTextSticky]}
                  onPress={() => setEditingName(true)}
                >
                  {workout.workoutName?.length ? workout.workoutName : 'My Workout'}
                </ThemedText>
              ) : (
                <TextInput
                  style={[styles.nameInput, isHeaderStuck && styles.nameTextSticky]}
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

            <View style={styles.subNameRow}>
              <ThemedText>
                <MaterialCommunityIcons name="calendar-outline" size={18} color={theme.textSecondary} />
              </ThemedText>
              <ThemedText secondary>
                {new Date(workout.startedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
              </ThemedText>
            </View>

            <Spacer height={12} />

            <View style={styles.noteInputContainer}>
              <SimpleLineIcons name="note" size={18} color={theme.textSecondary} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Add workout notes..."
                multiline
                numberOfLines={3}
                color={theme.text}
              />
            </View>
            
          </View>

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

          {/* If no exercises yet, show a button to add the first one */}
          {exerciseIds.length === 0 && (
            <ThemedView style={styles.noExercisesContainer}>
              <Spacer height={120} />
              <ThemedText secondary fontSize={32} textAlign="center">
                Tap the "+" button to add your first exercise.
              </ThemedText>
            </ThemedView>
          )}

          <Spacer height={32} />

        </ScrollView>

        <ExercisePicker
          visible={pickerVisible}
          userId={user?.$id}
          onSelect={handleSelectExercise}
          onClose={closeExercisePicker}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  )
}

export default ActiveWorkoutScreen;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  noExercisesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomColor: theme.border,
    borderBottomWidth: 1,
    backgroundColor: theme.background,
  },
  noteInputContainer: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.textInput,
  },
  noteInput: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
    textAlignVertical: 'top', 
  },
  // Hidden sticky header styles
  hiddenStickyContainer: {
    paddingHorizontal: 16,
    paddingTop: 50,
    borderBottomColor: theme.border,
    borderWidth: 1,
  },
  hiddenStickyHidden: {
    opacity: 1,
    borderWidth: 0,
    backgroundColor: theme.background,
  },
  hiddenStickyVisible: {
    opacity: 1,
    backgroundColor: theme.background,
  },
  hiddenStickyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hiddenStickyTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hiddenStickyTimer: {
    fontVariant: ['tabular-nums'],
    fontSize: 18,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  nameText: {
    flex: 1,
    fontWeight: '800',
    fontSize: 28,
    color: theme.text,
  },
  nameInput: {
    backgroundColor: 'transparent',
    flex: 1,
    fontWeight: '800',
    fontSize: 28,
    color: theme.text,
  },
  subNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timerText: {
    fontVariant: ['tabular-nums'],
  },
  finishButton: {
    paddingVertical: 8,
    borderRadius: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.success,
  },
})