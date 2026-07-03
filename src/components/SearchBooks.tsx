import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, BookOpen, Star, User, Calendar, Check, Plus, AlertCircle } from 'lucide-react';
import { GoogleBookItem, SavedBook, ReadingStatus } from '../types';

interface SearchBooksProps {
  onSelectBook: (id: string) => void;
  savedBooks: SavedBook[];
  onSaveBook: (book: GoogleBookItem, status: ReadingStatus) => void;
  onRemoveBook: (id: string) => void;
}

const PRESET_QUERIES = [
  { id: 'fiction', label: 'Fiction Novels', icon: '📖' },
  { id: 'biography', label: 'Biographies', icon: '👤' },
  { id: 'sci-fi', label: 'Sci-Fi & Fantasy', icon: '🚀' },
  { id: 'mystery', label: 'Mystery & Crime', icon: '🔍' },
  { id: 'history', label: 'History', icon: '🏛️' },
  { id: 'ai', label: 'Artificial Intelligence', icon: '🧠' },
];

export default function SearchBooks({ onSelectBook, savedBooks, onSaveBook, onRemoveBook }: SearchBooksProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GoogleBookItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Default search on load
  useEffect(() => {
    handleSearch('bestsellers');
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Could not retrieve books. Please try a different term.');
      }
      const data = await response.json();
      if (data.items) {
        setResults(data.items);
      } else {
        setResults([]);
        setError('No books matched your query. Try something else!');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while connecting to Google Books.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const getBookStatus = (googleId: string): ReadingStatus | 'NOT_SAVED' => {
    const book = savedBooks.find((b) => b.id === googleId);
    return book ? book.readingStatus : 'NOT_SAVED';
  };

  return (
    <div className="space-y-8 animate-fade-in" id="search-section">
      {/* Search Header Banner */}
      <div className="text-center py-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Discover Your Next Great{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Adventure
          </span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Search millions of volumes from the Google Books global library database and manage your reading flow seamlessly.
        </p>
      </div>

      {/* Search Bar Input Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, genre or keyword..."
            className="block w-full pl-12 pr-28 py-4 text-base text-gray-900 placeholder-gray-400 bg-white border border-gray-200 rounded-2xl shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden transition-all"
            id="search-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
            id="search-submit-btn"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Presets Grid */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-xs text-gray-400 mr-1">Popular terms:</span>
          {PRESET_QUERIES.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setQuery(p.label);
                handleSearch(p.id);
              }}
              type="button"
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
            >
              <span className="mr-1">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Info Banner */}
      {error && (
        <div className="max-w-2xl mx-auto bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start space-x-3 text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Notice</p>
            <p className="text-xs text-amber-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Books Deck/Grid Result Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
          <p className="text-sm font-medium text-gray-400">Querying global books records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((book) => {
            const status = getBookStatus(book.id);
            const coverUrl = book.volumeInfo.imageLinks?.thumbnail || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop';
            const authors = book.volumeInfo.authors?.join(', ') || 'Unknown Author';

            return (
              <div
                key={book.id}
                className="group flex flex-col bg-white border border-gray-100 hover:border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all h-[420px] duration-300"
                id={`book-card-${book.id}`}
              >
                {/* Image Wrap */}
                <div 
                  onClick={() => onSelectBook(book.id)}
                  className="relative h-48 bg-gray-50 flex items-center justify-center p-4 overflow-hidden cursor-pointer"
                >
                  <img
                    src={coverUrl}
                    alt={book.volumeInfo.title}
                    referrerPolicy="no-referrer"
                    className="h-36 w-24 object-cover shadow-md rounded-md group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Subtle hover gradient overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Rating Badge */}
                  {book.volumeInfo.averageRating && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg flex items-center space-x-1 border border-gray-100 text-xs font-semibold text-gray-800">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span>{book.volumeInfo.averageRating}</span>
                    </div>
                  )}
                </div>

                {/* Info wrap */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="inline-block px-2.5 py-0.5 text-3xs font-semibold bg-gray-100 text-gray-600 rounded-full max-w-full truncate">
                      {book.volumeInfo.categories?.[0] || 'Literature'}
                    </span>
                    <h3 
                      onClick={() => onSelectBook(book.id)}
                      className="font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors cursor-pointer text-sm"
                    >
                      {book.volumeInfo.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 flex items-center">
                      <User className="h-3 w-3 mr-1 shrink-0 text-gray-400" />
                      <span>{authors}</span>
                    </p>
                    <p className="text-2xs text-gray-400 line-clamp-2 mt-1">
                      {book.volumeInfo.description || 'No description available for this volume.'}
                    </p>
                  </div>

                  {/* Actions Area */}
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <button
                      onClick={() => onSelectBook(book.id)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      {status === 'NOT_SAVED' ? (
                        <>
                          <button
                            onClick={() => onSaveBook(book, 'WISHLIST')}
                            className="p-1.5 text-xs text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-gray-100 transition-all cursor-pointer"
                            title="Add to Wishlist"
                            id={`add-wishlist-${book.id}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onSaveBook(book, 'READING')}
                            className="px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                            id={`add-library-${book.id}`}
                          >
                            Add to Library
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-3xs font-semibold ${
                            status === 'COMPLETED' 
                              ? 'bg-blue-50 text-blue-700' 
                              : status === 'READING' 
                              ? 'bg-amber-50 text-amber-700' 
                              : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            <Check className="h-3 w-3 mr-0.5" />
                            {status === 'WISHLIST' ? 'Want to Read' : status === 'READING' ? 'Reading' : 'Completed'}
                          </span>
                          <button
                            onClick={() => onRemoveBook(book.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove book"
                            id={`remove-book-${book.id}`}
                          >
                            &times;
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
