import { View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { darkTheme, lightTheme } from '../constants/theme';

const ThemedView = ({ style, safe = false, ...props }) => {

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  if (!safe) {
    return (<View style={[{ backgroundColor: theme.background }, style]} {...props} />
    )
  } 

  return (
    <View style={[{
      backgroundColor: theme.background,
      paddingTop: insets.top,
    }, style]}
    {...props}
    />
  )

}

export default ThemedView