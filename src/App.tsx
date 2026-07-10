import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import SearchBooks from './components/SearchBooks';
import BookDetails from './components/BookDetails';
import MyLibrary from './components/MyLibrary';
import Wishlist from './components/Wishlist';
import Recommendations from './components/Recommendations';
import Products from './components/Products';
import AmbientFocus from './components/AmbientFocus';
import Profile from './components/Profile';
import About from './components/About';
import Contact from './components/Contact';
import JavaHub from './components/JavaHub';
import { SavedBook, GoogleBookItem, ReadingStatus, UserProfile } from './types';
import { 
  testConnection, 
  fetchAllBooks, 
  saveBookToBackend, 
  updateBookProgress, 
  deleteBook 
} from './lib/api';

// Curated mock starting books for premium first-turn display
const INITIAL_STARTER_BOOKS: SavedBook[] = [
  {
    id: 'yE6_EAAAQBAJ',
    title: 'Project Hail Mary',
    authors: ['Andy Weir'],
    publisher: 'Ballantine Books',
    publishedDate: '2021-05-04',
    description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.',
    pageCount: 476,
    categories: ['Science Fiction'],
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop',
    readingStatus: 'COMPLETED',
    currentPage: 476,
    rating: 5,
    review: 'An absolute masterpiece of scientific problem-solving, optimism, and friendship! One of my favorite sci-fi books of all time.',
    dateAdded: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    dateUpdated: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4H3GDwAAQBAJ',
    title: 'Dune',
    authors: ['Frank Herbert'],
    publisher: 'Penguin',
    publishedDate: '2019-10-01',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the mysterious man known as Muad\'Dib.',
    pageCount: 688,
    categories: ['Science Fiction'],
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=300&auto=format&fit=crop',
    readingStatus: 'READING',
    currentPage: 340,
    rating: 4,
    review: 'Fascinating world-building and complex political intrigue. The desert ecology description is incredibly immersive.',
    dateAdded: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    dateUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '_i6bDeoCQY0C',
    title: 'Clean Code',
    authors: ['Robert C. Martin'],
    publisher: 'Pearson Education',
    publishedDate: '2008-08-01',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.',
    pageCount: 464,
    categories: ['Technology'],
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&auto=format&fit=crop',
    readingStatus: 'WISHLIST',
    currentPage: 0,
    rating: 0,
    review: '',
    dateAdded: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  },
  {
    id: 'pD6arNyKyi8C',
    title: 'The Hobbit',
    authors: ['J.R.R. Tolkien'],
    publisher: 'Houghton Mifflin',
    publishedDate: '2002-09-15',
    description: 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep one day to enlist him on an adventure.',
    pageCount: 310,
    categories: ['Fiction / Fantasy'],
    thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?q=80&w=300&auto=format&fit=crop',
    readingStatus: 'COMPLETED',
    currentPage: 310,
    rating: 5,
    review: 'A timeless classic masterpiece. Tolkien\'s prose is pure magic, comforting, and adventurous.',
    dateAdded: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    dateUpdated: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'C890DwAAQBAJ',
    title: 'Atomic Habits',
    authors: ['James Clear'],
    publisher: 'Penguin Publishing Group',
    publishedDate: '2018-10-16',
    description: 'Tiny Changes, Remarkable Results. No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    pageCount: 320,
    categories: ['Self-Help'],
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=300&auto=format&fit=crop',
    readingStatus: 'READING',
    currentPage: 145,
    rating: 5,
    review: 'Incredibly actionable frameworks for building effective systems rather than focusing purely on abstract, distant goals.',
    dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dateUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm890DwAAQBAJ',
    title: 'The Silent Patient',
    authors: ['Alex Michaelides'],
    publisher: 'Celadon Books',
    publishedDate: '2019-02-05',
    description: 'The Silent Patient is a shocking psychological thriller of a woman’s act of violence against her husband—and of the therapist obsessed with uncovering her motive.',
    pageCount: 336,
    categories: ['Mystery / Thriller'],
    thumbnail: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop',
    readingStatus: 'WISHLIST',
    currentPage: 0,
    rating: 0,
    review: '',
    dateAdded: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  },
  {
    id: 'ToKillMock',
    title: 'To Kill a Mockingbird',
    authors: ['Harper Lee'],
    publisher: 'HarperCollins',
    publishedDate: '2006-10-31',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, To Kill a Mockingbird became both an instant bestseller and a critical success.',
    pageCount: 281,
    categories: ['Classic Fiction'],
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=300&auto=format&fit=crop',
    readingStatus: 'COMPLETED',
    currentPage: 281,
    rating: 5,
    review: 'Atticus Finch is the definition of quiet integrity. This novel teaches incredible lessons on empathy, justice, and humanity.',
    dateAdded: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    dateUpdated: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('bookverse_theme') === 'dark';
  });

  // Spring Boot Live Sync & Backend Configuration State
  const [backendMode, setBackendMode] = useState<'local' | 'spring'>(() => {
    return (localStorage.getItem('bookverse_backend_mode') as 'local' | 'spring') || 'spring';
  });
  const [backendUrl, setBackendUrl] = useState<string>(() => {
    return localStorage.getItem('bookverse_backend_url') || 'https://bookverse-8t9g.onrender.com';
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'connecting' | 'idle'>('connecting');

  // Simulated Login and User Profile State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('bookverse_is_logged_in') === 'true';
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const local = localStorage.getItem('bookverse_user_profile');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return {
      name: 'K. Shrivarshinee',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
      yearlyGoal: 12,
      joinDate: 'July 2026',
      favoriteGenres: ['Fiction', 'Technology', 'Science Fiction'],
    };
  });

  // Sync states with localStorage
  useEffect(() => {
    localStorage.setItem('bookverse_backend_mode', backendMode);
  }, [backendMode]);

  useEffect(() => {
    localStorage.setItem('bookverse_backend_url', backendUrl);
  }, [backendUrl]);

  useEffect(() => {
    localStorage.setItem('bookverse_user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('bookverse_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  // Load books dynamically based on the active backend mode
  const loadLibraryData = async (mode: 'local' | 'spring', url: string) => {
    if (mode === 'spring') {
      setConnectionStatus('connecting');
      try {
        const isOk = await testConnection(url);
        if (isOk) {
          const books = await fetchAllBooks(url);
          setSavedBooks(books);
          setConnectionStatus('connected');
          localStorage.setItem('bookverse_library', JSON.stringify(books));
        } else {
          setConnectionStatus('error');
          const local = localStorage.getItem('bookverse_library');
          if (local) {
            setSavedBooks(JSON.parse(local));
          } else {
            setSavedBooks(INITIAL_STARTER_BOOKS);
          }
        }
      } catch (err) {
        console.error("Failed to fetch from live Spring Boot backend:", err);
        setConnectionStatus('error');
        const local = localStorage.getItem('bookverse_library');
        if (local) {
          setSavedBooks(JSON.parse(local));
        } else {
          setSavedBooks(INITIAL_STARTER_BOOKS);
        }
      }
    } else {
      setConnectionStatus('idle');
      const local = localStorage.getItem('bookverse_library');
      if (local) {
        try {
          setSavedBooks(JSON.parse(local));
        } catch (e) {
          setSavedBooks(INITIAL_STARTER_BOOKS);
        }
      } else {
        setSavedBooks(INITIAL_STARTER_BOOKS);
      }
    }
  };

  useEffect(() => {
    loadLibraryData(backendMode, backendUrl);
  }, [backendMode, backendUrl]);

  // Sync dark mode class with state
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bookverse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bookverse_theme', 'light');
    }
  }, [isDark]);

  const saveToLocalStorage = (newBooks: SavedBook[]) => {
    setSavedBooks(newBooks);
    localStorage.setItem('bookverse_library', JSON.stringify(newBooks));
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const handleLogin = (name: string, email: string, avatar: string, goal: number) => {
    setProfile({
      name,
      avatar,
      yearlyGoal: goal,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      favoriteGenres: ['Fiction', 'Literature']
    });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  const handleClearLibrary = () => {
    saveToLocalStorage([]);
  };

  const handleResetLibrary = () => {
    saveToLocalStorage(INITIAL_STARTER_BOOKS);
  };

  const handleImportLibrary = (importedBooks: SavedBook[]) => {
    saveToLocalStorage(importedBooks);
  };

  // Live Synchronization Utilities
  const handleSyncLocalToBackend = async () => {
    if (backendMode !== 'spring') return { success: false, message: 'Backend is configured in Sandbox Mode.' };
    setConnectionStatus('connecting');
    try {
      const isOk = await testConnection(backendUrl);
      if (!isOk) {
        setConnectionStatus('error');
        return { success: false, message: 'Live Spring Boot server is unreachable.' };
      }

      let successCount = 0;
      const uploadedBooks: SavedBook[] = [];
      for (const book of savedBooks) {
        try {
          const saved = await saveBookToBackend(backendUrl, book);
          uploadedBooks.push(saved);
          successCount++;
        } catch (e) {
          console.error("Failed to sync book to backend:", book.title, e);
          uploadedBooks.push(book);
        }
      }

      setSavedBooks(uploadedBooks);
      saveToLocalStorage(uploadedBooks);
      setConnectionStatus('connected');
      return { 
        success: true, 
        message: `Successfully synchronized ${successCount} of ${savedBooks.length} books to the Live Spring Boot server!` 
      };
    } catch (err) {
      setConnectionStatus('error');
      return { success: false, message: `Sync failed: ${(err as Error).message}` };
    }
  };

  const handleSyncBackendToLocal = async () => {
    if (backendMode !== 'spring') return { success: false, message: 'Backend is configured in Sandbox Mode.' };
    setConnectionStatus('connecting');
    try {
      const isOk = await testConnection(backendUrl);
      if (!isOk) {
        setConnectionStatus('error');
        return { success: false, message: 'Live Spring Boot server is unreachable.' };
      }

      const books = await fetchAllBooks(backendUrl);
      setSavedBooks(books);
      saveToLocalStorage(books);
      setConnectionStatus('connected');
      return { 
        success: true, 
        message: `Successfully downloaded and merged ${books.length} books from the Live Spring Boot server!` 
      };
    } catch (err) {
      setConnectionStatus('error');
      return { success: false, message: `Download failed: ${(err as Error).message}` };
    }
  };

  const handleTestConnectionManual = async (urlToTest: string) => {
    setConnectionStatus('connecting');
    const isOk = await testConnection(urlToTest);
    if (isOk) {
      setConnectionStatus('connected');
      return true;
    } else {
      setConnectionStatus('error');
      return false;
    }
  };

  // Select a book to view details
  const handleSelectBook = (id: string) => {
    setSelectedBookId(id);
  };

  // Back to main search list
  const handleBackToSearch = () => {
    setSelectedBookId(null);
  };

  // Add/Update a book in personal bookshelf
  const handleSaveBook = async (googleBook: GoogleBookItem, readingStatus: ReadingStatus, extra: Partial<SavedBook> = {}) => {
    const existingBook = savedBooks.find((b) => b.id === googleBook.id);
    let bookToSave: SavedBook;

    if (existingBook) {
      bookToSave = {
        ...existingBook,
        readingStatus,
        currentPage: extra.currentPage !== undefined ? extra.currentPage : existingBook.currentPage,
        rating: extra.rating !== undefined ? extra.rating : existingBook.rating,
        review: extra.review !== undefined ? extra.review : existingBook.review,
        dateUpdated: new Date().toISOString(),
      };
    } else {
      bookToSave = {
        id: googleBook.id,
        title: googleBook.volumeInfo.title,
        authors: googleBook.volumeInfo.authors || ['Unknown Author'],
        publisher: googleBook.volumeInfo.publisher || 'Unknown Publisher',
        publishedDate: googleBook.volumeInfo.publishedDate || 'Unknown Date',
        description: googleBook.volumeInfo.description || '',
        pageCount: googleBook.volumeInfo.pageCount || 0,
        categories: googleBook.volumeInfo.categories || ['Literature'],
        thumbnail: googleBook.volumeInfo.imageLinks?.thumbnail || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop',
        readingStatus,
        currentPage: extra.currentPage !== undefined ? extra.currentPage : 0,
        rating: extra.rating !== undefined ? extra.rating : 0,
        review: extra.review !== undefined ? extra.review : '',
        dateAdded: new Date().toISOString(),
        dateUpdated: new Date().toISOString(),
      };
    }

    if (backendMode === 'spring' && connectionStatus === 'connected') {
      try {
        const savedBook = await saveBookToBackend(backendUrl, bookToSave);
        const updatedBooks = existingBook
          ? savedBooks.map((b) => (b.id === googleBook.id ? savedBook : b))
          : [...savedBooks, savedBook];
        saveToLocalStorage(updatedBooks);
      } catch (err) {
        console.error("Failed to save to Spring Boot backend, saving locally:", err);
        const updatedBooks = existingBook
          ? savedBooks.map((b) => (b.id === googleBook.id ? bookToSave : b))
          : [...savedBooks, bookToSave];
        saveToLocalStorage(updatedBooks);
      }
    } else {
      const updatedBooks = existingBook
        ? savedBooks.map((b) => (b.id === googleBook.id ? bookToSave : b))
        : [...savedBooks, bookToSave];
      saveToLocalStorage(updatedBooks);
    }
  };

  // Remove a book from bookshelf
  const handleRemoveBook = async (id: string) => {
    const bookToRemove = savedBooks.find((b) => b.id === id);
    const updatedBooks = savedBooks.filter((b) => b.id !== id);

    if (backendMode === 'spring' && connectionStatus === 'connected' && bookToRemove?.dbId !== undefined) {
      try {
        await deleteBook(backendUrl, bookToRemove.dbId);
        saveToLocalStorage(updatedBooks);
      } catch (err) {
        console.error("Failed to delete from Spring Boot backend, removing locally:", err);
        saveToLocalStorage(updatedBooks);
      }
    } else {
      saveToLocalStorage(updatedBooks);
    }

    // If the currently viewed book details is removed, transition back
    if (selectedBookId === id) {
      setSelectedBookId(null);
    }
  };

  // Quick state toggling from bookshelf list
  const handleUpdateStatus = async (id: string, readingStatus: ReadingStatus) => {
    const bookToUpdate = savedBooks.find((b) => b.id === id);
    if (!bookToUpdate) return;

    const updatedBookLocally = {
      ...bookToUpdate,
      readingStatus,
      dateUpdated: new Date().toISOString(),
    };

    if (backendMode === 'spring' && connectionStatus === 'connected' && bookToUpdate.dbId !== undefined) {
      try {
        const updated = await updateBookProgress(
          backendUrl,
          bookToUpdate.dbId,
          bookToUpdate.currentPage,
          bookToUpdate.review,
          bookToUpdate.rating,
          readingStatus
        );
        const updatedBooks = savedBooks.map((b) => (b.id === id ? updated : b));
        saveToLocalStorage(updatedBooks);
      } catch (err) {
        console.error("Failed to update status on Spring Boot backend:", err);
        const updatedBooks = savedBooks.map((b) => (b.id === id ? updatedBookLocally : b));
        saveToLocalStorage(updatedBooks);
      }
    } else {
      const updatedBooks = savedBooks.map((b) => (b.id === id ? updatedBookLocally : b));
      saveToLocalStorage(updatedBooks);
    }
  };

  // Quick adding matching from AI Recommendation suggestions
  const handleQuickAddBook = (title: string, author: string, category: string) => {
    const tempBook: GoogleBookItem = {
      id: `ai_${Math.random().toString(36).substring(2, 11)}`,
      volumeInfo: {
        title,
        authors: [author],
        categories: [category],
        pageCount: 300,
        description: 'Suggested by Bookverse AI recommendation engine.'
      }
    };
    handleSaveBook(tempBook, 'WISHLIST');
  };

  // Direct page switching logic
  const renderTabContent = () => {
    if (selectedBookId) {
      return (
        <BookDetails
          bookId={selectedBookId}
          onBack={handleBackToSearch}
          savedBooks={savedBooks}
          onSaveBook={handleSaveBook}
          onRemoveBook={handleRemoveBook}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <Home
            savedBooks={savedBooks}
            setActiveTab={setActiveTab}
            onSelectBook={handleSelectBook}
          />
        );
      case 'search':
        return (
          <SearchBooks
            onSelectBook={handleSelectBook}
            savedBooks={savedBooks}
            onSaveBook={handleSaveBook}
            onRemoveBook={handleRemoveBook}
          />
        );
      case 'library':
        return (
          <MyLibrary
            savedBooks={savedBooks}
            onSelectBook={handleSelectBook}
            onRemoveBook={handleRemoveBook}
            onUpdateStatus={handleUpdateStatus}
            setActiveTab={setActiveTab}
          />
        );
      case 'wishlist':
        return (
          <Wishlist
            savedBooks={savedBooks}
            onSelectBook={handleSelectBook}
            onRemoveBook={handleRemoveBook}
            onUpdateStatus={handleUpdateStatus}
            setActiveTab={setActiveTab}
          />
        );
      case 'recommendations':
        return (
          <Recommendations
            savedBooks={savedBooks}
            onSelectBook={handleSelectBook}
            onQuickAddBook={handleQuickAddBook}
          />
        );
      case 'focus':
        return (
          <AmbientFocus
            savedBooks={savedBooks}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case 'products':
        return (
          <Products />
        );
      case 'profile':
        return (
          <Profile
            savedBooks={savedBooks}
            setActiveTab={setActiveTab}
            isLoggedIn={isLoggedIn}
            profile={profile}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            onClearLibrary={handleClearLibrary}
            onResetLibrary={handleResetLibrary}
            onImportLibrary={handleImportLibrary}
            backendMode={backendMode}
            setBackendMode={setBackendMode}
            backendUrl={backendUrl}
            setBackendUrl={setBackendUrl}
            connectionStatus={connectionStatus}
            onSyncLocalToBackend={handleSyncLocalToBackend}
            onSyncBackendToLocal={handleSyncBackendToLocal}
            onTestConnection={handleTestConnectionManual}
          />
        );
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'javahub':
        return <JavaHub />;
      default:
        return (
          <Home
            savedBooks={savedBooks}
            setActiveTab={setActiveTab}
            onSelectBook={handleSelectBook}
          />
        );
    }
  };

  const libraryCount = savedBooks.filter(b => b.readingStatus !== 'WISHLIST').length;
  const wishlistCount = savedBooks.filter(b => b.readingStatus === 'WISHLIST').length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans antialiased text-gray-800 dark:text-slate-100 transition-colors duration-300 pb-16 lg:pb-0">
      {/* Navigation */}
      <Navigation 
        activeTab={selectedBookId ? '' : activeTab} 
        setActiveTab={(tab) => {
          setSelectedBookId(null);
          setActiveTab(tab);
        }} 
        userBooksCount={libraryCount}
        userWishlistCount={wishlistCount}
        isDark={isDark}
        onToggleDark={toggleDarkMode}
        profile={profile}
        isLoggedIn={isLoggedIn}
        backendMode={backendMode}
        connectionStatus={connectionStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* Humble, aesthetic footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 py-6 mt-12 text-center text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Bookverse. Built as a high-fidelity REST Architecture Prototype.</p>
        </div>
      </footer>
    </div>
  );
}
