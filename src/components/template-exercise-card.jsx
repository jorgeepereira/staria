import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

import { darkTheme, lightTheme } from '@/constants/theme.js';
import { getExerciseById } from '../services/exercises.js';
import TargetMuscleChip from './target-muscle-chip.jsx';
import ThemedText from './themed-text.jsx';
import ThemedView from './themed-view.jsx';

export default function TemplateExerciseCard({
  exerciseId,
  setCount,
  onAddSet,
  onRemoveSet,
}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const [exercise, setExercise] = useState(null);

  useEffect(() => {
    let active = true;
    getExerciseById(exerciseId).then(ex => {
      if (active) {
        setExercise(ex);
      }
    });
    return () => { active = false; };
  }, [exerciseId]);

  const name = exercise?.name ?? 'Exercise';
  const targetMuscle = exercise?.targetMuscle ?? '';
  const type = exercise?.type ? exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1) : '';

  return (
    <ThemedView style={styles.card}>
      {/* Header Row: Title/Type + Muscle Chip */}
      <View style={styles.headerRow}>
        <View style={styles.infoContainer}>
          <ThemedText style={styles.title}>{name}</ThemedText>
          <ThemedText secondary style={styles.subtitle}>{type}</ThemedText>
        </View>
        <TargetMuscleChip group={targetMuscle} compact />
      </View>

      {/* Bottom Row: Set Count + Controls */}
      <View style={styles.bottomRow}>
        <ThemedText style={styles.setCountLabel}>x{setCount}</ThemedText>
        
        <View style={styles.buttons}>
            <Pressable 
                onPress={() => onRemoveSet(exerciseId)}
                style={({pressed}) => [styles.button, styles.borderRight, pressed && styles.pressed]}
            >
                <MaterialCommunityIcons name="minus" size={20} color={theme.text} />
            </Pressable>
            
            <Pressable 
                onPress={() => onAddSet(exerciseId)}
                style={({pressed}) => [styles.button, pressed && styles.pressed]}
            >
                <MaterialCommunityIcons name="plus" size={20} color={theme.text} />
            </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: theme.cardBackground,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  setCountLabel: {
    fontSize: 14,
    fontFamily: 'Orbitron',
    fontWeight: '600',
    color: theme.text,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  button: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 36,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: theme.border,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: theme.border,
  }
});
