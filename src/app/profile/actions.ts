
'use server';

import { revalidatePath } from 'next/cache';
import { getAuth } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { cookies } from 'next/headers';
import { addFriend as addFriendFirestore, removeFriend as removeFriendFirestore } from '@/lib/firebase/firestore';

// This is a conceptual file. Getting the current user in a server action
// securely requires a more complex setup (e.g., NextAuth.js or Firebase Admin SDK).
// For this implementation, the logic is called from the client component which
// already has the authenticated user's context.

// The actual database logic will be in the page component for simplicity,
// calling helper functions from firestore.ts

export async function addFriend(currentUserId: string, friendId: string) {
  try {
    await addFriendFirestore(currentUserId, friendId);
    revalidatePath(`/profile/${currentUserId}`);
    revalidatePath(`/profile/${friendId}`);
  } catch (error) {
    console.error("Failed to add friend:", error);
    throw new Error("Could not add friend.");
  }
}

export async function removeFriend(currentUserId: string, friendId: string) {
  try {
    await removeFriendFirestore(currentUserId, friendId);
    revalidatePath(`/profile/${currentUserId}`);
    revalidatePath(`/profile/${friendId}`);
  } catch (error) {
    console.error("Failed to remove friend:", error);
    throw new Error("Could not remove friend.");
  }
}
