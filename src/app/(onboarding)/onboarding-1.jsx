import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

// themed components
import Spacer from '@/components/spacer';
import ThemedButton from '@/components/themed-button';
import ThemedText from '@/components/themed-text';
import ThemedTextInput from '@/components/themed-textInput';
import ThemedView from '@/components/themed-view';
import { darkTheme, lightTheme } from '@/constants/theme';

const OnboardingScreen1 = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const { profileData, setProfileData } = useOnboarding();
  const [ name, setName ] = useState(profileData.displayName ?? '');
  const [ error, setError ] = useState(null);
  const router = useRouter();

  const handleNext = () => {
    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters long.');
      return;
    }

    // update context so next screens can see it and move to the next screen
    setProfileData(prev => ({ ...prev, displayName: name.trim() }));
    router.push('/onboarding-2');
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ThemedView style={styles.container} safe>

        <ThemedView>
          <Spacer />
          <ThemedText style={{ fontSize: 32, fontWeight: 'bold' }}>
            Let's get started
          </ThemedText>

          {/* Underline */}
          <View
            style={{
              width: '85%', // adjust to match text width
              height: 5,
              backgroundColor: theme.accent,
              borderRadius: 1,
              marginBottom: 20,
            }}
          />
        </ThemedView>

        <ThemedView>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
            What is your name?
          </ThemedText>

          <ThemedTextInput
            value={name}
            onChangeText={setName}
            width='100%'
            placeholder="Enter your name"
            marginTop={10}
          />
          {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}

          <Spacer />

          <ThemedText
            secondary
            style={{
              textAlign: 'center',
              maxWidth: '100%',
            }}
          >
            This will be your display name. We will use it to personalize your profile.
          </ThemedText>

        </ThemedView>

        <ThemedView style={styles.btnContainer}>
          <Spacer />
          <ThemedButton style={styles.button} onPress={handleNext}>
            <ThemedText style={{fontWeight: 'bold'}}>Next</ThemedText>
          </ThemedButton>
        </ThemedView>
        
      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default OnboardingScreen1;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  btnContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  button: {
    width: '90%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
  },
})