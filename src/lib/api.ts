import { SavedBook, ReadingStatus } from '../types';

export interface BackendBook {
  id?: number;
  googleBooksId: string;
  title: string;
  authors?: string;
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string;
  thumbnail?: string;
  readingStatus: string;
  currentPage?: number;
  rating?: number;
  review?: string;
  dateAdded?: string;
  dateUpdated?: string;
}

export function mapBackendToSavedBook(bb: BackendBook): SavedBook {
  return {
    id: bb.googleBooksId,
    title: bb.title,
    authors: bb.authors ? bb.authors.split(', ') : ['Unknown Author'],
    publisher: bb.publisher || 'Unknown Publisher',
    publishedDate: bb.publishedDate || 'Unknown Date',
    description: bb.description || '',
    pageCount: bb.pageCount || 0,
    categories: bb.categories ? bb.categories.split(', ') : ['Literature'],
    thumbnail: bb.thumbnail || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop',
    readingStatus: (bb.readingStatus?.toUpperCase() as ReadingStatus) || 'WISHLIST',
    currentPage: bb.currentPage || 0,
    rating: bb.rating || 0,
    review: bb.review || '',
    dateAdded: bb.dateAdded || new Date().toISOString(),
    dateUpdated: bb.dateUpdated || new Date().toISOString(),
    dbId: bb.id,
  };
}

export function mapSavedBookToBackend(sb: SavedBook): BackendBook {
  return {
    id: sb.dbId,
    googleBooksId: sb.id,
    title: sb.title,
    authors: Array.isArray(sb.authors) ? sb.authors.join(', ') : sb.authors || 'Unknown Author',
    publisher: sb.publisher,
    publishedDate: sb.publishedDate,
    description: sb.description,
    pageCount: sb.pageCount,
    categories: Array.isArray(sb.categories) ? sb.categories.join(', ') : sb.categories || 'Literature',
    thumbnail: sb.thumbnail,
    readingStatus: sb.readingStatus,
    currentPage: sb.currentPage,
    rating: sb.rating,
    review: sb.review,
    dateAdded: sb.dateAdded,
    dateUpdated: sb.dateUpdated,
  };
}

export async function testConnection(baseUrl: string): Promise<boolean> {
  try {
    const cleanUrl = baseUrl.replace(/\/$/, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
    const response = await fetch(`${cleanUrl}/api/books`, { 
      method: 'GET', 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    return response.ok || response.status === 200 || response.status === 404;
  } catch (e) {
    return false;
  }
}

export async function fetchAllBooks(baseUrl: string): Promise<SavedBook[]> {
  const cleanUrl = baseUrl.replace(/\/$/, '');
  const response = await fetch(`${cleanUrl}/api/books`);
  if (!response.ok) {
    throw new Error(`Failed to fetch books: ${response.statusText}`);
  }
  const data: BackendBook[] = await response.json();
  return data.map(mapBackendToSavedBook);
}

export async function saveBookToBackend(baseUrl: string, book: SavedBook): Promise<SavedBook> {
  const cleanUrl = baseUrl.replace(/\/$/, '');
  const backendBook = mapSavedBookToBackend(book);
  const response = await fetch(`${cleanUrl}/api/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendBook),
  });
  if (!response.ok) {
    throw new Error(`Failed to save book: ${response.statusText}`);
  }
  const saved: BackendBook = await response.json();
  return mapBackendToSavedBook(saved);
}

export async function updateBookProgress(
  baseUrl: string,
  dbId: number,
  currentPage: number,
  review: string,
  rating: number,
  status: string
): Promise<SavedBook> {
  const cleanUrl = baseUrl.replace(/\/$/, '');
  const response = await fetch(`${cleanUrl}/api/books/${dbId}/progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPage, review, rating, readingStatus: status }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update progress: ${response.statusText}`);
  }
  const updated: BackendBook = await response.json();
  return mapBackendToSavedBook(updated);
}

export async function deleteBook(baseUrl: string, dbId: number): Promise<boolean> {
  const cleanUrl = baseUrl.replace(/\/$/, '');
  const response = await fetch(`${cleanUrl}/api/books/${dbId}`, {
    method: 'DELETE',
  });
  return response.ok;
}
