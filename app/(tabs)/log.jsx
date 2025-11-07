import { StyleSheet, useColorScheme } from 'react-native';

// themed components
import ThemedText from '../../components/themed-text.jsx';
import ThemedView from '../../components/themed-view.jsx';
import { darkTheme, lightTheme } from '../../constants/theme.js';

const Log = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText heading={true}>Welcome to the Log</ThemedText>
    </ThemedView>
  )
}

export default Log

const styles = StyleSheet.create({
  container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})