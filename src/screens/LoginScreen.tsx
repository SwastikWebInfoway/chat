import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import {useTheme} from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import GoogleSignInButton from '../components/GoogleSignInButton';

interface LoginScreenProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({onLogin, onSwitchToSignup}) => {
  const {theme} = useTheme();

  const handleGoogleSignIn = () => {
    console.log('Google Sign In pressed');
    onLogin();
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topSection}>
            <Logo />
          </View>

          <View style={styles.middleSection}>
            <View style={styles.welcomeContainer}>
              <Text style={[styles.welcomeText, {color: theme.text}]} variant="headlineLarge">
                Welcome Back!
              </Text>
              <Text style={[styles.subtitle, {color: theme.textSecondary}]} variant="bodyLarge">
                Sign in to continue chatting with your friends
              </Text>
            </View>

            <View style={styles.formContainer}>
              <GoogleSignInButton
                title="Continue with Google"
                onPress={handleGoogleSignIn}
              />
            </View>
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.switchContainer}
              onPress={onSwitchToSignup}
              activeOpacity={0.7}
            >
              <Text style={[styles.switchText, {color: theme.textSecondary}]}>
                Don't have an account?{' '}
                <Text style={[styles.switchLink, {color: theme.primary}]}>
                  Sign Up
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.version, {color: theme.textSecondary}]} variant="bodySmall">
                Version 1.0.0
              </Text>
              <Text style={[styles.footerText, {color: theme.textSecondary}]} variant="bodySmall">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeText: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 32,
  },
  bottomSection: {
    alignItems: 'center',
  },
  switchContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
    marginBottom: 8,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;