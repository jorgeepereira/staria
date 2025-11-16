import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

// themed components
import Spacer from '@/components/spacer';
import ThemedButton from '@/components/themed-button';
import ThemedText from '@/components/themed-text';
import ThemedView from '@/components/themed-view';
import { darkTheme, lightTheme } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

const OnboardingScreen2 = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const { profileData, setProfileData } = useOnboarding();
  const router = useRouter();

  const setUnits = (units) => {
    setProfileData(prev => ({ ...prev, units }));
  };

  const handleNext = () => {
    router.push('/onboarding-3');
  }

  const handleBack = () => {
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ThemedView style={styles.container} safe>

        <ThemedView>
          <Spacer />
          <ThemedText style={{ fontSize: 32, fontWeight: 'bold' }}>
            Choose wisely
          </ThemedText>

          {/* Underline */}
          <View
            style={{
              width: '75%', // adjust to match text width
              height: 5,
              backgroundColor: theme.accent,
              borderRadius: 1,
              marginBottom: 20,
            }}
          />
        </ThemedView>
        
        <Spacer height={150}/>

        <ThemedView style={{ alignItems : 'center' }}>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
            Choose your units.
          </ThemedText>
          
          <ThemedView style={styles.choiceContainer}>
            <ThemedButton
              style={[
                styles.choiceButtons,
                profileData.units === 'metric' && { borderColor: theme.primary },
              ]}
              onPress={() => setUnits('metric')}
            >
              <ThemedText style={{ fontWeight: '600'}}>Metric</ThemedText>
            </ThemedButton>
            <ThemedButton
              style={[
                styles.choiceButtons,
                profileData.units === 'imperial' && { borderColor: theme.primary },
              ]}
              onPress={() => setUnits('imperial')}
            >
              <ThemedText style={{ fontWeight: '600'}}>Imperial</ThemedText>
            </ThemedButton>

          </ThemedView>

          <Spacer />

          <ThemedText
            secondary
            style={{
              textAlign: 'center',
              maxWidth: '100%',
            }}
          >
            Tell us about your preferred measurement units. We use this information to tailor your experience.
          </ThemedText>

        </ThemedView>

        <ThemedView style={styles.navButtons}>
          <ThemedButton style={styles.buttonBack} onPress={handleBack}>
            <ThemedText style={{fontWeight: 'bold'}}>
              <FontAwesome5 name="long-arrow-alt-left" size={24} color={theme.text} />
            </ThemedText>
          </ThemedButton>
          <ThemedButton style={styles.buttonNext} onPress={handleNext}>
            <ThemedText style={{fontWeight: 'bold'}}>Next</ThemedText>
          </ThemedButton>
        </ThemedView>
        
      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default OnboardingScreen2;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  choiceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  choiceButtons: {
    width: '45%',
    paddingVertical: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.textInput,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 16,
  },
  buttonBack: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
  },
  buttonNext: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
  },
})