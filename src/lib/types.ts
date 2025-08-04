export interface User {
  id: string;
  name: string;
  imageUrl: string;
  socials: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface Cat {
  id: string;
  name?: string;
  description: string;
  imageUrl: string;
  location: string;
  lat: number;
  lng: number;
  listedDate: string;
  listerId: string;
}
