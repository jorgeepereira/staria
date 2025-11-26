import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { ScaleDecorator } from 'react-native-draggable-flatlist';

import { darkTheme, lightTheme } from '@/constants/theme.js';
import { getExerciseById } from '@/services/exercises.js';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import TargetMuscleChip from './target-muscle-chip.jsx';
import ThemedText from './themed-text.jsx';

export default function ReorderableExerciseCard({
  exerciseId,
  drag,
  isActive,
}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const [exercise, setExercise] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const doc = await getExerciseById(exerciseId);
        if (!cancelled) setExercise(doc);
      } catch (e) {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [exerciseId]);

  const name = exercise?.name ?? 'Loading...';
  const targetMuscle = exercise?.targetMuscle ?? '';
  const typeUpperCase = (exercise?.type ?? '').toUpperCase();

  return (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.card, 
          isActive && styles.activeCard
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.dragHandle}>
             <MaterialCommunityIcons name="drag-horizontal" size={24} color={theme.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.title}>{name}</ThemedText>
            <ThemedText secondary style={styles.subtitle}>{typeUpperCase}</ThemedText>
          </View>
          <TargetMuscleChip group={targetMuscle} compact />
        </View>
      </TouchableOpacity>
    </ScaleDecorator>
  );
}

const getStyles = (theme) => StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeCard: {
    backgroundColor: theme.secondary,
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dragHandle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 10,
    marginTop: 2,
  },
});
