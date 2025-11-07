import { Link } from 'expo-router';
import { StyleSheet, useColorScheme } from 'react-native';

// themed components
import Spacer from '../../components/spacer.jsx';
import ThemedText from '../../components/themed-text.jsx';
import ThemedView from '../../components/themed-view.jsx';
import { darkTheme, lightTheme } from '../../constants/theme.js';


const Dashboard = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText >Welcome to the Dashboard!</ThemedText>
      <Spacer />

      <Link href={"/login"} style={styles.link}>
          <ThemedText>Login Page</ThemedText>
      </Link>
      <Link href={"/register"} style={styles.link}>
          <ThemedText>Register Page</ThemedText>
      </Link>

    </ThemedView>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.text,
  },
})