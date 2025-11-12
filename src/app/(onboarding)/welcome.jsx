import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, Easing, StyleSheet, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

// themed components
import Spacer from '@/components/spacer';
import ThemedText from '@/components/themed-text';
import ThemedView from '@/components/themed-view';
import { darkTheme, lightTheme } from '@/constants/theme';

const WelcomeScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  // Animation setup
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  const router = useRouter();

  const onStart = () => {
    router.push('/onboarding-1');
  };

  return (
    <TouchableWithoutFeedback onPress={onStart}>
      <ThemedView style={styles.container}>
        
        <ThemedText style={{ fontSize: 32, fontWeight: 'bold' }}>
          Welcome!
        </ThemedText>

        {/* Underline */}
        <View
          style={{
            width: '50%', // adjust to match text width
            height: 5,
            backgroundColor: theme.accent,
            borderRadius: 1,
            marginBottom: 40,
          }}
        />

        <ThemedText
            style={{
              textAlign: 'center',
              maxWidth: '80%',
            }}
          >
          Before we get started, we must get to know you. This helps us personalize your experience.
        </ThemedText>

        <Spacer height={120}/>

        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <ThemedText 
            style={{
              textAlign: 'center',
              maxWidth: '80%',
              fontSize: 16,
              fontWeight: '600',
              color: theme.accent,
            }}
          > 
            Tap the screen to begin.
          </ThemedText>
        </Animated.View>

      </ThemedView>
    </TouchableWithoutFeedback>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})