import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View, useColorScheme } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import ExercisePicker from '@/components/exercise-picker';
import Spacer from '@/components/spacer';
import TemplateExerciseCard from '@/components/template-exercise-card';
import ThemedButton from '@/components/themed-button';
import ThemedText from '@/components/themed-text';
import ThemedView from '@/components/themed-view';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { createTemplate, getTemplateWithSets, updateTemplate } from '@/services/templates';

export default function WorkoutTemplateModal({ visible, onClose, onTemplateCreated, splitId, template }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [setsByExercise, setSetsByExercise] = useState({});
  const [exerciseOrder, setExerciseOrder] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && template) {
      loadTemplateDetails();
    } else if (visible) {
      setName('');
      setSetsByExercise({});
      setExerciseOrder([]);
    }
  }, [visible, template]);

  const loadTemplateDetails = async () => {
    try {
      setLoading(true);
      setName(template.name);
      const { sets } = await getTemplateWithSets(template.$id);
      
      // Group sets by exerciseId
      const grouped = {};
      const order = [];
      sets.forEach(set => {
        if (!grouped[set.exerciseId]) {
          grouped[set.exerciseId] = [];
          order.push(set.exerciseId);
        }
        grouped[set.exerciseId].push(set);
      });
      setSetsByExercise(grouped);
      setExerciseOrder(order);
    } catch (error) {
      console.error('Failed to load template details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = (exercise) => {
    if (!setsByExercise[exercise.$id]) {
      setSetsByExercise(prev => ({
        ...prev,
        [exercise.$id]: [createTempSet()]
      }));
      setExerciseOrder(prev => [...prev, exercise.$id]);
    }
  };

  const createTempSet = () => ({
    $id: `temp-${Date.now()}-${Math.random()}`,
    weight: null,
    reps: null,
    completed: false
  });

  const handleAddSet = (exerciseId) => {
    setSetsByExercise(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), createTempSet()]
    }));
  };

  const handleRemoveSet = (setId) => {
    // Find which exercise this set belongs to
    let targetExerciseId = null;
    for (const exId in setsByExercise) {
      if (setsByExercise[exId].find(s => s.$id === setId)) {
        targetExerciseId = exId;
        break;
      }
    }

    setSetsByExercise(prev => {
      const next = { ...prev };
      for (const exId in next) {
        next[exId] = next[exId].filter(s => s.$id !== setId);
        if (next[exId].length === 0) {
          delete next[exId];
        }
      }
      return next;
    });

    // If we found the exercise and it's now empty (checked via previous state length), remove from order
    if (targetExerciseId && setsByExercise[targetExerciseId].length === 1) {
      setExerciseOrder(prev => prev.filter(id => id !== targetExerciseId));
    }
  };

  const handleRemoveLastSet = (exerciseId) => {
    setSetsByExercise(prev => {
      const currentSets = prev[exerciseId];
      if (!currentSets || currentSets.length === 0) return prev;

      const nextSets = currentSets.slice(0, -1);
      
      const next = { ...prev };
      if (nextSets.length === 0) {
        delete next[exerciseId];
      } else {
        next[exerciseId] = nextSets;
      }
      return next;
    });

    if (setsByExercise[exerciseId] && setsByExercise[exerciseId].length === 1) {
      setExerciseOrder(prev => prev.filter(id => id !== exerciseId));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }
    if (exerciseOrder.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    try {
      setSaving(true);
      if (template) {
        await updateTemplate({
          templateId: template.$id,
          userId: user.$id,
          name: name.trim(),
          exercises: setsByExercise,
          exerciseOrder
        });
      } else {
        await createTemplate({
          userId: user.$id,
          name: name.trim(),
          exercises: setsByExercise,
          splitId: splitId || null,
          exerciseOrder
        });
      }
      onTemplateCreated?.();
      handleClose();
    } catch (error) {
      console.error('Failed to save template', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setSetsByExercise({});
    setExerciseOrder([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>
              {template ? 'Edit Template' : 'New Template'}
            </ThemedText>
            <ThemedButton style={styles.saveButton} onPress={handleSave} disabled={saving} hitSlop={10}>
              <ThemedText style={{ color: theme.success, fontWeight: 'bold', fontSize: 14 }}>
                Save
              </ThemedText>
            </ThemedButton>
          </View>

          <DraggableFlatList
            data={exerciseOrder}
            onDragEnd={({ data }) => setExerciseOrder(data)}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.content}
            renderItem={({ item, drag, isActive }) => (
              <ScaleDecorator>
                <Pressable
                  onLongPress={drag}
                  disabled={isActive}
                  style={[
                    isActive ? { opacity: 0.7 } : {},
                  ]}
                >
                  <TemplateExerciseCard
                    exerciseId={item}
                    setCount={setsByExercise[item]?.length || 0}
                    onAddSet={handleAddSet}
                    onRemoveSet={handleRemoveLastSet}
                  />
                </Pressable>
              </ScaleDecorator>
            )}
            ListHeaderComponent={
              <>
                <View style={styles.nameContainer}>
                  <ThemedText style={styles.label}>Template Name</ThemedText>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="eg. Push Day"
                    placeholderTextColor={theme.textSecondary}
                    returnKeyType="done"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                <ThemedButton 
                  style={styles.addButton} 
                  onPress={() => setPickerVisible(true)}
                >
                  <MaterialCommunityIcons name="plus" size={24} color={theme.accent} />
                  <ThemedText style={{ color: theme.accent , fontWeight: '800', fontSize: 16, marginLeft: 8}}>
                    Add Exercise
                  </ThemedText>
                </ThemedButton>
                <Spacer height={20} />
              </>
            }
            ListFooterComponent={
              <>
                <Spacer height={40} />
              </>
            }
          />

          <ExercisePicker
            visible={pickerVisible}
            userId={user?.$id}
            onSelect={handleAddExercise}
            onClose={() => setPickerVisible(false)}
          />
        </ThemedView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.cardBackground,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Orbitron',
  },
  content: {
    padding: 16,
    paddingBottom: 60,
  },
  nameContainer: {
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Orbitron',
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  nameInput: {
    flex: 1,
    fontWeight: '800',
    fontSize: 24,
    color: theme.text,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.tint,
    padding: 16,
    borderRadius: 8,
    borderColor: theme.accent,
    borderWidth: 1,
    backgroundColor: theme.accent + '10', // Slight tint
  },
  saveButton: {
    backgroundColor: theme.success + '10', // Slight tint
    borderRadius: 6,
    borderColor: theme.success + '50',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
