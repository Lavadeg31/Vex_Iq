import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Avatar, List, Switch, Portal, Dialog } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { theme, styles as globalStyles } from '../theme';
import { GeometricBackground } from '../components/GeometricBackground';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { updateUserSettings, deleteUserAccount } from '../utils/db';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleThemeToggle = async () => {
    try {
      setIsDarkMode(!isDarkMode);
      if (user) {
        await updateUserSettings(user.id, {
          theme: !isDarkMode ? 'dark' : 'light'
        });
      }
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (user) {
        await deleteUserAccount(user.id);
        await logout();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <GeometricBackground />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={[globalStyles.card, styles.profileCard]}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Icon
              size={80}
              icon="account"
              style={styles.avatar}
              color={theme.colors.primary}
            />
            <Text style={styles.username}>{user?.username}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </Card.Content>
        </Card>

        <Card style={globalStyles.card}>
          <Card.Content>
            <List.Section>
              <List.Subheader>Settings</List.Subheader>
            </List.Section>
          </Card.Content>
        </Card>

        <Card style={[globalStyles.card, styles.dangerCard]}>
          <Card.Content>
            <List.Section>
              <List.Subheader style={styles.dangerText}>Danger Zone</List.Subheader>
              <Button
                mode="outlined"
                onPress={() => setShowDeleteDialog(true)}
                style={styles.deleteButton}
                textColor={theme.colors.error}
                icon="delete"
              >
                Delete Account
              </Button>
            </List.Section>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={logout}
          style={[globalStyles.button, styles.logoutButton]}
          textColor={theme.colors.error}
          icon="logout"
        >
          Sign Out
        </Button>

        <Portal>
          <Dialog
            visible={showDeleteDialog}
            onDismiss={() => setShowDeleteDialog(false)}
          >
            <Dialog.Title>Delete Account</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to delete your account? This action cannot be undone.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button onPress={handleDeleteAccount} textColor={theme.colors.error}>Delete</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Increased to avoid bottom drawer
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    backgroundColor: theme.colors.background,
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: theme.colors.placeholder,
  },
  dangerCard: {
    marginTop: 24,
  },
  dangerText: {
    color: theme.colors.error,
  },
  deleteButton: {
    borderColor: theme.colors.error,
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 24,
    borderColor: theme.colors.error,
  },
}); 