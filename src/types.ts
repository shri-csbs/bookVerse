/**
 * Shared Type Definitions for the Bookverse application.
 */

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
    language?: string;
    previewLink?: string;
  };
}

export type ReadingStatus = 'WISHLIST' | 'READING' | 'COMPLETED';

export interface SavedBook {
  id: string; // Google Books ID
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  description: string;
  pageCount: number;
  categories: string[];
  thumbnail: string;
  
  // User customized progress fields
  readingStatus: ReadingStatus;
  currentPage: number;
  rating: number; // 0 to 5 stars
  review: string;
  dateAdded: string;
  dateUpdated: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  yearlyGoal: number; // number of books
  joinDate: string;
  favoriteGenres: string[];
}

export interface Product {
  id: string;
  name: string;
  category: 'Accessories' | 'Decor' | 'Smart Tech' | 'Drinkware';
  price: number;
  description: string;
  rating: number;
  reviewCount: number;
  image: string;
  features: string[];
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
