import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import {useTheme} from '../contexts/ThemeContext';

const Logo: React.FC = () => {
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      <Avatar.Icon
        size={80}
        icon="chat"
        style={{backgroundColor: theme.primary}}
        color="#FFFFFF"
      />
      <Text style={[styles.appName, {color: theme.text}]} variant="headlineMedium">ChatApp</Text>
      <Text style={[styles.tagline, {color: theme.textSecondary}]} variant="bodyLarge">
        Connect with friends
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },
  tagline: {
  },
});

export default Logo;