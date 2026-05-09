import { supabase } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadResult {
  path: string;
}

async function compressImage(file: File, maxDimension = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export async function uploadReceipt(
  userId: string,
  expenseId: string,
  file: File,
  onCompressionDone?: () => void
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File is too large. Maximum size is 5MB.');
  }

  // Compress JPEG and PNG; WebP is already efficient
  const fileToUpload = file.type !== 'image/webp' ? await compressImage(file) : file;
  onCompressionDone?.();

  // Always use .jpg extension for compressed output
  const fileExt = fileToUpload.type === 'image/jpeg' ? 'jpg' : file.name.split('.').pop();
  const fileName = `${expenseId}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(filePath, fileToUpload, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading receipt:', error);
    throw new Error('Failed to upload receipt');
  }

  return { path: data.path };
}

export async function deleteReceipt(userId: string, expenseId: string): Promise<void> {
  // Try to delete any existing receipt for this expense
  const extensions = ['jpg', 'jpeg', 'png', 'webp'];

  for (const ext of extensions) {
    const filePath = `${userId}/${expenseId}.${ext}`;
    await supabase.storage.from('receipts').remove([filePath]);
  }
}

export async function getSignedReceiptUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

export function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a JPG, PNG, or WebP image.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'File is too large. Maximum size is 5MB.';
  }

  return null;
}
