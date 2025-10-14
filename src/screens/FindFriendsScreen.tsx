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
    }, 800);
  };

  const handleCardPress = () => {
    console.log('View profile:', item.name);
    // Future profile view implementation
  };

  return (
    <TouchableRipple
      onPress={handleCardPress}
      style={styles.compactCardRipple}
      rippleColor={theme.primary + '10'}
    >
      <Surface style={[styles.compactCard, {backgroundColor: theme.surface}]} elevation={1}>
        <View style={styles.compactContent}>
          <View style={styles.compactAvatarContainer}>
            <Avatar.Text
              size={44}
              label={item.name.split(' ').map(n => n[0]).join('')}
              style={{backgroundColor: item.avatarColor}}
              labelStyle={styles.compactAvatarText}
            />
            {item.isOnline && (
              <View style={[styles.compactOnlineIndicator, {backgroundColor: theme.success}]} />
            )}
          </View>
          
          <View style={styles.compactUserInfo}>
            <Text style={[styles.compactName, {color: theme.text}]} variant="titleSmall" numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.compactUsername, {color: theme.textSecondary}]} variant="bodySmall" numberOfLines={1}>
              {item.username}
            </Text>
            <View style={styles.compactMutualContainer}>
              <Icon name="people" size={12} color={theme.textSecondary} />
              <Text style={[styles.compactMutualText, {color: theme.textSecondary}]} variant="bodySmall">
                {item.mutualFriends} mutual
              </Text>
            </View>
          </View>

          <TouchableRipple
            onPress={handleAddFriend}
            style={[styles.compactAddButton, {backgroundColor: isAdding ? theme.primary + '20' : theme.primary}]}
            rippleColor={theme.background + '30'}
            disabled={isAdding}
          >
            <View style={styles.addButtonContent}>
              {isAdding ? (
                <Icon name="hourglass-empty" size={18} color={theme.background} />
              ) : (
                <Icon name="add" size={18} color={theme.background} />
              )}
            </View>
          </TouchableRipple>
        </View>
      </Surface>
    </TouchableRipple>
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
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]} edges={['top']}>
      {/* Modern Header */}
      <View style={[styles.modernHeader, {backgroundColor: theme.background}]}>
        <View style={styles.headerTitleRow}>
          <Icon name="people" size={32} color={theme.primary} />
          <Text style={[styles.modernHeaderTitle, {color: theme.text}]} variant="headlineMedium">
            Discover People
          </Text>
        </View>
        <Text style={[styles.headerSubtitle, {color: theme.textSecondary}]} variant="bodyMedium">
          Connect with amazing people
        </Text>
      </View>

      {/* Enhanced Search */}
      <View style={styles.searchSection}>
        <TextInput
          mode="outlined"
          style={[styles.modernSearchInput, {backgroundColor: theme.surface}]}
          placeholder="Search people, roles, interests..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          left={<TextInput.Icon icon="magnify" color={theme.primary} />}
          right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} color={theme.textSecondary} /> : undefined}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
          textColor={theme.text}
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
                {
                  backgroundColor: activeFilter === category.id ? theme.primary : 'transparent',
                  borderColor: activeFilter === category.id ? theme.primary : theme.border,
                }
              ]}
              textStyle={{
                color: activeFilter === category.id ? '#FFFFFF' : theme.text,
                fontWeight: activeFilter === category.id ? '700' : '500'
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
        ItemSeparatorComponent={() => <View style={{height: 8}} />}
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
  modernHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  modernHeaderTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    opacity: 0.8,
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  modernSearchInput: {
    marginBottom: 16,
  },
  filtersContainer: {
    marginTop: 8,
  },
  filtersContent: {
    paddingRight: 24,
  },
  filterChip: {
    marginRight: 12,
    height: 36,
    borderWidth: 1.5,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  resultsHeader: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  filterInfo: {
    fontStyle: 'italic',
  },
  modernCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  modernName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  modernUsername: {
    marginBottom: 4,
  },
  userStatus: {
    fontStyle: 'italic',
    opacity: 0.8,
  },
  mutualFriendsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mutualFriendsText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernAddButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 25,
    borderWidth: 1.5,
  },
  profileButton: {
    paddingHorizontal: 16,
  },
  // Compact Card Styles
  compactCardRipple: {
    borderRadius: 12,
  },
  compactCard: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAvatarContainer: {
    position: 'relative',
  },
  compactAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  compactOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  compactUserInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  compactName: {
    fontWeight: '600',
    marginBottom: 1,
  },
  compactUsername: {
    marginBottom: 3,
    opacity: 0.8,
  },
  compactMutualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactMutualText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  compactAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FindFriendsScreen;