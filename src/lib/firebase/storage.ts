
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a cat photo to Firebase Storage and returns the public URL.
 * @param file The image file to upload.
 * @param userId The ID of the user uploading the photo.
 * @returns A promise that resolves with the public URL of the uploaded image.
 */
export async function uploadCatPhoto(file: File, userId: string): Promise<string> {
  console.log("uploadCatPhoto: Starting photo upload...");

  if (!file) {
    throw new Error('No file provided for upload.');
  }
  if (!userId) {
    throw new Error('User ID is required for upload.');
  }
  
  // Create a unique file path for the image
  const filePath = `cat-photos/${userId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);
  
  console.log(`uploadCatPhoto: Uploading to path: ${filePath}`);
  
  // Upload the file
  const uploadResult = await uploadBytes(storageRef, file);
  console.log("uploadCatPhoto: File uploaded successfully.", uploadResult);
  
  // Get the public URL
  const downloadURL = await getDownloadURL(uploadResult.ref);
  console.log("uploadCatPhoto: Got download URL:", downloadURL);

  return downloadURL;
}
