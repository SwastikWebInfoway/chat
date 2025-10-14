import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../contexts/ThemeContext';

const Logo: React.FC = () => {
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <Avatar.Icon
          size={90}
          icon="chat-bubble"
          style={[styles.avatar, {backgroundColor: theme.primary}]}
          color="#FFFFFF"
        />
        <View style={[styles.badge, {backgroundColor: theme.secondary}]}>
          <Icon name="bolt" size={16} color="#FFFFFF" />
        </View>
      </View>
      <Text style={[styles.appName, {color: theme.text}]} variant="headlineLarge">
        ChatApp
      </Text>
      <Text style={[styles.tagline, {color: theme.textSecondary}]} variant="bodyMedium">
        Where conversations come alive
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    elevation: 8,
    shadowColor: '#FF3B8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  appName: {
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  tagline: {
    fontWeight: '500',
  },
});

export default Logo;