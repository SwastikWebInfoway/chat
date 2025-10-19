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
  StatusBar,
  Keyboard,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {Text, TextInput, IconButton, Avatar, ActivityIndicator, Menu, Button} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EmojiSelector from 'react-native-emoji-selector';
import {launchCamera, launchImageLibrary, MediaType} from 'react-native-image-picker';
import {useTheme} from '../contexts/ThemeContext';
import {usePermissions} from '../hooks/usePermissions';

const {width} = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isMine: boolean;
  type: 'text' | 'image' | 'video' | 'audio';
  mediaUri?: string;
  duration?: string;
}

interface ChatScreenProps {
  route?: {
    params?: {
      chatId?: string;
      name?: string;
      avatarColor?: string;
      isOnline?: boolean;
    };
  };
  navigation?: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({route, navigation}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {permissions, requestCameraPermission, requestMicrophonePermission, openSettings} = usePermissions();
  const {name = 'Chat User', avatarColor = '#FF3B8B', isOnline = false} = route?.params || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const parent = navigation?.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' }
      });
    }
    
    return () => {
      if (parent) {
        parent.setOptions({
          tabBarStyle: undefined
        });
      }
      
      // Clean up recording if component unmounts
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [navigation]);

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
        text: 'I am doing great! Just finished that project we discussed.',
        timestamp: new Date(Date.now() - 3500000),
        isMine: true,
        type: 'text',
      },
      {
        id: '3',
        text: 'That is awesome! Want to grab coffee later?',
        timestamp: new Date(Date.now() - 3400000),
        isMine: false,
        type: 'text',
      },
    ];
    setMessages(mockMessages);
  }, []);

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({animated});
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Handle keyboard showing and hiding
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      scrollToBottom(false);
    });
      
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const showPermissionInfo = () => {
    const missingPermissions = [];
    if (!permissions.camera) missingPermissions.push('📸 Camera');
    if (!permissions.microphone) missingPermissions.push('🎤 Microphone');
    if (!permissions.storage) missingPermissions.push('💾 Storage');

    if (missingPermissions.length === 0) {
      Alert.alert(
        '✅ All Permissions Granted',
        'You have access to all chat features:\n\n📸 Camera for photos/videos\n🎤 Microphone for voice messages\n💾 Storage for saving media',
        [{text: 'Great!'}]
      );
    } else {
      Alert.alert(
        '⚙️ Permission Settings',
        `Missing permissions:\n${missingPermissions.join('\n')}\n\nTo use these features, tap "Enable Permissions" to grant access in your device settings.`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Enable Permissions', onPress: openSettings}
        ]
      );
    }
  };

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
  
  const handleEmojiSelected = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setEmojiPickerVisible(false);
  };
  
  const handleRecordAudio = async () => {
    if (!permissions.microphone) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setRecordingTimer(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Simulate audio recording completion
      const mockAudioPath = 'file://path/to/recorded/audio.mp3';
      
      const newMessage: Message = {
        id: Date.now().toString(),
        text: '',
        timestamp: new Date(),
        isMine: true,
        type: 'audio',
        mediaUri: mockAudioPath,
        duration: `0:${Math.floor(recordingTimer / 1000).toString().padStart(2, '0')}`,
      };
      
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingTimer(0);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTimer(prev => {
          if (prev >= 60000) { // Max 60 seconds
            handleRecordAudio(); // Stop recording
            return prev;
          }
          return prev + 1000;
        });
      }, 1000);
    }
  };

  const compressImage = async (uri: string): Promise<string> => {
    try {
      // For now, just return the original URI since we removed the image manipulator
      // In a real app, you would use a proper image compression library
      console.log('Image compression would happen here for:', uri);
      return uri;
    } catch (error) {
      console.log('Image compression error:', error);
      return uri;
    }
  };

  const sendMediaMessage = async (uri: string, type: 'image' | 'video') => {
    let processedUri = uri;
    
    if (type === 'image') {
      setIsUploading(true);
      processedUri = await compressImage(uri);
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: '',
      timestamp: new Date(),
      isMine: true,
      type,
      mediaUri: processedUri,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsUploading(false);
    scrollToBottom();
  };

  const handleImagePicker = async () => {
    // Navigate to gallery picker
    navigation?.navigate('GalleryPicker', {
      onMediaSelected: async (uri: string, type: 'image' | 'video') => {
        await sendMediaMessage(uri, type);
      },
    });
  };

  const handleVideoPicker = async () => {
    // This is now handled by the gallery picker with video filter
    navigation?.navigate('GalleryPicker', {
      onMediaSelected: async (uri: string, type: 'image' | 'video') => {
        await sendMediaMessage(uri, type);
      },
    });
  };

  const handleCamera = async () => {
    if (!permissions.camera) {
      const granted = await requestCameraPermission();
      if (!granted) return;
    }

    // Navigate to custom camera screen
    navigation?.navigate('Camera', {
      onMediaCaptured: async (uri: string, type: 'image' | 'video') => {
        await sendMediaMessage(uri, type);
      },
    });
  };

  const renderMessage = ({item}: {item: Message}) => {
    const isMyMessage = item.isMine;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}>
        {!isMyMessage && (
          <Avatar.Text
            size={32}
            label={name.substring(0, 2).toUpperCase()}
            style={[styles.messageAvatar, {backgroundColor: avatarColor}]}
            labelStyle={{fontSize: 12, fontWeight: '700'}}
          />
        )}
        <View style={styles.messageContent}>
          {item.type === 'text' ? (
            <View
              style={[
                styles.messageBubble,
                isMyMessage
                  ? [styles.myMessageBubble, {backgroundColor: theme.primary}]
                  : [styles.theirMessageBubble, {backgroundColor: theme.surface}],
              ]}>
              <Text
                style={[
                  styles.messageText,
                  {color: isMyMessage ? '#FFFFFF' : theme.text},
                ]}>
                {item.text}
              </Text>
            </View>
          ) : item.type === 'image' ? (
            <TouchableOpacity
              style={styles.mediaContainer}
              onPress={() => navigation?.navigate('MediaViewer', {
                mediaUri: item.mediaUri,
                mediaType: 'image',
              })}>
              <Image source={{uri: item.mediaUri}} style={styles.mediaImage} />
            </TouchableOpacity>
          ) : item.type === 'video' ? (
            <TouchableOpacity
              style={styles.mediaContainer}
              onPress={() => navigation?.navigate('MediaViewer', {
                mediaUri: item.mediaUri,
                mediaType: 'video',
              })}>
              <Image source={{uri: item.mediaUri}} style={styles.mediaImage} />
              <View style={styles.playButton}>
                <MaterialIcons name="play-arrow" size={40} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.audioBubble,
                isMyMessage
                  ? [styles.myMessageBubble, {backgroundColor: theme.primary}]
                  : [styles.theirMessageBubble, {backgroundColor: theme.surface}],
              ]}
              onPress={() => navigation?.navigate('AudioPlayer', {
                audioUri: item.mediaUri,
                duration: item.duration,
              })}>
              <View style={styles.audioContent}>
                <MaterialCommunityIcons 
                  name="play-circle" 
                  size={30} 
                  color={isMyMessage ? '#FFFFFF' : theme.primary} 
                />
                <View style={styles.audioInfo}>
                  <View style={[styles.audioWaveform, {backgroundColor: isMyMessage ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.1)'}]} />
                  <Text style={{color: isMyMessage ? '#FFFFFF' : theme.text, marginLeft: 8}}>
                    {item.duration || '0:30'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          <Text
            style={[
              styles.messageTime,
              {color: theme.textSecondary},
              isMyMessage && styles.myMessageTime,
            ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        {isMyMessage && <View style={styles.messageAvatarPlaceholder} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]} edges={['right', 'left', 'bottom']}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      
      <View style={[styles.header, {
        backgroundColor: theme.surface,
        paddingTop: insets.top, // Add padding for status bar height
      }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerInfo} onPress={() => console.log('View profile')}>
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
            <Text style={[styles.headerStatus, {color: isOnline ? theme.success : theme.textSecondary}]} variant="bodySmall">
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon={() => <MaterialIcons name="more-vert" size={24} color={theme.text} />}
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
          contentStyle={{backgroundColor: theme.surface, borderRadius: 8}}
          >
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              Alert.alert('Profile', `View ${name}'s profile`);
            }} 
            title="View Profile" 
            titleStyle={{color: theme.text}}
            leadingIcon={() => <MaterialIcons name="person" size={24} color={theme.primary} />} 
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              showPermissionInfo();
            }} 
            title="Permissions" 
            titleStyle={{color: theme.text}}
            leadingIcon={() => <MaterialIcons name="security" size={24} color={theme.primary} />} 
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              Alert.alert('Muted', `${name} has been muted`);
            }} 
            title="Mute" 
            titleStyle={{color: theme.text}}
            leadingIcon={() => <MaterialIcons name="notifications-off" size={24} color={theme.primary} />} 
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              Alert.alert('Block', `Are you sure you want to block ${name}?`, [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Block', style: 'destructive', onPress: () => Alert.alert('Blocked', `${name} has been blocked`)},
              ]);
            }} 
            title="Block" 
            titleStyle={{color: theme.error}}
            leadingIcon={() => <MaterialIcons name="block" size={24} color={theme.error} />} 
          />
        </Menu>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollToBottom()}
      />

      {isUploading && (
        <View style={[styles.uploadingContainer, {backgroundColor: theme.surface}]}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.uploadingText, {color: theme.text}]}>Uploading...</Text>
        </View>
      )}

      {(!permissions.camera || !permissions.microphone) && (
        <View style={[styles.permissionWarningContainer, {backgroundColor: theme.warning + '15'}]}>
          <MaterialIcons name="info" size={16} color={theme.warning} />
          <Text style={[styles.permissionWarningText, {color: theme.warning}]}>
            Some features need permissions. Tap menu → Permissions to enable.
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View 
          style={[
            styles.inputContainer, 
            {
              backgroundColor: theme.surface,
            }
          ]}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[
                styles.cameraButton, 
                {
                  backgroundColor: permissions.camera ? theme.primary + '15' : theme.textSecondary + '15'
                }
              ]}
              onPress={handleCamera}>
              <MaterialIcons 
                name="camera-alt" 
                size={24} 
                color={permissions.camera ? theme.primary : theme.textSecondary} 
              />
            </TouchableOpacity>
            <IconButton
              icon={() => <MaterialIcons name="image" size={24} color={theme.primary} />}
              size={24}
              onPress={handleImagePicker}
            />

            <View style={styles.inputTextContainer}>
              <IconButton
                icon={() => <MaterialIcons name="sentiment-satisfied" size={24} color={theme.textSecondary} />}
                size={24}
                style={styles.emojiButton}
                onPress={() => {
                  // Close keyboard when opening emoji picker
                  Keyboard.dismiss();
                  setEmojiPickerVisible(!emojiPickerVisible);
                }}
              />
              <TextInput
                mode="outlined"
                placeholder="Type a message..."
                value={inputText}
                onChangeText={setInputText}
                style={[styles.textInput, {backgroundColor: theme.background}]}
                outlineColor="transparent"
                activeOutlineColor={theme.primary}
                textColor={theme.text}
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={1000}
              />
            </View>

            {inputText.trim() ? (
              <IconButton
                icon={() => <MaterialIcons name="send" size={24} color={theme.primary} />}
                size={24}
                onPress={handleSend}
              />
            ) : (
              <View style={styles.audioButtonContainer}>
                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <Text style={[styles.recordingTimer, {color: theme.error}]}>
                      {Math.floor(recordingTimer / 1000)}s
                    </Text>
                    <View style={[styles.recordingDot, {backgroundColor: theme.error}]} />
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.microphoneButton,
                    isRecording ? {backgroundColor: theme.error + '20'} : {
                      backgroundColor: permissions.microphone ? theme.primary + '15' : theme.textSecondary + '15'
                    }
                  ]}
                  onPress={handleRecordAudio}
                  onLongPress={handleRecordAudio}
                  delayLongPress={500}>
                  <MaterialCommunityIcons 
                    name={isRecording ? "stop-circle" : "microphone"} 
                    size={24} 
                    color={isRecording ? theme.error : (permissions.microphone ? theme.primary : theme.textSecondary)} 
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        {emojiPickerVisible && (
          <View style={[styles.emojiPickerContainer, {backgroundColor: theme.surface}]}>
            <EmojiSelector
              showSearchBar={false}
              columns={8}
              onEmojiSelected={handleEmojiSelected}
              showTabs={true}
              showHistory={false}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  emojiButton: {
    margin: 0,
    marginLeft: -6,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontWeight: '700',
  },
  headerStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageAvatarPlaceholder: {
    width: 32,
    marginLeft: 8,
  },
  messageContent: {
    maxWidth: width * 0.7,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 4,
  },
  myMessageTime: {
    textAlign: 'right',
  },
  mediaContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: 'cover',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  uploadingText: {
    fontSize: 14,
  },
  inputContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginHorizontal: 4,
    maxHeight: 100,
    fontSize: 15,
  },
  emojiPickerContainer: {
    height: 250,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    zIndex: 10,
    paddingBottom: 20,
  },
  audioBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    maxWidth: width * 0.7,
  },
  audioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.5,
  },
  audioInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  audioWaveform: {
    height: 20,
    flex: 1,
    borderRadius: 10,
  },
  cameraButton: {
    padding: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  audioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  recordingTimer: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  microphoneButton: {
    padding: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  permissionWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 6,
  },
  permissionWarningText: {
    marginLeft: 6,
    fontSize: 11,
    flex: 1,
  },
});

export default ChatScreen;
