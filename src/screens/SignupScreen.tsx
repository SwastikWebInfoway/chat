import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import GoogleSignInButton from '../components/GoogleSignInButton';

interface SignupScreenProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({onSignup, onSwitchToLogin}) => {
  const {theme} = useTheme();

  const handleGoogleSignIn = () => {
    // Mock Google sign-in
    console.log('Google Sign Up pressed');
    onSignup();
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <View style={styles.content}>
        <Logo />

        <View style={styles.formContainer}>
          <Text style={[styles.welcomeText, {color: theme.text}]}>
            Join ChatApp
          </Text>
          <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
            Create your account and start connecting with friends
          </Text>

          <View style={styles.buttonContainer}>
            <GoogleSignInButton
              title="Sign up with Google"
              onPress={handleGoogleSignIn}
            />
          </View>

          <TouchableOpacity
            style={styles.switchContainer}
            onPress={onSwitchToLogin}>
            <Text style={[styles.switchText, {color: theme.textSecondary}]}>
              Already have an account?{' '}
              <Text style={[styles.switchLink, {color: theme.primary}]}>
                Sign In
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, {color: theme.textSecondary}]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.footerText, {color: theme.textSecondary}]}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  switchContainer: {
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
  },
  switchLink: {
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SignupScreen;