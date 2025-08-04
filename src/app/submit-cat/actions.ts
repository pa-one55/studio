'use server';

import { checkDuplicateCats } from '@/ai/flows/check-duplicate-cats.ts';

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
  },
  force: boolean = false
): Promise<FormState> {
  if (!force) {
    try {
      const duplicateResult = await checkDuplicateCats(input);

      if (duplicateResult.isDuplicate) {
        return {
          isDuplicate: true,
          duplicateExplanation: duplicateResult.duplicateExplanation,
          success: false,
        };
      }
    } catch (error) {
      console.error('AI check failed:', error);
      // We can choose to fail open (allow submission) or closed (block submission)
      // Here, we'll log the error and allow the submission to proceed as if no duplicate was found.
    }
  }

  // If not a duplicate, or if AI check fails, or if user forces submission:
  // In a real app, you would save the data to a database here.
  console.log('Saving new cat submission to database:', {
    catDescription: input.catDescription,
    locationDescription: input.locationDescription,
    // Don't log the full data URI
    photoSubmitted: true, 
  });

  return {
    isDuplicate: false,
    duplicateExplanation: '',
    success: true,
  };
}
