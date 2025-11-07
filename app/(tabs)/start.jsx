import { StyleSheet, useColorScheme } from 'react-native';

// themed components
import ThemedText from '../../components/themed-text.jsx';
import ThemedView from '../../components/themed-view.jsx';
import { darkTheme, lightTheme } from '../../constants/theme.js';

const Start = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText >Start a Session!</ThemedText>
    </ThemedView>
  )
}

export default Start;

const styles = StyleSheet.create({
  container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})