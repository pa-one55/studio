
'use server';

import { checkDuplicateCats } from '@/ai/flows/check-duplicate-cats.ts';
import { addCat } from '@/lib/firebase/firestore';
import { auth } from 'firebase-admin';
import { getAuth } from 'firebase/auth'; 
import { app } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

interface FormState {
  isDuplicate: boolean;
  duplicateExplanation: string;
  success: boolean;
  error?: string;
}

export async function handleSubmitCat(
  input: {
    photoDataUri: string;
    catDescription: string;
    locationDescription: string;
    name?: string;
    imageUrl: string;
    listerId: string;
  },
  force: boolean = false
): Promise<FormState> {
  console.log("handleSubmitCat action started. Input:", { ...input, photoDataUri: '...omitted...' }, "Force:", force);

  if (!input.listerId) {
     console.error("handleSubmitCat: Error - No listerId provided.");
     return {
      isDuplicate: false,
      duplicateExplanation: '',
      success: false,
      error: 'You must be logged in to list a cat.',
    };
  }

  if (!force) {
    console.log("handleSubmitCat: Performing AI duplicate check...");
    try {
      const duplicateResult = await checkDuplicateCats({
        photoDataUri: input.photoDataUri,
        catDescription: input.catDescription,
        locationDescription: input.locationDescription,
      });
      console.log("handleSubmitCat: AI check result:", duplicateResult);

      if (duplicateResult.isDuplicate) {
        console.log("handleSubmitCat: Potential duplicate found.");
        return {
          isDuplicate: true,
          duplicateExplanation: duplicateResult.duplicateExplanation,
          success: false,
        };
      }
    } catch (error) {
      console.error('handleSubmitCat: AI check failed:', error);
      // We can choose to continue without the AI check if it fails
    }
  } else {
    console.log("handleSubmitCat: Skipping AI duplicate check because force is true.");
  }

  try {
    console.log("handleSubmitCat: Adding cat to database...");
    const newCatId = await addCat({
      name: input.name,
      description: input.catDescription,
      imageUrl: input.imageUrl, // In a real app, you'd upload the photo and get a URL
      location: input.locationDescription,
      listerId: input.listerId,
      listedDate: new Date(),
    });

    console.log('handleSubmitCat: New cat added with ID:', newCatId);
    
    // Revalidate the homepage to show the new cat
    revalidatePath('/');
    console.log("handleSubmitCat: Revalidated path '/'.");

    return {
      isDuplicate: false,
      duplicateExplanation: '',
      success: true,
    };
  } catch (error) {
    console.error('handleSubmitCat: Failed to save cat to database:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      isDuplicate: false,
      duplicateExplanation: '',
      success: false,
      error: `Failed to save submission: ${errorMessage}`,
    }
  }
}
