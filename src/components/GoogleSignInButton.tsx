import React from 'react';
import {StyleSheet} from 'react-native';
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
      mode="outlined"
      onPress={onPress}
      style={[styles.button, {borderColor: theme.border}]}
      contentStyle={styles.content}
      labelStyle={[styles.buttonText, {color: theme.text}]}
      icon={() => <Text style={styles.googleIcon}>G</Text>}
    >
      {title}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginBottom: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    height: 50,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignInButton;