import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import {Text, IconButton, SegmentedButtons} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import {useTheme} from '../contexts/ThemeContext';

const {width} = Dimensions.get('window');
const ITEM_SIZE = width / 3 - 8;

interface GalleryPickerScreenProps {
  navigation?: any;
  route?: {
    params?: {
      onMediaSelected: (uri: string, type: 'image' | 'video') => void;
    };
  };
}

const GalleryPickerScreen: React.FC<GalleryPickerScreenProps> = ({navigation, route}) => {
  const {theme} = useTheme();
  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'mixed'>('mixed');

  const handleMediaPicker = async (type: 'photo' | 'video' | 'mixed') => {
    try {
      const result = await launchImageLibrary({
        mediaType: type,
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: false,
        presentationStyle: 'fullScreen',
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check if it's a video and validate duration
        if (asset.type?.startsWith('video')) {
          const duration = asset.duration || 0;
          
          if (duration > 30) {
            Alert.alert(
              'Video Too Long', 
              `The selected video is ${Math.round(duration)} seconds long. Please select a video shorter than 30 seconds.`,
              [{text: 'OK'}]
            );
            return;
          }
          
          if (asset.uri) {
            // Navigate to preview
            navigation?.navigate('MediaPreview', {
              mediaUri: asset.uri,
              mediaType: 'video',
              onSend: (uri: string, type: 'image' | 'video') => {
                route?.params?.onMediaSelected(uri, type);
                navigation?.goBack();
              },
            });
          }
        } else if (asset.uri) {
          // It's an image
          navigation?.navigate('MediaPreview', {
            mediaUri: asset.uri,
            mediaType: 'image',
            onSend: (uri: string, type: 'image' | 'video') => {
              route?.params?.onMediaSelected(uri, type);
              navigation?.goBack();
            },
          });
        }
      }
    } catch (error) {
      console.log('Media picker error:', error);
      Alert.alert('Error', 'Failed to pick media. Please try again.');
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={[styles.header, {backgroundColor: theme.surface}]}>
        <IconButton
          icon={() => <MaterialIcons name="close" size={24} color={theme.text} />}
          onPress={() => navigation?.goBack()}
        />
        <Text variant="titleLarge" style={{color: theme.text, flex: 1}}>
          Select Media
        </Text>
      </View>

      {/* Media Type Selector */}
      <View style={styles.selectorContainer}>
        <SegmentedButtons
          value={mediaType}
          onValueChange={(value) => setMediaType(value as 'photo' | 'video' | 'mixed')}
          buttons={[
            {
              value: 'photo',
              label: 'Photos',
              icon: () => <MaterialIcons name="image" size={20} color={mediaType === 'photo' ? theme.primary : theme.textSecondary} />,
            },
            {
              value: 'video',
              label: 'Videos',
              icon: () => <MaterialIcons name="videocam" size={20} color={mediaType === 'video' ? theme.primary : theme.textSecondary} />,
            },
            {
              value: 'mixed',
              label: 'All',
              icon: () => <MaterialIcons name="perm-media" size={20} color={mediaType === 'mixed' ? theme.primary : theme.textSecondary} />,
            },
          ]}
          style={{margin: 16}}
        />
      </View>

      {/* Info Banner */}
      <View style={[styles.infoBanner, {backgroundColor: theme.primary + '15'}]}>
        <MaterialIcons name="info" size={20} color={theme.primary} />
        <Text style={[styles.infoText, {color: theme.primary}]}>
          {mediaType === 'video' 
            ? 'Videos must be 30 seconds or shorter' 
            : mediaType === 'photo'
            ? 'Select a photo from your gallery'
            : 'Select photos or videos (max 30s) from your gallery'}
        </Text>
      </View>

      {/* Browse Button */}
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.browseButton, {backgroundColor: theme.primary}]}
          onPress={() => handleMediaPicker(mediaType)}>
          <MaterialIcons name="photo-library" size={48} color="#FFFFFF" />
          <Text style={styles.browseText}>
            Browse {mediaType === 'photo' ? 'Photos' : mediaType === 'video' ? 'Videos' : 'Gallery'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.helperText, {color: theme.textSecondary}]}>
          Tap to open your device gallery
        </Text>
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectorContainer: {
    paddingBottom: 8,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  browseButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  browseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  helperText: {
    marginTop: 24,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default GalleryPickerScreen;
