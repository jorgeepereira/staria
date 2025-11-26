import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, useColorScheme, View } from 'react-native';

// themed components
import HalfScreenModal from '@/components/half-screen-modal.jsx';
import SplitCard from '@/components/split-card.jsx';
import SplitCreateModal from '@/components/split-create-modal.jsx';
import SplitDetailsModal from '@/components/split-details-modal.jsx';
import ThemedButton from '@/components/themed-button.jsx';
import ThemedText from '@/components/themed-text.jsx';
import ThemedView from '@/components/themed-view.jsx';
import { darkTheme, lightTheme } from '@/constants/theme.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { deleteSplit, listSplitsWithStats, updateSplit } from '@/services/splits.js';

const Strategy = () => {
  // theme logic
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);
  const { user } = useAuth();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  
  // Options modal state
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [splitForOptions, setSplitForOptions] = useState(null);

  const loadSplits = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await listSplitsWithStats(user.$id);
      setSplits(data);
    } catch (error) {
      console.error('Failed to load splits', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadSplits();
    }, [loadSplits])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadSplits();
  };

  const handleOpenSplit = (split) => {
    setSelectedSplit(split);
    setDetailsModalVisible(true);
  };

  const handleLongPressSplit = (split) => {
    setSplitForOptions(split);
    setOptionsModalVisible(true);
  };

  const handleDeleteSplit = () => {
    if (!splitForOptions) return;
    
    Alert.alert(
      "Delete Split",
      "Are you sure you want to delete this split? All templates inside will be hidden (or deleted).",
      [
        { 
          text: "Cancel", 
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSplit(splitForOptions.$id);
              setOptionsModalVisible(false);
              loadSplits();
            } catch (error) {
              console.error('Failed to delete split', error);
              Alert.alert("Error", "Failed to delete split");
            }
          }
        }
      ]
    );
  };

  const handleStarSplit = async () => {
    if (!splitForOptions) return;
    
    try {
      await updateSplit(splitForOptions.$id, { star: !splitForOptions.star });
      setOptionsModalVisible(false);
      loadSplits();
    } catch (error) {
      console.error('Failed to update split', error);
      Alert.alert("Error", "Failed to update split");
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView safe style={styles.headerContainer}>
        <ThemedView style={styles.headerRow}>
          <ThemedText heading={true}>Strategy</ThemedText>
          <Pressable onPress={() => setModalVisible(true)}>
            {({ pressed }) => (
                <MaterialCommunityIcons 
                  name={pressed ? "plus-box" : "plus"}
                  size={32}
                  color={theme.text}
                />
                )}
          </Pressable>
        </ThemedView>
      </ThemedView>

      {splits.length === 0 && !loading ? (
        <ThemedText secondary style={{ textAlign: 'center', marginTop: 40 }}>
          No splits yet. Create a folder to organize your workouts!
        </ThemedText>
      ) : (
        <FlatList
          data={splits}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View style={styles.rowFront}>
              <SplitCard 
                split={item} 
                onPress={() => handleOpenSplit(item)}
                onLongPress={() => handleLongPressSplit(item)}
              />
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.content}
        />
      )}

      <SplitCreateModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        onSplitCreated={loadSplits}
      />

      <SplitDetailsModal 
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        split={selectedSplit}
      />

      {/* Options Modal */}
      <HalfScreenModal 
        visible={optionsModalVisible} 
        onClose={() => setOptionsModalVisible(false)}
        height="30%"
      >
        <ThemedText heading style={{ textAlign: 'center', marginBottom: 20 }}>
          {splitForOptions?.name}
        </ThemedText>
        
        <View style={{ gap: 12 }}>
          <ThemedButton 
            onPress={handleStarSplit}
            style={{ backgroundColor: theme.cardBackground, borderWidth: 1, borderColor: theme.border }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons 
                name={splitForOptions?.star ? "star-off" : "star"} 
                size={20} 
                color={theme.accent} 
              />
              <ThemedText style={{ fontWeight: '600' }}>
                {splitForOptions?.star ? "Unstar Split" : "Star Split"}
              </ThemedText>
            </View>
          </ThemedButton>

          <ThemedButton 
            onPress={handleDeleteSplit}
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: theme.error }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.error} />
              <ThemedText style={{ color: theme.error, fontWeight: '600' }}>Delete</ThemedText>
            </View>
          </ThemedButton>
        </View>
      </HalfScreenModal>
    </ThemedView>
  )
}

export default Strategy

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: theme.cardBackground,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomColor: theme.border,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  content: {
    padding: 8,
    paddingBottom: 100,
  },
  rowFront: {
    marginBottom: 8,
  },
})