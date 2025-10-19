import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import {useTheme} from '../contexts/ThemeContext';

const {width, height} = Dimensions.get('window');

interface MediaViewerScreenProps {
  navigation?: any;
  route?: {
    params?: {
      mediaUri: string;
      mediaType: 'image' | 'video';
    };
  };
}

const MediaViewerScreen: React.FC<MediaViewerScreenProps> = ({navigation, route}) => {
  const {theme} = useTheme();
  const {mediaUri = '', mediaType = 'image'} = route?.params || {};
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<any>(null);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              paused={!isPlaying}
              onProgress={(data: any) => setCurrentTime(data.currentTime)}
              onLoad={(data: any) => setDuration(data.duration)}
              onEnd={() => setIsPlaying(false)}
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
            
            {/* Video Progress */}
            <View style={styles.videoControls}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    {width: `${(currentTime / duration) * 100}%`, backgroundColor: theme.primary}
                  ]} 
                />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </>
        )}
      </View>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.iconButton}>
          <MaterialIcons name="close" size={30} color="#FFFFFF" />
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
  playPauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -35,
    marginLeft: -35,
  },
  videoControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MediaViewerScreen;
