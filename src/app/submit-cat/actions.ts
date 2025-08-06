
'use server';

import { addCat } from '@/lib/firebase/firestore';
import { revalidatePath } from 'next/cache';

interface FormState {
  success: boolean;
  error?: string;
}

export async function handleSubmitCat(
  input: {
    catDescription: string;
    location: string;
    name?: string;
    imageUrl: string; // This will now be a base64 Data URI
    listerId: string;
  }
): Promise<FormState> {
  console.log("handleSubmitCat action started. Input:", {
    ...input,
    imageUrl: input.imageUrl.substring(0, 50) + '...', // Log only a snippet of the Data URI
  });


  if (!input.listerId) {
     console.error("handleSubmitCat: Error - No listerId provided.");
     return {
      success: false,
      error: 'You must be logged in to list a cat.',
    };
  }
  
  if (!input.imageUrl.startsWith('data:image')) {
    console.error("handleSubmitCat: Error - Invalid image Data URI.");
    return {
      success: false,
      error: 'The provided image data was not valid.',
    }
  }

  try {
    console.log("handleSubmitCat: Adding cat to database...");
    const newCatId = await addCat({
      name: input.name,
      description: input.catDescription,
      imageUrl: input.imageUrl,
      location: input.location,
      listerId: input.listerId,
      listedDate: new Date(),
    });

    console.log('handleSubmitCat: New cat added with ID:', newCatId);
    
    // Revalidate the homepage to show the new cat
    revalidatePath('/');
    console.log("handleSubmitCat: Revalidated path '/'.");

    return {
      success: true,
    };
  } catch (error) {
    console.error('handleSubmitCat: Failed to save cat to database:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      success: false,
      error: `Failed to save submission: ${errorMessage}`,
    }
  }
}
