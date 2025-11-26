import { StyleSheet, View, useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../constants/theme';
import ThemedText from './themed-text';

const ThemedCard = ({ title, subtitle, children, style }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText secondary style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

export default ThemedCard;

const getStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    // Allow content to define its own layout
  },
});
