import { useAuth } from "@/contexts/AuthContext.jsx";
import { getProfileById } from '@/services/profile';
import { startWorkout } from "@/services/workouts";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, useColorScheme } from 'react-native';

// themed components
import HalfScreenModal from '@/components/half-screen-modal.jsx';
import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedLoader from '@/components/themed-loader.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";


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
  const [ profileModalVisible, setProfileModalVisible ] = useState(false);

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

  const openProfileModal = () => setProfileModalVisible(true);
  const closeProfileModal = () => setProfileModalVisible(false);

  // render loader while starting a workout
  if (starting) {
    return <ThemedLoader />;
  }

  return (
    <>
    <ThemedView style={styles.container}>
      <ThemedView safe style={styles.headerContainer}>
        <ThemedView style={styles.headerRow}>
          <ThemedText heading>Dashboard</ThemedText>

          <ThemedView style={{flexDirection: 'row' , gap: 4}}>
            <Pressable onPress={openProfileModal}>
              {({ pressed }) => (
                <MaterialCommunityIcons
                  name={pressed ? "account-box" : "account-box-outline"}
                  size={32}
                  color={theme.text}
                />
              )}
            </Pressable>

            <Pressable>
              {({ pressed }) => (
                <Ionicons
                  name={pressed ? "options" : "options-outline"}
                  size={32}
                  color={theme.text}
                />
              )}
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.startButtonsContainer}>
        <ThemedButton style={styles.buttonStartWorkout} onPress={handleStartWorkout}>
          <ThemedText style={{ fontWeight: '800' }}>Start Empty Workout</ThemedText>
        </ThemedButton>

        <ThemedButton style={styles.buttonStartWorkoutFromSplit} onPress={handleStartWorkoutFromSplit}>
          <ThemedText style={{ fontWeight: '800' }}>Start Workout From Split</ThemedText>
        </ThemedButton>
      </ThemedView>
    </ThemedView>

    <HalfScreenModal visible={profileModalVisible} height="86%" onClose={closeProfileModal}>
      <ThemedView style={styles.profileContainer}>
        <ThemedView style={styles.profileContentContainer}>
          <Spacer />
          <ThemedText>Name: {profile?.displayName || '-'}</ThemedText>
          <ThemedText>Units: {profile?.units || '-'}</ThemedText>
          <ThemedText>Height (cm): {profile?.height || '-'}</ThemedText>
          <ThemedText>Weight (kg): {profile?.weight || '-'}</ThemedText>

          <Spacer />
          <ThemedText secondary={true}>{user.email}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.bottomButtonsContainer}>
          <ThemedButton style={styles.buttonLogOut} onPress={onLogOut}>
            <ThemedText style={{ fontWeight: '800' }}>Log Out</ThemedText>
          </ThemedButton>
          <ThemedButton style={styles.btnJustText} onPress={closeProfileModal}>
            <ThemedText style={{ color: theme.error, fontWeight: '800' }}>Close</ThemedText>
          </ThemedButton>
        </ThemedView>
      </ThemedView>
    </HalfScreenModal>

    <HalfScreenModal visible={splitModalVisible} height="50%" onClose={closeSplitModal}>
      <ThemedText heading style={{ marginBottom: 16 }}>Choose Split</ThemedText>
      <ThemedText style={{ textAlign: 'center', marginBottom: 24 }}>
        Choose a training split to start from (placeholder content for now).
      </ThemedText>
      <Spacer height={180}/>
      <ThemedButton style={styles.btnJustText} onPress={closeSplitModal}>
        <ThemedText style={{ color: theme.error, fontWeight: '800' }}>Close</ThemedText>
      </ThemedButton>
    </HalfScreenModal>
    </>
  )
}

export default Dashboard

const getStyles = (theme) => StyleSheet.create({
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
    backgroundColor: 'transparent',
  },
  startButtonsContainer: {
    alignItems: 'center',
    gap: 16,
    marginTop: 32,
    backgroundColor: 'transparent',
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  profileContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },
  bottomButtonsContainer: {
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
    backgroundColor: 'transparent',
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
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.success,
  },
  buttonStartWorkoutFromSplit: {
    width: '90%',
    paddingVertical: 18,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
  },
  btnJustText: {
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
})