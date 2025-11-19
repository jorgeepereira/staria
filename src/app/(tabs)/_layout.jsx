import { useAuth } from "@/contexts/AuthContext.jsx";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useColorScheme } from "react-native";


// themes
import { darkTheme, lightTheme } from "@/constants/theme.js";

const TabLayout = () => {
  // auth logic
  const { user } = useAuth();
  
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  
  if (!user) {
    // aka if a user is NOT already logged in (null), send them to (auth)
    return <Redirect href={'/login'}/>
  }
  
  // if the user check passes, render all of the tabs content 
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      headerStyle: { backgroundColor: theme.background },
      headerTintColor: theme.text,
      headerTitleStyle: { fontFamily: 'Orbitron', fontWeight: 'bold' },
      tabBarStyle: {
        backgroundColor: theme.background,
        borderTopColor: theme.textSecondary,
        paddingTop: 10,
        height: 80,
      },
      tabBarActiveTintColor: theme.text,
      tabBarInactiveTintColor: theme.textSecondary,
      }}>
      
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Dashboard", 
          tabBarIcon: ({ focused }) =>
        <MaterialCommunityIcons 
          name={focused ? 'view-dashboard' : 'view-dashboard-outline'}
          size={24} 
          color={focused ? theme.text : theme.textSecondary}
        />}}
      />

      <Tabs.Screen 
        name="log" 
        options={{ title: "Log", tabBarIcon: ({ focused }) => 
          <MaterialCommunityIcons 
            size={24}
            name={focused ? 'clipboard-text' : 'clipboard-text-outline'}
            color={focused ? theme.text : theme.textSecondary}
          />}}
      />
    
      <Tabs.Screen 
        name="strategy" 
        options={{ title: "Strategy", tabBarIcon: ({ focused }) =>
        <MaterialCommunityIcons 
          name={'strategy'}
          size={24} 
          color={focused ? theme.text : theme.textSecondary}
        />}}
      />

      <Tabs.Screen 
        name="exercises" 
        options={{ 
          title: "Exercises", 
          tabBarIcon: ({ focused }) =>
        <FontAwesome6
          name={'dumbbell'}
          size={22} 
          color={focused ? theme.text : theme.textSecondary}
        />}}
      />

      <Tabs.Screen 
        name="active-workout"
        options={{ 
          title: "Active Workout",
          headerShown: false,
          tabBarStyle: { display: 'none' },
          href: null }}
      />

    </Tabs>
  )
}

export default TabLayout
