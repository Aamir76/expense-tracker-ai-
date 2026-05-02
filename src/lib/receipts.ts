import { supabase } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadResult {
  path: string;
}

export async function uploadReceipt(
  userId: string,
  expenseId: string,
  file: File
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File is too large. Maximum size is 5MB.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${expenseId}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(filePath, file, {
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
