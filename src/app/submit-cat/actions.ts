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
  if (!input.listerId) {
     return {
      isDuplicate: false,
      duplicateExplanation: '',
      success: false,
      error: 'You must be logged in to list a cat.',
    };
  }

  if (!force) {
    try {
      const duplicateResult = await checkDuplicateCats({
        photoDataUri: input.photoDataUri,
        catDescription: input.catDescription,
        locationDescription: input.locationDescription,
      });

      if (duplicateResult.isDuplicate) {
        return {
          isDuplicate: true,
          duplicateExplanation: duplicateResult.duplicateExplanation,
          success: false,
        };
      }
    } catch (error) {
      console.error('AI check failed:', error);
    }
  }

  try {
    const newCatId = await addCat({
      name: input.name,
      description: input.catDescription,
      imageUrl: input.imageUrl, // In a real app, you'd upload the photo and get a URL
      location: input.locationDescription,
      listerId: input.listerId,
      listedDate: new Date(),
    });

    console.log('New cat added with ID:', newCatId);
    
    // Revalidate the homepage to show the new cat
    revalidatePath('/');

    return {
      isDuplicate: false,
      duplicateExplanation: '',
      success: true,
    };
  } catch (error) {
    console.error('Failed to save cat to database:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      isDuplicate: false,
      duplicateExplanation: '',
      success: false,
      error: `Failed to save submission: ${errorMessage}`,
    }
  }
}
