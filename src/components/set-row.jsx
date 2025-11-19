import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, useColorScheme } from 'react-native';

// Themed components from your design system
import { MaterialIcons } from '@expo/vector-icons';
import ThemedCheckbox from './themed-checkbox.jsx';

// helpers: display '' for 0 or null; send null for blank
const displayFromNumber = (n) => (n == null || n === 0 ? '' : String(n));
const numberOrNull = (s) => (s === '' || s == null ? null : Number(s));

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
export default function SetRow({ set, index, onRemove, onChange }) {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('');
  const [completed, setCompleted] = useState(false);

  // Keep locals in sync when parent updates the set
  useEffect(() => {
    setWeight(displayFromNumber(set?.weight));
  }, [set?.weight]);
  useEffect(() => {
    setReps(displayFromNumber(set?.reps));
  }, [set?.reps]);
  useEffect(() => {
    setCompleted(!!set?.completed);
  }, [set?.completed]);

  const commitWeight = () => {
    const val = numberOrNull(weight);
    onChange?.({ weight: val });
    setWeight(displayFromNumber(val));
  };
  const commitReps = () => {
    const val = numberOrNull(reps);
    onChange?.({ reps: val });
    setReps(displayFromNumber(val));
  };
  const toggleCompleted = () => {
    const next = !completed;
    setCompleted(next);
    onChange?.({
      completed: next,
      weight: numberOrNull(weight),
      reps: numberOrNull(reps),
    });
  };

  return (
    <View style={completed ? styles.rowCompleted : styles.row}>
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
        <TextInput
          value={weight}
          onChangeText={setWeight}
          onEndEditing={commitWeight}
          keyboardType="numeric"
          style={styles.input}
          editable={!completed}
        />
      </View>

      <View style={styles.valueColumn}>
        <TextInput
          value={reps}
          onChangeText={setReps}
          onEndEditing={commitReps}
          keyboardType="numeric"
          style={styles.input}
          editable={!completed}
        />
      </View>

      <View style={styles.statusColumn}>
        <ThemedCheckbox
          value={completed}
          onChange={toggleCompleted}
        />
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
  rowCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    paddingVertical: 8,
    borderBottomColor: '#666666',
    borderBottomWidth: 1,
    opacity: 0.5,
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
    fontWeight: '500',
    backgroundColor: theme.background,
    textAlign: 'center',
  },
});
