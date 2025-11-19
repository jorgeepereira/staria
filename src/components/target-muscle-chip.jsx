import { darkTheme, lightTheme } from '@/constants/theme.js';
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
  chest:       '#F87171', // soft red
  back:        '#60A5FA', // soft blue
  frontdelts:  '#FBBF24', // amber-400 — bright, warm
  sidedelts:   '#F59E0B', // amber-500 — slightly deeper
  reardelts:   '#D97706', // amber-600 — rich, darker
  quads:       '#4ADE80', // soft green
  glutes:      '#F472B6', // soft pink
  biceps:      '#C084FC', // soft purple
  triceps:     '#A78BFA', // soft indigo
  abs:         '#2DD4BF', // soft teal
  calves:      '#34D399', // soft emerald
  forearms:    '#94A3B8', // clean slate
  hamstrings:  '#818CF8', // modern indigo blue
};

  // Resolve background color for the group, fallback to theme.accent
  const normalizedGroup = group?.toLowerCase().replace(/[\s-]/g, '') || '';
  const baseColor = MUSCLE_COLORS[normalizedGroup] || theme.accent;

  // Helper to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    if (!hex) return 'transparent';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Modern style: light transparent bg, solid border
  const backgroundColor = hexToRgba(baseColor, 0.40); // 15% opacity
  const borderColor = baseColor;

  const Container = onPress ? Pressable : View;
  
  const upperCaseTargetMuscle = group.toUpperCase();

  return (
    <Container
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor,
          borderWidth: 1.5,
          paddingHorizontal: compact ? 8 : 12,
          paddingVertical: compact ? 4 : 6,
          // Shadow
          shadowColor: baseColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 3,
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
        {upperCaseTargetMuscle || 'Muscle'}
      </ThemedText>
    </Container>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  }
});