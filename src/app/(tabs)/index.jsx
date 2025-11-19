import { useAuth } from "@/contexts/AuthContext.jsx";
import { getProfileById } from '@/services/profile';
import { startWorkout } from "@/services/workouts";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, useColorScheme } from 'react-native';

// themed components
import HalfScreenModal from '@/components/half-screen-modal.jsx';
import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedLoader from '@/components/themed-loader.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';


const Dashboard = () => {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const { signOut, user} = useAuth();

  const router = useRouter();

  const [ profile, setProfile] = useState(null);
  const [ starting, setStarting ] = useState(false);
  const [ splitModalVisible, setSplitModalVisible ] = useState(false);

  // load the profile
  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      try {
        const doc = await getProfileById(user.$id);
        if (active) setProfile(doc);
      } catch (e) {
        console.warn('profile load failed', e);
      }
    }
    load();
    return () => { active = false; };
  }, [user]);

  // start a new workout session
  async function handleStartWorkout() {
    try {
      setStarting(true);

      // create the workout in Appwrite
      const workout = await startWorkout({ userId: user.$id });

      // navigate to the active workout screen, passing the workout ID as a param
      router.push({
        pathname: '/(tabs)/active-workout',
        params: { workoutId: workout.$id }
      });
    } catch (error) {
      console.log('Failed to start workout', error);
    } finally {
      setStarting(false);
    }
  }

  const onLogOut = async () => {
    await signOut();
  }

  const handleStartWorkoutFromSplit = () => {
    setSplitModalVisible(true);
  }

  const closeSplitModal = () => setSplitModalVisible(false);

  // render loader while starting a workout
  if (starting) {
    return <ThemedLoader />;
  }

  return (
    <>
    <ThemedView style={styles.container}>
      <ThemedText heading={true}>Dashboard</ThemedText>
      <Spacer />

      <ThemedText>Name: {profile?.displayName || '-'}</ThemedText>
      <ThemedText>Units: {profile?.units || '-'}</ThemedText>
      <ThemedText>Height (cm): {profile?.height || '-'}</ThemedText>
      <ThemedText>Weight (kg): {profile?.weight || '-'}</ThemedText>

      <Spacer />
      <ThemedText secondary={true}>{user.email}</ThemedText>

      <Spacer />
      <ThemedButton style={styles.buttonStartWorkout} onPress={handleStartWorkout}>
        <ThemedText style={{ fontWeight: '800' }}>Start Workout</ThemedText>
      </ThemedButton>

      <Spacer />
      <ThemedButton style={styles.buttonStartWorkoutFromSplit} onPress={handleStartWorkoutFromSplit}>
        <ThemedText style={{ fontWeight: '800' }}>Start Workout From Split</ThemedText>
      </ThemedButton>

      <Spacer />
      <ThemedButton style={styles.buttonLogOut} onPress={onLogOut}>
        <ThemedText style={{ fontWeight: '800' }}>Log Out</ThemedText>
      </ThemedButton>
    </ThemedView>

    <HalfScreenModal visible={splitModalVisible} onClose={closeSplitModal}>
      <ThemedText heading style={{ marginBottom: 16 }}>Start From Split</ThemedText>
      <ThemedText style={{ textAlign: 'center', marginBottom: 24 }}>
        Choose a training split to start from (placeholder content for now).
      </ThemedText>
      <ThemedButton style={styles.buttonLogOut} onPress={closeSplitModal}>
        <ThemedText style={{ fontWeight: '800' }}>Close</ThemedText>
      </ThemedButton>
    </HalfScreenModal>
    </>
  )
}

export default Dashboard

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLogOut: {
    width: '90%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.error,
  },
  buttonStartWorkout: {
    width: '90%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.success,
  },
  buttonStartWorkoutFromSplit: {
    width: '90%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
  },

})