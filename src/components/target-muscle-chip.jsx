import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useMemo } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import ThemedText from './themed-text.jsx';

/**
 * TargetMuscleChip
 * Small pill displaying the target muscle group with a color-coded background.
 *
 * Props:
 * - group: string (e.g., "Chest", "Back")
 * - onPress?: () => void (optional press behavior)
 * - style?: ViewStyle (optional style override)
 * - textStyle?: TextStyle (optional text style override)
 * - compact?: boolean (smaller paddings/font)
 */
export default function TargetMuscleChip({ group, onPress, style, textStyle, compact = false }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  // Map muscle groups to brand colors (adjust to taste)
  const MUSCLE_COLORS = {
    chest: '#ef4444',       // red-500
    back: '#3b82f6',        // blue-500
    rearDelts: '#f59e0b',  // amber-500
    frontDelts: '#f59e0b',   // amber-500
    sideDelts: '#f59e0b',    // amber-500
    quads: '#22c55e',        // green-500
    glutes: '#ec4899',      // pink-500
    biceps: '#a855f7',      // purple-500
    triceps: '#6366f1',     // indigo-500
    abs: '#14b8a6',         // teal-500
    calves: '#10b981',      // emerald-500
    forearms: '#64748b',    // slate-500
  };

  // Resolve background color for the group, fallback to theme.accent
  const backgroundColor = MUSCLE_COLORS[group] || theme.accent;

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
  
  const upperCaseTargetMuscle = group.toUpperCase();

  return (
    <Container
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor: theme.border,
          paddingHorizontal: compact ? 8 : 12,
          paddingVertical: compact ? 4 : 6,
        },
        style,
      ]}
    >
      <ThemedText
        style={[
          { color: textColor, fontWeight: '600', fontSize: compact ? 10 : 12 },
          textStyle,
        ]}
      >
        {upperCaseTargetMuscle || 'Muscle'}
      </ThemedText>
    </Container>
  );
}

const styles = StyleSheet.create({
});