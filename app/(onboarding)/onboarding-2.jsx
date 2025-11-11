import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../../constants/theme';


// themed components
import ThemedButton from '../../components/themed-button';
import ThemedText from '../../components/themed-text';
import ThemedView from '../../components/themed-view';

const OnboardingScreen2 = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
        Onboarding Step 2
      </ThemedText>
      <ThemedButton onPress={() => router.replace('/onboarding-3')}>
        <ThemedText>Next</ThemedText>
      </ThemedButton>
    </ThemedView>
  )
}

export default OnboardingScreen2;