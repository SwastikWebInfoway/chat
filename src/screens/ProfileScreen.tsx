import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, Surface, Avatar, Button, TouchableRipple, Switch, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../contexts/ThemeContext';

const {width} = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const {theme} = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // User stats
  const userStats = [
    { label: 'Friends', value: '324', icon: 'people' },
    { label: 'Chats', value: '127', icon: 'chat' },
    { label: 'Groups', value: '8', icon: 'group' },
  ];

  const profileSections = [
    {
      id: 'account',
      title: 'Account',
      options: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: 'person-outline',
          onPress: () => console.log('Edit Profile'),
          hasSwitch: false,
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          icon: 'lock-outline',
          onPress: () => console.log('Privacy'),
          hasSwitch: false,
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      options: [
        {
          id: 'notifications',
          title: 'Notifications',
          subtitle: 'Push notifications and alerts',
          icon: 'notifications-outline',
          onPress: () => setNotificationsEnabled(!notificationsEnabled),
          hasSwitch: true,
          switchValue: notificationsEnabled,
        },
        {
          id: 'theme',
          title: 'Dark Mode',
          subtitle: 'Toggle dark theme',
          icon: 'dark-mode',
          onPress: () => setDarkMode(!darkMode),
          hasSwitch: true,
          switchValue: darkMode,
        },
      ],
    },
    {
      id: 'support',
      title: 'Support',
      options: [
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          icon: 'help-outline',
          onPress: () => console.log('Help'),
          hasSwitch: false,
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'App version and information',
          icon: 'info-outline',
          onPress: () => console.log('About'),
          hasSwitch: false,
        },
      ],
    },
  ];

  const renderStatsCard = () => (
    <Surface style={[styles.statsCard, {backgroundColor: theme.surface}]} elevation={2}>
      <View style={styles.statsContainer}>
        {userStats.map((stat, index) => (
          <View key={stat.label} style={styles.statItem}>
            <Icon name={stat.icon} size={24} color={theme.primary} />
            <Text style={[styles.statValue, {color: theme.text}]} variant="headlineSmall">
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, {color: theme.textSecondary}]} variant="bodySmall">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </Surface>
  );

  const renderProfileOption = (option: any) => (
    <TouchableRipple
      key={option.id}
      onPress={option.onPress}
      style={styles.optionRipple}
      rippleColor={theme.primary + '15'}
    >
      <Surface style={[styles.optionCard, {backgroundColor: theme.surface}]} elevation={1}>
        <View style={styles.optionContent}>
          <View style={styles.optionLeft}>
            <View style={[styles.optionIconContainer, {backgroundColor: theme.primary + '15'}]}>
              <Icon name={option.icon} size={20} color={theme.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, {color: theme.text}]} variant="bodyLarge">
                {option.title}
              </Text>
              <Text style={[styles.optionSubtitle, {color: theme.textSecondary}]} variant="bodySmall">
                {option.subtitle}
              </Text>
            </View>
          </View>
          {option.hasSwitch ? (
            <Switch
              value={option.switchValue}
              onValueChange={option.onPress}
              thumbColor={option.switchValue ? theme.primary : theme.textSecondary}
              trackColor={{false: theme.border, true: theme.primary + '40'}}
            />
          ) : (
            <Icon name="chevron-right" size={20} color={theme.textSecondary} />
          )}
        </View>
      </Surface>
    </TouchableRipple>
  );

  const renderSection = (section: any) => (
    <View key={section.id} style={styles.section}>
      <Text style={[styles.sectionTitle, {color: theme.text}]} variant="titleMedium">
        {section.title}
      </Text>
      <View style={styles.sectionContent}>
        {section.options.map(renderProfileOption)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Modern Profile Header */}
        <View style={[styles.modernHeader, {backgroundColor: theme.background}]}>
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarSection}>
              <Avatar.Text
                size={88}
                label="JD"
                style={{backgroundColor: theme.primary}}
                labelStyle={styles.modernAvatarLabel}
              />
              <View style={[styles.onlineBadge, {backgroundColor: theme.success}]}>
                <Icon name="circle" size={8} color={theme.background} />
              </View>
            </View>
            <View style={styles.profileDetails}>
              <Text style={[styles.modernProfileName, {color: theme.text}]} variant="headlineMedium">
                John Doe
              </Text>
              <Text style={[styles.profileEmail, {color: theme.textSecondary}]} variant="bodyMedium">
                john.doe@example.com
              </Text>
              <View style={styles.statusContainer}>
                <Chip 
                  mode="outlined" 
                  compact
                  style={[styles.statusChip, {borderColor: theme.success}]}
                  textStyle={{color: theme.success, fontSize: 12}}
                  icon={() => <Icon name="circle" size={8} color={theme.success} />}
                >
                  Online
                </Chip>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        {renderStatsCard()}

        {/* Profile Sections */}
        <View style={styles.sectionsContainer}>
          {profileSections.map(renderSection)}
        </View>

        {/* Footer Actions */}
        <View style={styles.modernFooter}>
          <Button
            mode="outlined"
            onPress={() => console.log('Logout')}
            style={[styles.modernLogoutButton, {borderColor: theme.error}]}
            labelStyle={{color: theme.error, fontWeight: '600'}}
            icon={() => <Icon name="logout" size={18} color={theme.error} />}
          >
            Logout
          </Button>

          <Text style={[styles.modernVersion, {color: theme.textSecondary}]} variant="bodySmall">
            ChatApp v1.0.0 • Built with ❤️
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
  scrollContent: {
    paddingBottom: 24,
  },
  
  // Modern Header
  modernHeader: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  profileHeaderContent: {
    alignItems: 'center',
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 16,
  },
  modernAvatarLabel: {
    fontSize: 32,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    alignItems: 'center',
  },
  modernProfileName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    marginBottom: 12,
    opacity: 0.8,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusChip: {
    borderWidth: 1,
  },

  // Stats Card
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    paddingVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    opacity: 0.8,
  },

  // Sections
  sectionsContainer: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    gap: 8,
  },

  // Option Cards
  optionRipple: {
    borderRadius: 12,
  },
  optionCard: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    opacity: 0.8,
    lineHeight: 16,
  },

  // Footer
  modernFooter: {
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  modernLogoutButton: {
    marginBottom: 20,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  modernVersion: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default ProfileScreen;
