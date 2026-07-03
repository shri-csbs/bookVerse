import React, { useState } from 'react';
import { Bookmark, Star, Clock, CheckCircle2, Heart, Search, BookOpen, AlertCircle, Trash2, PlusCircle, Settings } from 'lucide-react';
import { SavedBook, ReadingStatus } from '../types';

interface MyLibraryProps {
  savedBooks: SavedBook[];
  onSelectBook: (id: string) => void;
  onRemoveBook: (id: string) => void;
  onUpdateStatus: (id: string, status: ReadingStatus) => void;
  setActiveTab: (tab: string) => void;
}

export default function MyLibrary({ savedBooks, onSelectBook, onRemoveBook, onUpdateStatus, setActiveTab }: MyLibraryProps) {
  const [filter, setFilter] = useState<'ALL' | ReadingStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = savedBooks.filter((book) => {
    const matchesFilter = filter === 'ALL' || book.readingStatus === filter;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getPercentage = (book: SavedBook) => {
    if (!book.pageCount) return 0;
    return Math.round((book.currentPage / book.pageCount) * 100);
  };

  const statusTags = [
    { id: 'ALL', label: 'All Books', icon: Bookmark, color: 'text-gray-600 bg-gray-100 hover:bg-gray-200/80' },
    { id: 'READING', label: 'Reading', icon: Clock, color: 'text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/50' },
    { id: 'WISHLIST', label: 'Want to Read', icon: Heart, color: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/50' },
    { id: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="library-section">
      {/* Library Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Bookshelf</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, categorize, and log your reading milestones locally.</p>
        </div>

        {/* Local library search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved library..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden bg-gray-50/50 hover:bg-white transition-all"
            id="local-library-search"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Categories / Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {statusTags.map((tag) => {
          const Icon = tag.icon;
          const isActive = filter === tag.id;
          const count = tag.id === 'ALL' 
            ? savedBooks.length 
            : savedBooks.filter(b => b.readingStatus === tag.id).length;

          return (
            <button
              key={tag.id}
              onClick={() => setFilter(tag.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? tag.id === 'COMPLETED' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : tag.id === 'READING'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : tag.id === 'WISHLIST'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-800 text-white shadow-xs'
                  : tag.color
              }`}
              id={`filter-pill-${tag.id}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tag.label}</span>
              <span className={`px-1.5 py-0.5 text-3xs font-bold rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200/50 text-gray-700'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookshelf Shelf Layout or Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full">
            <Bookmark className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Bookshelf Is Empty</h2>
          <p className="text-sm text-gray-500">
            {searchQuery 
              ? "We couldn't find any books on your shelf matching your search keywords."
              : "Keep track of the books you want to read, are currently reading, and have finished by saving them to your library."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setActiveTab('search')}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              id="library-explore-btn"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Explore Books
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBooks.map((book) => {
            const percentage = getPercentage(book);
            
            return (
              <div
                key={book.id}
                className="group relative bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 shadow-xs hover:shadow-md transition-all duration-300"
                id={`shelf-book-${book.id}`}
              >
                {/* Book cover image thumbnail */}
                <div 
                  onClick={() => onSelectBook(book.id)}
                  className="w-full sm:w-24 h-36 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2 shrink-0 border border-gray-100 cursor-pointer shadow-2xs group-hover:shadow-xs transition-shadow"
                >
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    referrerPolicy="no-referrer"
                    className="h-28 w-18 object-cover shadow-xs rounded-sm group-hover:scale-102 transition-transform"
                  />
                </div>

                {/* Book Shelf details info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-3xs font-semibold ${
                        book.readingStatus === 'COMPLETED' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : book.readingStatus === 'READING' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}>
                        {book.readingStatus === 'WISHLIST' ? 'Want to Read' : book.readingStatus === 'READING' ? 'Reading' : 'Completed'}
                      </span>

                      {/* quick action trash delete */}
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this book?')) {
                            onRemoveBook(book.id);
                          }
                        }}
                        className="text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer sm:opacity-0 group-hover:opacity-100"
                        title="Delete book"
                        id={`delete-btn-${book.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h3 
                      onClick={() => onSelectBook(book.id)}
                      className="font-bold text-gray-900 line-clamp-1 hover:text-emerald-600 transition-colors cursor-pointer text-sm"
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">by {book.authors.join(', ')}</p>

                    {/* rating */}
                    {book.rating > 0 && (
                      <div className="flex items-center space-x-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < book.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress tracker visualizer */}
                  {book.readingStatus === 'READING' && (
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-2xs text-gray-500 font-medium">
                        <span>Progress</span>
                        <span>{percentage}% ({book.currentPage}/{book.pageCount} pages)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {book.readingStatus === 'COMPLETED' && (
                    <div className="mt-3 flex items-center space-x-1 text-2xs font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Completed! logged: {book.pageCount} pages</span>
                    </div>
                  )}

                  {book.readingStatus === 'WISHLIST' && (
                    <div className="mt-3 flex items-center justify-between text-2xs">
                      <span className="text-gray-400">Not started yet</span>
                      <button
                        onClick={() => onUpdateStatus(book.id, 'READING')}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        id={`start-reading-${book.id}`}
                      >
                        Start reading &rarr;
                      </button>
                    </div>
                  )}

                  {/* Detailed action row */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-3">
                    <button
                      onClick={() => onSelectBook(book.id)}
                      className="text-2xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors flex items-center cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5 mr-1" />
                      <span>Details & Notes</span>
                    </button>

                    {book.readingStatus === 'READING' && (
                      <button
                        onClick={() => onSelectBook(book.id)}
                        className="text-2xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md hover:bg-amber-100 transition-colors flex items-center cursor-pointer"
                        id={`log-progress-${book.id}`}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Log progress
                      </button>
                    )}
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
