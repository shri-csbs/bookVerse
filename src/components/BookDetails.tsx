import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Star, Calendar, Bookmark, BookOpen, MessageSquare, AlertCircle, RefreshCw, Layers, Brain, Sparkles } from 'lucide-react';
import { GoogleBookItem, SavedBook, ReadingStatus } from '../types';

interface BookDetailsProps {
  bookId: string;
  onBack: () => void;
  savedBooks: SavedBook[];
  onSaveBook: (book: GoogleBookItem, status: ReadingStatus, extra?: Partial<SavedBook>) => void;
  onRemoveBook: (id: string) => void;
}

export default function BookDetails({ bookId, onBack, savedBooks, onSaveBook, onRemoveBook }: BookDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [bookData, setBookData] = useState<GoogleBookItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable user states (if saved)
  const savedInstance = savedBooks.find((b) => b.id === bookId);
  const [status, setStatus] = useState<ReadingStatus>('WISHLIST');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hugging Face AI States
  const [hfSummary, setHfSummary] = useState<string | null>(null);
  const [hfTakeaways, setHfTakeaways] = useState<string[]>([]);
  const [hfLoading, setHfLoading] = useState(false);
  const [hfError, setHfError] = useState<string | null>(null);
  const [hfSandbox, setHfSandbox] = useState(true);


  useEffect(() => {
    // Sync initial states if book is saved
    if (savedInstance) {
      setStatus(savedInstance.readingStatus);
      setCurrentPage(savedInstance.currentPage || 0);
      setRating(savedInstance.rating || 0);
      setReview(savedInstance.review || '');
    }
  }, [savedInstance]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/books/details/${bookId}`);
        if (!response.ok) {
          throw new Error('Failed to retrieve volume details from server.');
        }
        const data = await response.json();
        setBookData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch book data.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [bookId]);

  const handleUpdateProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookData) return;
    setIsUpdatingProgress(true);
    setSuccessMsg(null);

    // Trigger update/save
    onSaveBook(bookData, status, {
      currentPage: Number(currentPage),
      rating: Number(rating),
      review: review
    });

    setTimeout(() => {
      setIsUpdatingProgress(false);
      setSuccessMsg('Progress updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 600);
  };

  const handleHFSummarize = async () => {
    if (!bookData) return;
    setHfLoading(true);
    setHfError(null);
    try {
      const response = await fetch('/api/books/summarize-hf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookData.volumeInfo.title,
          authors: bookData.volumeInfo.authors,
          description: bookData.volumeInfo.description || '',
          categories: bookData.volumeInfo.categories
        })
      });
      if (!response.ok) {
        throw new Error('Hugging Face microservice returned an error response.');
      }
      const data = await response.json();
      setHfSummary(data.summary);
      setHfTakeaways(data.takeaways || []);
      setHfSandbox(!!data.isSandbox);
    } catch (err: any) {
      console.error(err);
      setHfError(err.message || 'Failed to communicate with Hugging Face Inference API.');
    } finally {
      setHfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Retrieving literary dossier from records...</p>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="inline-flex p-3 bg-red-50 rounded-full text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Details Unavailable</h2>
        <p className="text-gray-500">{error || 'An unexpected error occurred while loading this volume.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </button>
      </div>
    );
  }

  const { volumeInfo } = bookData;
  const coverUrl = volumeInfo.imageLinks?.thumbnail || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop';
  const authorsList = volumeInfo.authors || ['Unknown Author'];
  const formattedDate = volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'Unknown Date';

  return (
    <div className="space-y-8 animate-fade-in" id="book-details-section">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-emerald-700 transition-colors focus:outline-hidden group cursor-pointer"
        id="back-to-search-btn"
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Search
      </button>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Book Cover & Quick Meta */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col items-center shadow-xs">
            <div className="relative group overflow-hidden rounded-2xl shadow-xl w-48 h-72">
              <img
                src={coverUrl}
                alt={volumeInfo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
            </div>

            <div className="mt-6 text-center space-y-1 w-full">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                {volumeInfo.categories?.[0] || 'Literature'}
              </span>
              <h2 className="text-xl font-bold text-gray-900 line-clamp-2 mt-2">{volumeInfo.title}</h2>
              {volumeInfo.subtitle && (
                <p className="text-xs text-gray-500 line-clamp-2 italic">{volumeInfo.subtitle}</p>
              )}
              <p className="text-sm font-medium text-gray-600 mt-1">by {authorsList.join(', ')}</p>
            </div>

            {/* Google Rating */}
            {volumeInfo.averageRating && (
              <div className="mt-4 flex items-center space-x-1 px-3 py-1 bg-amber-50 rounded-lg text-xs font-bold text-amber-800 border border-amber-100">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>Google Books Rating: {volumeInfo.averageRating}/5</span>
                <span className="text-amber-600 font-normal ml-0.5">({volumeInfo.ratingsCount} reviews)</span>
              </div>
            )}
          </div>

          {/* Publisher Dossier */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center text-sm border-b border-gray-50 pb-2">
              <Layers className="h-4 w-4 text-emerald-600 mr-2" />
              Volume Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 font-medium">Publisher</span>
                <p className="font-semibold text-gray-700">{volumeInfo.publisher || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 font-medium">Published</span>
                <p className="font-semibold text-gray-700">{formattedDate}</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 font-medium">Pages count</span>
                <p className="font-semibold text-gray-700">{volumeInfo.pageCount || 'Unspecified'} pages</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 font-medium">Language</span>
                <p className="font-semibold text-gray-700 uppercase">{volumeInfo.language || 'EN'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Description & Library Manager */}
        <div className="lg:col-span-2 space-y-6">
          {/* Synopsis */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xs space-y-4">
            <h3 className="font-extrabold text-gray-900 text-lg border-b border-gray-50 pb-2">Synopsis & Description</h3>
            {volumeInfo.description ? (
              <div 
                className="text-gray-600 text-sm leading-relaxed space-y-4 max-h-[300px] overflow-y-auto pr-2"
                dangerouslySetInnerHTML={{ __html: volumeInfo.description }}
              />
            ) : (
              <p className="text-sm text-gray-400 italic">No detailed summary is available for this catalog record.</p>
            )}
          </div>

          {/* Hugging Face Summarizer Option */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                <h3 className="font-extrabold text-gray-900 text-lg">Hugging Face AI Insights</h3>
              </div>
              <button
                type="button"
                onClick={handleHFSummarize}
                disabled={hfLoading}
                className="inline-flex items-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                id="hf-generate-btn"
              >
                {hfLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Generate Takeaways
                  </>
                )}
              </button>
            </div>

            {hfError && (
              <div className="p-3.5 bg-red-50 text-red-800 text-xs rounded-xl border border-red-100 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span>{hfError}</span>
              </div>
            )}

            {hfSummary ? (
              <div className="space-y-4 animate-fade-in">
                {hfSandbox && (
                  <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md border border-amber-100">
                    Sandbox Simulation Mode
                  </span>
                )}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Semantic Summary</h4>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                    {hfSummary}
                  </p>
                </div>

                {hfTakeaways.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aesthetic Key Takeaways</h4>
                    <ul className="space-y-2">
                      {hfTakeaways.map((point, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                          <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              !hfLoading && (
                <p className="text-xs text-gray-400 italic">
                  Generate key takeaways and a theme-synthesized summary powered by Hugging Face inference models.
                </p>
              )
            )}
          </div>

          {/* Library Status / Tracker Controls */}
          <div className="bg-emerald-50/30 border border-emerald-500/10 rounded-3xl p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/10 pb-4 mb-6">
              <div>
                <h3 className="font-bold text-emerald-900 text-lg">My Reading Tracker</h3>
                <p className="text-emerald-700 text-xs">Save this volume to your local bookshelf and log your active reading progress.</p>
              </div>

              {!savedInstance ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onSaveBook(bookData, 'WISHLIST')}
                    className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-100 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                    id="save-to-wishlist"
                  >
                    Want to Read
                  </button>
                  <button
                    onClick={() => onSaveBook(bookData, 'READING')}
                    className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                    id="save-to-reading"
                  >
                    Add to Library
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <Bookmark className="h-4.5 w-4.5 mr-1 fill-emerald-800 text-emerald-800" />
                  Saved on shelf
                </span>
              )}
            </div>

            {savedInstance && (
              <form onSubmit={handleUpdateProgress} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reading Status Select */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Shelf Category
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                      className="block w-full py-2.5 px-3 border border-gray-200 bg-white rounded-xl text-sm focus:ring-emerald-500/10 focus:border-emerald-500"
                      id="details-status-select"
                    >
                      <option value="WISHLIST">Want to Read (Wishlist)</option>
                      <option value="READING">Currently Reading</option>
                      <option value="COMPLETED">Completed (Finished)</option>
                    </select>
                  </div>

                  {/* Page Tracker */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Current Page
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max={volumeInfo.pageCount || 9999}
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Math.min(Number(e.target.value), volumeInfo.pageCount || 9999))}
                        className="block w-24 py-2 px-3 border border-gray-200 bg-white rounded-xl text-sm text-center focus:ring-emerald-500/10 focus:border-emerald-500"
                        id="details-progress-input"
                      />
                      <span className="text-gray-400 text-xs">/ {volumeInfo.pageCount || 'Unspecified'} pages</span>
                    </div>
                  </div>
                </div>

                {/* Rating out of 5 stars */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    My Rating
                  </span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        id={`star-${star}`}
                      >
                        <Star className={`h-6 w-6 ${rating >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="text-xs font-semibold text-gray-500 ml-2">({rating} stars)</span>
                    )}
                  </div>
                </div>

                {/* Private Review/Notes */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                    <MessageSquare className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                    My Notes & Review
                  </label>
                  <textarea
                    rows={3}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write private notes, favorite quotes, or your comprehensive review..."
                    className="block w-full p-3 text-sm border border-gray-200 bg-white rounded-xl focus:ring-emerald-500/10 focus:border-emerald-500"
                    id="details-review-textarea"
                  />
                </div>

                {/* Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-emerald-500/10">
                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      disabled={isUpdatingProgress}
                      className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      id="save-tracker-changes"
                    >
                      {isUpdatingProgress ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
                      Update bookshelf
                    </button>

                    {successMsg && (
                      <span className="text-emerald-700 text-xs font-bold animate-pulse">{successMsg}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to remove this book from your shelf?')) {
                        onRemoveBook(bookId);
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors shrink-0 text-center cursor-pointer"
                    id="remove-from-shelf"
                  >
                    Remove from shelf
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
