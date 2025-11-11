import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../../constants/theme';

// themed components
import ThemedButton from '../../components/themed-button';
import ThemedText from '../../components/themed-text';
import ThemedView from '../../components/themed-view';

const OnboardingScreen1 = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
        Onboarding Step 1
      </ThemedText>
      <ThemedButton onPress={() => router.replace('/onboarding-2')}>
        <ThemedText>Next</ThemedText>
      </ThemedButton>
    </ThemedView>
  )
}

export default OnboardingScreen1;