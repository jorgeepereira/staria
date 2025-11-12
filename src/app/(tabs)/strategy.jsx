import { StyleSheet, useColorScheme } from 'react-native';

// themed components
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';

const Strategy = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText heading>Welcome to Strategy</ThemedText>
    </ThemedView>
  )
}

export default Strategy

const styles = StyleSheet.create({
  container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})