import { Link } from 'expo-router';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, useColorScheme } from 'react-native';

// themed components
import Spacer from '../../components/spacer.jsx';
import ThemedButton from '../../components/themed-button.jsx';
import ThemedText from '../../components/themed-text.jsx';
import ThemedTextInput from '../../components/themed-textInput.jsx';
import ThemedView from '../../components/themed-view.jsx';
import { darkTheme, lightTheme } from '../../constants/theme.js';

const Login = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.heading}>Login to your Account</ThemedText>

        <ThemedTextInput 
          style={{ width: '80%', marginBottom: 10,}}
          placeholder='Email'
          keyboardType='email-address'
        />

        <ThemedTextInput 
          style={{ width: '80%', marginBottom: 10,}}
          placeholder='Password'
          secureTextEntry
        />

        <ThemedButton>
          <ThemedText>Login</ThemedText>
        </ThemedButton>

        <Spacer />
        <Link href={"/register"} style={styles.link}>
          <ThemedText secondary={true}>Go to Register Page</ThemedText>
        </Link>
      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default Login;

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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  }
})