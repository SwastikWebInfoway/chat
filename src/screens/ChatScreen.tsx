import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, TextInput, IconButton, Avatar, ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {launchCamera, launchImageLibrary, Asset} from 'react-native-image-picker';
import {useTheme} from '../contexts/ThemeContext';

const {width} = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isMine: boolean;
  type: 'text' | 'image' | 'video';
  mediaUri?: string;
  videoDuration?: number;
}

interface ChatScreenProps {
  route: {
    params: {
      chatId: string;
      name: string;
      avatarColor: string;
      isOnline: boolean;
    };
  };
  navigation: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({route, navigation}) => {
  const {theme} = useTheme();
  const {name, avatarColor, isOnline} = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Hide bottom tabs when this screen is active
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
    return () => {
      navigation.getParent()?.setOptions({
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
          paddingBottom: 10,
          height: 70,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }
      });
    };
  }, [navigation, theme]);

  // Mock initial messages
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        text: 'Hey! How are you?',
        timestamp: new Date(Date.now() - 3600000),
        isMine: false,
        type: 'text',
      },
      {
        id: '2',
        text: 'I\'m doing great! Just finished that project we discussed.',
        timestamp: new Date(Date.now() - 3500000),
        isMine: true,
        type: 'text',
      },
      {
        id: '3',
        text: 'That\'s awesome! Want to grab coffee later?',
        timestamp: new Date(Date.now() - 3400000),
        isMine: false,
        type: 'text',
      },
    ];
    setMessages(mockMessages);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({animated: true});
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up header
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.surface,
        elevation: 2,
        shadowOpacity: 0.1,
      },
      headerTitle: () => (
        <TouchableOpacity style={styles.headerTitle} onPress={() => console.log('View profile')}>
          <Avatar.Text
            size={40}
            label={name.substring(0, 2).toUpperCase()}
            style={{backgroundColor: avatarColor}}
            labelStyle={{fontSize: 16, fontWeight: '700'}}
          />
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerName, {color: theme.text}]} variant="titleMedium">
              {name}
            </Text>
            <Text style={[styles.headerStatus, {color: theme.textSecondary}]} variant="bodySmall">
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <IconButton
            icon="more-vert"
            size={24}
            iconColor={theme.text}
            onPress={() => console.log('More options')}
          />
        </View>
      ),
    });
  }, [navigation, theme, name, avatarColor, isOnline]);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        timestamp: new Date(),
        isMine: true,
        type: 'text',
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      scrollToBottom();
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.assets && result.assets[0]) {
        sendMediaMessage(result.assets[0], 'image');
      }
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleVideoPicker = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        quality: 0.8,
        selectionLimit: 1,
        videoQuality: 'medium',
      });

      if (result.assets && result.assets[0]) {
        const videoDuration = result.assets[0].duration || 0;
        
        if (videoDuration > 30) {
          Alert.alert('Video Too Long', 'Please select a video shorter than 30 seconds');
          return;
        }
        
        sendMediaMessage(result.assets[0], 'video');
      }
    } catch (error) {
      console.log('Video picker error:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });

      if (result.assets && result.assets[0]) {
        sendMediaMessage(result.assets[0], 'image');
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleVideoRecord = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'video',
        quality: 0.8,
        saveToPhotos: true,
        videoQuality: 'medium',
        durationLimit: 30,
      });

      if (result.assets && result.assets[0]) {
        sendMediaMessage(result.assets[0], 'video');
      }
    } catch (error) {
      console.log('Video recording error:', error);
      Alert.alert('Error', 'Failed to record video');
    }
  };

  const sendMediaMessage = (asset: Asset, type: 'image' | 'video') => {
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: '',
        timestamp: new Date(),
        isMine: true,
        type: type,
        mediaUri: asset.uri,
        videoDuration: asset.duration,
      };
      setMessages(prev => [...prev, newMessage]);
      setIsUploading(false);
      scrollToBottom();
    }, 500);
  };

  const showMediaOptions = () => {
    Alert.alert(
      'Send Media',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleCameraCapture,
        },
        {
          text: 'Record Video (30s)',
          onPress: handleVideoRecord,
        },
        {
          text: 'Choose Photo',
          onPress: handleImagePicker,
        },
        {
          text: 'Choose Video',
          onPress: handleVideoPicker,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const renderMessage = ({item}: {item: Message}) => {
    const isImage = item.type === 'image';
    const isVideo = item.type === 'video';

    return (
      <View
        style={[
          styles.messageContainer,
          item.isMine ? styles.myMessage : styles.theirMessage,
        ]}>
        {isImage && item.mediaUri && (
          <Image source={{uri: item.mediaUri}} style={styles.mediaImage} resizeMode="cover" />
        )}
        {isVideo && item.mediaUri && (
          <View style={styles.videoContainer}>
            <Image source={{uri: item.mediaUri}} style={styles.mediaImage} resizeMode="cover" />
            <View style={styles.playButton}>
              <Icon name="play-circle-filled" size={48} color="#FFFFFF" />
            </View>
            {item.videoDuration && (
              <View style={styles.videoDuration}>
                <Text style={styles.videoDurationText}>
                  {Math.floor(item.videoDuration)}s
                </Text>
              </View>
            )}
          </View>
        )}
        {item.text !== '' && (
          <Text
            style={[
              styles.messageText,
              {color: item.isMine ? '#FFFFFF' : theme.text},
            ]}>
            {item.text}
          </Text>
        )}
        <Text
          style={[
            styles.timestamp,
            {color: item.isMine ? 'rgba(255,255,255,0.7)' : theme.textSecondary},
          ]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        {/* Input Area */}
        <View style={[styles.inputContainer, {backgroundColor: theme.surface}]}>
          <View style={styles.inputRow}>
            <IconButton
              icon="add-circle"
              size={28}
              iconColor={theme.primary}
              onPress={showMediaOptions}
            />
            <TextInput
              style={[styles.input, {backgroundColor: theme.background}]}
              placeholder="Type a message..."
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              textColor={theme.text}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
            {inputText.trim() ? (
              <IconButton
                icon="send"
                size={24}
                iconColor={theme.primary}
                onPress={handleSend}
              />
            ) : (
              <IconButton
                icon="photo-camera"
                size={24}
                iconColor={theme.primary}
                onPress={handleCameraCapture}
              />
            )}
          </View>
          {isUploading && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.uploadingText, {color: theme.textSecondary}]}>
                Uploading...
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerName: {
    fontWeight: '700',
  },
  headerStatus: {
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    maxWidth: '75%',
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF3B8B',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  mediaImage: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 12,
    marginBottom: 8,
  },
  videoContainer: {
    position: 'relative',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
  },
  videoDuration: {
    position: 'absolute',
    bottom: 16,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoDurationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  uploadingText: {
    fontSize: 14,
  },
});

export default ChatScreen;
