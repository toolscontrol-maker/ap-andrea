import { triggerHaptic } from './haptics';

export interface PickedImageResult {
  uri: string;
  width?: number;
  height?: number;
  base64?: string;
  mimeType?: string;
}

function compressImage(base64: string, maxWidth = 800, maxHeight = 800, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(base64);
      return;
    }
    const timeout = setTimeout(() => resolve(base64), 1500);
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

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
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
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
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
        const compressedBase64 = await compressImage(rawBase64, 480, 480, options.quality || 0.82);
        triggerHaptic('selection');
        resolve({
          uri: compressedBase64,
          base64: compressedBase64,
          mimeType: 'image/jpeg',
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
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        triggerHaptic('selection');
        resolve({
          uri: base64,
          base64: base64,
          mimeType: file.type,
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
 * Universal web prompt
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
