import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TouchableRipple, Searchbar} from 'react-native-paper';
import {useTheme} from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Helper function to get initials from name
const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Mock data for chat list
const mockChats = [
  {
    id: '1',
    name: 'Alice Johnson',
    lastMessage: 'Hey! How are you doing?',
    time: '2:30 PM',
    unreadCount: 2,
    isOnline: true,
    isTyping: false,
    avatarColor: '#FF5757',
  },
  {
    id: '2',
    name: 'Bob Smith',
    lastMessage: 'Thanks for the help!',
    time: '1:45 PM',
    unreadCount: 0,
    isOnline: false,
    isTyping: false,
    avatarColor: '#2EC4B6',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    lastMessage: 'See you tomorrow! 🎉',
    time: 'Yesterday',
    unreadCount: 1,
    isOnline: true,
    isTyping: false,
    avatarColor: '#7B68EE',
  },
  {
    id: '4',
    name: 'Diana Prince',
    lastMessage: 'The meeting is at 3 PM',
    time: 'Yesterday',
    unreadCount: 0,
    isOnline: true,
    isTyping: true,
    avatarColor: '#FF6B9D',
  },
  {
    id: '5',
    name: 'Group Chat',
    lastMessage: 'Emma: Great work everyone!',
    time: '2 days ago',
    unreadCount: 5,
    isOnline: false,
    isTyping: false,
    avatarColor: '#9C88FF',
  },
  {
    id: '6',
    name: 'Eve Martinez',
    lastMessage: 'Let\'s catch up soon!',
    time: '3 days ago',
    unreadCount: 0,
    isOnline: false,
    isTyping: false,
    avatarColor: '#FFA94D',
  },
  {
    id: '7',
    name: 'Frank Wilson',
    lastMessage: 'Check out this link 🔗',
    time: '1 week ago',
    unreadCount: 0,
    isOnline: true,
    isTyping: false,
    avatarColor: '#20C997',
  },
];

const ChatListScreen = () => {
  const {theme} = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border + '20',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 12,
    },
    searchBar: {
      backgroundColor: theme.background,
      borderRadius: 10,
      elevation: 0,
    },
    searchInput: {
      color: theme.text,
      fontSize: 16,
    },
    listContainer: {
      paddingBottom: 80,
    },
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border + '15',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#10B981',
      borderWidth: 2,
      borderColor: theme.surface,
    },
    unreadBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#FF3B30',
      justifyContent: 'center',
      alignItems: 'center',
    },
    unreadBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    chatContent: {
      flex: 1,
      justifyContent: 'center',
    },
    chatHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    chatName: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
    },
    chatTime: {
      fontSize: 13,
      color: '#8E8E93',
      marginLeft: 8,
    },
    chatTimeUnread: {
      color: '#FF3B30',
      fontWeight: '600',
    },
    lastMessageRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    lastMessage: {
      fontSize: 15,
      color: '#8E8E93',
      flex: 1,
    },
    lastMessageUnread: {
      color: theme.text,
      fontWeight: '500',
    },
    typingIndicator: {
      fontSize: 15,
      color: '#FF3B30',
      fontStyle: 'italic',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 16,
      color: '#8E8E93',
      marginTop: 12,
    },
  });

  const ChatItem = ({item, onPress}) => {
    const hasUnread = item.unreadCount > 0;
    const initials = getInitials(item.name);
    
    return (
      <TouchableRipple
        onPress={() => onPress(item)}
        rippleColor="rgba(0, 0, 0, 0.05)"
      >
        <View style={styles.chatItem}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, {backgroundColor: item.avatarColor}]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {item.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text 
                style={[
                  styles.chatTime,
                  hasUnread && styles.chatTimeUnread
                ]}
              >
                {item.time}
              </Text>
            </View>
            
            <View style={styles.lastMessageRow}>
              {item.isTyping ? (
                <Text style={styles.typingIndicator} numberOfLines={1}>
                  typing...
                </Text>
              ) : (
                <Text
                  style={[
                    styles.lastMessage,
                    hasUnread && styles.lastMessageUnread
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableRipple>
    );
  };

  const handleChatPress = (chat) => {
    console.log('Chat pressed:', chat.name);
  };

  const renderChatItem = ({item}) => (
    <ChatItem item={item} onPress={handleChatPress} />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chat-bubble-outline" size={64} color="#8E8E93" />
      <Text style={styles.emptyText}>No chats found</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <Searchbar
          placeholder="Search chats..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor="#8E8E93"
        />
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={ListEmptyComponent}
      />
    </SafeAreaView>
  );
};

export default ChatListScreen;
