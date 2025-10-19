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
import EmojiPicker, {EmojiType} from 'rn-emoji-keyboard';
import {launchCamera, launchImageLibrary, MediaType} from 'react-native-image-picker';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
// @ts-ignore
import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Sound | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const isStoppingRecordingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    const parent = navigation?.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: 'none' }
      });
    }
    
    return () => {
      isMountedRef.current = false;
      if (parent) {
        parent.setOptions({
          tabBarStyle: undefined
        });
      }
      
      // Clean up recording timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Stop recording if active
      if (isRecording) {
        try {
          AudioRecord.stop().catch(err => console.warn('Error stopping recording on unmount:', err));
        } catch (error) {
          console.warn('Error stopping recording on unmount:', error);
        }
      }
      
      // Clean up audio playback
      if (soundRef.current) {
        try {
          soundRef.current.stop(() => {});
          soundRef.current.release();
          soundRef.current = null;
        } catch (error) {
          console.warn('Error cleaning up sound on unmount:', error);
        }
      }
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [navigation, isRecording]);

  useEffect(() => {
    // Initialize audio recording
    try {
      const options = {
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        wavFile: 'recording.wav'
      };
      AudioRecord.init(options);
      console.log('Audio recording initialized successfully');
    } catch (error) {
      console.warn('Audio recording initialization failed:', error);
    }
  }, []);

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
      if (flatListRef.current && isMountedRef.current) {
        flatListRef.current.scrollToEnd({animated});
      }
    }, 100);
  };

  useEffect(() => {
    // Only scroll on initial load, not on every message change
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]); // Changed from [messages] to [messages.length]
  
  useEffect(() => {
    // Handle keyboard showing and hiding
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      scrollToBottom(false);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
      
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Cleanup audio resources when component unmounts
    return () => {
      if (soundRef.current) {
        try {
          soundRef.current.stop(() => {});
          soundRef.current.release();
          soundRef.current = null;
        } catch (error) {
          console.warn('Error cleaning up audio:', error);
        }
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
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
  
  const handleEmojiSelected = (emoji: EmojiType) => {
    setInputText(prev => prev + emoji.emoji);
    setEmojiPickerVisible(false);
  };
  
  const handleRecordAudio = async () => {
    // Prevent concurrent operations
    if (isStoppingRecordingRef.current) {
      console.log('Recording stop already in progress');
      return;
    }

    if (!permissions.microphone) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    if (isRecording) {
      // Stop recording
      isStoppingRecordingRef.current = true;
      const currentTimer = recordingTimer; // Capture current timer BEFORE clearing
      
      // Clear interval first
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Update state
      setIsRecording(false);
      setRecordingTimer(0);
      
      try {
        const audioFile = await AudioRecord.stop();
        console.log('Recording stopped, file:', audioFile);
        
        if (isMountedRef.current) {
          const newMessage: Message = {
            id: Date.now().toString(),
            text: '',
            timestamp: new Date(),
            isMine: true,
            type: 'audio',
            mediaUri: audioFile,
            duration: `0:${Math.floor(currentTimer / 1000).toString().padStart(2, '0')}`,
          };
          
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Failed to stop recording:', error);
        if (isMountedRef.current) {
          Alert.alert('Recording Error', 'Failed to save audio recording');
        }
      } finally {
        isStoppingRecordingRef.current = false;
      }
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingTimer(0);
      
      try {
        await AudioRecord.start();
        console.log('Recording started');
        
        // Start timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTimer(prev => {
            const newTime = prev + 1000;
            
            // Check if we've hit the max time
            if (newTime >= 60000) {
              // Stop automatically without recursive call
              if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
              }
              
              // Stop recording asynchronously
              if (!isStoppingRecordingRef.current) {
                isStoppingRecordingRef.current = true;
                setIsRecording(false);
                
                AudioRecord.stop()
                  .then(audioFile => {
                    console.log('Auto-stopped at 60s, file:', audioFile);
                    if (isMountedRef.current) {
                      const newMessage: Message = {
                        id: Date.now().toString(),
                        text: '',
                        timestamp: new Date(),
                        isMine: true,
                        type: 'audio',
                        mediaUri: audioFile,
                        duration: '1:00', // 60 seconds
                      };
                      setMessages(prev => [...prev, newMessage]);
                      scrollToBottom();
                    }
                  })
                  .catch(error => {
                    console.error('Failed to stop recording at max time:', error);
                    if (isMountedRef.current) {
                      Alert.alert('Recording Error', 'Failed to save audio recording');
                    }
                  })
                  .finally(() => {
                    isStoppingRecordingRef.current = false;
                    setRecordingTimer(0);
                  });
              }
              
              return newTime; // Keep last value
            }
            
            return newTime;
          });
        }, 1000);
      } catch (error) {
        console.error('Failed to start recording:', error);
        setIsRecording(false);
        setRecordingTimer(0);
        if (isMountedRef.current) {
          Alert.alert('Recording Error', 'Failed to start audio recording');
        }
      }
    }
  };

  const handlePlayAudio = async (messageId: string, audioUri: string) => {
    try {
      // Stop current playing audio if any
      if (soundRef.current) {
        soundRef.current.stop(() => {});
        soundRef.current.release();
        soundRef.current = null;
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }

      // If clicking the same audio that's playing, just pause
      if (playingAudioId === messageId) {
        setPlayingAudioId(null);
        setAudioProgress(0);
        return;
      }

      // Start new audio
      const sound = new Sound(audioUri, '', (error) => {
        if (error) {
          console.error('Failed to load sound:', error);
          if (isMountedRef.current) {
            Alert.alert('Playback Error', 'Failed to load audio file');
          }
          return;
        }

        if (!isMountedRef.current) {
          sound.release();
          return;
        }

        setPlayingAudioId(messageId);
        setAudioDuration(sound.getDuration());
        setAudioProgress(0);

        sound.play((success) => {
          if (!isMountedRef.current) return;
          
          if (success) {
            console.log('Audio played successfully');
          } else {
            console.log('Audio playback failed');
          }
          setPlayingAudioId(null);
          setAudioProgress(0);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        });

        // Start progress tracking
        progressIntervalRef.current = setInterval(() => {
          if (!isMountedRef.current || !soundRef.current) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return;
          }
          
          sound.getCurrentTime((seconds) => {
            if (isMountedRef.current) {
              setAudioProgress(seconds);
            }
          });
        }, 100);
      });

      soundRef.current = sound;
    } catch (error) {
      console.error('Failed to play audio:', error);
      if (isMountedRef.current) {
        Alert.alert('Playback Error', 'Failed to play audio');
      }
    }
  };

  const handleAudioSeek = (messageId: string, gestureState: any) => {
    if (!soundRef.current || playingAudioId !== messageId || audioDuration === 0) return;

    const { translationX } = gestureState;
    const audioWidth = width * 0.5; // Same width as audioContent
    const seekPercentage = Math.max(0, Math.min(1, (translationX / audioWidth) + 0.5)); // Center at 0.5
    const newPosition = seekPercentage * audioDuration;

    setSeekPosition(newPosition);
    setIsSeeking(true);

    // Seek to the new position
    soundRef.current.setCurrentTime(newPosition);
    setAudioProgress(newPosition);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
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
            <PanGestureHandler
              onGestureEvent={(event) => handleAudioSeek(item.id, event.nativeEvent)}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  handleSeekEnd();
                }
              }}>
              <View
                style={[
                  styles.audioBubble,
                  isMyMessage
                    ? [styles.myMessageBubble, {backgroundColor: theme.primary}]
                    : [styles.theirMessageBubble, {backgroundColor: theme.surface}],
                ]}>
                <TouchableOpacity
                  style={styles.audioContent}
                  onPress={() => handlePlayAudio(item.id, item.mediaUri!)}
                  activeOpacity={0.7}>
                  <MaterialCommunityIcons 
                    name={playingAudioId === item.id ? "pause-circle" : "play-circle"} 
                    size={30} 
                    color={isMyMessage ? '#FFFFFF' : theme.primary} 
                  />
                  <View style={styles.audioInfo}>
                    <View style={[styles.audioWaveform, {backgroundColor: isMyMessage ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.1)'}]}>
                      {playingAudioId === item.id && audioDuration > 0 && (
                        <View 
                          style={[
                            styles.audioProgress, 
                            {
                              width: `${((isSeeking ? seekPosition : audioProgress) / audioDuration) * 100}%`,
                              backgroundColor: isSeeking ? (isMyMessage ? 'rgba(255,255,255,0.9)' : theme.primary) : 'rgba(255,255,255,0.8)'
                            }
                          ]} 
                        />
                      )}
                      {isSeeking && playingAudioId === item.id && (
                        <View style={[styles.seekIndicator, {backgroundColor: isMyMessage ? '#FFFFFF' : theme.primary}]} />
                      )}
                    </View>
                    <Text style={{color: isMyMessage ? '#FFFFFF' : theme.text, marginLeft: 8}}>
                      {playingAudioId === item.id ? 
                        (isSeeking ? 
                          `${Math.floor(seekPosition)}:${Math.floor((seekPosition % 1) * 60).toString().padStart(2, '0')}` :
                          `${Math.floor(audioProgress)}:${Math.floor((audioProgress % 1) * 60).toString().padStart(2, '0')}`
                        ) : 
                        (item.duration || '0:30')
                      }
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </PanGestureHandler>
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
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]} edges={['right', 'left']}>
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

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        enabled={keyboardVisible || emojiPickerVisible}>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            // Don't auto-scroll on every content change to prevent infinite loops
          }}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
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

      <View 
        style={[
          styles.inputContainer, 
          {
            backgroundColor: theme.surface,
            paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 8),
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
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleImagePicker}>
              <MaterialIcons name="image" size={24} color={theme.primary} />
            </TouchableOpacity>

            <View style={styles.inputTextContainer}>
              <TouchableOpacity
                style={styles.emojiButton}
                onPress={() => setEmojiPickerVisible(!emojiPickerVisible)}>
                <MaterialIcons name="sentiment-satisfied" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
              <TextInput
                mode="outlined"
                placeholder="Type a message..."
                value={inputText}
                onChangeText={setInputText}
                style={[styles.textInput, {backgroundColor: theme.background}]}
                contentStyle={styles.textInputContent}
                outlineColor="transparent"
                activeOutlineColor={theme.primary}
                textColor={theme.text}
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={1000}
                onFocus={() => setEmojiPickerVisible(false)}
              />
            </View>

            {inputText.trim() ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}>
                <MaterialIcons name="send" size={24} color={theme.primary} />
              </TouchableOpacity>
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
      </KeyboardAvoidingView>
      
      <EmojiPicker
        onEmojiSelected={handleEmojiSelected}
        open={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        enableSearchBar
        enableRecentlyUsed
        categoryPosition="top"
        theme={{
          backdrop: theme.background,
          knob: theme.textSecondary,
          container: theme.surface,
          header: theme.text,
          skinTonesContainer: theme.surface,
          category: {
            icon: theme.textSecondary,
            iconActive: theme.primary,
            container: theme.surface,
            containerActive: theme.primary + '20',
          },
        }}
      />
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
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 0,
    marginRight: 4,
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
    minHeight: 48,
    height: 48,
    paddingTop: 0,
  },
  textInputContent: {
    paddingTop: 12,
    paddingBottom: 12,
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
  audioProgress: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
  },
  seekIndicator: {
    position: 'absolute',
    right: -6,
    top: -3,
    width: 12,
    height: 26,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  cameraButton: {
    width: 48,
    height: 48,
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
    width: 48,
    height: 48,
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
