import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

// themed components
import Spacer from '@/components/spacer';
import ThemedButton from '@/components/themed-button';
import ThemedText from '@/components/themed-text';
import ThemedTextInput from '@/components/themed-textInput';
import ThemedView from '@/components/themed-view';
import { darkTheme, lightTheme } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

const OnboardingScreen3 = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const { profileData, setProfileData } = useOnboarding();
  const { setIsNewUser } = useAuth();
  const router = useRouter();

  const [weight, setWeight] = useState(profileData.weight ? String(profileData.weight) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const units = profileData.units || 'imperial';

  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [heightCm, setHeightCm] = useState('');

  const weightLabel = units === 'imperial' ? 'eg. 150 lbs' : 'eg. 68 kg';

  useEffect(() => {
    // prefill if coming back to this screen
    if (units === 'imperial' && typeof profileData.height === 'number') {
      const f = Math.floor(profileData.height / 12);
      const i = profileData.height % 12;
      setFeet(String(f));
      setInches(String(i));
    }
    if (units === 'metric' && typeof profileData.height === 'number') {
      setHeightCm(String(profileData.height));
    }
  }, [units, profileData.height]);

  const handleNext = () => {
    setError('');

    // validate & compute height
    let heightVal = null;
    if (units === 'imperial') {
      const f = feet === '' ? null : Number(feet);
      const i = inches === '' ? 0 : Number(inches);
      if (f === null || isNaN(f) || f < 0) {
        setError('Please enter feet (0 or more).'); return;
      }
      if (isNaN(i) || i < 0 || i > 11) {
        setError('Inches must be between 0 and 11.'); return;
      }
      heightVal = f * 12 + i;
      if (heightVal <= 0) { setError('Height must be greater than 0.'); return; }
    } else {
      const h = heightCm.trim() === '' ? null : Number(heightCm);
      if (h === null || isNaN(h) || h <= 0) {
        setError('Please enter height in cm (greater than 0).'); return;
      }
      heightVal = h;
    }

    // validate weight provided must be > 0
    const weightNum = weight.trim() === '' ? null : Number(weight);
    if (weightNum !== null && (isNaN(weightNum) || weightNum <= 0)) {
      setError(`Please enter ${units === 'imperial' ? 'lb' : 'kg'} greater than 0.`); return;
    }

    // save both height & weight into context
    setProfileData(p => ({ ...p, height: heightVal, weight: weightNum }));

    // proceed to Finish
    router.push('/(onboarding)/finish');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ThemedView style={styles.container} safe>

        <ThemedView>
          <Spacer />
          <ThemedText style={{ fontSize: 32, fontWeight: 'bold' }}>
            One last thing!
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
        
        <Spacer height={100}/>

        
        <ThemedView>
          {units === 'imperial' ? (
            <>
              <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                Height (ft/in)
              </ThemedText>

              <ThemedView style={{ flexDirection: 'row', gap: 12 }}>
                <ThemedTextInput
                  value={feet}
                  onChangeText={(t) => setFeet(t.replace(/[^0-9]/g, ''))}
                  width="48%"
                  placeholder="Feet"
                  keyboardType="number-pad"
                />
                <ThemedTextInput
                  value={inches}
                  onChangeText={(t) => setInches(t.replace(/[^0-9]/g, ''))}
                  width="48%"
                  placeholder="Inches"
                  keyboardType="number-pad"
                />
              </ThemedView>
              <ThemedText secondary style={{ marginTop: 6 }}>
                Tip: inches should be 0–11.
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
                Height (cm)
              </ThemedText>
              <ThemedTextInput
                value={heightCm}
                onChangeText={(t) => setHeightCm(t.replace(/[^0-9.]/g, ''))}
                width="100%"
                placeholder="e.g., 178"
                keyboardType="decimal-pad"
              />
            </>
          )}

          <Spacer/>

          <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
            Weight
          </ThemedText>

          <ThemedTextInput
            value={weight}
            onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ''))}
            width='100%'
            placeholder={weightLabel}
            keyboardType="decimal-pad"
          />

          {error && <ThemedText style={{ color: 'red' , marginTop: 6 }}>{error}</ThemedText>}

        </ThemedView>

        <Spacer />

      <ThemedView style={{ alignItems: 'center' }}>
        <ThemedText
          secondary
          style={{
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          Enter your height and weight. This information will help us track your progress and personalize recommendations.
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

export default OnboardingScreen3;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
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