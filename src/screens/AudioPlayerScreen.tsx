import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {Text, IconButton} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Sound from 'react-native-sound';
import {useTheme} from '../contexts/ThemeContext';

const {width} = Dimensions.get('window');

interface AudioPlayerScreenProps {
  navigation?: any;
  route?: {
    params?: {
      audioUri: string;
      duration?: string;
    };
  };
}

const AudioPlayerScreen: React.FC<AudioPlayerScreenProps> = ({navigation, route}) => {
  const {theme} = useTheme();
  const {audioUri = '', duration = '0:00'} = route?.params || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const soundRef = useRef<Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    // Initialize sound
    Sound.setCategory('Playback');
    
    if (audioUri) {
      // Load the actual audio file
      soundRef.current = new Sound(audioUri, '', (error) => {
        if (error) {
          console.error('Failed to load sound:', error);
          if (isMountedRef.current) {
            Alert.alert('Playback Error', 'Failed to load audio file');
          }
          return;
        }
        
        // Get duration from the loaded sound
        if (soundRef.current && isMountedRef.current) {
          const duration = soundRef.current.getDuration() || 0;
          setTotalDuration(duration);
        }
      });
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (soundRef.current) {
        try {
          soundRef.current.stop(() => {});
          soundRef.current.release();
          soundRef.current = null;
        } catch (error) {
          console.warn('Error cleaning up audio:', error);
        }
      }
    };
  }, [audioUri]);

  const togglePlayPause = () => {
    if (!soundRef.current || !isMountedRef.current) return;
    
    if (isPlaying) {
      // Pause
      soundRef.current.pause();
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      // Play
      soundRef.current.play((success) => {
        if (!isMountedRef.current) return;
        
        if (success) {
          setIsPlaying(false);
          setCurrentTime(0);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          console.error('Playback failed');
          Alert.alert('Playback Error', 'Failed to play audio');
          setIsPlaying(false);
        }
      });
      
      setIsPlaying(true);
      
      // Update progress
      intervalRef.current = setInterval(() => {
        if (soundRef.current && isMountedRef.current) {
          soundRef.current.getCurrentTime((seconds) => {
            if (isMountedRef.current) {
              setCurrentTime(seconds);
            }
          });
        } else if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <View style={styles.header}>
        <IconButton
          icon={() => <MaterialIcons name="close" size={24} color={theme.text} />}
          onPress={() => navigation?.goBack()}
        />
        <Text variant="titleLarge" style={{color: theme.text}}>Voice Message</Text>
        <View style={{width: 48}} />
      </View>

      <View style={styles.content}>
        <View style={[styles.audioCard, {backgroundColor: theme.surface}]}>
          <MaterialCommunityIcons name="waveform" size={120} color={theme.primary} />
          
          <View style={styles.controls}>
            <TouchableOpacity onPress={togglePlayPause} style={[styles.playButton, {backgroundColor: theme.primary}]}>
              <MaterialCommunityIcons 
                name={isPlaying ? 'pause' : 'play'} 
                size={40} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <Text style={{color: theme.textSecondary}}>{formatTime(currentTime)}</Text>
            <View style={[styles.progressBar, {backgroundColor: theme.border}]}>
              <View 
                style={[
                  styles.progressFill, 
                  {width: `${progress}%`, backgroundColor: theme.primary}
                ]} 
              />
            </View>
            <Text style={{color: theme.textSecondary}}>{formatTime(totalDuration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  audioCard: {
    width: width - 40,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  controls: {
    marginVertical: 30,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default AudioPlayerScreen;
