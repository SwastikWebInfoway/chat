/**
 * ChatApp Prototype
 * Beautiful chat app with yellow theme
 */

import React, {useState} from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider as PaperProvider} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ThemeProvider, useTheme} from './src/contexts/ThemeContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import FindFriendsScreen from './src/screens/FindFriendsScreen';
import CallsScreen from './src/screens/CallsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Extracted icon components to avoid defining during render
const ChatIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="chat" color={color} size={size} />
);

const FriendsIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="people" color={color} size={size} />
);

const CallsIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="call" color={color} size={size} />
);

const ProfileIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="person" color={color} size={size} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function TabNavigator() {
  const {theme} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Chats',
          headerTitle: 'Chats',
          tabBarIcon: ChatIcon,
        }}
      />
      <Tab.Screen
        name="FindFriends"
        component={FindFriendsScreen}
        options={{
          tabBarLabel: 'Friends',
          headerTitle: 'Find Friends',
          tabBarIcon: FriendsIcon,
        }}
      />
      <Tab.Screen
        name="Calls"
        component={CallsScreen}
        options={{
          tabBarLabel: 'Calls',
          headerTitle: 'Calls',
          tabBarIcon: CallsIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'My Profile',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator({onLogin}: {onLogin: () => void}) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isLogin ? (
        <Stack.Screen name="Login">
          {() => (
            <LoginScreen
              onLogin={onLogin}
              onSwitchToSignup={() => setIsLogin(false)}
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Signup">
          {() => (
            <SignupScreen
              onSignup={onLogin}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <GestureHandlerRootView style={[styles.container, {backgroundColor: theme.background}]}>
      <NavigationContainer>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        {isAuthenticated ? (
          <TabNavigator />
        ) : (
          <AuthNavigator onLogin={handleLogin} />
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider>
          <AppContent />
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;

