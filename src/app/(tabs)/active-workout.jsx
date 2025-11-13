import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

// themed components
import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';

// workout helper functions
import ThemedLoader from '@/components/themed-loader';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkoutWithSets } from '@/services/workouts';


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

  // 4. Render the active workout screen
  return (
    <ThemedView style={styles.container} safe>

      <Spacer />
      <ThemedText heading>Active Workout</ThemedText>

      <ThemedText secondary style={{ marginTop: 8 }}>
        Started at: {new Date(workout.startedAt).toLocaleString()}
      </ThemedText>

      <ThemedText style={{ marginTop: 16 }}>
        Workout ID: {workout.$id}
      </ThemedText>

      <Spacer />
      <ThemedButton style={styles.button}>
        <ThemedText style={{ fontWeight: '800' }}>Finish</ThemedText>
      </ThemedButton>

    </ThemedView>
  )
}

export default ActiveWorkoutScreen;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '80%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.error,
  },
})