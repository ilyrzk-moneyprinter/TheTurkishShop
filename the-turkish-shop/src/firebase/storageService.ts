import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param folder - The folder to upload to (e.g., 'vouches', 'products', 'orders')
 * @returns The download URL of the uploaded file
 */
export const uploadFile = async (file: File, folder: string): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, `${folder}/${filename}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Upload multiple files to Firebase Storage
 * @param files - Array of files to upload
 * @param folder - The folder to upload to
 * @returns Array of download URLs
 */
export const uploadFiles = async (files: File[], folder: string): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw new Error('Failed to upload files');
  }
};

/**
 * Delete a file from Firebase Storage
 * @param url - The URL of the file to delete
 */
export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    const startIndex = url.indexOf(baseUrl);
    if (startIndex === -1) {
      throw new Error('Invalid storage URL');
    }
    
    // Parse the storage path from the URL
    const pathStart = url.indexOf('/o/') + 3;
    const pathEnd = url.indexOf('?');
    const encodedPath = url.substring(pathStart, pathEnd);
    const path = decodeURIComponent(encodedPath);
    
    // Create a reference and delete
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}; 