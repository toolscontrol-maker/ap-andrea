import { triggerHaptic } from './haptics';

export interface PickedImageResult {
  uri: string;
  width?: number;
  height?: number;
  base64?: string;
  mimeType?: string;
}

function compressImage(base64: string, maxWidth = 2048, maxHeight = 2048, quality = 0.92): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(base64);
      return;
    }
    const timeout = setTimeout(() => resolve(base64), 2000);
    const img = new Image();
    img.onload = () => {
      clearTimeout(timeout);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          resolve(base64);
          return;
        }

        // Only scale down if image exceeds 2048px Ultra HD boundary
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64);
          return;
        }
        
        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for superior compression without loss of crispness, fallback to JPEG
        let compressed = '';
        try {
          compressed = canvas.toDataURL('image/webp', quality);
        } catch {}

        if (!compressed || compressed.startsWith('data:image/png') || compressed.length < 100) {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        if (!compressed || compressed === 'data:,' || compressed.length < 100) {
          resolve(base64);
        } else {
          resolve(compressed);
        }
      } catch {
        resolve(base64);
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(base64);
    };
    img.src = base64;
  });
}

/**
 * Web implementation using standard HTML input element
 * 100% reliable, zero native module mismatch, works on Mobile Web (Safari/Chrome) and Desktop Web
 */
export async function pickImageFromGallery(
  options: { allowsEditing?: boolean; aspect?: [number, number]; quality?: number } = {}
): Promise<PickedImageResult | null> {
  return new Promise((resolve) => {
    triggerHaptic('light');

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.style.display = 'none';

    input.onchange = async (event: any) => {
      const file = event.target?.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      if (file.type && file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const rawBase64 = e.target?.result as string;
          triggerHaptic('selection');
          resolve({
            uri: rawBase64,
            base64: rawBase64,
            mimeType: file.type || 'video/mp4',
          });
        };
        reader.onerror = () => {
          resolve(null);
        };
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawBase64 = e.target?.result as string;
        const targetQuality = options.quality ?? 0.92;
        const compressedBase64 = await compressImage(rawBase64, 2048, 2048, targetQuality);
        triggerHaptic('selection');
        resolve({
          uri: compressedBase64,
          base64: compressedBase64,
          mimeType: compressedBase64.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg',
        });
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(file);
    };

    document.body.appendChild(input);
    input.click();
    setTimeout(() => {
      document.body.removeChild(input);
    }, 1000);
  });
}

/**
 * Web implementation for camera capture (on mobile web prompts camera; on desktop prompts file upload)
 */
export async function takePhotoWithCamera(
  options: { allowsEditing?: boolean; aspect?: [number, number]; quality?: number } = {}
): Promise<PickedImageResult | null> {
  return new Promise((resolve) => {
    triggerHaptic('light');

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.display = 'none';

    input.onchange = async (event: any) => {
      const file = event.target?.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawBase64 = e.target?.result as string;
        const targetQuality = options.quality ?? 0.92;
        const compressedBase64 = await compressImage(rawBase64, 2048, 2048, targetQuality);
        triggerHaptic('selection');
        resolve({
          uri: compressedBase64,
          base64: compressedBase64,
          mimeType: compressedBase64.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg',
        });
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(file);
    };

    document.body.appendChild(input);
    input.click();
    setTimeout(() => {
      document.body.removeChild(input);
    }, 1000);
  });
}

/**
 * Universal web prompt for single photo/video
 */
export async function promptPhotoPicker(options: {
  title?: string;
  aspect?: [number, number];
  onImageSelected: (image: PickedImageResult) => void;
}): Promise<void> {
  const result = await pickImageFromGallery(options);
  if (result) {
    options.onImageSelected(result);
  }
}

/**
 * Compress a single File/Blob to a WebP/JPEG Blob efficiently using object URLs (low memory footprint)
 */
