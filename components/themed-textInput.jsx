import { TextInput, useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../constants/theme';

const ThemedTextInput = ({ style, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <TextInput
      style={[
        {
          backgroundColor: theme.textInput,
          color: theme.textSecondary,
          padding: 20,
          borderRadius: 6,
        },
        style
      ]}
      {...props}
    />
  )
}

export default ThemedTextInput