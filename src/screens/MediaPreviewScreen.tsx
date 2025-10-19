import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../contexts/ThemeContext';

const {width, height} = Dimensions.get('window');

interface MediaPreviewScreenProps {
  navigation?: any;
  route?: {
    params?: {
      mediaUri: string;
      mediaType: 'image' | 'video';
      onSend: (uri: string, type: 'image' | 'video', caption?: string) => void;
    };
  };
}

const MediaPreviewScreen: React.FC<MediaPreviewScreenProps> = ({navigation, route}) => {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {mediaUri = '', mediaType = 'image', onSend} = route?.params || {};
  const [caption, setCaption] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  console.log('📹 MediaPreviewScreen mounted:', {mediaUri, mediaType});

  useEffect(() => {
    isMountedRef.current = true;
    console.log('📹 MediaPreviewScreen useEffect - Setting up');

    return () => {
      console.log('📹 MediaPreviewScreen unmounting - Cleaning up');
      isMountedRef.current = false;
      
      // Cleanup video player
      if (videoRef.current) {
        try {
          console.log('📹 Cleaning up video player');
          // Video player cleanup is handled by react-native-video automatically
          videoRef.current = null;
        } catch (error) {
          console.warn('⚠️ Error cleaning up video:', error);
        }
      }
    };
  }, []);

  const handleSend = () => {
    console.log('✉️ Sending media:', {mediaUri, mediaType, caption});
    if (onSend) {
      try {
        onSend(mediaUri, mediaType, caption);
        console.log('✅ Media sent successfully');
      } catch (error) {
        console.error('❌ Error sending media:', error);
      }
    }
    
    if (navigation && isMountedRef.current) {
      navigation.goBack();
    }
  };

  const togglePlayPause = () => {
    console.log('▶️ Toggle play/pause:', !isPlaying);
    if (isMountedRef.current) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoError = (error: any) => {
    console.error('❌ Video playback error:', error);
    if (isMountedRef.current) {
      Alert.alert('Video Error', 'Failed to load or play video. The video file may be corrupted.');
    }
  };

  const handleVideoLoad = (data: any) => {
    console.log('✅ Video loaded successfully:', {
      duration: data.duration,
      naturalSize: data.naturalSize,
      currentTime: data.currentTime,
    });
  };

  const handleVideoProgress = (data: any) => {
    // Log less frequently to avoid spam
    if (data.currentTime % 5 < 0.5) {
      console.log('⏱️ Video progress:', {
        currentTime: data.currentTime.toFixed(2),
        playableDuration: data.playableDuration.toFixed(2),
      });
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: '#000'}]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Media Display */}
      <View style={styles.mediaContainer}>
        {mediaType === 'image' ? (
          <Image source={{uri: mediaUri}} style={styles.media} resizeMode="contain" />
        ) : (
          <>
            <Video
              ref={videoRef}
              source={{uri: mediaUri}}
              style={styles.media}
              resizeMode="contain"
              repeat
              paused={!isPlaying}
              onError={handleVideoError}
              onLoad={handleVideoLoad}
              onProgress={handleVideoProgress}
              onReadyForDisplay={() => console.log('📹 Video ready for display')}
              onBuffer={(data: any) => console.log('📹 Video buffering:', data.isBuffering)}
              posterResizeMode="contain"
              ignoreSilentSwitch="ignore"
              playInBackground={false}
              playWhenInactive={false}
              mixWithOthers="duck"
              bufferConfig={{
                minBufferMs: 2000,
                maxBufferMs: 5000,
                bufferForPlaybackMs: 1000,
                bufferForPlaybackAfterRebufferMs: 1500,
              }}
              maxBitRate={2000000}
              disableFocus={true}
              controls={false}
            />
            <TouchableOpacity 
              style={styles.playPauseButton} 
              onPress={togglePlayPause}
            >
              <MaterialIcons 
                name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'} 
                size={70} 
                color="rgba(255,255,255,0.9)" 
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Top Controls */}
      <View style={[styles.topControls, {top: insets.top + 10}]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.iconButton}>
          <MaterialIcons name="close" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={[styles.bottomControls, {bottom: 30 + insets.bottom}]}>
        <TextInput
          mode="flat"
          placeholder="Add a caption..."
          value={caption}
          onChangeText={setCaption}
          style={[styles.captionInput, {backgroundColor: 'rgba(255,255,255,0.1)'}]}
          textColor="#FFFFFF"
          placeholderTextColor="rgba(255,255,255,0.6)"
          maxLength={200}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
        
        <TouchableOpacity onPress={handleSend} style={[styles.sendButton, {backgroundColor: theme.primary}]}>
          <MaterialIcons name="send" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: width,
    height: height,
  },
  topControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captionInput: {
    flex: 1,
    marginRight: 12,
    borderRadius: 25,
    paddingHorizontal: 16,
  },
  sendButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  playPauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -35,
    marginLeft: -35,
  },
});

export default MediaPreviewScreen;
