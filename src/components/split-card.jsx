import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import TargetMuscleChip from '@/components/target-muscle-chip';
import ThemedText from '@/components/themed-text';
import { darkTheme, lightTheme } from '@/constants/theme';

export default function SplitCard({ split, onPress, onLongPress, style, compact = false }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const stats = split.stats || {};
  const muscles = Object.keys(stats).sort((a, b) => stats[b] - stats[a]);
  
  // Calculate total sets
  const totalSets = muscles.reduce((sum, muscle) => sum + (stats[muscle] || 0), 0);

  return (
    <Pressable 
      style={({ pressed }) => [styles.card, style, pressed && styles.pressed]} 
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      <View style={[styles.header, compact && { marginBottom: 0 }]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={split.star ? "folder-star-outline" : "folder-outline"} 
            size={32} 
            color={split.star ? theme.accent : theme.textSecondary} 
          />
        </View>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="tail">{split.name}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {new Date(split.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>

        <View style={styles.countContainer}>
          <ThemedText style={styles.countText}>{split.templateCount || 0}</ThemedText>
          {compact && (
            <MaterialCommunityIcons name="chevron-right" size={24} color={theme.textSecondary} />
          )}
        </View>
      </View>

      {!compact && (
        <>
          <View style={styles.separator} />

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
        </>
      )}
    </Pressable>
  );
}

const getStyles = (theme) => StyleSheet.create({
  card: {
    flexDirection: 'column',
    backgroundColor: theme.background,
    padding: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 4,
  },
  pressed: {
    borderColor: theme.accent,
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
  separator: {
    height: 1,
    backgroundColor: theme.border,
    marginBottom: 12,
    opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align top so chips wrap nicely
  },
  chipsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontFamily: 'Orbitron',
    fontSize: 20,
    fontWeight: '600',
    color: theme.textSecondary,
  },
});
