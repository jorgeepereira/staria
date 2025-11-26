import { useAuth } from "@/contexts/AuthContext.jsx";
import { getProfileById } from '@/services/profile';
import { listSplitsWithStats } from '@/services/splits';
import { getTemplateWithSets, listTemplatesWithStats } from '@/services/templates';
import { createSet, getUserStatistics, startWorkout, updateWorkoutName } from "@/services/workouts";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, RefreshControl, ScrollView, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';

// themed components
import HalfScreenModal from '@/components/half-screen-modal.jsx';
import SplitCard from '@/components/split-card';
import TargetMuscleChip from '@/components/target-muscle-chip.jsx';
import ThemedButton from "@/components/themed-button";
import ThemedCard from '@/components/themed-card.jsx';
import ThemedLoader from '@/components/themed-loader.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import UserProfileModal from '@/components/user-profile-modal.jsx';
import WorkoutTemplateCard from '@/components/workout-template-card.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';
import { MaterialCommunityIcons } from "@expo/vector-icons";


const Dashboard = () => {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const { user } = useAuth();
  const { height } = useWindowDimensions();

  const router = useRouter();

  const [ profile, setProfile] = useState(null);
  const [ starting, setStarting ] = useState(false);
  const [ splitModalVisible, setSplitModalVisible ] = useState(false);
  const [ profileModalVisible, setProfileModalVisible ] = useState(false);
  const [ statsModalVisible, setStatsModalVisible ] = useState(false);
  const [ templates, setTemplates ] = useState([]);
  const [ splits, setSplits ] = useState([]);
  const [ selectedSplitId, setSelectedSplitId ] = useState(null);
  const [ selectedTemplateId, setSelectedTemplateId ] = useState(null);
  const [ loadingData, setLoadingData ] = useState(false);
  const [ statistics, setStatistics ] = useState({ 
    totalWorkouts: 0, 
    workoutsThisWeek: 0,
    averageSets: 0,
    averageDuration: 0,
    muscleStats: []
  });
  const [ refreshingStats, setRefreshingStats ] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const loadStats = async () => {
    if (!user) return;
    try {
      const stats = await getUserStatistics(user.$id);
      setStatistics(stats);
    } catch (e) {
      console.warn('stats load failed', e);
    }
  };

  const onRefreshStats = async () => {
    setRefreshingStats(true);
    await loadStats();
    setRefreshingStats(false);
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // load the profile
  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      try {
        const doc = await getProfileById(user.$id);
        if (active) setProfile(doc);

        const stats = await getUserStatistics(user.$id);
        if (active) setStatistics(stats);
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

  const handleStartWorkoutFromSplit = () => {
    setSplitModalVisible(true);
    setSelectedSplitId(null);
    loadSplits();
  }

  const loadSplits = async () => {
    if (!user) return;
    try {
      setLoadingData(true);
      const data = await listSplitsWithStats(user.$id);
      setSplits(data);
    } catch (error) {
      console.warn('Failed to load splits', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectSplit = async (splitId) => {
    setSelectedSplitId(splitId);
    setSelectedTemplateId(null);
    loadTemplates(splitId);
  };

  const loadTemplates = async (splitId) => {
    if (!user) return;
    try {
      setLoadingData(true);
      const data = await listTemplatesWithStats(user.$id, splitId);
      setTemplates(data);
    } catch (error) {
      console.warn('Failed to load templates', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleStartFromTemplate = async (templateId) => {
    try {
      setStarting(true);
      setSplitModalVisible(false);

      // 1. Fetch template details
      const { template, sets } = await getTemplateWithSets(templateId);

      // 2. Start a new workout
      const workout = await startWorkout({ userId: user.$id });

      // 3. Update workout name to match template
      await updateWorkoutName(workout.$id, template.name);

      // 4. Create sets based on template
      // We map through the template sets and create new sets for the active workout
      // Note: We intentionally leave weight/reps blank (null) as requested, 
      // even if the template had them (though our UI currently saves them as null anyway).
      const setPromises = sets.map((set, index) => 
        createSet({
          userId: user.$id,
          workoutId: workout.$id,
          exerciseId: set.exerciseId,
          order: index + 1,
          reps: null,
          weight: null,
          completed: false
        })
      );

      await Promise.all(setPromises);

      // 5. Navigate to active workout
      router.push({
        pathname: '/(tabs)/active-workout',
        params: { workoutId: workout.$id }
      });

    } catch (error) {
      console.error('Failed to start workout from template', error);
      alert('Failed to start workout from template');
    } finally {
      setStarting(false);
    }
  };

  const closeSplitModal = () => setSplitModalVisible(false);

  const openProfileModal = () => setProfileModalVisible(true);
  const closeProfileModal = () => setProfileModalVisible(false);

  const openStatsModal = () => setStatsModalVisible(true);
  const closeStatsModal = () => setStatsModalVisible(false);

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // render loader while starting a workout
  if (starting) {
    return <ThemedLoader />;
  }

  return (
    <>
    <ThemedView style={styles.container}>
      <ThemedView safe style={styles.headerContainer}>
        <ThemedView style={styles.headerRow}>
          <ThemedText heading>Home</ThemedText>

          <ThemedView style={styles.headerButtonContainer}>
            <Pressable onPress={openStatsModal}>
              {({ pressed }) => (
                <MaterialCommunityIcons
                  name={pressed ? "chart-box" : "chart-box-outline"}
                  size={32}
                  color={theme.text}
                />
              )}
            </Pressable>
            <Pressable onPress={openProfileModal}>
              {({ pressed }) => (
                <MaterialCommunityIcons
                  name={pressed ? "account-box" : "account-box-outline"}
                  size={32}
                  color={theme.text}
                />
              )}
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      
      <View style={styles.heroContainer}>
        <ThemedView style={styles.startButtonsContainer}>
          <Animated.View style={{ width: '100%', alignItems: 'center', transform: [{ scale: pulseAnim }] }}>
            <Pressable
              style={({pressed}) => [styles.buttonStartWorkoutFromSplit, pressed && styles.buttonPressed]} 
              onPress={handleStartWorkoutFromSplit}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={28} color="white" style={{marginBottom: 4}}/>
              <ThemedText style={{ fontFamily: 'Orbitron', fontWeight: '800', fontSize: 18, color: 'white' }}>Start Workout From Split</ThemedText>
              <ThemedText style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Use a saved template</ThemedText>
            </Pressable>
          </Animated.View>

          <Pressable 
            style={({pressed}) => [styles.buttonStartWorkout, pressed && styles.buttonPressed]} 
            onPress={handleStartWorkout}
          >
            <ThemedText style={{ fontWeight: '700', color: theme.accent }}>New Empty Workout</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </ThemedView>

    <UserProfileModal 
      visible={profileModalVisible} 
      onClose={closeProfileModal} 
      profile={profile} 
    />

    <HalfScreenModal visible={statsModalVisible} onClose={closeStatsModal} height="95%">
      <View style={{ 
        width: '100%',
        alignItems: 'center',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}>
        <ThemedText heading>Statistics</ThemedText>
      </View>
      
      <ScrollView 
        style={{ width: '100%' }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshingStats} onRefresh={onRefreshStats} tintColor={theme.accent} />
        }
      >
        <ThemedCard title="Workouts" subtitle="Your workout history stats">
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 }}>
            <View style={{ alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 24, fontFamily: 'Orbitron', fontWeight: 'bold', color: theme.accent }}>{statistics.totalWorkouts}</ThemedText>
              <ThemedText secondary>Total Workouts</ThemedText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 24, fontFamily: 'Orbitron', fontWeight: 'bold', color: theme.accent }}>{statistics.workoutsThisWeek}</ThemedText>
              <ThemedText secondary>This Week</ThemedText>
            </View>
          </View>
        </ThemedCard>

        <ThemedCard title="Averages" subtitle="Your average workout stats">
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 }}>
            <View style={{ alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 24, fontFamily: 'Orbitron', fontWeight: 'bold', color: theme.accent }}>{statistics.averageSets}</ThemedText>
              <ThemedText secondary>Avg Sets</ThemedText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 24, fontFamily: 'Orbitron', fontWeight: 'bold', color: theme.accent }}>{formatDuration(statistics.averageDuration)}</ThemedText>
              <ThemedText secondary>Avg Duration</ThemedText>
            </View>
          </View>
        </ThemedCard>

        <ThemedCard title="Muscle Distribution" subtitle="Total sets per muscle group">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 10 }}>
            {statistics.muscleStats && statistics.muscleStats.length > 0 ? (
              statistics.muscleStats.map((stat, index) => (
                <View key={index} style={{ width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingRight: 12 }}>
                  <TargetMuscleChip group={stat.name} compact />
                  <View style={{ flex: 1, height: 1, borderBottomWidth: 1, borderColor: theme.textSecondary, borderStyle: 'dashed', marginHorizontal: 8, opacity: 0.3 }} />
                  <ThemedText style={{ fontWeight: 'bold', fontFamily: 'Orbitron', letterSpacing: 1 }}>{stat.count}</ThemedText>
                </View>
              ))
            ) : (
              <ThemedText secondary>No data available</ThemedText>
            )}
          </View>
        </ThemedCard>
      </ScrollView>

      <View style={{ marginTop: 12, paddingHorizontal: 16, flexDirection: 'row' }}>
        <ThemedButton 
            style={styles.buttonClose}
            onPress={closeStatsModal}
        >
            <ThemedText style={{ color: theme.error, fontWeight: 'bold' }}>Close</ThemedText>
        </ThemedButton>
      </View>
    </HalfScreenModal>

    <HalfScreenModal visible={splitModalVisible} height="85%" onClose={closeSplitModal}>
      <View style={{ 
        width: '100%',
        alignItems: 'center',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}>
        <ThemedText heading>
          {selectedSplitId ? splits.find(s => s.$id === selectedSplitId)?.name : 'Choose Split'}
        </ThemedText>
      </View>
      
      {loadingData ? (
        <ThemedLoader style={{ marginTop: 20 , backgroundColor: 'transparent' }} />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }} contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}>
          {!selectedSplitId ? (
            // Show Splits
            splits.length === 0 ? (
              <ThemedText secondary style={{ textAlign: 'center', marginTop: 20 }}>
                No splits found. Create one in the Strategy tab.
              </ThemedText>
            ) : (
              splits.map(split => (
                <SplitCard
                  key={split.$id} 
                  split={split} 
                  onPress={() => handleSelectSplit(split.$id)}
                  compact={true}
                  style={{ marginBottom: 12 }}
                />
              ))
            )
          ) : (
            // Show Templates
            templates.length === 0 ? (
              <ThemedText secondary style={{ textAlign: 'center', marginTop: 20 }}>
                No templates found in this split.
              </ThemedText>
            ) : (
              templates.map(template => (
                <WorkoutTemplateCard 
                  key={template.$id} 
                  template={template} 
                  selected={selectedTemplateId === template.$id}
                  onPress={() => setSelectedTemplateId(template.$id === selectedTemplateId ? null : template.$id)}
                  style={{ marginTop: 12, marginHorizontal: 16 }}
                />
              ))
            )
          )}
        </ScrollView>
      )}

      <View style={styles.navButtons}>
         {selectedSplitId ? (
            <>
              <ThemedButton 
                style={styles.buttonBack} 
                onPress={() => {
                  if (selectedTemplateId) {
                    setSelectedTemplateId(null);
                  } else {
                    setSelectedSplitId(null);
                  }
                }}
              >
                <ThemedText style={{fontWeight: 'bold'}}>
                  <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
                </ThemedText>
              </ThemedButton>

              <ThemedButton 
                  style={selectedTemplateId ? styles.buttonStartChosenTemplate : styles.buttonStartDisabled}
                  onPress={() => handleStartFromTemplate(selectedTemplateId)}
                  disabled={!selectedTemplateId}
              >
                  <ThemedText style={{ color: selectedTemplateId ? theme.accent : theme.textSecondary, fontWeight: 'bold' }}>Start Workout</ThemedText>
              </ThemedButton>
            </>
         ) : (
            <ThemedButton 
                style={styles.buttonClose}
                onPress={closeSplitModal}
            >
                <ThemedText style={{ color: theme.error, fontWeight: 'bold' }}>Close</ThemedText>
            </ThemedButton>
         )}
      </View>
      
    </HalfScreenModal>
    </>
  )
}

export default Dashboard

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: theme.background,
  },
  headerContainer: {
    paddingHorizontal: 16,
  },
  headerButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  startButtonsContainer: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
    gap: 16,
  },
  heroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 80,
  },
  buttonStartWorkout: {
    width: '90%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderColor: theme.border,
  },
  buttonStartWorkoutFromSplit: {
    width: '90%',
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
    shadowColor: theme.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  btnJustText: {
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  closeButton: {
    marginHorizontal: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    topBorderWidth: 1,
    borderTopColor: theme.border,
    gap: 10,
  },
  buttonBack: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    width: 70,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.border,
  },
  buttonClose: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.error,
    backgroundColor: theme.error + '20',
  },
  buttonStartChosenTemplate: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.accent,
    backgroundColor: theme.accent + '20',
  },
  buttonStartDisabled: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.cardBackground,
  },
})