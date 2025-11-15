import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useMemo } from 'react';
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

  // Resolve background color for the type, fallback to theme.accent
  const backgroundColor = TYPE_COLORS[type] || theme.accent;

  // Decide readable text color based on background brightness
  const textColor = useMemo(() => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    // relative luminance
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.55 ? '#0f172a' /* slate-900 */ : '#ffffff';
  }, [backgroundColor]);

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
          { color: textColor, fontWeight: '700', fontSize: compact ? 10 : 12 },
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