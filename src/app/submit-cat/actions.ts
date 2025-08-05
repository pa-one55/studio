'use server';

import { checkDuplicateCats } from '@/ai/flows/check-duplicate-cats.ts';
import { addCat } from '@/lib/firebase/firestore';
import { getAuth } from 'firebase/auth'; // We'll need auth to get the listerId
import { app } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

interface FormState {
  isDuplicate: boolean;
  duplicateExplanation: string;
  success: boolean;
  error?: string;
}

// NOTE: In a real server action, you'd get the current user's ID
// from the session. For now, we'll hardcode it.
const FAKE_USER_ID = 'user-1'; // Replace with real auth logic

export async function handleSubmitCat(
  input: {
    photoDataUri: string;
    catDescription: string;
    locationDescription: string;
    lat: number;
    lng: number;
    name?: string;
    imageUrl: string;
  },
  force: boolean = false
): Promise<FormState> {
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
      lat: input.lat,
      lng: input.lng,
      listerId: FAKE_USER_ID, // Use the authenticated user's ID
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
