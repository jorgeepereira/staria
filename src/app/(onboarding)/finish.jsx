
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { upsertProfile } from '@/services/profile';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

// themed imports
import Spacer from '@/components/spacer';
import ThemedButton from '@/components/themed-button';
import ThemedText from '@/components/themed-text';
import ThemedView from '@/components/themed-view';
import { darkTheme, lightTheme } from '@/constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

const toStorageUnits = ({ units, height, weight }) => {
  // Normalize to cm/kg for storage. Keep units as a display preference.
  const h = height == null ? null
    : units === 'imperial' ? Math.round(Number(height) * 2.54) : Number(height); // in→cm
  const w = weight == null ? null
    : units === 'imperial' ? Math.round(Number(weight) / 2.20462) : Number(weight); // lb→kg
  return { height: h, weight: w };
};

const FinishScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const { profileData } = useOnboarding();
  const { user, completeOnboarding } = useAuth();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // friendly preview strings
  const friendlyHeight = useMemo(() => {
    if (profileData.height == null) return '—';
    if (profileData.units === 'imperial') {
      const totalIn = Number(profileData.height);
      const ft = Math.floor(totalIn / 12);
      const inch = totalIn % 12;
      return `${ft}′ ${inch}″`;
    }
    return `${profileData.height} cm`;
  }, [profileData.height, profileData.units]);

  const friendlyWeight = useMemo(() => {
    if (profileData.weight == null) return '—';
    return profileData.units === 'imperial'
      ? `${profileData.weight} lb`
      : `${profileData.weight} kg`;
  }, [profileData.weight, profileData.units]);

  const onFinish = async () => {
    setError('');

    // final guardrails
    if (!profileData.displayName || profileData.displayName.trim().length < 3) {
      setError('Please set a display name (3+ characters).');
      return;
    }
    if (!profileData.units) {
      setError('Please choose units.');
      return;
    }
    // height/weight are optional; if provided they must be numbers > 0
    if (profileData.height != null && !(Number(profileData.height) > 0)) {
      setError('Height must be greater than 0.'); return;
    }
    if (profileData.weight != null && !(Number(profileData.weight) > 0)) {
      setError('Weight must be greater than 0.'); return;
    }

    setSaving(true);
    try {
      const norm = toStorageUnits(profileData);
      const payload = {
        displayName: profileData.displayName.trim(),
        units: profileData.units,
        height: norm.height,          // cm or null
        weight: norm.weight,          // kg or null
        avatarUrl: profileData.avatarUrl ?? null,
      };

      await upsertProfile(user.$id, payload);   // create if missing, else update
      completeOnboarding();                     // stop gate from redirecting back
      router.replace('/(tabs)');                // into main app
    } catch (e) {
      console.log(e);
      setError('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };


  return (
      <ThemedView style={styles.container} safe>

        <ThemedView>
          <Spacer />
          <ThemedText style={{ fontSize: 32, fontWeight: 'bold' }}>
            Looks good?
          </ThemedText>

          {/* Underline */}
          <View
            style={{
              width: '65%', // adjust to match text width
              height: 5,
              backgroundColor: theme.accent,
              borderRadius: 1,
              marginBottom: 20,
            }}
          />
        </ThemedView>

        <Spacer />

        <ThemedView style={styles.summaryContainer}>

          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
            Name
          </ThemedText>
          {/* Underline */}
          <View
            style={{
              width: '40%', // adjust to match text width
              height: 5,
              backgroundColor: theme.border,
              borderRadius: 1,
              marginTop: 6,
            }}
          />
          <ThemedText secondary style={{ fontSize: 16, marginTop: 10 }}>
              {profileData.displayName || '—'}
          </ThemedText>
          
          <Spacer />

          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
            Units
          </ThemedText>
          {/* Underline */}
          <View
            style={{
              width: '40%', // adjust to match text width
              height: 5,
              backgroundColor: theme.border,
              borderRadius: 1,
              marginTop: 6,
            }}
          />
          <ThemedText secondary style={{ fontSize: 16, marginTop: 10 }}>
              {profileData.units === 'imperial' ? 'Imperial (lb/in)' : 'Metric (kg/cm)'}
            </ThemedText>
          <Spacer />

          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
            Height
          </ThemedText>
          {/* Underline */}
          <View
            style={{
              width: '40%', // adjust to match text width
              height: 5,
              backgroundColor: theme.border,
              borderRadius: 1,
              marginTop: 6,
            }}
          />
          <ThemedText secondary style={{ fontSize: 16, marginTop: 10 }}>
            {friendlyHeight}
          </ThemedText>
          <Spacer />
          

            <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
              Weight
            </ThemedText>
            {/* Underline */}
            <View
              style={{
                width: '40%', // adjust to match text width
                height: 5,
                backgroundColor: theme.border,
                borderRadius: 1,
                marginTop: 6,
              }}
            />
            <ThemedText secondary style={{ fontSize: 16, marginTop: 10 }}>
                {friendlyWeight}
            </ThemedText>
          

        </ThemedView>
        
        <ThemedView style={styles.navButtons}>
          <ThemedButton style={styles.buttonBack} onPress={handleBack}>
            <ThemedText style={{fontWeight: 'bold'}}>
              <FontAwesome5 name="long-arrow-alt-left" size={24} color={theme.text} />
            </ThemedText>
          </ThemedButton>
          <ThemedButton style={styles.buttonNext} onPress={onFinish}>
            <ThemedText style={{fontWeight: 'bold'}}>Finish</ThemedText>
          </ThemedButton>
        </ThemedView>
        
      </ThemedView>
  )
}

export default FinishScreen;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  summaryContainer: {
    alignItems: 'center',
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