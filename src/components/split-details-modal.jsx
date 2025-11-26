import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HalfScreenModal from '@/components/half-screen-modal';
import ThemedLoader from '@/components/themed-loader';
import ThemedText from '@/components/themed-text';
import WorkoutTemplateCard from '@/components/workout-template-card';
import WorkoutTemplateModal from '@/components/workout-template-modal';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { deleteTemplate, listTemplatesWithStats, updateTemplateOrder } from '@/services/templates';

export default function SplitDetailsModal({ visible, onClose, split }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);
  const { user } = useAuth();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const loadTemplates = useCallback(async () => {
    if (!user || !split) return;
    try {
      setLoading(true);
      const data = await listTemplatesWithStats(user.$id, split.$id);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates', error);
    } finally {
      setLoading(false);
    }
  }, [user, split]);

  useEffect(() => {
    if (visible && split) {
      loadTemplates();
    }
  }, [visible, split, loadTemplates]);

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (templateId) => {
    Alert.alert(
      "Delete Template",
      "Are you sure you want to delete this template?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTemplate(templateId);
              loadTemplates();
            } catch (error) {
              console.error('Failed to delete template', error);
              Alert.alert("Error", "Failed to delete template");
            }
          }
        }
      ]
    );
  };

  const handleDragEnd = async ({ data }) => {
    setTemplates(data);
    try {
      await updateTemplateOrder(data);
    } catch (error) {
      console.error('Failed to update template order', error);
    }
  };

  return (
    <HalfScreenModal visible={visible} onClose={onClose} height="95%">
      <GestureHandlerRootView style={{ flex: 1, width: '100%' }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <MaterialCommunityIcons name="close" size={30} color={theme.error} />
            </Pressable>
            <ThemedText style={styles.headerTitle}>{split?.name || 'Split Details'}</ThemedText>
            <Pressable onPress={() => setCreateModalVisible(true)}>
              {({ pressed }) => (
                  <MaterialCommunityIcons 
                    name={pressed ? "plus-box" : "plus"}
                    size={32}
                    color={theme.text}
                  />
                )}
            </Pressable>
          </View>

          {loading ? (
            <ThemedLoader style={{ backgroundColor: 'transparent' }} />
          ) : (
            templates.length === 0 ? (
              <ThemedText secondary style={{ textAlign: 'center', marginTop: 40 }}>
                No templates in this split. Create one!
              </ThemedText>
            ) : (
              <DraggableFlatList
                data={templates}
                onDragEnd={handleDragEnd}
                keyExtractor={(item) => item.$id}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                containerStyle={{ width: '100%' , marginBottom: 30}}
                renderItem={({ item, drag, isActive }) => (
                  <WorkoutTemplateCard 
                    template={item} 
                    onPress={() => handleEditTemplate(item)}
                    onLongPress={drag}
                    onDelete={() => handleDeleteTemplate(item.$id)}
                    disabled={isActive}
                    selected={isActive}
                  />
                )}
              />
            )
          )}

          <WorkoutTemplateModal 
            visible={createModalVisible} 
            onClose={handleCloseCreateModal}
            onTemplateCreated={loadTemplates}
            splitId={split?.$id}
            template={selectedTemplate}
          />
        </View>
      </GestureHandlerRootView>
    </HalfScreenModal>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Orbitron',
  },
  content: {
    paddingBottom: 20,
  },
});
