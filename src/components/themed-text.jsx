import { StyleSheet, Text, useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../constants/theme.js';

const ThemedText = ({ 
  style, 
  secondary = false, 
  heading = false,
  ...props 
}) => {

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  // secondary color logic
  const textColor = secondary ? theme.textSecondary : theme.text;

  // heading style logic
  const headingStyle = heading ? styles.heading : null;

  return (
    <Text
      style={[{ color: textColor}, headingStyle, style]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
});

export default ThemedText