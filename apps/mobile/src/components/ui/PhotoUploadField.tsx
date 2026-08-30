import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radii, Spacing, Typography } from '../../theme/tokens';
import { IconCamera, IconPlus } from './Icons';
import { promptPhotoPicker, PickedImageResult } from '../../utils/imagePicker';
import { triggerHaptic } from '../../utils/haptics';
import { sanitizeImageHotlink } from '../../utils/linkMetadata';

interface PhotoUploadFieldProps {
  imageUri?: string | null;
  onImageChange?: (imageUri: string | null) => void;
  photoUrl?: string | null;
  onPhotoSelected?: (imageUri: string | null) => void;
  label?: string;
  placeholderText?: string;
  aspect?: [number, number];
  style?: ViewStyle;
}

export function PhotoUploadField({
  imageUri,
  onImageChange,
  photoUrl,
  onPhotoSelected,
  label = 'Fotografía del momento',
  placeholderText = 'Toca para subir una foto o hacer una captura',
  aspect = [4, 3],
  style,
}: PhotoUploadFieldProps) {
  const rawUri = imageUri !== undefined && imageUri !== null ? imageUri : photoUrl;
  const effectiveImageUri = typeof rawUri === 'string' ? rawUri : (rawUri as any)?.uri || '';

  const triggerChange = (val: string | null) => {
    if (onImageChange) onImageChange(val);
    if (onPhotoSelected) onPhotoSelected(val);
  };
  const handlePress = () => {
    promptPhotoPicker({
      title: label,
      aspect,
      onImageSelected: (res: PickedImageResult) => {
        triggerChange(res.base64 || res.uri);
      },
    });
  };

  const handleRemove = (e: any) => {
    e.stopPropagation?.();
    triggerHaptic('light');
    triggerChange(null);
  };

  const cleanPreviewUri = sanitizeImageHotlink(effectiveImageUri);

  const isVideo = (url?: string | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    return (
      url.startsWith('data:video/') ||
      url.endsWith('.mp4') ||
      url.endsWith('.mov') ||
      url.endsWith('.webm') ||
      url.endsWith('.m4v') ||
      url.includes('video')
    );
  };

  const isVideoMedia = isVideo(effectiveImageUri);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        style={[styles.uploadBox, Boolean(effectiveImageUri) && styles.uploadBoxWithImage]}
        activeOpacity={0.85}
        onPress={handlePress}
      >
        {effectiveImageUri ? (
          <View style={styles.imagePreviewWrapper}>
            {isVideoMedia ? (
              <video
                src={cleanPreviewUri}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' } as any}
              />
            ) : (
              <Image
                source={{ uri: cleanPreviewUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} activeOpacity={0.7}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.changeBadge}>
              <IconCamera size={13} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.changeBadgeText}>{isVideoMedia ? 'Cambiar vídeo' : 'Cambiar'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContent}>
            <View style={styles.iconCircle}>
              <IconCamera size={20} color={Colors.light.primary} strokeWidth={2} />
            </View>
            <Text style={styles.placeholderMain}>Subir foto o vídeo</Text>
            <Text style={styles.placeholderSub}>{placeholderText}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    letterSpacing: -0.1,
  },
  uploadBox: {
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(43, 33, 41, 0.12)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    overflow: 'hidden',
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBoxWithImage: {
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: Colors.light.surfaceSubtle,
    minHeight: 160,
  },
  imagePreviewWrapper: {
    width: '100%',
    height: 170,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: Radii.lg,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  removeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  changeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
  },
  changeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  placeholderMain: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  placeholderSub: {
    fontSize: 11.5,
    color: Colors.light.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
