import { StyleSheet, View } from 'react-native';

// Themed components from your design system
import ThemedText from './themed-text.jsx';

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
export default function SetRow({ set, index }) {
  const weight = set.weight;
  const reps = set.reps;
  const rpe = set.rpe;
  const completed = set.completed;

  return (
    <View style={styles.row}>
      {/* Left side: "Set 1", "Set 2", etc. */}
      <View style={styles.indexColumn}>
        <ThemedText secondary style={styles.indexLabel}>
          Set
        </ThemedText>
        <ThemedText style={styles.indexValue}>{index + 1}</ThemedText>
      </View>

      {/* Middle: weight + reps */}
      <View style={styles.valuesColumn}>
        <View style={styles.valueBlock}>
          <ThemedText secondary style={styles.valueLabel}>
            Weight
          </ThemedText>
          <ThemedText style={styles.valueValue}>
            {weight}
          </ThemedText>
        </View>

        <View style={styles.valueBlock}>
          <ThemedText secondary style={styles.valueLabel}>
            Reps
          </ThemedText>
          <ThemedText style={styles.valueValue}>
            {reps}
          </ThemedText>
        </View>

        
        <View style={styles.valueBlock}>
          <ThemedText secondary style={styles.valueLabel}>
            RPE
          </ThemedText>
          <ThemedText style={styles.valueValue}>
            {rpe}
          </ThemedText>
        </View>
        
      </View>

      {/* Right side: simple "Logged" indicator.
         In the future you might have a "completed" boolean on the set.
         For now, any saved set can be considered "logged".
      */}
      <View style={styles.statusColumn}>
        <ThemedText secondary style={styles.valueLabel}>
          Logged?
        </ThemedText>
        <ThemedText style={styles.loggedValue}>{completed ? '✓' : 'X'}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  indexColumn: {
    width: 50,
    alignItems: 'center',
  },
  indexLabel: {
    fontSize: 12,
  },
  indexValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  valuesColumn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  valueBlock: {
    alignItems: 'center',
    minWidth: 60,
  },
  valueLabel: {
    fontSize: 12,
  },
  valueValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusColumn: {
    width: 70,
    alignItems: 'center',
  },
  loggedValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
