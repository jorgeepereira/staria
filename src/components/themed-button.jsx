import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../constants/theme.js';

function ThemedButton ({ style, ...props }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <Pressable
      style={({ pressed }) => [{backgroundColor: theme.accent}
        , styles.btn, pressed && styles.pressed, style]}
      {...props}
    />
  )
}

export default ThemedButton

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#2c2c2c',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.5,
  },
})