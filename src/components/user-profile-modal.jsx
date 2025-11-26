import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

import { darkTheme, lightTheme } from '../constants/theme';
import HalfScreenModal from './half-screen-modal';
import Spacer from './spacer';
import ThemedButton from './themed-button';
import ThemedText from './themed-text';
import ThemedView from './themed-view';

const UserProfileModal = ({ visible, onClose, profile }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(theme);

  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isImperial = profile?.units === 'imperial';

  const formatHeight = (cm) => {
    if (!cm) return '-';
    if (isImperial) {
      const totalInches = Math.round(cm * 0.393701);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return `${feet}' ${inches}"`;
    }
    return `${cm} cm`;
  };

  const formatWeight = (kg) => {
    if (!kg) return '-';
    if (isImperial) {
      const lbs = Math.floor(kg * 2.20462);
      return `${lbs} lbs`;
    }
    return `${kg} kg`;
  };

  return (
    <HalfScreenModal visible={visible} onClose={onClose} height="63%">
      <ThemedView style={styles.container}>
        
        <View style={styles.content}>
          {/* Profile Picture Placeholder */}
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={100} color={theme.textSecondary} />
          </View>

          <Spacer height={16} />

          {/* User Name */}
          <ThemedText heading style={styles.nameText}>
            {profile?.displayName || 'User'}
          </ThemedText>
          <ThemedText secondary style={styles.emailText}>
            {user?.email}
          </ThemedText>

          <Spacer height={32} />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText secondary style={styles.statLabel}>Units</ThemedText>
              <ThemedText style={styles.statValue}>
                {profile?.units ? profile.units.charAt(0).toUpperCase() + profile.units.slice(1) : '-'}
              </ThemedText>
            </View>
            
            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <ThemedText secondary style={styles.statLabel}>Height</ThemedText>
              <ThemedText style={styles.statValue}>
                {formatHeight(profile?.height)}
              </ThemedText>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <ThemedText secondary style={styles.statLabel}>Weight</ThemedText>
              <ThemedText style={styles.statValue}>
                {formatWeight(profile?.weight)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.footer}>
          <ThemedButton style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>Log Out</ThemedText>
          </ThemedButton>
          
          <Spacer height={12} />

          <ThemedButton style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.closeText}>Close</ThemedText>
          </ThemedButton>
        </View>

      </ThemedView>
    </HalfScreenModal>
  );
};

export default UserProfileModal;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    marginBottom: 8,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingHorizontal: 16,
    backgroundColor: theme.background,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.border,
    height: '80%',
    alignSelf: 'center',
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 10,
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 16,
    marginBottom: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.error,
  },
  logoutText: {
    fontWeight: '800',
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    width: '100%',
    paddingVertical: 2,
    borderColor: theme.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  closeText: {
    color: theme.error,
    fontWeight: '600',
    fontSize: 16,
  },
});
