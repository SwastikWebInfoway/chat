import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import GoogleSignInButton from '../components/GoogleSignInButton';

const {width} = Dimensions.get('window');

interface AuthScreenProps {
  onAuth: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({onAuth}) => {
  const {theme} = useTheme();
  const [isLogin, setIsLogin] = useState(true);

  const handleGoogleSignIn = () => {
    console.log(isLogin ? 'Google Sign In' : 'Google Sign Up');
    onAuth();
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Logo />
        </View>

        {/* Toggle Tabs */}
        <View style={styles.tabContainer}>
          <View style={[styles.tabBackground, {backgroundColor: theme.surface}]}>
            <Button
              mode={isLogin ? 'contained' : 'outlined'}
              onPress={() => setIsLogin(true)}
              style={[
                styles.tabButton,
                {
                  backgroundColor: isLogin ? theme.primary : 'transparent',
                  borderColor: theme.border,
                },
              ]}
              labelStyle={[
                styles.tabButtonText,
                {color: isLogin ? '#FFFFFF' : theme.text},
              ]}
              contentStyle={styles.tabButtonContent}
            >
              Sign In
            </Button>
            <Button
              mode={!isLogin ? 'contained' : 'outlined'}
              onPress={() => setIsLogin(false)}
              style={[
                styles.tabButton,
                {
                  backgroundColor: !isLogin ? theme.primary : 'transparent',
                  borderColor: theme.border,
                },
              ]}
              labelStyle={[
                styles.tabButtonText,
                {color: !isLogin ? '#FFFFFF' : theme.text},
              ]}
              contentStyle={styles.tabButtonContent}
            >
              Sign Up
            </Button>
          </View>
        </View>

        {/* Content */}
        <View style={styles.mainContent}>
          <View style={styles.welcomeContainer}>
            <View style={styles.iconContainer}>
              <Icon 
                name={isLogin ? 'waving-hand' : 'celebration'} 
                size={48} 
                color={theme.primary} 
              />
            </View>
            <Text style={[styles.welcomeText, {color: theme.text}]} variant="headlineLarge">
              {isLogin ? 'Welcome Back!' : 'Join the Fun!'}
            </Text>
            <Text style={[styles.subtitle, {color: theme.textSecondary}]} variant="bodyLarge">
              {isLogin
                ? 'Sign in to continue chatting with your friends'
                : 'Create your account and start connecting'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <GoogleSignInButton
              title={isLogin ? 'Continue with Google' : 'Sign up with Google'}
              onPress={handleGoogleSignIn}
            />
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Icon 
              name={isLogin ? 'rocket-launch' : 'auto-awesome'} 
              size={20} 
              color={theme.primary} 
            />
            <Text style={[styles.infoText, {color: theme.textSecondary}]} variant="bodySmall">
              {isLogin
                ? 'Your friends are waiting for you!'
                : 'Join thousands of happy chatters!'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, {color: theme.textSecondary}]} variant="bodySmall">
            By continuing, you agree to our{'\n'}
            <Text style={{color: theme.primary, fontWeight: '600'}}>Terms of Service</Text> and{' '}
            <Text style={{color: theme.primary, fontWeight: '600'}}>Privacy Policy</Text>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  tabContainer: {
    marginBottom: 40,
  },
  tabBackground: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  tabButtonContent: {
    paddingVertical: 8,
  },
  tabButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 16,
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
    marginBottom: 24,
  },
  infoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AuthScreen;
