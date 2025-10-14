import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, Surface, Avatar, List, Button} from 'react-native-paper';
import {useTheme} from '../contexts/ThemeContext';

const ProfileScreen: React.FC = () => {
  const {theme} = useTheme();

  const profileOptions = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: '👤',
      onPress: () => console.log('Edit Profile'),
    },
    {
      id: '2',
      title: 'Notifications',
      icon: '🔔',
      onPress: () => console.log('Notifications'),
    },
    {
      id: '3',
      title: 'Privacy & Security',
      icon: '🔒',
      onPress: () => console.log('Privacy'),
    },
    {
      id: '4',
      title: 'Theme Settings',
      icon: '🎨',
      onPress: () => console.log('Theme'),
    },
    {
      id: '5',
      title: 'Help & Support',
      icon: '❓',
      onPress: () => console.log('Help'),
    },
    {
      id: '6',
      title: 'About',
      icon: 'ℹ️',
      onPress: () => console.log('About'),
    },
  ];

  const handleOptionPress = (option: typeof profileOptions[0]) => {
    option.onPress();
  };

  const renderProfileOption = (option: typeof profileOptions[0]) => (
    <List.Item
      key={option.id}
      title={option.title}
      left={() => <List.Icon icon="account" />}
      right={() => <List.Icon icon="chevron-right" />}
      onPress={() => handleOptionPress(option)}
      titleStyle={{color: theme.text}}
    />
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Surface style={[styles.header, {backgroundColor: theme.surface}]} elevation={2}>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={80}
              label="👤"
              style={{backgroundColor: theme.primary}}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, {color: theme.text}]} variant="headlineSmall">
                John Doe
              </Text>
              <Text style={[styles.profileStatus, {color: theme.textSecondary}]} variant="bodyMedium">
                Online
              </Text>
            </View>
          </View>
        </Surface>

        <View style={styles.optionsContainer}>
          {profileOptions.map(renderProfileOption)}
        </View>

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={() => console.log('Logout')}
            style={[styles.logoutButton, {borderColor: theme.error}]}
            textColor={theme.error}
          >
            Logout
          </Button>

          <Text style={[styles.version, {color: theme.textSecondary}]} variant="bodySmall">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  profileName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileStatus: {
  },
  optionsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoutButton: {
    marginBottom: 20,
    width: '100%',
  },
  version: {
  },
  avatarLabel: {
    fontSize: 36,
  },
});

export default ProfileScreen;
