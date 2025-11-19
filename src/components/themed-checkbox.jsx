import { darkTheme, lightTheme } from '@/constants/theme.js';
import { FontAwesome6 } from '@expo/vector-icons';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

/**
 * ThemedCheckbox (pure JS)
 * Props:
 *  - value (boolean)
 *  - onChange(next:boolean)
 *  - disabled?
 *  - size? (default 24)
 */
export default function ThemedCheckbox({
  value,
  onChange,
  disabled = false,
  size = 26,
}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <Pressable
      onPress={() => onChange?.(!value)}
      style={({ pressed }) => [
        styles.box,
        {
          width: size,
          height: size,
          borderColor: theme.border,
          backgroundColor: value ? theme.success : theme.background,
          opacity: pressed ? 0.5 : 1,
        },
      ]}
      hitSlop={6}
    >
      {value && 
        <View>
          <FontAwesome6 name="check" size={size * 0.6} color={theme.background} />
        </View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: '55%',
    height: '55%',
    borderRadius: 1,
  },
});