import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

// themed components
import ThemedButton from '@/components/themed-button';
import ThemedLoader from '@/components/themed-loader';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';

import { useAuth } from '@/contexts/AuthContext';
import { startWorkout } from '@/services/workouts';

const Start = () => {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const router = useRouter();
  const { user } = useAuth();
  const [ starting, setStarting ] = useState(false);

  // start a new workout session
  async function handleStartWorkout() {
    try {
      setStarting(true);

      // create the workout in Appwrite
      const workout = await startWorkout({ userId: user.$id });

      // navigate to the active workout screen, passing the workout ID as a param
      router.push({
        pathname: '/active-workout',
        params: { workoutId: workout.$id }
      });
    } catch (error) {
      console.log('Failed to start workout', error);
    } finally {
      setStarting(false);
    }
  }

  // render loader while starting a workout
  if (starting) {
    return <ThemedLoader />;
  }
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText heading>Start a Session</ThemedText>

      <ThemedButton style={styles.button} onPress={handleStartWorkout}>
        <ThemedText style={{ fontWeight: '700' }}>
          {starting ? 'Starting...' : 'Start Workout'}
        </ThemedText>
      </ThemedButton>
    </ThemedView>
  )
}

export default Start;

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
    backgroundColor: theme.accent,
  },
})