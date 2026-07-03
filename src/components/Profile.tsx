import React, { useState, useRef } from 'react';
import { 
  User, Award, BookOpen, Clock, CheckCircle, Flame, Star, Trophy, Target, 
  ArrowRight, Shield, Settings, Database, Download, Upload, Trash2, 
  RotateCcw, AlertTriangle, Sparkles, Mail, Lock, Eye, EyeOff, Loader2, 
  Check, RefreshCw, Smartphone, Bell, Palette, Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { SavedBook, UserProfile } from '../types';

interface ProfileProps {
  savedBooks: SavedBook[];
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
  profile: UserProfile & {
    email?: string;
    accentColor?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan';
    notifyOnStreak?: boolean;
    notifyOnGoal?: boolean;
  };
  onLogin: (name: string, email: string, avatar: string, goal: number) => void;
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<UserProfile & {
    email?: string;
    accentColor?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan';
    notifyOnStreak?: boolean;
    notifyOnGoal?: boolean;
  }>) => void;
  onClearLibrary: () => void;
  onResetLibrary: () => void;
  onImportLibrary: (importedBooks: SavedBook[]) => void;
}

const PREDEFINED_AVATARS = [
  { name: 'Smart Librarian', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop' },
  { name: 'Cozy Reader', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' },
  { name: 'Tech Developer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
  { name: 'Sci-Fi Explorer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop' },
  { name: 'Classic Scholar', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop' },
  { name: 'Fantasy Adventurer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop' }
];

const ACCENTS = {
  emerald: {
    bg: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20 dark:border-emerald-500/10',
    lightBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    lightText: 'text-emerald-800 dark:text-emerald-400',
    ring: 'focus:ring-emerald-500 focus:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400',
    accentFill: '#10b981',
    accentFillLight: '#a7f3d0'
  },
  indigo: {
    bg: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/20 dark:border-indigo-500/10',
    lightBg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    lightText: 'text-indigo-800 dark:text-indigo-400',
    ring: 'focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400',
    accentFill: '#6366f1',
    accentFillLight: '#c7d2fe'
  },
  amber: {
    bg: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20 dark:border-amber-500/10',
    lightBg: 'bg-amber-50/50 dark:bg-amber-950/20',
    lightText: 'text-amber-800 dark:text-amber-400',
    ring: 'focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-400 dark:focus:border-amber-400',
    accentFill: '#f59e0b',
    accentFillLight: '#fde68a'
  },
  rose: {
    bg: 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20 dark:border-rose-500/10',
    lightBg: 'bg-rose-50/50 dark:bg-rose-950/20',
    lightText: 'text-rose-800 dark:text-rose-400',
    ring: 'focus:ring-rose-500 focus:border-rose-500 dark:focus:ring-rose-400 dark:focus:border-rose-400',
    accentFill: '#f43f5e',
    accentFillLight: '#fecdd3'
  },
  cyan: {
    bg: 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/20 dark:border-cyan-500/10',
    lightBg: 'bg-cyan-50/50 dark:bg-cyan-950/20',
    lightText: 'text-cyan-800 dark:text-cyan-400',
    ring: 'focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400',
    accentFill: '#06b6d4',
    accentFillLight: '#a5f3fc'
  },
};

export default function Profile({
  savedBooks,
  setActiveTab,
  isLoggedIn,
  profile,
  onLogin,
  onLogout,
  onUpdateProfile,
  onClearLibrary,
  onResetLibrary,
  onImportLibrary
}: ProfileProps) {
  // Navigation inside the Profile component (Dashboard vs Settings)
  const [profileSubTab, setProfileSubTab] = useState<'analytics' | 'settings'>('analytics');

  // Login/Register States
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(PREDEFINED_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [registerGoal, setRegisterGoal] = useState(12);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  // OAuth Simulated Handshake
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [oauthStep, setOauthStep] = useState('');

  // Database operations feedback
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields edits in Settings Sub-Tab
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email || 'shrivarshinee.k.2024.csbs@rajalakshmi.edu.in');
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const [editGoal, setEditGoal] = useState(profile.yearlyGoal);
  const [showCustomAvatarEdit, setShowCustomAvatarEdit] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Dynamic colors based on chosen accent
  const currentAccent = profile.accentColor || 'emerald';
  const colorsStyle = ACCENTS[currentAccent] || ACCENTS.emerald;

  // Yearly goal inline edits in Stats Tab
  const [isEditingGoalInline, setIsEditingGoalInline] = useState(false);
  const [inlineGoalInput, setInlineGoalInput] = useState(String(profile.yearlyGoal));

  // Math calculations
  const totalBooks = savedBooks.length;
  const completedBooks = savedBooks.filter((b) => b.readingStatus === 'COMPLETED');
  const completedCount = completedBooks.length;
  const readingCount = savedBooks.filter((b) => b.readingStatus === 'READING').length;
  const wishlistCount = savedBooks.filter((b) => b.readingStatus === 'WISHLIST').length;

  const totalPagesRead = completedBooks.reduce((sum, b) => sum + (b.pageCount || 0), 0) + 
                         savedBooks.filter((b) => b.readingStatus === 'READING').reduce((sum, b) => sum + (b.currentPage || 0), 0);

  const ratedBooks = savedBooks.filter((b) => b.rating > 0);
  const avgRating = ratedBooks.length > 0 
    ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)
    : 'N/A';

  const goalPercentage = Math.min(Math.round((completedCount / profile.yearlyGoal) * 100), 100);

  // Group books by category for Recharts
  const genreDataMap: { [key: string]: number } = {};
  savedBooks.forEach((book) => {
    const genre = book.categories?.[0] || 'Literature';
    genreDataMap[genre] = (genreDataMap[genre] || 0) + 1;
  });

  const chartData = Object.entries(genreDataMap).map(([name, value]) => ({
    name: name.length > 15 ? name.substring(0, 12) + '...' : name,
    value,
  })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5

  const chartColors = [
    colorsStyle.accentFill,
    '#6366f1', // Indigo fallback
    '#06b6d4', // Cyan fallback
    '#f59e0b', // Amber fallback
    '#f43f5e', // Rose fallback
  ];

  // Password strength check
  const getPasswordStrength = (password: string) => {
    if (!password) return '';
    if (password.length < 6) return 'Weak (min 6 characters)';
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (hasNumbers && hasSpecial) return 'Strong';
    return 'Medium';
  };

  const getStrengthColor = (strength: string) => {
    if (strength.startsWith('Weak')) return 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-950/40';
    if (strength === 'Strong') return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-950/40';
    return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-950/40';
  };

  // Simulated Email & Password Login
  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      if (!loginEmail.includes('@') || !loginEmail.includes('.')) {
        setLoginError('Please enter a valid email address.');
        return;
      }
      if (loginPassword.length < 6) {
        setLoginError('Password must be at least 6 characters.');
        return;
      }
      setLoginError('');
      // Authenticate with details
      const userDisplayName = loginEmail.split('@')[0]
        .split('.')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
      onLogin(userDisplayName, loginEmail, PREDEFINED_AVATARS[1].url, 12);
    } else {
      if (!registerName.trim()) {
        setRegisterError('Name is required.');
        return;
      }
      if (!registerEmail.includes('@')) {
        setRegisterError('Please enter a valid email address.');
        return;
      }
      if (registerPassword.length < 6) {
        setRegisterError('Password must be at least 6 characters.');
        return;
      }
      setRegisterError('');
      const avatarToUse = customAvatarUrl.trim() || selectedAvatarUrl;
      onLogin(registerName, registerEmail, avatarToUse, registerGoal);
    }
  };

  // Google/Github OAuth Handshake simulation
  const handleOAuthLogin = (provider: 'Google Books' | 'GitHub Gist') => {
    setIsOAuthLoading(true);
    setOauthStep('Initializing secure connection to ' + provider + '...');
    
    setTimeout(() => {
      setOauthStep('Exchanging OAuth access token handshake...');
      setTimeout(() => {
        setOauthStep('Retrieving book metadata and profile records...');
        setTimeout(() => {
          setOauthStep('Handshake completed! Synchronizing bookshelf...');
          setTimeout(() => {
            setIsOAuthLoading(false);
            setOauthStep('');
            // Log in with customized OAuth details
            const defaultName = provider === 'Google Books' ? 'K. Shrivarshinee' : 'GitHub Explorer';
            const defaultEmail = provider === 'Google Books' 
              ? 'shrivarshinee.k.2024.csbs@rajalakshmi.edu.in' 
              : 'github.developer@bookverse.io';
            const defaultAvatar = PREDEFINED_AVATARS[0].url;
            onLogin(defaultName, defaultEmail, defaultAvatar, 15);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  // Demo direct login bypass
  const handleDemoLogin = () => {
    onLogin('Demo Administrator', 'admin@bookverse.com', PREDEFINED_AVATARS[2].url, 24);
  };

  // Settings Save handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: editName,
      email: editEmail,
      avatar: editAvatar,
      yearlyGoal: editGoal,
    });
    setProfileSuccessMsg('Profile changes successfully updated in storage!');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  // Inline goal change helper
  const handleInlineGoalSave = (e: React.FormEvent) => {
    e.preventDefault();
    const g = Number(inlineGoalInput);
    if (g > 0) {
      onUpdateProfile({ yearlyGoal: g });
      setEditGoal(g);
      setIsEditingGoalInline(false);
    }
  };

  // Real Database Export to JSON
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(savedBooks, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `bookverse-library-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error('Failed to export library', e);
    }
  };

  // Real Database Import from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        if (!Array.isArray(parsed)) {
          throw new Error('Backup must be an array of book items');
        }
        
        // Basic validation check
        const isValid = parsed.every(item => item && typeof item === 'object' && 'id' in item && 'title' in item);
        if (!isValid) {
          throw new Error('Invalid schema. Items must contain "id" and "title" attributes.');
        }

        onImportLibrary(parsed);
        setImportStatus({
          type: 'success',
          text: `Successfully imported ${parsed.length} books and updated your bookshelf!`
        });
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          text: `Import failed: ${err.message || 'Malformed JSON file.'}`
        });
        setTimeout(() => setImportStatus(null), 5000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input
    }
  };

  // Logged-Out UI
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-6 sm:my-12 animate-fade-in" id="auth-container">
        {/* Mock OAuth loading modal */}
        {isOAuthLoading && (
          <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 sm:p-8 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-xl">
              <Loader2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <span className="text-3xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">AUTHENTICATING SECURELY</span>
                <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{oauthStep}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-2 mb-6">
          <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-emerald-500/10">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Bookverse Central Auth</h1>
          <p className="text-2xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
            Sign in to synchronize your reading goals, view high-fidelity library metrics, and unlock custom theme colors.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-6">
          {/* Header tabs */}
          <div className="flex border-b border-gray-100 dark:border-slate-800 p-0.5 bg-gray-50 dark:bg-slate-950/40 rounded-xl">
            <button
              onClick={() => { setAuthMode('login'); setLoginError(''); }}
              className={`flex-1 py-2 text-3xs font-extrabold uppercase tracking-widest rounded-lg transition-all ${
                authMode === 'login' 
                  ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-3xs' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setRegisterError(''); }}
              className={`flex-1 py-2 text-3xs font-extrabold uppercase tracking-widest rounded-lg transition-all ${
                authMode === 'register' 
                  ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-3xs' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSimulatedSubmit} className="space-y-4">
            {authMode === 'login' ? (
              // Login Fields
              <div className="space-y-3.5">
                {loginError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 rounded-xl text-3xs font-bold leading-tight flex items-start space-x-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-4xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600" />
                    <input
                      type="text"
                      placeholder="e.g. shrivarshinee@bookverse.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="block w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-4xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Secret Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="block w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Registration Fields
              <div className="space-y-3.5">
                {registerError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30 rounded-xl text-3xs font-bold leading-tight flex items-start space-x-2">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{registerError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-4xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. K. Shrivarshinee"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-4xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. shrivarshinee@rajalakshmi.edu.in"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-4xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Password</label>
                    {registerPassword && (
                      <span className={`text-[10px] font-bold ${getPasswordStrength(registerPassword) === 'Strong' ? 'text-emerald-500' : getPasswordStrength(registerPassword).startsWith('Weak') ? 'text-red-500' : 'text-amber-500'}`}>
                        {getPasswordStrength(registerPassword)}
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Avatar Grid Selection */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-4xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Choose Avatar Role</label>
                  <div className="grid grid-cols-6 gap-2">
                    {PREDEFINED_AVATARS.map((av) => (
                      <button
                        key={av.name}
                        type="button"
                        onClick={() => { setSelectedAvatarUrl(av.url); setCustomAvatarUrl(''); }}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                          selectedAvatarUrl === av.url && !customAvatarUrl
                            ? 'border-emerald-500 ring-2 ring-emerald-500/10' 
                            : 'border-transparent hover:border-gray-200'
                        }`}
                        title={av.name}
                      >
                        <img src={av.url} alt={av.name} className="h-full w-full object-cover" />
                        {selectedAvatarUrl === av.url && !customAvatarUrl && (
                          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white drop-shadow-md stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom URL image toggle */}
                  <div className="pt-1.5">
                    <input
                      type="text"
                      placeholder="Or paste custom image Unsplash URL..."
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="block w-full px-2.5 py-1.5 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-lg text-3xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Yearly Goal Selector */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-4xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    <span>Yearly Goal Milestone</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{registerGoal} Books</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={registerGoal}
                    onChange={(e) => setRegisterGoal(Number(e.target.value))}
                    className="w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer mt-6"
            >
              <span>{authMode === 'login' ? 'Confirm & Sign In' : 'Register & Log In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Social OAuth Dividers */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-100 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-4xs font-bold text-gray-400 uppercase tracking-widest">or connect with</span>
            <div className="flex-grow border-t border-gray-100 dark:border-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthLogin('Google Books')}
              className="px-4 py-2 border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-950 rounded-xl text-2xs font-extrabold text-gray-600 dark:text-slate-300 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Google OAuth</span>
            </button>
            <button
              onClick={() => handleOAuthLogin('GitHub Gist')}
              className="px-4 py-2 border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-950 rounded-xl text-2xs font-extrabold text-gray-600 dark:text-slate-300 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-indigo-500" />
              <span>GitHub Auth</span>
            </button>
          </div>

          {/* Direct Demo Bypasser */}
          <div className="pt-2 text-center">
            <button
              onClick={handleDemoLogin}
              className="text-4xs text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-extrabold uppercase tracking-widest cursor-pointer transition-colors"
            >
              [ Bypass: Login with Admin Demo Profile ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged-In Interface
  return (
    <div className="space-y-8 animate-fade-in" id="profile-section">
      
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <img
            src={profile.avatar}
            alt={profile.name}
            className={`h-24 w-24 rounded-3xl object-cover shadow-md ring-4 ${colorsStyle.border}`}
          />
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{profile.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Avid Reader & Bookverse Explorer</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Member since {profile.joinDate} &bull; {profile.email || 'shrivarshinee@bookverse.com'}</p>
          </div>
        </div>

        {/* Action Controls Side Header */}
        <div className="flex items-center space-x-3 bg-gray-50/50 dark:bg-slate-950/20 border border-gray-100 dark:border-slate-800 px-4 py-3 rounded-2xl">
          <div className={`p-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 ${colorsStyle.text} rounded-xl shadow-3xs`}>
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-4xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Daily streak</span>
            <span className="font-extrabold text-gray-900 dark:text-slate-200 text-sm">5 Days Reading</span>
          </div>
        </div>
      </div>

      {/* Sub tabs navigation: Analytics vs Advanced Settings */}
      <div className="flex border-b border-gray-100 dark:border-slate-800/80 p-1 bg-white dark:bg-slate-900 rounded-2xl">
        <button
          onClick={() => setProfileSubTab('analytics')}
          className={`flex-1 py-3 text-2xs font-extrabold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            profileSubTab === 'analytics'
              ? `${colorsStyle.lightBg} ${colorsStyle.text} shadow-3xs`
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>My Library Analytics</span>
        </button>
        <button
          onClick={() => setProfileSubTab('settings')}
          className={`flex-1 py-3 text-2xs font-extrabold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            profileSubTab === 'settings'
              ? `${colorsStyle.lightBg} ${colorsStyle.text} shadow-3xs`
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
          }`}
          id="settings-tab-btn"
        >
          <Settings className="h-4 w-4" />
          <span>System Preferences & Settings</span>
        </button>
      </div>

      {profileSubTab === 'analytics' ? (
        // Tab 1: Interactive Analytics and charts
        <div className="space-y-8 animate-fade-in">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Books on Shelf', value: totalBooks, sub: `${wishlistCount} in wishlist`, icon: BookOpen, color: `text-gray-900 bg-white dark:text-slate-100 dark:bg-slate-900` },
              { label: 'Completed Books', value: completedCount, sub: `${readingCount} in progress`, icon: CheckCircle, color: `${colorsStyle.text} ${colorsStyle.lightBg}` },
              { label: 'Total Pages Read', value: totalPagesRead, sub: 'Logged progress', icon: Clock, color: 'text-cyan-700 bg-cyan-50/20 dark:text-cyan-400 dark:bg-cyan-950/20' },
              { label: 'Avg Rating Given', value: avgRating, sub: ratedBooks.length > 0 ? `${ratedBooks.length} rated` : 'No reviews', icon: Star, color: 'text-amber-700 bg-amber-50/20 dark:text-amber-400 dark:bg-amber-950/20' },
            ].map((s, index) => {
              const Icon = s.icon;
              return (
                <div key={index} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-3 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">{s.label}</span>
                    <div className={`p-1.5 rounded-lg ${s.color.split(' ')[1]}`}>
                      <Icon className={`h-4 w-4 ${s.color.split(' ')[0]}`} />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</span>
                    <p className="text-3xs font-medium text-gray-400 dark:text-slate-500">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Goals widget */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-slate-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center">
                  <Trophy className="h-4.5 w-4.5 text-amber-500 mr-2" />
                  Annual Reading Goal
                </h3>
                {!isEditingGoalInline ? (
                  <button
                    onClick={() => {
                      setInlineGoalInput(String(profile.yearlyGoal));
                      setIsEditingGoalInline(true);
                    }}
                    className={`text-2xs ${colorsStyle.text} font-bold hover:underline cursor-pointer`}
                    id="edit-goal-btn"
                  >
                    Change goal
                  </button>
                ) : null}
              </div>

              {isEditingGoalInline ? (
                <form onSubmit={handleInlineGoalSave} className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={inlineGoalInput}
                    onChange={(e) => setInlineGoalInput(e.target.value)}
                    className="block w-20 py-1.5 px-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-850 rounded-lg text-sm text-center font-bold text-gray-900 dark:text-white"
                    id="goal-number-input"
                  />
                  <button
                    type="submit"
                    className={`px-3 py-1.5 ${colorsStyle.bg} text-white rounded-lg text-2xs font-bold shadow-3xs cursor-pointer`}
                    id="save-goal-btn"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingGoalInline(false);
                    }}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-lg text-2xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{completedCount}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">of {profile.yearlyGoal} books goal</span>
                  </div>

                  {/* High Quality Styled Progress Bar */}
                  <div className="space-y-2">
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-500 to-teal-500`}
                        style={{ width: `${goalPercentage}%`, backgroundColor: colorsStyle.accentFill }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-3xs font-extrabold text-gray-400 uppercase tracking-widest">
                      <span>{goalPercentage}% Complete</span>
                      {goalPercentage >= 100 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">GOAL MET! 🎉</span>
                      ) : (
                        <span>{profile.yearlyGoal - completedCount} Left</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Motivational Tip Card */}
              <div className="p-4 bg-gray-50/50 dark:bg-slate-950/45 rounded-2xl space-y-1.5 border border-gray-100 dark:border-slate-800/40">
                <span className="text-4xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest block">Librarian Insight</span>
                <p className="text-2xs text-gray-500 dark:text-gray-400 leading-normal">
                  {goalPercentage === 0 
                    ? 'Start tracking books you finish to build momentum towards your yearly goal! Consistency is key.'
                    : goalPercentage < 50 
                    ? 'You are making steady progress! Reading just 10 pages a day will help you lock in your targets.'
                    : goalPercentage < 100 
                    ? 'Incredible work! You are more than halfway to your target. Push through to secure your trophy.'
                    : 'Congratulations! You have achieved your annual milestone. Feel free to raise your goal for more adventure.'}
                </p>
              </div>
            </div>

            {/* Genre Distribution Charts */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs lg:col-span-2 space-y-6 transition-colors duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-slate-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center">
                  <Target className={`h-4.5 w-4.5 ${colorsStyle.text} mr-2`} />
                  Genre & Category Analytics
                </h3>
                <span className="text-3xs text-gray-400 uppercase font-black tracking-widest">Distribution Analysis</span>
              </div>

              {chartData.length === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-center space-y-2">
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">No books logged with genre labels yet.</p>
                  <button 
                    onClick={() => setActiveTab('search')}
                    className={`px-3 py-1.5 ${colorsStyle.bg} text-white rounded-lg text-3xs font-extrabold uppercase tracking-widest shadow-2xs cursor-pointer`}
                  >
                    Explore books
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2">
                  {/* Left Column: Bar Chart */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <span className="text-4xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block text-center md:text-left">
                      Comparative Quantity (Top Genres)
                    </span>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis 
                            dataKey="name" 
                            stroke="#9ca3af" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <YAxis 
                            stroke="#9ca3af" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false} 
                            allowDecimals={false}
                          />
                          <Tooltip 
                            contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '11px', color: '#1f2937' }} 
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right Column: Donut Pie Chart with custom detailed legends */}
                  <div className="space-y-3 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-800 pt-6 md:pt-0 md:pl-8">
                    <span className="text-4xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block text-center md:text-left">
                      Relative Proportional Share
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1">
                      {/* Pie Canvas Box */}
                      <div className="sm:col-span-7 h-44 w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={46}
                              outerRadius={62}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '11px', color: '#1f2937' }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Floating Central Stat Hole */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                            {totalBooks}
                          </span>
                          <span className="text-[8px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-widest mt-1">
                            Total
                          </span>
                        </div>
                      </div>

                      {/* High Quality Rich Legend lists */}
                      <div className="sm:col-span-5 space-y-2.5">
                        {chartData.map((item, index) => {
                          const percentage = ((item.value / totalBooks) * 100).toFixed(0);
                          return (
                            <div key={item.name} className="flex items-start space-x-2 text-3xs">
                              <span 
                                className="h-2 w-2 rounded-full mt-0.5 shrink-0" 
                                style={{ backgroundColor: chartColors[index % chartColors.length] }}
                              />
                              <div className="flex-1 min-w-0 leading-tight">
                                <span className="font-extrabold text-gray-700 dark:text-gray-300 block truncate" title={item.name}>
                                  {item.name}
                                </span>
                                <span className="text-gray-400 dark:text-gray-500 font-medium">
                                  {item.value} {item.value === 1 ? 'book' : 'books'} ({percentage}%)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Tab 2: Advanced Account & System Settings
        <div className="space-y-8 animate-fade-in" id="settings-section">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left side: Personal details form */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs lg:col-span-2 space-y-6 transition-colors duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-slate-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center">
                  <User className={`h-4.5 w-4.5 ${colorsStyle.text} mr-2`} />
                  Update Profile Details
                </h3>
                <span className="text-3xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Account Config</span>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl text-2xs font-extrabold leading-tight flex items-center space-x-2">
                  <Check className="h-4.5 w-4.5 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-4xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`block w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${colorsStyle.ring}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-4xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className={`block w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${colorsStyle.ring}`}
                    />
                  </div>
                </div>

                {/* Avatar Selection Inside Settings */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-4xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Customize Profile Avatar</label>
                    <button
                      type="button"
                      onClick={() => setShowCustomAvatarEdit(!showCustomAvatarEdit)}
                      className={`text-3xs ${colorsStyle.text} font-bold hover:underline`}
                    >
                      {showCustomAvatarEdit ? 'Pick Quick Roles' : 'Paste custom image URL'}
                    </button>
                  </div>

                  {showCustomAvatarEdit ? (
                    <input
                      type="text"
                      placeholder="Paste any high quality image Unsplash URL..."
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className={`block w-full px-3 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${colorsStyle.ring}`}
                    />
                  ) : (
                    <div className="grid grid-cols-6 gap-2">
                      {PREDEFINED_AVATARS.map((av) => (
                        <button
                          key={av.name}
                          type="button"
                          onClick={() => setEditAvatar(av.url)}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                            editAvatar === av.url
                              ? 'border-emerald-500 ring-2 ring-emerald-500/10' 
                              : 'border-transparent hover:border-gray-200'
                          }`}
                          title={av.name}
                        >
                          <img src={av.url} alt={av.name} className="h-full w-full object-cover" />
                          {editAvatar === av.url && (
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white drop-shadow-md stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                  {/* Goal Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-4xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      <span>Annual Reading Goal</span>
                      <span className={`${colorsStyle.text} font-black`}>{editGoal} Books</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={editGoal}
                      onChange={(e) => setEditGoal(Number(e.target.value))}
                      className="w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className={`px-6 py-2 ${colorsStyle.bg} text-white rounded-xl text-2xs font-bold shadow-xs cursor-pointer flex items-center space-x-2`}
                    >
                      <Check className="h-4 w-4" />
                      <span>Save Account Settings</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Accent Color customizer */}
              <div className="pt-6 border-t border-gray-100 dark:border-slate-800 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-2xs font-extrabold text-gray-800 dark:text-slate-200 flex items-center">
                    <Palette className="h-4 w-4 mr-2 text-indigo-500" />
                    Interactive Accent Themes
                  </h4>
                  <p className="text-3xs text-gray-400 dark:text-gray-500">
                    Switch the primary highlight and metric indicator color scheme used across the Bookverse interface.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {Object.entries(ACCENTS).map(([key, item]) => {
                    const isSelected = currentAccent === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          onUpdateProfile({ accentColor: key as any });
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-3xs font-black uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-950 shadow-3xs'
                            : 'bg-white border-gray-100 text-gray-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 hover:bg-gray-50'
                        }`}
                      >
                        <span 
                          className="h-2.5 w-2.5 rounded-full block border border-white" 
                          style={{ backgroundColor: item.accentFill }} 
                        />
                        <span>{key}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right side: Database, Export, and Session Control Panel */}
            <div className="space-y-6">
              {/* Database and shelf operations */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5 transition-colors duration-300">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-50 dark:border-slate-800">
                  <Database className="h-4.5 w-4.5 text-amber-500" />
                  <span className="text-2xs font-extrabold text-gray-900 dark:text-slate-200 uppercase tracking-widest">Local Database Engine</span>
                </div>

                {importStatus && (
                  <div className={`p-3 border rounded-xl text-3xs font-bold leading-tight flex items-start space-x-2 ${
                    importStatus.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50' 
                      : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200/50'
                  }`}>
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{importStatus.text}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-3xs text-gray-400 dark:text-gray-500 leading-normal">
                    Import and export your entire saved bookshelf, reading statuses, page milestones, and book review ratings as persistent JSON objects.
                  </p>

                  <div className="space-y-2">
                    {/* Real Export Button */}
                    <button
                      onClick={handleExportData}
                      className="w-full py-2 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 hover:border-gray-200 text-gray-700 dark:text-slate-300 rounded-xl text-3xs font-extrabold uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Export Shelf JSON</span>
                    </button>

                    {/* Real Import Trigger */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportData}
                      accept=".json"
                      className="hidden"
                      id="json-file-uploader"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 hover:border-gray-200 text-gray-700 dark:text-slate-300 rounded-xl text-3xs font-extrabold uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Restore Backup JSON</span>
                    </button>
                  </div>
                </div>

                {/* Destructive and Reset operations */}
                <div className="pt-4 border-t border-gray-50 dark:border-slate-800 space-y-2">
                  
                  {/* Reset back to starters logic */}
                  {confirmReset ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl space-y-2.5 text-3xs">
                      <p className="font-extrabold text-amber-800 dark:text-amber-400 leading-tight">
                        Confirm reset library back to starter books? This will override your current bookshelf progress.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            onResetLibrary();
                            setConfirmReset(false);
                            setImportStatus({ type: 'success', text: 'Bookshelf successfully restored to original starter catalog!' });
                            setTimeout(() => setImportStatus(null), 5000);
                          }}
                          className="px-3 py-1 bg-amber-600 text-white font-extrabold rounded-lg cursor-pointer"
                        >
                          Yes, Reset
                        </button>
                        <button
                          onClick={() => setConfirmReset(false)}
                          className="px-3 py-1 bg-white text-gray-500 border border-gray-200 font-bold rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="w-full py-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl text-3xs font-extrabold uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Starter Books</span>
                    </button>
                  )}

                  {/* Wipe data logic */}
                  {confirmWipe ? (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl space-y-2.5 text-3xs">
                      <p className="font-extrabold text-red-800 dark:text-red-400 leading-tight">
                        ARE YOU ABSOLUTELY SURE? This will permanently wipe your entire local library list. This cannot be undone.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            onClearLibrary();
                            setConfirmWipe(false);
                            setImportStatus({ type: 'success', text: 'All books removed. Your catalog is now completely empty!' });
                            setTimeout(() => setImportStatus(null), 5000);
                          }}
                          className="px-3 py-1 bg-red-600 text-white font-extrabold rounded-lg cursor-pointer"
                        >
                          Confirm Wipe
                        </button>
                        <button
                          onClick={() => setConfirmWipe(false)}
                          className="px-3 py-1 bg-white text-gray-500 border border-gray-200 font-bold rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmWipe(true)}
                      className="w-full py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-3xs font-extrabold uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Wipe Shelf Clean</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Preferences: simulated toggles */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 transition-colors duration-300">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-50 dark:border-slate-800">
                  <Bell className="h-4.5 w-4.5 text-indigo-500" />
                  <span className="text-2xs font-extrabold text-gray-900 dark:text-slate-200 uppercase tracking-widest">Simulated Notifications</span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <span className="text-3xs font-extrabold text-gray-700 dark:text-slate-300 block">Streak Accomplishments</span>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">Notify me on daily milestones and reading habits.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateProfile({ notifyOnStreak: !profile.notifyOnStreak })}
                      className={`h-5 w-9 rounded-full transition-all relative ${
                        profile.notifyOnStreak ? colorsStyle.bg : 'bg-gray-200 dark:bg-slate-800'
                      }`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition-all shadow-xs ${
                        profile.notifyOnStreak ? 'left-4.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5 max-w-[80%]">
                      <span className="text-3xs font-extrabold text-gray-700 dark:text-slate-300 block">Goal Celebrations</span>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">Congratulate me when completing an annual book goal.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateProfile({ notifyOnGoal: !profile.notifyOnGoal })}
                      className={`h-5 w-9 rounded-full transition-all relative ${
                        profile.notifyOnGoal ? colorsStyle.bg : 'bg-gray-200 dark:bg-slate-800'
                      }`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition-all shadow-xs ${
                        profile.notifyOnGoal ? 'left-4.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Logout/Session Button */}
              <div className="text-center pt-2">
                <button
                  onClick={onLogout}
                  className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-3xs font-black uppercase tracking-widest rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center space-x-2 mx-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Logout Session</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
