import { Slot } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

// themed components
import ThemedLoader from "../components/themed-loader.jsx";
import ThemedText from '../components/themed-text.jsx';

function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    // return a splash/loader screen
    return (
      <ThemedLoader>
        <ThemedText>Loading...</ThemedText>
      </ThemedLoader>
    );
  };

  // if not !loading, return a single slot. using redirects in each groups _layout.
  return <Slot />
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
