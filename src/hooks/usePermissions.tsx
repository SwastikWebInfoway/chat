import React, {createContext, useContext, useState, useEffect} from 'react';
import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';

interface PermissionState {
  camera: boolean;
  microphone: boolean;
  storage: boolean;
}

interface PermissionContextType {
  permissions: PermissionState;
  isLoading: boolean;
  requestCameraPermission: () => Promise<boolean>;
  requestMicrophonePermission: () => Promise<boolean>;
  requestStoragePermission: () => Promise<boolean>;
  checkAllPermissions: () => Promise<void>;
  openSettings: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: false,
    microphone: false,
    storage: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    setIsLoading(true);
    
    if (Platform.OS === 'android') {
      try {
        const [camera, microphone, storage] = await Promise.all([
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA),
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO),
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE),
        ]);

        setPermissions({
          camera,
          microphone,
          storage,
        });
      } catch (error) {
        console.warn('Error checking permissions:', error);
        setPermissions({camera: false, microphone: false, storage: false});
      }
    } else {
      // iOS - permissions are handled at runtime by the system
      setPermissions({camera: true, microphone: true, storage: true});
    }
    
    setIsLoading(false);
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return true; // iOS handles this automatically
    }

    try {
      // Check if already granted
      const currentStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (currentStatus) {
        setPermissions(prev => ({...prev, camera: true}));
        return true;
      }

      // Request permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs camera access to take photos and record videos in chats.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow',
        }
      );

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      setPermissions(prev => ({...prev, camera: isGranted}));

      if (!isGranted && granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        showSettingsAlert('Camera', 'take photos and videos');
      }

      return isGranted;
    } catch (error) {
      console.warn('Camera permission error:', error);
      return false;
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return true; // iOS handles this automatically
    }

    try {
      // Check if already granted
      const currentStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (currentStatus) {
        setPermissions(prev => ({...prev, microphone: true}));
        return true;
      }

      // Request permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs microphone access to record and send voice messages.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow',
        }
      );

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      setPermissions(prev => ({...prev, microphone: isGranted}));

      if (!isGranted && granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        showSettingsAlert('Microphone', 'record voice messages');
      }

      return isGranted;
    } catch (error) {
      console.warn('Microphone permission error:', error);
      return false;
    }
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return true; // iOS handles this automatically
    }

    try {
      // Check if already granted
      const currentStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (currentStatus) {
        setPermissions(prev => ({...prev, storage: true}));
        return true;
      }

      // Request permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs storage access to save and share photos and videos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow',
        }
      );

      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      setPermissions(prev => ({...prev, storage: isGranted}));

      if (!isGranted && granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        showSettingsAlert('Storage', 'save photos and videos');
      }

      return isGranted;
    } catch (error) {
      console.warn('Storage permission error:', error);
      return false;
    }
  };

  const showSettingsAlert = (permissionName: string, usage: string) => {
    Alert.alert(
      `${permissionName} Access Needed`,
      `To ${usage}, please enable ${permissionName} permission in your device settings.\n\n1. Go to Settings\n2. Find this app\n3. Enable ${permissionName} permission`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Open Settings', onPress: openSettings},
      ]
    );
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const value: PermissionContextType = {
    permissions,
    isLoading,
    requestCameraPermission,
    requestMicrophonePermission,
    requestStoragePermission,
    checkAllPermissions,
    openSettings,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};