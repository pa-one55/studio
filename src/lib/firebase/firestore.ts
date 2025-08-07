
import { db } from '@/lib/firebase';
import type { Cat, User } from '@/lib/types';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, query, where, Timestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// --- User Functions ---

export async function getUser(userId: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        return {
            id: userDocSnap.id,
            name: data.name,
            email: data.email,
            imageUrl: data.imageUrl,
            socials: data.socials || {},
            friends: data.friends || [],
        };
    } else {
        return null;
    }
}

export async function addUser(user: User): Promise<void> {
    const userDocRef = doc(db, 'users', user.id);
    await setDoc(userDocRef, user);
}

export async function addFriend(currentUserId: string, friendId: string): Promise<void> {
    const userDocRef = doc(db, 'users', currentUserId);
    await updateDoc(userDocRef, {
        friends: arrayUnion(friendId)
    });
}

export async function removeFriend(currentUserId: string, friendId: string): Promise<void> {
    const userDocRef = doc(db, 'users', currentUserId);
    await updateDoc(userDocRef, {
        friends: arrayRemove(friendId)
    });
}

export async function getFriends(friendIds: string[]): Promise<User[]> {
    if (friendIds.length === 0) {
        return [];
    }
    const friends: User[] = [];
    // Firestore 'in' query is limited to 10 items. We fetch them one by one.
    // For larger friend lists, batching would be required.
    for (const id of friendIds) {
        const user = await getUser(id);
        if (user) {
            friends.push(user);
        }
    }
    return friends;
}


// --- Cat Functions ---
// NOTE: These functions now include default values to prevent crashes if cat documents
// in Firestore are missing fields (e.g., when added manually for testing).

export async function getAllCats(): Promise<Cat[]> {
    const catsCollectionRef = collection(db, 'cats');
    const catsSnapshot = await getDocs(catsCollectionRef);
    const catsList = catsSnapshot.docs.map(doc => {
        const data = doc.data();
        const listedDate = data.listedDate as Timestamp | undefined;
        return {
            id: doc.id,
            name: data.name || 'Unnamed Cat',
            description: data.description || 'No description available.',
            imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
            location: data.location || 'Unknown location',
            listedDate: listedDate ? listedDate.toDate().toISOString() : new Date().toISOString(),
            listerId: data.listerId || 'Unknown lister',
        }
    });
    return catsList;
}

export async function getCat(catId: string): Promise<Cat | null> {
    const catDocRef = doc(db, 'cats', catId);
    const catDocSnap = await getDoc(catDocRef);

    if (catDocSnap.exists()) {
        const data = catDocSnap.data();
        const listedDate = data.listedDate as Timestamp | undefined;
        return {
            id: catDocSnap.id,
            name: data.name || 'Unnamed Cat',
            description: data.description || 'No description available.',
            imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
            location: data.location || 'Unknown location',
            listedDate: listedDate ? listedDate.toDate().toISOString() : new Date().toISOString(),
            listerId: data.listerId || 'Unknown lister',
        };
    } else {
        return null;
    }
}

export async function getCatsByUser(userId: string): Promise<Cat[]> {
    const catsCollectionRef = collection(db, 'cats');
    const q = query(catsCollectionRef, where('listerId', '==', userId));
    const catsSnapshot = await getDocs(q);
    const catsList = catsSnapshot.docs.map(doc => {
        const data = doc.data();
        const listedDate = data.listedDate as Timestamp | undefined;
        return {
            id: doc.id,
            name: data.name || 'Unnamed Cat',
            description: data.description || 'No description available.',
            imageUrl: data.imageUrl || 'https://placehold.co/600x400.png',
            location: data.location || 'Unknown location',
            listedDate: listedDate ? listedDate.toDate().toISOString() : new Date().toISOString(),
            listerId: data.listerId,
        }
    });
    return catsList;
}

export async function addCat(cat: Omit<Cat, 'id' | 'listedDate'> & { listedDate: Date }): Promise<string> {
  const catsCollectionRef = collection(db, 'cats');
  const newDocRef = await addDoc(catsCollectionRef, {
    ...cat,
    listedDate: Timestamp.fromDate(cat.listedDate),
  });
  return newDocRef.id;
}
