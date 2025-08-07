
'use server';

import { deleteCat } from '@/lib/firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function deleteCatAction(catId: string) {
  try {
    await deleteCat(catId);
    revalidatePath('/');
    revalidatePath(`/cat/${catId}`);
  } catch (error) {
    console.error('Failed to delete cat:', error);
    throw new Error('Could not delete cat listing.');
  }
}
