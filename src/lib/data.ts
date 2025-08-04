import type { Cat, User } from './types';

export const MOCK_USERS: User[] = [
    {
        id: 'user-1',
        name: 'Alice',
        imageUrl: 'https://placehold.co/200x200.png',
        socials: {
            twitter: '#',
            github: '#',
            linkedin: '#',
        }
    },
    {
        id: 'user-2',
        name: 'Bob',
        imageUrl: 'https://placehold.co/200x200.png',
        socials: {
            twitter: '#',
        }
    },
    {
        id: 'user-3',
        name: 'Charlie',
        imageUrl: 'https://placehold.co/200x200.png',
        socials: {
            github: '#',
        }
    },
    {
        id: 'user-4',
        name: 'David',
        imageUrl: 'https://placehold.co/200x200.png',
        socials: {
            linkedin: '#',
        }
    },
    {
        id: 'user-5',
        name: 'Eve',
        imageUrl: 'https://placehold.co/200x200.png',
        socials: {}
    }
];


export const MOCK_CATS: Cat[] = [
  {
    id: '1',
    name: 'Mittens',
    description: 'A very friendly ginger tabby with white paws. Found near the old oak tree in the park. Seems well-fed and might have a home nearby. Loves to be petted.',
    imageUrl: 'https://placehold.co/600x400.png',
    location: 'Central Park, Springfield',
    lat: 34.0522,
    lng: -118.2437,
    listedDate: '2024-05-15T10:00:00Z',
    listerId: 'user-1'
  },
  {
    id: '2',
    name: 'Shadow',
    description: 'Shy all-black cat. Very skittish and runs from loud noises. Found hiding under a car on Maple Street. Looks a bit thin. Responds to soft voices.',
    imageUrl: 'https://placehold.co/600x400.png',
    location: 'Maple Street, Springfield',
    lat: 34.0542,
    lng: -118.2457,
    listedDate: '2024-05-14T14:30:00Z',
    listerId: 'user-2'
  },
  {
    id: '3',
    description: 'Calico with a distinctive patch over one eye. Very vocal and seems to be looking for someone. Found lounging on a porch on 3rd Avenue.',
    imageUrl: 'https://placehold.co/600x400.png',
    location: '3rd Avenue, Springfield',
    lat: 34.0500,
    lng: -118.2411,
    listedDate: '2024-05-14T18:00:00Z',
    listerId: 'user-3'
  },
  {
    id: '4',
    name: 'Leo',
    description: 'Large, fluffy grey cat with a majestic mane. Looks like a Maine Coon mix. Very calm and lets people approach. Found near the library downtown.',
    imageUrl: 'https://placehold.co/600x400.png',
    location: 'Downtown Library, Springfield',
    lat: 34.0566,
    lng: -118.2405,
    listedDate: '2024-05-13T11:20:00Z',
    listerId: 'user-1'
  },
  {
    id: '5',
    description: 'A small tuxedo cat (black with white chest and paws). Very playful and energetic. Was chasing butterflies in the community garden.',
    imageUrl: 'https://placehold.co/600x400.png',
    location: 'Community Garden, Springfield',
    lat: 34.0488,
    lng: -118.2501,
    listedDate: '2024-05-12T09:00:00Z',
    listerId: 'user-4'
  },
  {
    id: '6',
    name: 'Luna',
    description: 'Sleek Siamese with bright blue eyes. A bit wary but warms up with treats. Found near the Riverwalk cafe, seemed a bit lost.',
    imageUrl: 'https://placehold.co/600x400.png',
    location: 'Riverwalk, Springfield',
    lat: 34.0515,
    lng: -118.2399,
    listedDate: '2024-05-11T20:00:00Z',
    listerId: 'user-5'
  },
];
