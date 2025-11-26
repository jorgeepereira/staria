import { darkTheme, lightTheme } from '@/constants/theme';
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";


export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

 return (
    <Stack
      screenOptions={{
        animation: "none",
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}