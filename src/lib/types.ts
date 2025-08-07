
export interface SocialLink {
  platform: string;
  url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  socials?: {
    instagram?: string;
    custom?: SocialLink; // For one extra user-defined social link
  };
  friends?: string[]; // Array of user IDs
}

export interface Cat {
  id: string;
  name?: string;
  description: string;
  imageUrl: string;
  location: string; // "latitude,longitude"
  listedDate: string;
  listerId: string;
}
