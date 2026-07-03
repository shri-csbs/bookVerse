import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, BookOpen, AlertCircle, Send, Plus, BookCheck, ShieldAlert, ArrowRight, Compass, Check, User } from 'lucide-react';
import { SavedBook, GoogleBookItem, ReadingStatus } from '../types';

interface RecommendedAuthor {
  name: string;
  avatar: string;
  genre: string;
  description: string;
  books: {
    title: string;
    description: string;
    category: string;
    pageCount: number;
  }[];
}

const RECOMMENDED_AUTHORS: RecommendedAuthor[] = [
  {
    name: "Andy Weir",
    avatar: "AW",
    genre: "Science Fiction",
    description: "Meticulously researched hard sci-fi filled with optimism and wit.",
    books: [
      { title: "The Martian", description: "An astronaut stranded on Mars must survive using science.", category: "Science Fiction", pageCount: 369 },
      { title: "Artemis", description: "A high-stakes heist on the first and only city on the moon.", category: "Science Fiction", pageCount: 305 }
    ]
  },
  {
    name: "Robert C. Martin",
    avatar: "RM",
    genre: "Technology",
    description: "Software pioneer advocating code craftsmanship and professional standards.",
    books: [
      { title: "Clean Architecture", description: "Building highly cohesive and maintainable software structures.", category: "Technology", pageCount: 352 },
      { title: "The Clean Coder", description: "Professional disciplines and code standards for developers.", category: "Technology", pageCount: 210 }
    ]
  },
  {
    name: "Frank Herbert",
    avatar: "FH",
    genre: "Science Fiction",
    description: "The classic visionary master of complex galactic empires and ecology.",
    books: [
      { title: "Dune Messiah", description: "Paul Atreides confronts the consequences of his emperor rise.", category: "Science Fiction", pageCount: 336 },
      { title: "Children of Dune", description: "The struggle to keep humanity on the fabled Golden Path.", category: "Science Fiction", pageCount: 444 }
    ]
  },
  {
    name: "Brandon Sanderson",
    avatar: "BS",
    genre: "Fantasy",
    description: "Modern champion of epic world-building and logical magic frameworks.",
    books: [
      { title: "Mistborn: The Final Empire", description: "A group of skilled thieves plan to defeat an immortal god.", category: "Fantasy", pageCount: 541 },
      { title: "The Way of Kings", description: "A massive, sweeping tale of honor, war, and ancient highstorms.", category: "Fantasy", pageCount: 1007 }
    ]
  },
  {
    name: "Haruki Murakami",
    avatar: "HM",
    genre: "Magical Realism",
    description: "Japanese novelist famed for surrealist themes, jazz vibes, and solitude.",
    books: [
      { title: "Kafka on the Shore", description: "Two parallel characters explore surreal, metaphysical boundaries.", category: "Literature", pageCount: 467 },
      { title: "Norwegian Wood", description: "A deeply nostalgic journey of love, loss, and college years.", category: "Literature", pageCount: 296 }
    ]
  },
  {
    name: "Stephen King",
    avatar: "SK",
    genre: "Suspense",
    description: "One of the most prolific contemporary novelists of suspense and dread.",
    books: [
      { title: "The Shining", description: "Supernatural horror forces a father into dangerous madness.", category: "Horror", pageCount: 447 },
      { title: "11/22/63", description: "A time-travel adventure to prevent the tragedy of JFK.", category: "Suspense", pageCount: 849 }
    ]
  }
];

interface RecommendationsProps {
  savedBooks: SavedBook[];
  onSelectBook: (id: string) => void;
  onQuickAddBook: (title: string, author: string, category: string) => void;
}

