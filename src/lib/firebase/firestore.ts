
import { db } from '@/lib/firebase';
import type { Cat, User } from '@/lib/types';
import { collection, getDocs, doc, getDoc, addDoc, setDoc, query, where, Timestamp, updateDoc, arrayUnion, arrayRemove, writeBatch, deleteDoc } from 'firebase/firestore';

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
            socials: data.socials || { instagram: '', custom: { platform: '', url: ''} },
            friends: data.friends || [],
        };
    } else {
        return null;
    }
}

export async function addUser(user: User): Promise<void> {
    const userDocRef = doc(db, 'users', user.id);
    await setDoc(userDocRef, user, { merge: true });
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    // Note: This logic assumes you handle image upload elsewhere and pass the URL here.
    // If imageUrl is a base64 string, it should be uploaded to a service like Firebase Storage first.
    // For this app, we're simplifying and storing the Data URI directly for the profile pic, similar to the cat pic.
    await updateDoc(userDocRef, data);
}

export async function addFriend(currentUserId: string, friendId: string): Promise<void> {
    if (currentUserId === friendId) {
        throw new Error("You cannot add yourself as a friend.");
    }
    const currentUserDocRef = doc(db, 'users', currentUserId);
    const friendDocRef = doc(db, 'users', friendId);

    const batch = writeBatch(db);

    batch.update(currentUserDocRef, {
        friends: arrayUnion(friendId)
    });

    batch.update(friendDocRef, {
        friends: arrayUnion(currentUserId)
    });

    await batch.commit();
}

export async function removeFriend(currentUserId: string, friendId:string): Promise<void> {
    if (currentUserId === friendId) {
        throw new Error("Invalid operation.");
    }
    const currentUserDocRef = doc(db, 'users', currentUserId);
    const friendDocRef = doc(db, 'users', friendId);

    const batch = writeBatch(db);

    batch.update(currentUserDocRef, {
        friends: arrayRemove(friendId)
    });
    
    batch.update(friendDocRef, {
        friends: arrayRemove(currentUserId)
    });

    await batch.commit();
}

export async function getFriends(friendIds: string[]): Promise<User[]> {
    if (friendIds.length === 0) {
        return [];
    }
    const friends: User[] = [];
    // Firestore 'in' query has a limit of 30 items in the array.
    // We chunk the friendIds array to handle cases with more than 30 friends.
    const chunks: string[][] = [];
    for (let i = 0; i < friendIds.length; i += 30) {
        chunks.push(friendIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
         const q = query(collection(db, 'users'), where('id', 'in', chunk));
         const friendsSnapshot = await getDocs(q);
         friendsSnapshot.forEach(doc => {
            const data = doc.data();
            friends.push({
                id: doc.id,
                name: data.name,
                email: data.email,
                imageUrl: data.imageUrl,
                socials: data.socials || {},
                friends: data.friends || [],
            });
         });
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

export async function deleteCat(catId: string): Promise<void> {
    const catDocRef = doc(db, 'cats', catId);
    await deleteDoc(catDocRef);
}
