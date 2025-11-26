import { SimpleLineIcons } from '@expo/vector-icons';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../constants/theme';
import TargetMuscleChip from './target-muscle-chip';
import ThemedText from './themed-text';

const WorkoutSummaryCard = ({ workout }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme, colorScheme);

  if (!workout) return null;

  // Format date
  const date = new Date(workout.date).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Calculate set counts per muscle group and total sets
  const muscleCounts = {};
  let totalSets = 0;

  workout.exercises.forEach(ex => {
    const count = ex.sets ? ex.sets.length : 0;
    totalSets += count;

    if (ex.targetMuscle) {
      muscleCounts[ex.targetMuscle] = (muscleCounts[ex.targetMuscle] || 0) + count;
    }
  });
  const targetMuscles = Object.keys(muscleCounts);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        
        <View style={styles.titleContainer}>
        <ThemedText style={styles.title}>{workout.name}</ThemedText>
        <ThemedText secondary style={{fontSize: 14, fontFamily: 'Orbitron', fontWeight: '400'}}>{workout.duration}</ThemedText>
        </View>

        <ThemedText secondary style={styles.subtitle}>{date}</ThemedText>
        
        {workout.note && workout.note.trim().length > 0 && (
          <View style={styles.noteContainer}>
            <SimpleLineIcons name="note" size={18} color={theme.textSecondary} style={{ marginRight: 6 }} />
            <ThemedText style={styles.note}>{workout.note}</ThemedText>
          </View>
        )}
      </View>
      
      <View style={styles.exerciseList}>
        {workout.exercises && workout.exercises.map((exercise, index) => (
          <ThemedText key={index} style={styles.exerciseText}>
            {exercise.name} x {exercise.sets ? exercise.sets.length : 0}
          </ThemedText>
        ))}
      </View>

      {(totalSets > 0 || targetMuscles.length > 0) && (
        <View style={styles.footer}>
          <View style={styles.chipsContainer}>
            {targetMuscles.map((muscle, index) => (
              <View key={index} style={styles.statItem}>
                <TargetMuscleChip group={muscle} compact />
                <View style={styles.dashedLine} />
                <ThemedText style={styles.statCount}>{muscleCounts[muscle]}</ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.totalSetsContainer}>
            <ThemedText style={styles.totalSetsLabel}>Total Sets</ThemedText>
            <ThemedText style={styles.totalSetsValue}>{totalSets}</ThemedText>
          </View>
        </View>
      )}
    </View>
  )
}

export default WorkoutSummaryCard

const getStyles = (theme, colorScheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: theme.border,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  noteContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(42, 85, 137, 0.6)',
    borderWidth: 1,
    borderColor: theme.secondary,
  },
  note: {
    fontSize: 12,
    color: theme.text,
    lineHeight: 20,
  },
  exerciseList: {
    gap: 4,
  },
  exerciseText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  chipsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: 16,
  },
  statItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 8,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderColor: theme.textSecondary,
    borderStyle: 'dashed',
    marginHorizontal: 6,
    opacity: 0.3,
  },
  statCount: {
    fontSize: 12,
    color: theme.text,
    fontWeight: 'bold',
    fontFamily: 'Orbitron',
    letterSpacing: 1,
  },
  totalSetsContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  totalSetsLabel: {
    fontSize: 10,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  totalSetsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
})