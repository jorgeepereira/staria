import { Text, useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../constants/theme.js';

const ThemedText = ({ style, secondary = false, ...props }) => {

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const textColor = secondary ? theme.textSecondary : theme.text;

  return (
    <Text
      style={[{ color: textColor}, style]}
      {...props}
    />
  )
}

export default ThemedText