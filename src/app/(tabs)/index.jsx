import { useAuth } from "@/contexts/AuthContext.jsx";
import { getProfileById } from '@/services/profile';
import { useEffect, useState } from "react";
import { StyleSheet, useColorScheme } from 'react-native';

// themed components
import Spacer from '@/components/spacer.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';


const Dashboard = () => {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const { signOut, user} = useAuth();
  const [ profile, setProfile] = useState(null);

  // load the profile
  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      try {
        const doc = await getProfileById(user.$id);
        if (active) setProfile(doc);
      } catch (e) {
        console.warn('profile load failed', e);
      }
    }
    load();
    return () => { active = false; };
  }, [user]);

  const onLogOut = async () => {
    await signOut();
  }
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText heading={true}>Dashboard</ThemedText>
      <Spacer />

      <ThemedText>Name: {profile?.displayName || '—'}</ThemedText>
      <ThemedText>Units: {profile?.units || '—'}</ThemedText>
      <ThemedText>Height (cm): {profile?.height || '—'}</ThemedText>
      <ThemedText>Weight (kg): {profile?.weight || '—'}</ThemedText>

      <Spacer />
      <ThemedText secondary={true}>{user.email}</ThemedText>

      <Spacer />
      <ThemedButton style={styles.button} onPress={onLogOut}>
        <ThemedText style={{ fontWeight: '800' }}>Log Out</ThemedText>
      </ThemedButton>

    </ThemedView>
  )
}

export default Dashboard

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '90%',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.error,
  },
})