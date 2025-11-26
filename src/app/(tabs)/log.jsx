import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, useColorScheme } from 'react-native';

// themed components
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import WorkoutSummaryCard from '@/components/workout-summary-card.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';

// services & context
import { useAuth } from '@/contexts/AuthContext';
import { getExercisesByUserId } from '@/services/exercises';
import { getCompletedWorkouts } from '@/services/workouts';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

const Log = () => {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  // state
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const fetchData = async () => {
    if (!user) return;
    try {
      const [workoutsData, exercisesData] = await Promise.all([
        getCompletedWorkouts(user.$id),
        getExercisesByUserId(user.$id)
      ]);

      // Create exercise lookup map
      const exerciseMap = {};
      exercisesData.forEach(ex => {
        exerciseMap[ex.$id] = ex.name;
      });

      // Process workouts
      const processedWorkouts = workoutsData.map(workout => {
        // Group sets by exercise
        const exerciseGroups = {};
        
        // If sets exist, group them
        if (workout.sets && workout.sets.length > 0) {
          workout.sets.forEach(set => {
            if (!exerciseGroups[set.exerciseId]) {
              exerciseGroups[set.exerciseId] = {
                name: exerciseMap[set.exerciseId] || 'Unknown Exercise',
                targetMuscle: exercisesData.find(e => e.$id === set.exerciseId)?.targetMuscle || '',
                sets: []
              };
            }
            exerciseGroups[set.exerciseId].sets.push(set);
          });
        }

        // Convert to array
        const exercisesList = Object.values(exerciseGroups);

        // Format duration
        const durationSeconds = workout.duration || 0;
        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        let durationString = '0m';
        
        if (hours > 0) {
          durationString = `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
          durationString = `${minutes}m`;
        } else if (durationSeconds > 0) {
            durationString = `${durationSeconds}s`;
        }

        return {
          id: workout.$id,
          name: workout.workoutName || 'Untitled Workout',
          date: workout.startedAt,
          duration: durationString,
          exercises: exercisesList,
          note: workout.note
        };
      });

      setWorkouts(processedWorkouts);
    } catch (error) {
      console.error("Error fetching log data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredWorkouts = workouts.filter(workout => {
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = workout.name.toLowerCase().includes(query);
      const exerciseMatch = workout.exercises.some(ex => ex.name.toLowerCase().includes(query));
      matchesSearch = nameMatch || exerciseMatch;
    }

    let matchesMonth = true;
    if (selectedMonth !== null) {
      const workoutDate = new Date(workout.date);
      matchesMonth = workoutDate.getMonth() === selectedMonth;
    }

    return matchesSearch && matchesMonth;
  });
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView safe style={styles.headerContainer}>
        <ThemedView style={styles.headerRow}>
          <ThemedText heading={true}>Log</ThemedText>

          <ThemedView style={styles.headerButtonContainer}>
            <Pressable onPress={() => {
              setShowCalendar(!showCalendar);
              if (showSearch) {
                setShowSearch(false);
              }
            }}>
              <MaterialCommunityIcons 
                name={showCalendar ? "calendar-month" : "calendar-month-outline"} 
                size={28} 
                color={showCalendar || selectedMonth !== null ? theme.accent : theme.text} 
              />
            </Pressable>
            <Pressable onPress={() => {
              if (showSearch) {
                setShowSearch(false);
                setSearchQuery('');
              } else {
                setShowSearch(true);
                setShowCalendar(false);
              }
            }} hitSlop={8}>
              <FontAwesome name={showSearch ? "close" : "search"} size={showSearch ? 28 : 24} color={showSearch ? theme.error : theme.text} />
            </Pressable>
          </ThemedView>
        </ThemedView>

        {showSearch && (
          <TextInput 
            style={styles.searchInput}
            placeholder="Search workouts..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        )}

        {showCalendar && (
          <ThemedView style={styles.calendarContainer}>
            {MONTHS.map((month, index) => (
              <Pressable
                key={month}
                style={[
                  styles.monthButton,
                  selectedMonth === index && { backgroundColor: theme.accent, borderColor: theme.accent }
                ]}
                onPress={() => setSelectedMonth(selectedMonth === index ? null : index)}
              >
                <ThemedText style={[
                  styles.monthText,
                  selectedMonth === index && { color: '#fff' }
                ]}>
                  {month}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        )}
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </ThemedView>
      ) : (
        <FlatList
          data={filteredWorkouts}
          renderItem={({ item }) => <WorkoutSummaryCard workout={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {searchQuery ? 'No workouts found matching your search.' : 'No completed workouts yet.'}
              </ThemedText>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  )
}

export default Log

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: theme.cardBackground,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomColor: theme.border,
    borderWidth: 1,
    backgroundColor: theme.background,
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
    minHeight: 40,
  },
  searchInput: {
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: theme.cardBackground,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 7,
    justifyContent: 'space-between',
  },
  monthButton: {
    width: '15%',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.cardBackground,
    marginBottom: 4
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.textSecondary,
    textAlign: 'center',
  }
})