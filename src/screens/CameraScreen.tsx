import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import {Camera, useCameraDevice, useCameraPermission, useCodeScanner} from 'react-native-vision-camera';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../contexts/ThemeContext';

interface CameraScreenProps {
  navigation?: any;
  route?: {
    params?: {
      onMediaCaptured: (uri: string, type: 'image' | 'video') => void;
    };
  };
}

const CameraScreen: React.FC<CameraScreenProps> = ({navigation, route}) => {
  const {theme} = useTheme();
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const camera = useRef<Camera>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressStartTime = useRef<number>(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentDevice = useCameraDevice(cameraType);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const handlePressIn = () => {
    pressStartTime.current = Date.now();
    
    // Start scale animation
    Animated.spring(scaleAnim, {
      toValue: 1.3,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  const handlePressOut = async () => {
    const pressDuration = Date.now() - pressStartTime.current;
    
    // Reset scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();

    if (pressDuration < 200) {
      // Quick tap - take photo
      await takePhoto();
    } else {
      // Long press - stop video recording
      if (isRecording) {
        await stopRecording();
      }
    }
  };

  const handleLongPress = async () => {
    // Start video recording
    await startRecording();
  };

  const takePhoto = async () => {
    try {
      if (camera.current) {
        const photo = await camera.current.takePhoto({
          flash: flash,
          enableShutterSound: true,
        });
        
        const uri = `file://${photo.path}`;
        
        // Navigate to preview screen
        if (navigation) {
          navigation.navigate('MediaPreview', {
            mediaUri: uri,
            mediaType: 'image',
            onSend: (uri: string, type: 'image' | 'video') => {
              route?.params?.onMediaCaptured(uri, type);
              navigation.goBack();
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const startRecording = async () => {
    try {
      if (camera.current && !isRecording) {
        setIsRecording(true);
        setRecordingTime(0);
        
        // Start timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 30) {
              // Auto-stop at 30 seconds
              stopRecording();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);

        await camera.current.startRecording({
          flash: flash === 'on' ? 'on' : 'off',
          onRecordingFinished: (video) => {
            const uri = `file://${video.path}`;
            
            // Navigate to preview screen
            if (navigation) {
              navigation.navigate('MediaPreview', {
                mediaUri: uri,
                mediaType: 'video',
                onSend: (uri: string, type: 'image' | 'video') => {
                  route?.params?.onMediaCaptured(uri, type);
                  navigation.goBack();
                },
              });
            }
          },
          onRecordingError: (error) => {
            console.error('Recording error:', error);
            Alert.alert('Error', 'Failed to record video');
            setIsRecording(false);
            if (recordingTimerRef.current) {
              clearInterval(recordingTimerRef.current);
            }
          },
        });
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      if (camera.current && isRecording) {
        await camera.current.stopRecording();
        setIsRecording(false);
        
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const toggleCamera = () => {
    setCameraType(prev => prev === 'back' ? 'front' : 'back');
  };

  const toggleFlash = () => {
    setFlash(prev => prev === 'off' ? 'on' : 'off');
  };

  if (!hasPermission) {
    return (
      <View style={[styles.container, {backgroundColor: theme.background}]}>
        <Text style={{color: theme.text}}>No camera permission</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{color: theme.primary}}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentDevice) {
    return (
      <View style={[styles.container, {backgroundColor: theme.background}]}>
        <Text style={{color: theme.text}}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={currentDevice}
        isActive={true}
        photo={true}
        video={true}
        audio={true}
      />

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.iconButton}>
          <MaterialIcons name="close" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
          <MaterialIcons 
            name={flash === 'on' ? 'flash-on' : 'flash-off'} 
            size={30} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Recording Timer */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>{recordingTime}s / 30s</Text>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.captureContainer}>
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLongPress={handleLongPress}
            delayLongPress={200}
            activeOpacity={1}
            style={styles.captureButtonOuter}>
            <Animated.View
              style={[
                styles.captureButtonInner,
                {
                  transform: [{scale: scaleAnim}],
                  backgroundColor: isRecording ? '#FF0000' : '#FFFFFF',
                  borderRadius: isRecording ? 8 : 35,
                },
              ]}
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={toggleCamera} style={styles.switchCamera}>
          <MaterialIcons name="flip-camera-android" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Instruction Text */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Tap to capture photo • Hold to record video
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 60 : 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    marginRight: 8,
  },
  recordingTime: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  captureContainer: {
    flex: 1,
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 6,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  switchCamera: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CameraScreen;
