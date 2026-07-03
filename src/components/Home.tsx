import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, Bookmark, Heart, Clock, Award, Star, Quote, ChevronRight } from 'lucide-react';
import { SavedBook } from '../types';

interface HomeProps {
  savedBooks: SavedBook[];
  setActiveTab: (tab: string) => void;
  onSelectBook: (id: string) => void;
}

const INSPIRED_QUOTES = [
  { text: "A room without books is like a body without a soul.", author: "Marcus Tullius Cicero" },
  { text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" },
  { text: "There is no frigate like a book to take us lands away.", author: "Emily Dickinson" },
  { text: "The reading of all good books is like a conversation with the finest minds of past centuries.", author: "René Descartes" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  { text: "Reading is essential for those who seek to rise above the ordinary.", author: "Jim Rohn" }
];

export default function Home({ savedBooks, setActiveTab, onSelectBook }: HomeProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Derive status counts
  const totalCount = savedBooks.length;
  const readingBooks = savedBooks.filter(b => b.readingStatus === 'READING');
  const wishlistBooks = savedBooks.filter(b => b.readingStatus === 'WISHLIST');
  const completedBooks = savedBooks.filter(b => b.readingStatus === 'COMPLETED');

  // Derive total pages read from Completed books and partial pages from Reading books
  const totalPagesRead = completedBooks.reduce((sum, b) => sum + b.pageCount, 0) +
                         readingBooks.reduce((sum, b) => sum + b.currentPage, 0);

  // Goal calculation (Default 12 books per year)
  const yearlyGoal = 12;
  const goalProgress = Math.min(Math.round((completedBooks.length / yearlyGoal) * 100), 100);

  // Dynamic Genre counting
  const genreCounts: { [key: string]: number } = {};
  savedBooks.forEach(b => {
    const cat = b.categories?.[0] || 'Other';
    genreCounts[cat] = (genreCounts[cat] || 0) + 1;
  });
  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const cycleQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % INSPIRED_QUOTES.length);
  };

  return (
    <div className="space-y-10 animate-fade-in" id="home-dashboard">
      
      {/* 1. Hero Welcoming Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl dark:from-slate-900 dark:via-slate-800 dark:to-slate-950">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full tracking-wider uppercase border border-emerald-500/30">
            Welcome Back, Librarian
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Your Sanctuary of <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">Reading</span> & Knowledge
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-xl">
            Bookverse is your personalized intellectual dashboard. Keep logs of your physical bookshelves, analyze your core reading archetypes, and generate tailored literary suggestions powered by artificial intelligence.
          </p>
          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('search')}
              className="flex items-center space-x-2 px-5 py-3 bg-white text-emerald-900 hover:bg-emerald-50 transition-colors rounded-xl font-bold text-xs cursor-pointer shadow-sm"
              id="hero-search-nav"
            >
              <Search className="h-4 w-4" />
              <span>Explore Book Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className="flex items-center space-x-2 px-5 py-3 bg-emerald-700/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-500/20 transition-colors rounded-xl font-bold text-xs cursor-pointer"
              id="hero-ai-nav"
            >
              <Sparkles className="h-4 w-4" />
              <span>Get AI Suggestions</span>
            </button>
          </div>
        </div>
        
        {/* Abstract background decorative blobs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-60 h-60 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" id="dashboard-stats-grid">
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Bookmark className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider">Total Shelf</p>
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{totalCount} volumes</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider">Currently Reading</p>
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{readingBooks.length} books</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider">My Wishlist</p>
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{wishlistBooks.length} items</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider">Total Progress</p>
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{totalPagesRead} pages</h4>
          </div>
        </div>
      </div>

      {/* 3. Reading Goal & Favorite Genres & Inspirational Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Goal Circle widget */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Yearly Reading Goal</h3>
            <p className="text-xs text-gray-400 mt-1">Challenge yourself to expand your library perspective.</p>
          </div>
          
          <div className="flex flex-col items-center justify-center my-6">
            <div className="relative h-28 w-28 flex items-center justify-center">
              {/* Semi-mock circular progress bar */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  className="stroke-gray-100 dark:stroke-slate-700"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="45"
                  className="stroke-emerald-500"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * goalProgress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{completedBooks.length}</span>
                <span className="text-3xs font-semibold text-gray-400 uppercase">of {yearlyGoal} books</span>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {goalProgress}% Completed Goal
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className="w-full text-center py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-all cursor-pointer"
          >
            Adjust Reading Goal &rarr;
          </button>
        </div>

        {/* Favorite Genres card */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Genre Alignment</h3>
            <p className="text-xs text-gray-400 mt-1">Which categories define your literary footprints?</p>
          </div>

          <div className="space-y-4 my-4 flex-1 flex flex-col justify-center">
            {sortedGenres.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 italic">
                Add books to your shelf to populate your genre profile!
              </div>
            ) : (
              sortedGenres.map(([genre, count], index) => {
                const colors = ['bg-emerald-500', 'bg-teal-500', 'bg-indigo-500'];
                return (
                  <div key={genre} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">{genre}</span>
                      <span className="text-gray-400">{count} volume{count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`${colors[index] || 'bg-slate-400'} h-full rounded-full`}
                        style={{ width: `${Math.min((count / savedBooks.length) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={() => setActiveTab('library')}
            className="w-full text-center py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl transition-all cursor-pointer"
          >
            View Bookshelf Inventory &rarr;
          </button>
        </div>

        {/* Quotes widget */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Inspirational Quote</h3>
            <p className="text-xs text-gray-400 mt-1">Literary fragments to light up your daily reading.</p>
          </div>

          <div className="my-6 px-4 py-3 bg-gray-50/50 dark:bg-slate-900/40 rounded-2xl border border-gray-100/50 dark:border-slate-800 relative flex-1 flex flex-col justify-center">
            <Quote className="absolute top-2 left-2 h-8 w-8 text-emerald-600/10 dark:text-emerald-400/10 pointer-events-none" />
            <p className="text-xs italic text-gray-600 dark:text-gray-300 text-center leading-relaxed font-medium">
              "{INSPIRED_QUOTES[quoteIndex].text}"
            </p>
            <p className="text-3xs font-mono font-bold text-right text-emerald-600 dark:text-emerald-400 mt-2">
              — {INSPIRED_QUOTES[quoteIndex].author}
            </p>
          </div>

          <button
            onClick={cycleQuote}
            className="w-full text-center py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-all cursor-pointer"
            id="quote-cycle-btn"
          >
            Cycle Quote
          </button>
        </div>
      </div>

      {/* 4. Reading History / Active Books Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Reads List (Left side, takes 2 columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700 pb-3 mb-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base flex items-center">
              <Clock className="h-5 w-5 text-amber-500 mr-2" />
              Active Bookshelf Slots
            </h3>
            <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-3xs font-bold rounded-full">
              In Progress
            </span>
          </div>

          {readingBooks.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 italic space-y-3">
              <p>No books currently being logged as in-progress.</p>
              <button
                onClick={() => setActiveTab('search')}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-3xs rounded-lg transition-colors cursor-pointer"
              >
                Find books to start &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {readingBooks.map(book => {
                const percent = Math.min(Math.round((book.currentPage / book.pageCount) * 100), 100);
                return (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book.id)}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-gray-100 dark:hover:border-slate-700"
                  >
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      className="h-14 w-10 object-cover rounded shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{book.title}</h4>
                      <p className="text-3xs text-gray-400 truncate">by {book.authors.join(', ')}</p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-3xs font-mono text-gray-500 dark:text-gray-400 shrink-0 font-bold">{percent}%</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reading Milestone Feed (History) */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-base border-b border-gray-50 dark:border-slate-700 pb-3 mb-4 flex items-center">
            <Award className="h-5 w-5 text-emerald-600 mr-2" />
            Reading History Log
          </h3>

          <div className="space-y-4 overflow-y-auto max-h-[220px] pr-1">
            {savedBooks.length === 0 ? (
              <p className="text-center py-10 text-xs text-gray-400 italic">No historical activities yet recorded.</p>
            ) : (
              savedBooks.slice().sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime()).slice(0, 5).map((book, i) => {
                let statusText = "";
                let accentColor = "bg-emerald-500";
                if (book.readingStatus === 'COMPLETED') {
                  statusText = "Completed reading";
                  accentColor = "bg-emerald-500";
                } else if (book.readingStatus === 'READING') {
                  statusText = "Updated reading progress of";
                  accentColor = "bg-amber-500";
                } else {
                  statusText = "Added to wishlist";
                  accentColor = "bg-indigo-500";
                }

                return (
                  <div key={i} className="relative pl-5 pb-3 last:pb-0">
                    {/* timeline line */}
                    {i < savedBooks.slice(0, 5).length - 1 && (
                      <div className="absolute left-[5px] top-2 bottom-0 w-[1px] bg-gray-100 dark:bg-slate-700" />
                    )}
                    {/* timeline dot */}
                    <div className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${accentColor}`} />
                    
                    <div className="space-y-0.5">
                      <p className="text-3xs text-gray-400 font-mono">
                        {new Date(book.dateUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {statusText} <span onClick={() => onSelectBook(book.id)} className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">{book.title}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
