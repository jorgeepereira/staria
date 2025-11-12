import NavGate from "@/components/gate";
import { AuthProvider } from "@/contexts/AuthContext";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Aldrich: require('@/assets/fonts/Aldrich-Regular.ttf'),
    Orbitron: require('@/assets/fonts/Orbitron-VariableFont_wght.ttf'),
    OpenSans: require('@/assets/fonts/OpenSans-VariableFont_wdth,wght.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <NavGate />
    </AuthProvider>
  )
}