export async function compressFileToBlob(
  file: File,
  maxWidth = 2048,
  maxHeight = 2048,
  quality = 0.92
): Promise<{ blob: Blob | File; mimeType: string; fileName: string }> {
  if (file.type && file.type.startsWith('video/')) {
    return { blob: file, mimeType: file.type || 'video/mp4', fileName: file.name || 'video.mp4' };
  }

  return new Promise((resolve) => {
    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      resolve({ blob: file, mimeType: file.type || 'image/jpeg', fileName: file.name || 'photo.jpg' });
      return;
    }

    const timeout = setTimeout(() => {
      try { URL.revokeObjectURL(objectUrl); } catch {}
      resolve({ blob: file, mimeType: file.type || 'image/jpeg', fileName: file.name || 'photo.jpg' });
    }, 4000);

    const img = new Image();
    img.onload = () => {
      clearTimeout(timeout);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          try { URL.revokeObjectURL(objectUrl); } catch {}
          resolve({ blob: file, mimeType: file.type || 'image/jpeg', fileName: file.name || 'photo.jpg' });
          return;
        }

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          try { URL.revokeObjectURL(objectUrl); } catch {}
          resolve({ blob: file, mimeType: file.type || 'image/jpeg', fileName: file.name || 'photo.jpg' });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            try { URL.revokeObjectURL(objectUrl); } catch {}
            if (blob && blob.size > 0) {
              resolve({ blob, mimeType: 'image/webp', fileName: (file.name ? file.name.replace(/\.[^/.]+$/, '') : 'photo') + '.webp' });
            } else {
              canvas.toBlob(
                (jpgBlob) => {
                  if (jpgBlob && jpgBlob.size > 0) {
                    resolve({ blob: jpgBlob, mimeType: 'image/jpeg', fileName: (file.name ? file.name.replace(/\.[^/.]+$/, '') : 'photo') + '.jpg' });
                  } else {
                    resolve({ blob: file, mimeType: file.type || 'image/jpeg', fileName: file.name || 'photo.jpg' });
                  }
                },
                'image/jpeg',
                quality
              );
            }
          },
          'image/webp',
          quality
        );
      } catch (err) {
        try { URL.revokeObjectURL(objectUrl); } catch {}
        resolve({ blob: file, mimeType: file.type || 'image/jpeg', fileName: file.name || 'photo.jpg' });
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      try { URL.revokeObjectURL(objectUrl); } catch {}
      resolve({ blob: file, mimeType: file.type || 'image/jpeg', fileName: file.name || 'photo.jpg' });
    };

    img.src = objectUrl;
  });
}

/**
 * Universal web multi-selector returning raw Files with zero-DOM-timeout cancellation
 */
export async function pickMultipleFiles(
  options: { accept?: string } = {}
): Promise<File[]> {
  return new Promise((resolve) => {
    triggerHaptic('light');

    // Use a persistent hidden input element so Mobile Safari / Chrome never drops the event
    let input = document.getElementById('__app_multi_media_input__') as HTMLInputElement;
    if (!input) {
      input = document.createElement('input');
      input.id = '__app_multi_media_input__';
      input.type = 'file';
      input.style.position = 'fixed';
      input.style.top = '-9999px';
      input.style.left = '-9999px';
      input.style.opacity = '0';
      input.style.pointerEvents = 'none';
      document.body.appendChild(input);
    }

    input.accept = options.accept || 'image/*,video/*';
    input.multiple = true;
    input.value = '';

    input.onchange = (event: any) => {
      const fileList: FileList = event.target?.files;
      if (!fileList || fileList.length === 0) {
        resolve([]);
        return;
      }
      const files = Array.from(fileList);
      triggerHaptic('selection');
      resolve(files);
    };

    input.click();
  });
}

/**
 * Universal web multi-selector for multiple photos and videos at once
 */
export async function pickMultipleMediaFromGallery(
  options: {
    quality?: number;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<PickedImageResult[]> {
  const files = await pickMultipleFiles();
  if (!files.length) return [];

  const results: PickedImageResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    if (options.onProgress) {
      options.onProgress(i + 1, total);
    }

    try {
      const { blob, mimeType } = await compressFileToBlob(file, 2048, 2048, options.quality || 0.92);
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target?.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });

      results.push({
        uri: base64,
        base64: base64,
        mimeType: mimeType,
      });
    } catch (err) {
      console.warn('[imagePicker] Error processing file:', file.name, err);
    }
  }

  triggerHaptic('success');
  return results;
}
