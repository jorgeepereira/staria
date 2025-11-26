import { ActivityIndicator, useColorScheme } from 'react-native'
import { darkTheme, lightTheme } from '../constants/theme.js'

import ThemedView from './themed-view.jsx'

const ThemedLoader = ({ style }) => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemedView style={[{ 
      flex: 1, 
      justifyContent: "center", 
      alignItems: "center" 
    }, style]}>
      <ActivityIndicator size="large" color={theme.text} />
    </ThemedView>
  )
}

export default ThemedLoader