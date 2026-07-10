import React, { useState } from 'react';
import { 
  BookOpen, Search, Bookmark, Sparkles, User, Terminal, 
  Heart, Info, Mail, Home as HomeIcon, Sun, Moon, Menu, X, ShoppingBag, Clock
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userBooksCount: number;
  userWishlistCount: number;
  isDark: boolean;
  onToggleDark: () => void;
  profile: UserProfile;
  isLoggedIn: boolean;
  backendMode: 'local' | 'spring';
  connectionStatus: 'connected' | 'error' | 'connecting' | 'idle';
}

export default function Navigation({ 
  activeTab, 
  setActiveTab, 
  userBooksCount, 
  userWishlistCount,
  isDark,
  onToggleDark,
  profile,
  isLoggedIn,
  backendMode,
  connectionStatus
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'search', label: 'Search Books', icon: Search },
    { id: 'library', label: 'My Library', icon: Bookmark, badge: userBooksCount > 0 ? userBooksCount : undefined },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: userWishlistCount > 0 ? userWishlistCount : undefined },
    { id: 'recommendations', label: 'AI Recommendations', icon: Sparkles },
    { id: 'focus', label: 'Ambient Focus', icon: Clock },
    { id: 'products', label: 'Bookish Shop', icon: ShoppingBag },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => handleTabClick('home')} 
              className="flex items-center space-x-2 focus:outline-hidden group"
            >
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Bookverse
              </span>
            </button>
          </div>

          {/* Desktop Tab Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative flex items-center px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-slate-800/40'
                  }`}
                  id={`nav-tab-${item.id}`}
                >
                  <Icon className={`mr-1.5 h-3.5 w-3.5 ${
                    isActive 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600'
                  }`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-3xs font-extrabold bg-emerald-600 dark:bg-emerald-500 text-white rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Header Operations (Dark Mode & Hamburger) */}
          <div className="flex items-center space-x-2">
            
            {/* Dark Mode toggle button */}
            <button
              onClick={onToggleDark}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="Toggle visual theme mode"
              id="dark-mode-toggle"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600" />
              )}
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Slide-Out or Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${
                    isActive 
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-400'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-3xs font-extrabold bg-emerald-600 dark:bg-emerald-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Persistent Quick Mobile Bottom Bar for most popular sections */}
      <div className="lg:hidden border-t border-gray-100 dark:border-slate-800/60 bg-white/95 dark:bg-slate-900/95 fixed bottom-0 left-0 right-0 py-1.5 px-4 flex justify-around items-center z-50 shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: HomeIcon },
          { id: 'search', label: 'Search', icon: Search },
          { id: 'library', label: 'Library', icon: Bookmark },
          { id: 'wishlist', label: 'Wishlist', icon: Heart },
          { id: 'recommendations', label: 'AI', icon: Sparkles },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
              }`}
            >
              <Icon className="h-4.5 w-4.5 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
