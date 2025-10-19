import React, {useState, useRef} from 'react';
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
  const {mediaUri = '', mediaType = 'image', onSend} = route?.params || {};
  const [caption, setCaption] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<any>(null);

  const handleSend = () => {
    if (onSend) {
      onSend(mediaUri, mediaType, caption);
    }
    navigation?.goBack();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
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
              onError={(error: any) => {
                console.error('Video error:', error);
                Alert.alert('Error', 'Failed to load video');
              }}
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
      <View style={styles.topControls}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.iconButton}>
          <MaterialIcons name="close" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
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
    top: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 40,
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
