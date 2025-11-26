import ExerciseCreate from '@/components/exercise-create';
import ExerciseTypeChip from '@/components/exercise-type-chip';
import TargetMuscleChip from '@/components/target-muscle-chip';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useAuth } from '@/contexts/AuthContext';
import { createExercise, deleteExercise, getExercisesByUserId } from '@/services/exercises';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';

const MUSCLE_OPTIONS = [
  'Abs', 'Back', 'Biceps', 'Chest', 'Forearms', 'Glutes', 'Quads', 'Triceps', 'Calves', 'Hamstrings', 'Front Delts', 'Side Delts', 'Rear Delts'
];

const MUSCLE_COLORS = {
  chest:       '#F87171', // soft red
  back:        '#60A5FA', // soft blue
  frontDelts:  '#FBBF24', // amber-400 — bright, warm
  sideDelts:   '#F59E0B', // amber-500 — slightly deeper
  rearDelts:   '#D97706', // amber-600 — rich, darker
  quads:       '#4ADE80', // soft green
  glutes:      '#F472B6', // soft pink
  biceps:      '#C084FC', // soft purple
  triceps:     '#A78BFA', // soft indigo
  abs:         '#2DD4BF', // soft teal
  calves:      '#34D399', // soft emerald
  forearms:    '#94A3B8', // clean slate
  hamstrings:  '#818CF8', // modern indigo blue
};

const ExercisesScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const { user } = useAuth();
  const userId = user?.$id;

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [filter, setFilter] = useState('');
  const [muscleFilter, setMuscleFilter] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const loadExercises = async () => {
    if (!userId) return;
    try {
      const list = await getExercisesByUserId(userId);
      setExercises(list);
    } catch (e) {
      console.warn('exercises load failed', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load user exercises
  useEffect(() => {
    setLoading(true);
    loadExercises();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadExercises();
  };

  // Create from sub-modal
  const handleCreateFromModal = useCallback(async ({ name, targetMuscle, type }) => {
    setCreating(true);
    try {
      const ex = await createExercise({userId: userId, name, targetMuscle, type });
      setExercises(prev => [...prev, ex]);
      setShowCreate(false);
    } catch (e) {
      console.warn('create exercise failed', e);
    } finally {
      setCreating(false);
    }
  }, [userId]);

  const handleDelete = useCallback(async (ex, rowMap) => {
    Alert.alert('Delete exercise', `Delete "${ex.name}"?`, [
      { text: 'Cancel', style: 'cancel', onPress: () => rowMap?.[ex.$id]?.closeRow() },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExercise(ex.$id);
          } catch (e) {
            console.warn('delete exercise failed', e);
          } finally {
            setExercises(prev => prev.filter(x => x.$id !== ex.$id));
            rowMap?.[ex.$id]?.closeRow();
          }
        },
      },
    ]);
  }, []);

  const filtered = exercises.filter(e => {
    const matchesName = filter ? e.name.toLowerCase().includes(filter.toLowerCase()) : true;
    const matchesMuscle = muscleFilter ? e.targetMuscle.toLowerCase() === muscleFilter.toLowerCase() : true;
    return matchesName && matchesMuscle;
  });

  return (
    <ThemedView style={styles.container}>
        <ThemedView safe style={styles.headerContainer}>
          <ThemedView style={styles.headerRow}>
            <ThemedText heading>
              Exercises
            </ThemedText>

            <ThemedView style={styles.headerButtonContainer}>
              <Pressable onPress={() => setShowCreate(true)}>
                {({ pressed }) => (
                <MaterialCommunityIcons 
                  name={pressed ? "plus-box" : "plus"}
                  size={32}
                  color={theme.text}
                />
                )}
              </Pressable>
              <Pressable onPress={() => {
                if (showSearch) {
                  setShowSearch(false);
                  setFilter('');
                } else {
                  setShowSearch(true);
                }
              }}>
                <FontAwesome name={showSearch ? "close" : "search"} size={showSearch ? 28 : 24} color={showSearch ? theme.error : theme.text} />
              </Pressable>
            </ThemedView>
          </ThemedView>

          {showSearch && (
          <ThemedView style={styles.searchContainer}>
            <TextInput
              placeholder="Search..."
              value={filter}
              onChangeText={setFilter}
              style={styles.input}
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />
            {filter.length > 0 && (
              <Pressable onPress={() => setFilter('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
              </Pressable>
            )}
          </ThemedView>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <Pressable
              onPress={() => setMuscleFilter(null)}
              style={[
                styles.filterChip,
                !muscleFilter && { backgroundColor: theme.accent, borderColor: theme.accent }
              ]}
            >
              <ThemedText style={{ color: !muscleFilter ? '#fff' : theme.text, fontWeight: '600', fontSize: 12 }}>All</ThemedText>
            </Pressable>
            {MUSCLE_OPTIONS.map(m => {
              const key = m.replace(/ /g, '').replace(/^./, c => c.toLowerCase());
              const color = MUSCLE_COLORS[key] || theme.accent;
              const isSelected = muscleFilter === m;
              
              return (
                <Pressable
                  key={m}
                  onPress={() => setMuscleFilter(isSelected ? null : m)}
                  style={[
                    styles.filterChip,
                    { borderColor: color },
                    isSelected && { backgroundColor: color }
                  ]}
                >
                  <ThemedText style={{ 
                    color: isSelected ? '#fff' : color, 
                    fontWeight: '600', 
                    fontSize: 12 
                  }}>
                    {m}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </ThemedView>

        {loading && (
          <ActivityIndicator color={theme.text} size="large" style={{ flex: 1 , justifyContent: 'center', alignItems: 'center' }} />
        )}

        {!loading && filtered.length === 0 && (
          <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 , backgroundColor: 'transparent' }}>
            <ThemedText secondary style={{ textAlign: 'center', fontSize: 16 }}>
              {(filter || muscleFilter) 
                ? "No exercises match your search." 
                : "No exercises yet. Tap the + button to create one."}
            </ThemedText>
          </ThemedView>
        )}

        {!loading && filtered.length > 0 && (
          <SwipeListView
            data={filtered}
            keyExtractor={(item) => item.$id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.exerciseItem,
                  { borderColor: pressed ? theme.accent : theme.background },
                ]}
              >
                <ThemedView style={styles.exerciseNameContainer}>
                  <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>{item.name}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.exerciseChips}>
                  <TargetMuscleChip group={item.targetMuscle} compact />
                  <ExerciseTypeChip type={item.type} compact />
                </ThemedView>
              </Pressable>
            )}
            renderHiddenItem={({ item, rowMap }) => (
              <ThemedView style={styles.hiddenRow}>
                <Pressable
                  style={styles.deleteAction}
                  onPress={() => handleDelete(item, rowMap)}
                >
                  <Ionicons name="trash" size={28} color="#fff" />
                </Pressable>
              </ThemedView>
            )}
            rightOpenValue={-96}
            disableLeftSwipe={false}
            disableRightSwipe={true}
          />
        )}
        
        <ExerciseCreate
            visible={showCreate}
            onClose={() => setShowCreate(false)}
            onCreate={handleCreateFromModal}
            loading={creating}
        />
    </ThemedView>
  );
};

export default ExercisesScreen;

const getStyles = theme =>
  StyleSheet.create({
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 2,
      paddingHorizontal: 12,
      marginTop: 12,
    },
    input: {
      flex: 1,
      color: theme.text,
      paddingVertical: 10,
      fontSize: 16,
    },
    clearButton: {
      marginLeft: 8,
    },
    listContent: {
      padding: 8,
      paddingBottom: 100,
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      padding: 14,
      marginBottom: 8,
      backgroundColor: theme.background,
    },
    hiddenRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: 8,
      backgroundColor: theme.background,
    },
    deleteAction: {
      width: 80,
      height: '100%',
      backgroundColor: theme.error,
      borderRadius: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    exerciseNameContainer: {
      backgroundColor: 'transparent',
      flex: 1,
      paddingRight: 12,
    },
    exerciseChips: {
      backgroundColor: 'transparent',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: 8,
      backgroundColor: theme.background,
      marginBottom: 4,
    },
  });