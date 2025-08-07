
'use server';

import { updateUser } from '@/lib/firebase/firestore';
import type { User } from '@/lib/types';
import { revalidatePath } from 'next/cache';

interface FormState {
  success: boolean;
  error?: string;
}

export async function updateUserAction(
  input: {
    userId: string;
    name: string;
    imageUrl: string | null;
    socials: User['socials'];
  }
): Promise<FormState> {
  try {
    const userData: Partial<User> = {
      name: input.name,
      socials: {
        instagram: input.socials?.instagram || '',
        custom: {
            platform: input.socials?.custom?.platform || '',
            url: input.socials?.custom?.url || '',
        }
      },
    };
    
    if (input.imageUrl && input.imageUrl.startsWith('data:image')) {
      userData.imageUrl = input.imageUrl;
    }

    await updateUser(input.userId, userData);

    revalidatePath(`/profile/${input.userId}`);
    revalidatePath('/profile/edit');

    return { success: true };
  } catch (error) {
    console.error('Failed to update user profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      success: false,
      error: `Failed to update profile: ${errorMessage}`,
    };
  }
}
