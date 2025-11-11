import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

// themed components
import ThemedButton from '../../components/themed-button';
import ThemedText from '../../components/themed-text';
import ThemedView from '../../components/themed-view';

const OnboardingScreen3 = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const { completeOnboarding } = useAuth();
  const router = useRouter();

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace('/(tabs)'); // Navigate to main app
  };

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
        You're All Set!
      </ThemedText>
      <ThemedButton onPress={handleComplete}>
        <ThemedText>Get Started</ThemedText>
      </ThemedButton>
    </ThemedView>
  );
};

export default OnboardingScreen3;