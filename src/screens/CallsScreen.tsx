import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, Surface, Avatar, List} from 'react-native-paper';
import {useTheme} from '../contexts/ThemeContext';

// Mock data for calls
const mockCalls = [
  {
    id: '1',
    name: 'Alice Johnson',
    type: 'video', // 'video' or 'audio'
    time: '2:30 PM',
    missed: false,
    avatar: '👩',
  },
  {
    id: '2',
    name: 'Bob Smith',
    type: 'audio',
    time: 'Yesterday',
    missed: true,
    avatar: '👨',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    type: 'video',
    time: '2 days ago',
    missed: false,
    avatar: '🧑',
  },
  {
    id: '4',
    name: 'Diana Prince',
    type: 'audio',
    time: '3 days ago',
    missed: false,
    avatar: '👸',
  },
];

interface CallItemProps {
  item: typeof mockCalls[0];
  onPress: (call: typeof mockCalls[0]) => void;
}

const CallItem: React.FC<CallItemProps> = ({item, onPress}) => {
  const {theme} = useTheme();

  return (
    <List.Item
      title={item.name}
      description={item.missed ? 'Missed call' : `${item.type === 'video' ? 'Video' : 'Audio'} call`}
      left={() => (
        <Avatar.Text
          size={40}
          label={item.avatar}
          style={{backgroundColor: theme.primary}}
          labelStyle={styles.avatarLabel}
        />
      )}
      right={() => (
        <View style={styles.rightContainer}>
          <Text style={[styles.callTime, {color: theme.textSecondary}]} variant="bodySmall">
            {item.time}
          </Text>
          <List.Icon
            icon={item.type === 'video' ? 'video' : 'phone'}
            color={item.missed ? theme.error : theme.primary}
          />
        </View>
      )}
      onPress={() => onPress(item)}
      titleStyle={{color: item.missed ? theme.error : theme.text}}
      descriptionStyle={{color: item.missed ? theme.error : theme.textSecondary}}
    />
  );
};

const CallsScreen: React.FC = () => {
  const {theme} = useTheme();

  const handleCallPress = (call: typeof mockCalls[0]) => {
    console.log('Call pressed:', call.name);
    // Navigate to call screen (not implemented in prototype)
  };

  const renderCallItem = ({item}: {item: typeof mockCalls[0]}) => (
    <CallItem item={item} onPress={handleCallPress} />
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <Surface style={[styles.header, {backgroundColor: theme.surface}]} elevation={2}>
        <Text style={[styles.headerTitle, {color: theme.text}]} variant="headlineMedium">Calls</Text>
      </Surface>

      <FlatList
        data={mockCalls}
        renderItem={renderCallItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  callTime: {
  },
  avatarLabel: {
    fontSize: 20,
  },
});

export default CallsScreen;