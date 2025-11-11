import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ThemedLoader from "./themed-loader";
import ThemedView from "./themed-view";

export default function NavGate() {
  const { user, loading, isNewUser } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // if loading, do nothing

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const inTabsGroup = segments[0] === "(tabs)";

    const navigationTimeout = setTimeout(() => {
    if (!user && !inAuthGroup) {
      // user is not logged in, and not in auth group, redirect to login
      router.replace("/login");
    } else if ( user && isNewUser && !inOnboardingGroup) {
      // user is logged in but new, and not in onboarding group, redirect to onboarding
      router.replace("/onboarding-1");
    } else if (user && !isNewUser && !inTabsGroup) {
      // user is logged in and not new, and not in tabs group, redirect to main app
      router.replace("/(tabs)");
    }
    }, 100); // setTimeout to avoid navigation flashing onboarding screen

    return () => clearTimeout(navigationTimeout);
  }, [user, loading, segments]);

  if (loading) {
    return (
      <ThemedView>
        <ThemedLoader />
      </ThemedView>
    )
  };
  return <Slot />;
}