export default function Recommendations({ savedBooks, onSelectBook, onQuickAddBook }: RecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [recommendationText, setRecommendationText] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isSandbox, setIsSandbox] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authorSearchQuery, setAuthorSearchQuery] = useState('');
  const [expandedAuthors, setExpandedAuthors] = useState<Record<string, boolean>>({
    "Andy Weir": true,
    "Robert C. Martin": true
  });

  useEffect(() => {
    fetchDefaultRecommendations();
  }, [savedBooks.length]); // Refresh if the books size changes

  const fetchDefaultRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/books/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedBooks }),
      });
      if (!response.ok) {
        throw new Error('Recommendations engine failed. Please try again.');
      }
      const data = await response.json();
      setRecommendationText(data.text);
      setIsSandbox(data.isSandbox || false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to retrieve recommendations from the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/books/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedBooks, prompt: customPrompt }),
      });
      if (!response.ok) {
        throw new Error('Recommendations engine failed. Please try again.');
      }
      const data = await response.json();
      setRecommendationText(data.text);
      setIsSandbox(data.isSandbox || false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate recommendations.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse basic markdown headers, list items, bold tags, etc. for visual rendering
  const parseMarkdownToHtml = (text: string) => {
    if (!text) return '';
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h4 class="text-base font-bold text-gray-900 mt-4 mb-2">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="text-lg font-extrabold text-emerald-800 mt-6 mb-3 border-b border-emerald-500/10 pb-1">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 class="text-xl font-black text-gray-950 mt-8 mb-4">$1</h2>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      // List items
      .replace(/^\s*\-\s*(.*$)/gim, '<li class="ml-4 list-disc pl-1 text-sm text-gray-600 my-1">$1</li>')
      .replace(/^\s*\d+\.\s*(.*$)/gim, '<li class="ml-4 list-decimal pl-1 text-sm text-gray-600 my-1">$1</li>')
      // Line breaks
      .replace(/\n$/gim, '<br />')
      .replace(/\n/g, '<br />');

    return html;
  };

  // Toggle author expanded status
  const toggleAuthorExpanded = (authorName: string) => {
    setExpandedAuthors(prev => ({
      ...prev,
      [authorName]: !prev[authorName]
    }));
  };

  // Get status of a book by title
  const getRecommendedBookStatus = (title: string): ReadingStatus | null => {
    const match = savedBooks.find(b => b.title.toLowerCase().trim() === title.toLowerCase().trim());
    return match ? match.readingStatus : null;
  };

  // Filtered recommended authors
  const filteredAuthors = RECOMMENDED_AUTHORS.filter(author => {
    const query = authorSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      author.name.toLowerCase().includes(query) ||
      author.genre.toLowerCase().includes(query) ||
      author.books.some(b => b.title.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8 animate-fade-in" id="recommendations-section">
      {/* Page Header */}
      <div className="text-center py-6 max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Bookverse{' '}
          <span className="bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
            AI Assistant
          </span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Unleash the power of Gemini AI to perform deep taste scans of your bookshelves and curate bespoke reading matches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Quick Actions & Custom Queries */}
        <div className="lg:col-span-3 space-y-6">
          {/* Custom Query Box */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center text-sm border-b border-gray-50 pb-2">
              <Compass className="h-4 w-4 text-emerald-600 mr-2" />
              Ask Bookverse AI
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Describe exactly what you are in the mood for (themes, settings, target pacing, or comparable titles) and Gemini will find matches!
            </p>

            <form onSubmit={handleCustomQuerySubmit} className="space-y-3">
              <textarea
                rows={4}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="E.g., Suggest 3 psychological thrillers with shocking plot twists, or What should I read next based on Dune?"
                className="block w-full p-3 text-xs border border-gray-200 bg-gray-50 rounded-xl focus:ring-emerald-500/10 focus:border-emerald-500"
                id="ai-prompt-textarea"
              />
              <button
                type="submit"
                disabled={loading || !customPrompt.trim()}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                id="submit-ai-query-btn"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                )}
                Submit custom prompt
              </button>
            </form>
          </div>

          {/* User taste statistics */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center text-sm border-b border-gray-50 pb-2">
              <BookCheck className="h-4 w-4 text-emerald-600 mr-2" />
              Shelf Scan Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Scanned library books</span>
                <span className="font-semibold text-gray-700">{savedBooks.length} titles</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Favorites rate</span>
                <span className="font-semibold text-amber-700">
                  {savedBooks.filter(b => b.rating >= 4).length} highly rated
                </span>
              </div>
              <button
                onClick={fetchDefaultRecommendations}
                disabled={loading}
                className="w-full text-center text-2xs text-emerald-600 font-semibold bg-emerald-50 hover:bg-emerald-100/80 py-2 rounded-xl transition-colors cursor-pointer"
                id="re-scan-shelf-btn"
              >
                Trigger profile re-scan &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Authors Column */}
        <div className="lg:col-span-4 space-y-6" id="authors-column">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h3 className="font-bold text-gray-900 flex items-center text-sm">
                <User className="h-4 w-4 text-emerald-600 mr-2" />
                Recommended Authors
              </h3>
              <span className="text-3xs px-2 py-0.5 font-semibold bg-gray-50 text-gray-400 rounded-full">
                {filteredAuthors.length} found
              </span>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              Discover prolific authors that align with your library metrics and add their masterpieces straight to your Wishlist!
            </p>

            {/* Micro search input inside column */}
            <div className="relative">
              <input
                type="text"
                value={authorSearchQuery}
                onChange={(e) => setAuthorSearchQuery(e.target.value)}
                placeholder="Filter by author, book, or genre..."
                className="block w-full px-3 py-2 text-xs border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-emerald-500/10 focus:border-emerald-500"
                id="author-micro-search"
              />
              {authorSearchQuery && (
                <button
                  onClick={() => setAuthorSearchQuery('')}
                  className="absolute right-2.5 top-2 text-3xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Authors Deck list */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredAuthors.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-gray-400 italic">No matching authors found.</p>
                </div>
              ) : (
                filteredAuthors.map((author, authorIdx) => {
                  const isExpanded = !!expandedAuthors[author.name];
                  
                  // Simple dynamic gradients for beautiful cards
                  const gradientClasses = [
                    "from-emerald-500 to-teal-600",
                    "from-indigo-500 to-purple-600",
                    "from-amber-500 to-orange-600",
                    "from-rose-500 to-red-600",
                    "from-blue-500 to-cyan-600",
                    "from-purple-500 to-pink-600"
                  ][authorIdx % 6];

                  return (
                    <div 
                      key={author.name}
                      className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50/30 hover:bg-white hover:shadow-xs transition-all duration-200"
                    >
                      {/* Author Card Header */}
                      <div 
                        onClick={() => toggleAuthorExpanded(author.name)}
                        className="flex items-start justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white bg-gradient-to-br ${gradientClasses} shadow-2xs shrink-0`}>
                            {author.avatar}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-gray-900 text-xs group-hover:text-emerald-600 transition-colors">
                              {author.name}
                            </h4>
                            <span className="inline-block text-[10px] text-gray-400 font-medium">
                              {author.genre}
                            </span>
                          </div>
                        </div>
                        <span className="text-3xs text-emerald-600 font-semibold uppercase tracking-wider group-hover:underline">
                          {isExpanded ? "Hide" : "Show"} ({author.books.length})
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-3xs text-gray-400 leading-relaxed">
                        {author.description}
                      </p>

                      {/* Nested recommended books */}
                      {isExpanded && (
                        <div className="space-y-2 pt-2 border-t border-gray-100 animate-slide-down">
                          <span className="text-4xs font-bold text-gray-400 uppercase tracking-widest block">
                            Curated Masterpieces:
                          </span>
                          <div className="space-y-2">
                            {author.books.map((b) => {
                              const currentStatus = getRecommendedBookStatus(b.title);
                              return (
                                <div 
                                  key={b.title}
                                  className="flex items-center justify-between bg-white border border-gray-50 p-2.5 rounded-xl gap-2"
                                >
                                  <div className="space-y-0.5">
                                    <h5 className="text-3xs font-extrabold text-gray-800 leading-snug">
                                      {b.title}
                                    </h5>
                                    <p className="text-[10px] text-gray-400 line-clamp-1">
                                      {b.description}
                                    </p>
                                  </div>

                                  {/* Reactive Action button */}
                                  {currentStatus === null ? (
                                    <button
                                      onClick={() => onQuickAddBook(b.title, author.name, b.category)}
                                      className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer shrink-0"
                                      title="Add masterpiece to Wishlist"
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </button>
                                  ) : currentStatus === 'WISHLIST' ? (
                                    <span 
                                      className="p-1 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 flex items-center justify-center"
                                      title="This masterpiece is in your Wishlist!"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </span>
                                  ) : (
                                    <span 
                                      className="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 flex items-center justify-center"
                                      title="You have saved or read this book!"
                                    >
                                      <BookCheck className="h-3.5 w-3.5" />
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column: Main AI Recommendations Viewport */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sandbox warning banner if necessary */}
          {isSandbox && (
            <div className="bg-amber-50 border border-amber-500/10 rounded-2xl p-4 flex items-start space-x-3 text-amber-950">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs">Gemini Developer Mode Enabled</h4>
                <p className="text-2xs text-amber-700 leading-relaxed">
                  The application is running in unauthenticated sandbox mode. Add your <strong className="font-semibold">GEMINI_API_KEY</strong> in the Secrets menu to get live, real-time AI scans.
                </p>
              </div>
            </div>
          )}

          {/* AI Output Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xs relative overflow-hidden min-h-[450px]">
            {/* Visual backdrop accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-200/5 rounded-full blur-2xl" />

            <div className="relative space-y-6">
              {/* Header block inside viewport */}
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-lg text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-gray-900 text-sm">Bespoke Literary Curation</span>
                </div>
                <span className="text-3xs text-gray-400 font-mono">POWERED BY GEMINI 3.5 FLASH</span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                  <p className="text-sm font-semibold text-gray-500">Scanning metadata, mapping genres, and consulting AI libraries...</p>
                  <p className="text-2xs text-gray-400">This usually takes around 2-3 seconds</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 space-y-4 max-w-sm mx-auto">
                  <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                  <h4 className="font-bold text-gray-900 text-sm">Curation Glitch</h4>
                  <p className="text-xs text-gray-500">{error}</p>
                  <button
                    onClick={fetchDefaultRecommendations}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Retry curation
                  </button>
                </div>
              ) : (
                <div 
                  className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(recommendationText) }}
                  id="recommendations-content-block"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
