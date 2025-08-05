import { db } from '@/lib/firebase';
import type { Cat, User } from '@/lib/types';
import { collection, getDocs, doc, getDoc, addDoc, query, where, Timestamp } from 'firebase/firestore';

// --- User Functions ---

export async function getUser(userId: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        return {
            id: userDocSnap.id,
            name: data.name,
            imageUrl: data.imageUrl,
            socials: data.socials || {},
        };
    } else {
        return null;
    }
}


// --- Cat Functions ---

export async function getAllCats(): Promise<Cat[]> {
    const catsCollectionRef = collection(db, 'cats');
    const catsSnapshot = await getDocs(catsCollectionRef);
    const catsList = catsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            location: data.location,
            lat: data.lat,
            lng: data.lng,
            listedDate: (data.listedDate as Timestamp).toDate().toISOString(),
            listerId: data.listerId,
        }
    });
    return catsList;
}

export async function getCat(catId: string): Promise<Cat | null> {
    const catDocRef = doc(db, 'cats', catId);
    const catDocSnap = await getDoc(catDocRef);

    if (catDocSnap.exists()) {
        const data = catDocSnap.data();
        return {
            id: catDocSnap.id,
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            location: data.location,
            lat: data.lat,
            lng: data.lng,
            listedDate: (data.listedDate as Timestamp).toDate().toISOString(),
            listerId: data.listerId,
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
        return {
            id: doc.id,
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            location: data.location,
            lat: data.lat,
            lng: data.lng,
            listedDate: (data.listedDate as Timestamp).toDate().toISOString(),
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
