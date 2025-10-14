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
import AuthScreen from './src/screens/AuthScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatScreen from './src/screens/ChatScreen';
import FindFriendsScreen from './src/screens/FindFriendsScreen';
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

const ProfileIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="person" color={color} size={size} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Chat Stack Navigator
function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          paddingTop: 10,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          height: 70 + (insets.bottom > 0 ? insets.bottom : 0),
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Chats"
        component={ChatStack}
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

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {theme} = useTheme();

  const handleAuth = () => {
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
          <AuthScreen onAuth={handleAuth} />
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

