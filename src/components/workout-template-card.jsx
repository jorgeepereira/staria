import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

import TargetMuscleChip from '@/components/target-muscle-chip';
import ThemedText from '@/components/themed-text';
import { darkTheme, lightTheme } from '@/constants/theme';

export default function WorkoutTemplateCard({ template, onPress, onLongPress, onDelete, selected, disabled }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const stats = template.stats || {};
  const muscles = Object.keys(stats).sort((a, b) => stats[b] - stats[a]);
  
  // Calculate total sets
  const totalSets = muscles.reduce((sum, muscle) => sum + (stats[muscle] || 0), 0);

  return (
    <Pressable 
      onPress={onPress} 
      onLongPress={onLongPress}
      disabled={disabled}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, selected && styles.selected]}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.title}>{template.name || 'Untitled Template'}</ThemedText>
          <ThemedText style={styles.subtitle}>
            Created {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown date'}
          </ThemedText>
        </View>

        {onDelete && (
          <Pressable onPress={onDelete} hitSlop={10} style={styles.deleteButton}>
            <MaterialCommunityIcons name="trash-can-outline" size={24} color={theme.error} />
          </Pressable>
        )}
      </View>

      <View style={styles.separator} />

      <View style={styles.footer}>
        <View style={styles.chipsContainer}>
          {muscles.length > 0 ? (
            muscles.map(muscle => (
              <View key={muscle} style={styles.statItem}>
                <TargetMuscleChip group={muscle} compact />
                <View style={styles.dashedLine} />
                <ThemedText style={styles.statCount}>{stats[muscle]}</ThemedText>
              </View>
            ))
          ) : (
            <ThemedText style={styles.emptyText}>No exercises yet</ThemedText>
          )}
        </View>

        <View style={styles.totalSetsContainer}>
          <ThemedText style={styles.totalSetsLabel}>Total Sets</ThemedText>
          <ThemedText style={styles.totalSetsValue}>{totalSets}</ThemedText>
        </View>
      </View>
    </Pressable>
  ); 
}

const getStyles = (theme) => StyleSheet.create({
  card: {
    flexDirection: 'column',
    backgroundColor: theme.background,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.background,
    borderRadius: 4,
    marginBottom: 12,
  },
  pressed: {
    borderColor: theme.accent,
  },
  selected: {
    borderColor: theme.accent,
    borderWidth: 2,
    backgroundColor: theme.accent + '10', // Slight tint
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  separator: {
    height: 1,
    backgroundColor: theme.border,
    marginBottom: 12,
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  emptyText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
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
});
