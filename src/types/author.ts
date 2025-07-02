export interface Author {
  id: string;
  name: string;
  defaultTitle: string;
  image?: string;
  bio?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export interface BlogAuthor extends Author {
  customTitle?: string; // Allow custom title override per post
}

export interface AuthorReference {
  authorId: string;
  customTitle?: string; // Optional custom title for this specific post
}
