import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    // aka if a user is already logged in (not null)
    return <Redirect href={'/(tabs)'} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}/>
  )
}