import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, Surface, Avatar, Button, TouchableRipple, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../contexts/ThemeContext';

const {width} = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const {theme} = useTheme();

  // User info
  const userInfo = {
    name: 'John Doe',
    username: '@johndoe',
    bio: 'Living my best life | Gamer | Photography enthusiast | Coffee addict',
    joined: 'Joined March 2024',
  };

  // User stats
  const userStats = [
    { label: 'Friends', value: '324', icon: 'people', color: '#FF3B8B' },
    { label: 'Chats', value: '127', icon: 'chat-bubble', color: '#A855F7' },
    { label: 'Groups', value: '8', icon: 'group', color: '#00E676' },
  ];

  // Recent Activity/Interests
  const interests = [
    { id: 1, label: 'Gaming', color: '#FF6B9D', icon: 'sports-esports' },
    { id: 2, label: 'Photography', color: '#4ECDC4', icon: 'photo-camera' },
    { id: 3, label: 'Music', color: '#A855F7', icon: 'music-note' },
    { id: 4, label: 'Travel', color: '#FF9F43', icon: 'flight' },
    { id: 5, label: 'Foodie', color: '#FF6348', icon: 'restaurant' },
    { id: 6, label: 'Reading', color: '#54A0FF', icon: 'menu-book' },
  ];

  // Quick Actions
  const quickActions = [
    {
      id: 'edit',
      title: 'Edit Profile',
      icon: 'edit',
      color: theme.primary,
      onPress: () => console.log('Edit Profile'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      color: '#A855F7',
      onPress: () => console.log('Settings'),
    },
    {
      id: 'share',
      title: 'Share Profile',
      icon: 'share',
      color: '#00E676',
      onPress: () => console.log('Share'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover Photo + Avatar Section */}
        <View style={styles.coverSection}>
          <View style={[styles.coverPhoto, {backgroundColor: theme.primary}]}>
            {/* Clean gradient background */}
          </View>
          
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={100}
              label="JD"
              style={[styles.avatar, {backgroundColor: theme.secondary}]}
              labelStyle={styles.avatarLabel}
            />
            <View style={[styles.onlineBadge, {backgroundColor: theme.success}]}>
              <Icon name="bolt" size={14} color="#FFFFFF" />
            </View>
            <TouchableOpacity style={[styles.editAvatarButton, {backgroundColor: theme.primary}]}>
              <Icon name="camera-alt" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfoSection}>
          <Text style={[styles.userName, {color: theme.text}]} variant="headlineMedium">
            {userInfo.name}
          </Text>
          <Text style={[styles.userUsername, {color: theme.textSecondary}]} variant="bodyLarge">
            {userInfo.username}
          </Text>
          
          <View style={styles.statusChipContainer}>
            <Chip 
              mode="flat" 
              compact
              style={[styles.statusChip, {backgroundColor: theme.success + '20'}]}
              textStyle={{color: theme.success, fontSize: 13, fontWeight: '600'}}
              icon={() => <Icon name="circle" size={8} color={theme.success} />}
            >
              Active Now
            </Chip>
          </View>

          <Text style={[styles.userBio, {color: theme.text}]} variant="bodyMedium">
            {userInfo.bio}
          </Text>
          
          <View style={styles.metaInfo}>
            <Icon name="location-on" size={16} color={theme.textSecondary} />
            <Text style={[styles.metaText, {color: theme.textSecondary}]}>
              San Francisco, CA
            </Text>
            <Text style={[styles.metaText, {color: theme.textSecondary}]}>
              • {userInfo.joined}
            </Text>
          </View>
        </View>

        {/* Stats Card */}
        <Surface style={[styles.statsCard, {backgroundColor: theme.surface}]} elevation={2}>
          <View style={styles.statsContainer}>
            {userStats.map((stat) => (
              <TouchableOpacity key={stat.label} style={styles.statItem} activeOpacity={0.7}>
                <View style={[styles.statIconContainer, {backgroundColor: stat.color + '20'}]}>
                  <Icon name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={[styles.statValue, {color: theme.text}]} variant="headlineSmall">
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, {color: theme.textSecondary}]} variant="bodySmall">
                  {stat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Surface>

        {/* Interests Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Icon name="favorite" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, {color: theme.text}]} variant="titleMedium">
              Interests & Hobbies
            </Text>
          </View>
          <View style={styles.interestsContainer}>
            {interests.map((interest) => (
              <Chip
                key={interest.id}
                mode="flat"
                style={[styles.interestChip, {backgroundColor: interest.color + '15'}]}
                textStyle={{color: theme.text, fontWeight: '600'}}
                icon={() => <Icon name={interest.icon} size={16} color={interest.color} />}
                onPress={() => console.log(interest.label)}
              >
                {interest.label}
              </Chip>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Icon name="bolt" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, {color: theme.text}]} variant="titleMedium">
              Quick Actions
            </Text>
          </View>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <TouchableRipple
                key={action.id}
                onPress={action.onPress}
                style={styles.actionRipple}
                rippleColor={action.color + '20'}
              >
                <Surface style={[styles.actionCard, {backgroundColor: theme.surface}]} elevation={1}>
                  <View style={[styles.actionIconContainer, {backgroundColor: action.color + '15'}]}>
                    <Icon name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={[styles.actionTitle, {color: theme.text}]} variant="bodyMedium">
                    {action.title}
                  </Text>
                </Surface>
              </TouchableRipple>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={() => console.log('Logout')}
            style={[styles.logoutButton, {borderColor: theme.error}]}
            labelStyle={{color: theme.error, fontWeight: '600', fontSize: 15}}
            icon={() => <Icon name="logout" size={20} color={theme.error} />}
          >
            Logout
          </Button>

          <Text style={[styles.version, {color: theme.textSecondary}]} variant="bodySmall">
            ChatApp v1.0.0
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
  
  // Cover & Avatar Section
  coverSection: {
    position: 'relative',
    marginBottom: 60,
  },
  coverPhoto: {
    height: 180,
    width: '100%',
    overflow: 'hidden',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -50,
    alignSelf: 'center',
  },
  avatar: {
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },
  avatarLabel: {
    fontSize: 36,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  // User Info Section
  userInfoSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontWeight: '700',
    marginBottom: 4,
  },
  userUsername: {
    marginBottom: 8,
  },
  statusChipContainer: {
    marginBottom: 16,
  },
  statusChip: {
    height: 28,
  },
  userBio: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },

  // Stats Card
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    opacity: 0.8,
    fontSize: 12,
  },

  // Sections
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
  },

  // Interests
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    marginRight: 4,
    marginBottom: 4,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionRipple: {
    flex: 1,
    borderRadius: 16,
  },
  actionCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  logoutButton: {
    marginBottom: 20,
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 4,
  },
  version: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default ProfileScreen;
