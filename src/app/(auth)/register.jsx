import { useAuth } from "@/contexts/AuthContext.jsx";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

// themed components
import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedTextInput from '@/components/themed-textInput.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';

const Register = () => {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);
  
  // register logic
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const { signUp, loading: authLoading, error: authError } = useAuth();
  
  // tiny utility function that validates email and password
  const validateRegister = () => {
    if (!email.includes('@')) return 'Please enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const onRegister = async () => {
    const validate = validateRegister();
    if (validate) { setLocalError(validate); return; }

    try {
      setLocalError(null);
      setSubmitting(true);
      await signUp(email.trim(), password);
      // no need to send user to (tabs) as it is done automatically based on user
    } catch (error) {
      const msg = error?.message?.toLowerCase?.() || "";
      if (msg.includes('already exists')) {
        setLocalError("An account with this email already exists.")
      } else {
        setLocalError('Could not register. Please try again.');
        console.log(error);
        
      }
    } finally {
      setSubmitting(false);
    }
  }
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container}>

          <ThemedView>
            <ThemedText style={{
              fontFamily: 'Orbitron',
              fontWeight: '700',
              fontSize: 52,
              color: theme.text,
              letterSpacing: 1.5,
            }}>
              Staria
            </ThemedText>

            {/* Underline */}
            <View
              style={{
                width: 185, // adjust to match text width
                height: 5,
                backgroundColor: theme.accent,
                borderRadius: 1,
                marginBottom: 40,
              }}
            />
          </ThemedView>
          
          <Spacer />
          <ThemedText style={styles.heading}>Create an Account</ThemedText>

          <ThemedText>
            Already have an account? <Link href={"/login"}><ThemedText style={styles.link}>Sign In</ThemedText></Link>
          </ThemedText>
        
          <Spacer />
          <ThemedView style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <ThemedTextInput 
              style={styles.inputField}
              placeholder='Email'
              keyboardType='email-address'
              value={email}
              onChangeText={setEmail}
            />
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <AntDesign
              name="lock"
              size={22}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <ThemedTextInput 
              style={styles.inputField}
              placeholder='Password'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </ThemedView>

          {(localError || authError) ? (
            <Text style={{ marginTop: 8, color: theme.error}}>
              {localError || authError}
            </Text>
          ): null}

          <Spacer height={20}/>
          <ThemedButton disabled={submitting} onPress={onRegister} style={styles.button}>
            <ThemedText style={{ fontWeight: '800' }}>{submitting ? 'Registering...' : 'Register'}</ThemedText>
          </ThemedButton>
      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default Register;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
  },
  link: {
    color: theme.accent,
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.text,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  button: {
    width: '90%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginTop: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    backgroundColor: theme.textInput,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    paddingVertical: 18,
  },
})