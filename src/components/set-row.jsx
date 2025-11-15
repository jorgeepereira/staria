import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useState } from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

// Themed components from your design system
import { MaterialIcons } from '@expo/vector-icons';
import ThemedText from './themed-text.jsx';
import ThemedTextInput from './themed-textInput.jsx';

/**
 * SetRow
 *
 * Responsible for rendering ONE set row inside an exercise card.
 * It does NOT call Appwrite directly; it just:
 *  - receives a set object
 *  - receives a display index ("Set 1", "Set 2", etc.)
 *  - optionally could receive callbacks for edit/delete later
 *
 * For now it's read-only: just shows weight, reps, and a "Logged" indicator.
 */
export default function SetRow({ set, index, onRemove }) {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('');
  const [completed, setCompleted] = useState(false);

  return (
    <View style={styles.row}>
      <View style={styles.deleteColumn}>
        <Pressable onPress={onRemove} hitSlop={10}>
          {({ pressed }) => (
            <MaterialIcons 
            name="remove" 
            size={24} 
            color= {pressed ? theme.error : theme.text}
            />
          )}
        </Pressable>
      </View>

      <View style={styles.valueColumn}>
        <ThemedTextInput
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={styles.input}
          editable={!completed}
        />
      </View>

      <View style={styles.valueColumn}>
        <ThemedTextInput
          value={reps}
          onChangeText={setReps}
          keyboardType="numeric"
          style={styles.input}
          editable={!completed}
        />
      </View>

      <View style={styles.statusColumn}>
        <ThemedText style={styles.loggedValue}>
          {completed ? '✔' : '✘'}
        </ThemedText>
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    paddingVertical: 8,
    borderBottomColor: '#666666',
    borderBottomWidth: 1,
  },
  // Must match ExerciseCard
  deleteColumn: {
    width: 50,
    alignItems: 'center',
  },
  valueColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusColumn: {
    width: 60,
    marginRight: 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  indexValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  loggedValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 0,
    width: '80%',
    color: theme.text,
    backgroundColor: theme.background,
    textAlign: 'center',
  },
});
