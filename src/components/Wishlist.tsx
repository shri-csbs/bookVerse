import React, { useState } from 'react';
import { Heart, Search, Star, Trash2, ArrowRight, Sparkles, PlusCircle } from 'lucide-react';
import { SavedBook, ReadingStatus } from '../types';

interface WishlistProps {
  savedBooks: SavedBook[];
  onSelectBook: (id: string) => void;
  onRemoveBook: (id: string) => void;
  onUpdateStatus: (id: string, status: ReadingStatus) => void;
  setActiveTab: (tab: string) => void;
}

export default function Wishlist({ savedBooks, onSelectBook, onRemoveBook, onUpdateStatus, setActiveTab }: WishlistProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const wishlistBooks = savedBooks.filter((book) => {
    const isWishlist = book.readingStatus === 'WISHLIST';
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase()));
    return isWishlist && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in" id="wishlist-section">
      
      {/* Wishlist Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-700 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center">
            <Heart className="h-8 w-8 text-indigo-600 mr-2 shrink-0 fill-indigo-600" />
            My Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">Keep track of the books you want to read next and prioritize your queue.</p>
        </div>

        {/* Local search within Wishlist */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wishlist..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden bg-gray-50/50 dark:bg-slate-800 hover:bg-white transition-all dark:text-white"
            id="wishlist-local-search"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Wishlist Grid */}
      {wishlistBooks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full">
            <Heart className="h-10 w-10 fill-indigo-600/10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Wishlist is Empty</h2>
          <p className="text-sm text-gray-500">
            {searchQuery 
              ? "No books on your wishlist match your current search terms."
              : "Save volumes that caught your attention to find them easily when you are ready to start reading."}
          </p>
          {!searchQuery && (
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActiveTab('search')}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                id="wishlist-find-books"
              >
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Find Books
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                AI Recs
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistBooks.map((book) => {
            const coverUrl = book.thumbnail;
            const authors = book.authors.join(', ');

            return (
              <div
                key={book.id}
                className="group flex flex-col bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all h-[420px] duration-300"
                id={`wishlist-card-${book.id}`}
              >
                {/* Book Cover Container */}
                <div 
                  onClick={() => onSelectBook(book.id)}
                  className="relative h-48 bg-gray-50 dark:bg-slate-900/50 flex items-center justify-center p-4 overflow-hidden cursor-pointer shrink-0 border-b border-gray-50 dark:border-slate-800"
                >
                  <img
                    src={coverUrl}
                    alt={book.title}
                    referrerPolicy="no-referrer"
                    className="h-36 w-24 object-cover shadow-md rounded-md group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Delete button from Wishlist */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Remove this book from your wishlist?')) {
                        onRemoveBook(book.id);
                      }
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-xs rounded-lg border border-gray-100 dark:border-slate-700 text-gray-400 hover:text-red-500 transition-colors shadow-2xs"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Info and Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="inline-block px-2.5 py-0.5 text-3xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 rounded-full max-w-full truncate">
                      {book.categories?.[0] || 'Literature'}
                    </span>
                    <h3 
                      onClick={() => onSelectBook(book.id)}
                      className="font-bold text-gray-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-sm"
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      by {authors}
                    </p>
                    <p className="text-2xs text-gray-400 dark:text-gray-500 line-clamp-3 mt-1">
                      {book.description || 'No summary available.'}
                    </p>
                  </div>

                  {/* Actions area */}
                  <div className="pt-4 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between mt-auto">
                    <button
                      onClick={() => onSelectBook(book.id)}
                      className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => onUpdateStatus(book.id, 'READING')}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
                      id={`start-reading-wishlist-${book.id}`}
                    >
                      <span>Start Reading</span>
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </button>
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
