import * as ImagePicker from 'expo-image-picker';
import { Alert, ActionSheetIOS, Platform } from 'react-native';
import { triggerHaptic } from './haptics';

export interface PickedImageResult {
  uri: string;
  width?: number;
  height?: number;
  base64?: string;
  mimeType?: string;
}

/**
 * Request camera and media library permissions
 */
export async function requestMediaPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permiso necesario',
      'Necesitamos acceso a tu galería para que puedas seleccionar fotos para vuestros recuerdos y deseos.'
    );
    return false;
  }
  return true;
}

/**
 * Pick an image from device gallery
 */
export async function pickImageFromGallery(
  options: { allowsEditing?: boolean; aspect?: [number, number]; quality?: number } = {}
): Promise<PickedImageResult | null> {
  try {
    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return null;

    triggerHaptic('light');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? true,
      aspect: options.aspect ?? [4, 3],
      quality: options.quality ?? 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    triggerHaptic('selection');
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined,
      mimeType: asset.mimeType,
    };
  } catch (error) {
    console.error('Error selecting image from gallery:', error);
    Alert.alert('Error', 'No se pudo cargar la imagen seleccionada.');
    return null;
  }
}

/**
 * Take a photo with camera
 */
export async function takePhotoWithCamera(
  options: { allowsEditing?: boolean; aspect?: [number, number]; quality?: number } = {}
): Promise<PickedImageResult | null> {
  try {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de cámara',
          'Necesitamos acceso a tu cámara para capturar este momento especial juntos.'
        );
        return null;
      }
    }

    triggerHaptic('light');

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? true,
      aspect: options.aspect ?? [4, 3],
      quality: options.quality ?? 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    triggerHaptic('selection');
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined,
      mimeType: asset.mimeType,
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'No se pudo abrir la cámara en este dispositivo.');
    return null;
  }
}

/**
 * Universal photo picker triggering iOS ActionSheet or web picker
 */
export async function promptPhotoPicker(
  options: {
    title?: string;
    aspect?: [number, number];
    onImageSelected: (image: PickedImageResult) => void;
  }
): Promise<void> {
  triggerHaptic('light');

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: options.title || 'Añadir Foto',
        options: ['Cancelar', 'Hacer una foto', 'Elegir de la fototeca'],
        cancelButtonIndex: 0,
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          const res = await takePhotoWithCamera({ aspect: options.aspect });
          if (res) options.onImageSelected(res);
        } else if (buttonIndex === 2) {
          const res = await pickImageFromGallery({ aspect: options.aspect });
          if (res) options.onImageSelected(res);
        }
      }
    );
  } else {
    // Android & Web direct gallery picker
    const res = await pickImageFromGallery({ aspect: options.aspect });
    if (res) options.onImageSelected(res);
  }
}
