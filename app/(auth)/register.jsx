import { Link } from 'expo-router';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, useColorScheme } from 'react-native';

// themed components
import Spacer from '../../components/spacer.jsx';
import ThemedButton from '../../components/themed-button.jsx';
import ThemedText from '../../components/themed-text.jsx';
import ThemedTextInput from '../../components/themed-textInput.jsx';
import ThemedView from '../../components/themed-view.jsx';
import { darkTheme, lightTheme } from '../../constants/theme.js';


const Register = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.heading}>Register a new Account</ThemedText>

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
          <ThemedText>Register</ThemedText>
        </ThemedButton>

        <Spacer />
        <Link href={"/login"} style={styles.link}>
          <ThemedText secondary={true}>Go to Login Page</ThemedText>
        </Link>
      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default Register;

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