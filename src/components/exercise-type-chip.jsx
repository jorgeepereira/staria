import { darkTheme, lightTheme } from '@/constants/theme.js';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import ThemedText from './themed-text.jsx';

/**
 * ExerciseTypeChip
 * Small pill displaying the target EXERCISE type with a color-coded background.
 *
 * Props:
 * - type: string (e.g., "Chest", "Back")
 * - onPress?: () => void (optional press behavior)
 * - style?: ViewStyle (optional style override)
 * - textStyle?: TextStyle (optional text style override)
 * - compact?: boolean (smaller paddings/font)
 */
export default function ExerciseTypeChip({ type, onPress, style, textStyle, compact = false }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  // Map EXERCISE types to brand colors (adjust to taste)
  const TYPE_COLORS = {
    barbell: '#ef4444',       // red-500
    dumbbell: '#3b82f6',        // blue-500
    machine: '#f59e0b',  // amber-500
    bodyweight: '#ec4899',      // pink-500
    cable: '#a855f7',      // purple-500
    other: '#64748b',    // slate-500
  };

  const Container = onPress ? Pressable : View;
  
  const upperCaseType = type.toUpperCase();

  return (
    <Container
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: theme.border,
          paddingHorizontal: compact ? 8 : 12,
          paddingVertical: compact ? 4 : 6,
        },
        style,
      ]}
    >
      <ThemedText
        style={[
          { color: theme.text, fontWeight: '700', fontSize: compact ? 10 : 12 },
          textStyle,
        ]}
      >
        {upperCaseType || 'Other'}
      </ThemedText>
    </Container>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
  },
});