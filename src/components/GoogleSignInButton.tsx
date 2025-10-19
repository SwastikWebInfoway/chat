import React from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {useTheme} from '../contexts/ThemeContext';

interface GoogleSignInButtonProps {
  onPress: () => void;
  title: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({onPress, title}) => {
  const {theme} = useTheme();

  return (
    <Button
      mode="contained"
      onPress={onPress}
      style={[styles.button, {backgroundColor: theme.primary}]}
      contentStyle={styles.content}
      labelStyle={styles.buttonText}
      icon={() => (
        <View style={styles.iconContainer}>
          <Image
            source={{uri: 'https://developers.google.com/identity/images/g-logo.png'}}
            style={styles.googleLogoImage}
            resizeMode="contain"
          />
        </View>
      )}
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#FF3B8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  content: {
    height: 56,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  googleLogoImage: {
    width: 18,
    height: 18,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default GoogleSignInButton;