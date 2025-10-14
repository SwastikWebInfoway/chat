import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, TextInput, Button, Surface, Avatar, TouchableRipple, Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../contexts/ThemeContext';

const {width} = Dimensions.get('window');

// Mock data for friends suggestions
const mockSuggestions = [
  {id: '1', name: 'Emma Wilson', username: '@emma_w', avatar: '👩‍💼', mutualFriends: 12, isOnline: true, status: 'Software Engineer', avatarColor: '#FF6B9D'},
  {id: '2', name: 'James Rodriguez', username: '@james_r', avatar: '👨‍💻', mutualFriends: 8, isOnline: true, status: 'Product Designer', avatarColor: '#4ECDC4'},
  {id: '3', name: 'Sophia Chen', username: '@sophia_c', avatar: '👩‍🎨', mutualFriends: 5, isOnline: false, status: 'UI/UX Artist', avatarColor: '#45B7D1'},
  {id: '4', name: 'Michael Brown', username: '@michael_b', avatar: '👨‍🔬', mutualFriends: 15, isOnline: true, status: 'Data Scientist', avatarColor: '#96CEB4'},
  {id: '5', name: 'Olivia Davis', username: '@olivia_d', avatar: '👩‍⚕️', mutualFriends: 3, isOnline: false, status: 'Medical Doctor', avatarColor: '#FFEAA7'},
  {id: '6', name: 'William Garcia', username: '@william_g', avatar: '👨‍🏫', mutualFriends: 7, isOnline: true, status: 'Mathematics Prof.', avatarColor: '#DDA0DD'},
];

// Quick filter categories
const filterCategories = [
  { id: 'all', label: 'All', icon: 'people' },
  { id: 'online', label: 'Online', icon: 'wifi' },
  { id: 'mutual', label: 'Mutual Friends', icon: 'group' },
  { id: 'nearby', label: 'Nearby', icon: 'location-on' },
];

interface FriendSuggestionProps {
  item: typeof mockSuggestions[0];
  onAddFriend: (friend: typeof mockSuggestions[0]) => void;
}

const FriendSuggestion: React.FC<FriendSuggestionProps> = ({item, onAddFriend}) => {
  const {theme} = useTheme();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFriend = () => {
    setIsAdding(true);
    setTimeout(() => {
      onAddFriend(item);
      setIsAdding(false);
    }, 1000);
  };

  return (
    <Surface style={[styles.modernCard, {backgroundColor: theme.background}]} elevation={2}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Avatar.Text
            size={56}
            label={item.name.split(' ').map(n => n[0]).join('')}
            style={{backgroundColor: item.avatarColor}}
            labelStyle={styles.avatarText}
          />
          {item.isOnline && (
            <View style={[styles.onlineIndicator, {backgroundColor: theme.success}]} />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.modernName, {color: theme.text}]} variant="titleMedium">
            {item.name}
          </Text>
          <Text style={[styles.modernUsername, {color: theme.textSecondary}]} variant="bodySmall">
            {item.username}
          </Text>
          <Text style={[styles.userStatus, {color: theme.textSecondary}]} variant="bodySmall">
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.mutualFriendsContainer}>
        <Icon name="people" size={14} color={theme.textSecondary} />
        <Text style={[styles.mutualFriendsText, {color: theme.textSecondary}]} variant="bodySmall">
          {item.mutualFriends} mutual friends
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <Button
          mode="outlined"
          onPress={handleAddFriend}
          loading={isAdding}
          disabled={isAdding}
          style={[styles.modernAddButton, {borderColor: theme.primary}]}
          labelStyle={{color: theme.primary, fontSize: 13, fontWeight: '600'}}
        >
          {isAdding ? 'Adding...' : 'Add Friend'}
        </Button>
        <Button
          mode="text"
          onPress={() => console.log('View profile')}
          style={styles.profileButton}
          labelStyle={{color: theme.textSecondary, fontSize: 13}}
        >
          View
        </Button>
      </View>
    </Surface>
  );
};

const FindFriendsScreen: React.FC = () => {
  const {theme} = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredSuggestions, setFilteredSuggestions] = useState(mockSuggestions);

  useEffect(() => {
    let filtered = mockSuggestions;

    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.status.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'online':
        filtered = filtered.filter(item => item.isOnline);
        break;
      case 'mutual':
        filtered = filtered.filter(item => item.mutualFriends > 5);
        break;
      case 'nearby':
        // Mock nearby filter
        filtered = filtered.slice(0, 3);
        break;
      default:
        break;
    }

    setFilteredSuggestions(filtered);
  }, [searchQuery, activeFilter]);

  const handleAddFriend = (friend: typeof mockSuggestions[0]) => {
    console.log('Add friend:', friend.name);
    // Mock add friend functionality - could show success message
  };

  const renderFriendItem = ({item}: {item: typeof mockSuggestions[0]}) => (
    <FriendSuggestion item={item} onAddFriend={handleAddFriend} />
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Modern Header */}
      <View style={[styles.modernHeader, {backgroundColor: theme.background}]}>
        <Text style={[styles.modernHeaderTitle, {color: theme.text}]} variant="headlineMedium">
          Discover People
        </Text>
        <Text style={[styles.headerSubtitle, {color: theme.textSecondary}]} variant="bodyMedium">
          Connect with friends and colleagues
        </Text>
      </View>

      {/* Enhanced Search */}
      <View style={styles.searchSection}>
        <TextInput
          mode="outlined"
          style={[styles.modernSearchInput, {backgroundColor: theme.surface}]}
          placeholder="Search people, roles, interests..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          left={<TextInput.Icon icon="magnify" />}
          right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} /> : undefined}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filterCategories.map((category) => (
            <Chip
              key={category.id}
              mode={activeFilter === category.id ? 'flat' : 'outlined'}
              selected={activeFilter === category.id}
              onPress={() => setActiveFilter(category.id)}
              style={[
                styles.filterChip,
                activeFilter === category.id && {backgroundColor: theme.primary + '15'}
              ]}
              textStyle={{
                color: activeFilter === category.id ? theme.primary : theme.textSecondary,
                fontWeight: activeFilter === category.id ? '600' : '500'
              }}
              icon={category.icon}
            >
              {category.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <FlatList
        data={filteredSuggestions}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{height: 16}} />}
        ListHeaderComponent={() => (
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsTitle, {color: theme.text}]} variant="titleMedium">
              {searchQuery.trim() === '' ? 'People You May Know' : `${filteredSuggestions.length} Results`}
            </Text>
            {activeFilter !== 'all' && (
              <Text style={[styles.filterInfo, {color: theme.textSecondary}]} variant="bodySmall">
                Filtered by {filterCategories.find(f => f.id === activeFilter)?.label}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.modernEmptyContainer}>
            <Icon name="people-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, {color: theme.text}]} variant="titleMedium">
              No People Found
            </Text>
            <Text style={[styles.emptyText, {color: theme.textSecondary}]} variant="bodyMedium">
              {searchQuery.trim() === ''
                ? 'Check back later for new suggestions'
                : 'Try adjusting your search or filters'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    backgroundColor: 'transparent',
  },
  suggestionsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  suggestionsTitle: {
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  suggestionRipple: {
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 16,
  },
  friendName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  friendUsername: {
  },
  addButton: {
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    textAlign: 'center',
  },
  avatarLabel: {
    fontSize: 24,
  },
});

export default FindFriendsScreen;