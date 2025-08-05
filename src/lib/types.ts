
export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  socials?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  friends?: string[]; // Array of user IDs
}

export interface Cat {
  id: string;
  name?: string;
  description: string;
  imageUrl: string;
  location: string; // A Google Maps URL
  listedDate: string;
  listerId: string;
}
