import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Volume2, Play, Pause, RotateCcw, Sparkles, BookOpen, 
  Coffee, Droplets, Flame, Music, Moon, Headphones, ArrowRight, CheckCircle, Award
} from 'lucide-react';
import { SavedBook, ReadingStatus } from '../types';

interface AmbientFocusProps {
  savedBooks: SavedBook[];
  onUpdateStatus: (id: string, status: ReadingStatus, currentPage?: number) => void;
}

interface FocusSessionLog {
  id: string;
  bookTitle: string;
  durationMinutes: number;
  pagesRead: number;
  date: string;
}

export default function AmbientFocus({ savedBooks, onUpdateStatus }: AmbientFocusProps) {
  // Get active reading books
  const readingBooks = savedBooks.filter(b => b.readingStatus === 'READING');
  
  // State variables
  const [selectedBookId, setSelectedBookId] = useState<string>(readingBooks[0]?.id || '');
  const [timerDuration, setTimerDuration] = useState<number>(25); // In minutes
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // In seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [selectedSound, setSelectedSound] = useState<'none' | 'rain' | 'campfire' | 'drone' | 'brown'>('none');
  const [audioVolume, setAudioVolume] = useState<number>(0.5);
  
  // Tracking pages
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [pagesInput, setPagesInput] = useState<string>('10');
  const [focusLogs, setFocusLogs] = useState<FocusSessionLog[]>([]);

  // Web Audio Context refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{
    source?: AudioNode;
    gainNode?: GainNode;
    intervalId?: number;
    timerIntervalId?: number;
  }>({});

  // Load log history on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem('bookverse_focus_logs');
    if (savedLogs) {
      try {
        setFocusLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error('Error parsing focus logs:', e);
      }
    }
  }, []);

  // Update timer remaining when duration changes
  useEffect(() => {
    if (!isTimerRunning) {
      setTimeLeft(timerDuration * 60);
    }
  }, [timerDuration]);

  // Main Timer loop
  useEffect(() => {
    if (isTimerRunning) {
      soundNodesRef.current.timerIntervalId = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (soundNodesRef.current.timerIntervalId) {
        clearInterval(soundNodesRef.current.timerIntervalId);
      }
    }

    return () => {
      if (soundNodesRef.current.timerIntervalId) {
        clearInterval(soundNodesRef.current.timerIntervalId);
      }
    };
  }, [isTimerRunning]);

  // Sync sound volume when volume slider updates
  useEffect(() => {
    if (soundNodesRef.current.gainNode) {
      soundNodesRef.current.gainNode.gain.setValueAtTime(audioVolume, audioContextRef.current?.currentTime || 0);
    }
  }, [audioVolume]);

  // Manage Sound synthesis based on selected state
  useEffect(() => {
    stopAmbientSound();
    if (selectedSound !== 'none') {
      startAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [selectedSound]);

  // Stop ambient loops
  const stopAmbientSound = () => {
    if (soundNodesRef.current.source) {
      try {
        (soundNodesRef.current.source as any).stop?.();
        (soundNodesRef.current.source as any).disconnect?.();
      } catch (e) {}
      soundNodesRef.current.source = undefined;
    }
    if (soundNodesRef.current.gainNode) {
      try {
        soundNodesRef.current.gainNode.disconnect();
      } catch (e) {}
      soundNodesRef.current.gainNode = undefined;
    }
    if (soundNodesRef.current.intervalId) {
      window.clearInterval(soundNodesRef.current.intervalId);
      soundNodesRef.current.intervalId = undefined;
    }
  };

  // Start procedural Web Audio synthesis
  const startAmbientSound = () => {
    try {
      // Create audio context if not exists
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create primary Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(audioVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      soundNodesRef.current.gainNode = masterGain;

      // Buffer creators for noise
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Procedural synthesizers
      if (selectedSound === 'brown') {
        // Brown Noise (Deep ocean wind)
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // compensation volume
        }

        const brownSource = ctx.createBufferSource();
        brownSource.buffer = noiseBuffer;
        brownSource.loop = true;

        // Filter out extreme highs
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);

        brownSource.connect(filter);
        filter.connect(masterGain);
        brownSource.start();
        soundNodesRef.current.source = brownSource;

      } else if (selectedSound === 'drone') {
        // Space/Cosmic Deep Drone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const filterGain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        lfo.type = 'sine';

        // Set meditative sub-frequencies
        osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2
        osc2.frequency.setValueAtTime(110.5, ctx.currentTime); // detuned slightly

        lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // slow pulse
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, ctx.currentTime);

        // LFO modulating the filter
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(60, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);

        osc1.start();
        osc2.start();
        lfo.start();

        soundNodesRef.current.source = {
          stop: () => {
            osc1.stop();
            osc2.stop();
            lfo.stop();
          },
          disconnect: () => {
            osc1.disconnect();
            osc2.disconnect();
            lfo.disconnect();
            filter.disconnect();
            lfoGain.disconnect();
          }
        } as any;

      } else if (selectedSound === 'rain') {
        // Sound of Rain: Low-passed Pink Noise background + fast high droplets
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          b6 = white * 0.115926;
          output[i] *= 0.11; // compensation
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(1200, ctx.currentTime);

        rainSource.connect(rainFilter);
        rainFilter.connect(masterGain);
        rainSource.start();

        // Procedural individual water droplets dripping randomly
        const dropletInterval = window.setInterval(() => {
          if (Math.random() > 0.4) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1500 + Math.random() * 1000, ctx.currentTime);
            
            gain.gain.setValueAtTime(0.005 * audioVolume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.08);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
          }
        }, 120);

        soundNodesRef.current.source = rainSource;
        soundNodesRef.current.intervalId = dropletInterval;

      } else if (selectedSound === 'campfire') {
        // Cozy crackling campfire: Brown noise rumble + random sharp snaps
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 2.8;
        }

        const fireSource = ctx.createBufferSource();
        fireSource.buffer = noiseBuffer;
        fireSource.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(180, ctx.currentTime);

        fireSource.connect(lowpass);
        lowpass.connect(masterGain);
        fireSource.start();

        // High frequency snaps and crackles
        const crackleInterval = window.setInterval(() => {
          const chance = Math.random();
          if (chance > 0.6) {
            // High snap pop
            const filter = ctx.createBiquadFilter();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(2000 + Math.random() * 5000, ctx.currentTime);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(3000, ctx.currentTime);
            filter.Q.setValueAtTime(10, ctx.currentTime);

            gain.gain.setValueAtTime(0.02 * audioVolume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02 + Math.random() * 0.03);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.06);
          }
        }, 90);

        soundNodesRef.current.source = fireSource;
        soundNodesRef.current.intervalId = crackleInterval;
      }

    } catch (e) {
      console.error('Web Audio error:', e);
    }
  };

  // Play a beautiful synthesized completion bell
  const playBellSynth = () => {
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      const master = ctx.destination;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.5); // slide to E5
      
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime); // G5 (creating a harmony)

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.8);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(master);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.0);
      osc2.stop(ctx.currentTime + 2.0);
    } catch (e) {
      console.error('Error playing chime:', e);
    }
  };

  // Timer complete sequence
  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    setIsZenMode(false);
    setSelectedSound('none');
    playBellSynth();
    setShowLogModal(true);
  };

  const handleToggleTimer = () => {
    // If starting audio context, resume first
    if (!isTimerRunning && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerDuration * 60);
  };

  // Log focal reading details to local library
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pages = Number(pagesInput);
    
    // Find book
    const currentBook = readingBooks.find(b => b.id === selectedBookId);
    const bookTitle = currentBook ? currentBook.title : 'Unspecified Masterpiece';

    if (currentBook) {
      const targetPage = Math.min((currentBook.currentPage || 0) + pages, currentBook.pageCount || 9999);
      const isBookCompleted = targetPage >= (currentBook.pageCount || 9999);
      const targetStatus: ReadingStatus = isBookCompleted ? 'COMPLETED' : 'READING';
      
      // Update book status and page count in parent
      onUpdateStatus(currentBook.id, targetStatus, targetPage);
    }

    // Save history entry
    const newLog: FocusSessionLog = {
      id: `log_${Date.now()}`,
      bookTitle,
      durationMinutes: timerDuration,
      pagesRead: pages,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedLogs = [newLog, ...focusLogs];
    setFocusLogs(updatedLogs);
    localStorage.setItem('bookverse_focus_logs', JSON.stringify(updatedLogs));

    setShowLogModal(false);
    setPagesInput('10');
  };

  const clearLogHistory = () => {
    if (confirm('Clear focus sessions history?')) {
      setFocusLogs([]);
      localStorage.removeItem('bookverse_focus_logs');
    }
  };

  // Helper formatting for clocks
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Current reading book info
  const currentSelectedBook = readingBooks.find(b => b.id === selectedBookId);

  return (
    <div className="space-y-10 animate-fade-in" id="ambient-focus-tab">
      
      {/* 1. Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-3xs font-bold rounded-full tracking-wider uppercase border border-emerald-500/30">
            Cozy Ambient Sandbox
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ambient Reading <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Space</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            Settle down into deep focus. Choose your current book, configure high-fidelity procedural background waves, set a timer, and enter minimalist zen reading mode.
          </p>
        </div>
        
        {/* Abstract blurred blobs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/4 w-48 h-48 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Main Focus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Controls & Sound Deck (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Deck panel */}
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-6">
            
            {/* Session Settings Header */}
            <div className="border-b border-gray-50 dark:border-slate-700/50 pb-3 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-sm flex items-center">
                <Headphones className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                Session Architecture
              </h3>
              <span className="text-4xs px-2 py-0.5 font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full uppercase tracking-wider">
                Procedural Sound (Web Audio)
              </span>
            </div>

            {/* Select Book currently reading */}
            <div className="space-y-2">
              <label className="text-3xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest block">
                1. Select Reading Subject
              </label>
              
              {readingBooks.length === 0 ? (
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/15 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                  <p className="text-3xs text-amber-800 dark:text-amber-400 font-medium">
                    No active books tagged as "Reading". Go save books or change status to "Reading" first!
                  </p>
                </div>
              ) : (
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="block w-full text-xs font-semibold px-3 py-2.5 bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-emerald-500 text-gray-800 dark:text-white"
                  id="focus-book-selector"
                >
                  {readingBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.authors?.[0] || 'Unknown'}) - {b.pageCount - b.currentPage} pages left
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Select Duration */}
            <div className="space-y-2">
              <label className="text-3xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest block">
                2. Timer Duration ({timerDuration} Minutes)
              </label>
              
              <div className="flex gap-2 flex-wrap">
                {[15, 25, 45, 60, 90].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => {
                      setTimerDuration(dur);
                      if (!isTimerRunning) setTimeLeft(dur * 60);
                    }}
                    disabled={isTimerRunning}
                    className={`px-3 py-1.5 rounded-xl text-3xs font-bold transition-all cursor-pointer ${
                      timerDuration === dur
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 disabled:opacity-50'
                    }`}
                  >
                    {dur} min
                  </button>
                ))}
              </div>
            </div>

            {/* Select Sound Environment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-3xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest block">
                  3. Atmospheric White Noise
                </label>
                {selectedSound !== 'none' && (
                  <div className="flex items-center space-x-1 text-3xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <Volume2 className="h-3 w-3 animate-bounce" />
                    <span>Active Ambient Sound</span>
                  </div>
                )}
              </div>

              {/* Procedural Sound Choices */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'none', label: 'Pure Silence', icon: Music, desc: 'Quiet mind focus' },
                  { id: 'rain', label: 'Rainfall', icon: Droplets, desc: 'Dripping water & drops' },
                  { id: 'campfire', label: 'Cozy Fire', icon: Flame, desc: 'Fireside logs crackle' },
                  { id: 'drone', label: 'Deep Space', icon: Moon, desc: 'Hypnotic modular pulse' },
                  { id: 'brown', label: 'Brownian', icon: Coffee, desc: 'Rushing wind rumble' },
                ].map((s) => {
                  const Icon = s.icon;
                  const isSelected = selectedSound === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSound(s.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 shadow-3xs'
                          : 'border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                      }`}
                      title={s.desc}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-gray-400'}`} />
                      <span className="text-[10px] font-bold leading-none">{s.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Volume Slider */}
              {selectedSound !== 'none' && (
                <div className="bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 p-3 rounded-xl flex items-center space-x-3">
                  <Volume2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full cursor-pointer"
                  />
                  <span className="text-[10px] font-mono font-bold text-gray-500 w-8 text-right">
                    {Math.round(audioVolume * 100)}%
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Past Sessions History list */}
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-700/50 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-xs flex items-center">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mr-1.5" />
                Completed Focus Sessions ({focusLogs.length})
              </h3>
              {focusLogs.length > 0 && (
                <button
                  onClick={clearLogHistory}
                  className="text-4xs text-red-500 dark:text-red-400 font-extrabold uppercase hover:underline cursor-pointer"
                >
                  Clear history
                </button>
              )}
            </div>

            {focusLogs.length === 0 ? (
              <p className="text-3xs text-gray-400 dark:text-gray-500 italic py-4 text-center">
                Your focus journal is empty. Complete a timer to log your first session!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {focusLogs.map((log) => (
                  <div 
                    key={log.id}
                    className="flex justify-between items-center bg-gray-50 dark:bg-slate-900/40 p-2.5 rounded-xl text-3xs border border-gray-100 dark:border-slate-800"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-900 dark:text-white line-clamp-1">
                        {log.bookTitle}
                      </span>
                      <span className="text-gray-400 font-medium block">
                        Completed on {log.date}
                      </span>
                    </div>
                    <div className="text-right font-mono text-[10px] text-gray-500 flex items-center space-x-2">
                      <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold rounded-md">
                        {log.durationMinutes}m duration
                      </span>
                      <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold rounded-md">
                        +{log.pagesRead} pages
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Visualizing Timer (5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-8 shadow-xs flex flex-col items-center justify-center text-center space-y-6 h-full relative overflow-hidden">
            
            {/* Visual feedback rain/crackle background overlay when running */}
            {isTimerRunning && selectedSound === 'rain' && (
              <div className="absolute inset-0 pointer-events-none opacity-5 flex justify-around">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-0.5 h-full bg-indigo-500 animate-slide-down" style={{ animationDelay: `${i * 0.25}s`, animationDuration: '0.8s' }} />
                ))}
              </div>
            )}
            
            {isTimerRunning && selectedSound === 'campfire' && (
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-gradient-to-t from-orange-500 via-transparent to-transparent animate-pulse" />
            )}

            {/* Floating Zen switch */}
            <button
              onClick={() => setIsZenMode(true)}
              className="absolute top-4 right-4 text-3xs font-bold text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center cursor-pointer border border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900 rounded-lg px-2 py-1"
              title="Enter minimalist distraction-free view"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Zen Mode
            </button>

            {/* Pulse core timer */}
            <div className="space-y-4">
              <div className="relative flex items-center justify-center">
                {/* SVG circular progress ring */}
                <svg className="w-56 h-56 transform -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r="98"
                    className="stroke-gray-100 dark:stroke-slate-700"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="112"
                    cy="112"
                    r="98"
                    className="stroke-emerald-600 dark:stroke-emerald-500 transition-all duration-1000"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 98}
                    strokeDashoffset={(2 * Math.PI * 98) * (1 - timeLeft / (timerDuration * 60))}
                    fill="transparent"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Clock core text */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-gray-900 dark:text-white font-mono tracking-tight leading-none">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-4xs text-gray-400 font-extrabold uppercase tracking-widest mt-1">
                    {isTimerRunning ? 'focusing' : 'paused'}
                  </span>
                </div>
              </div>

              {/* Subject status lines */}
              <div className="space-y-1">
                <span className="text-4xs text-gray-400 font-bold uppercase tracking-wider block">Currently Tracking:</span>
                <span className="text-xs font-black text-gray-900 dark:text-white block line-clamp-1">
                  {currentSelectedBook ? currentSelectedBook.title : 'My Library Masterpiece'}
                </span>
                {currentSelectedBook && (
                  <span className="text-3xs text-emerald-600 dark:text-emerald-400 font-medium block">
                    Page {currentSelectedBook.currentPage} of {currentSelectedBook.pageCount}
                  </span>
                )}
              </div>
            </div>

            {/* Timer Control Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleResetTimer}
                className="p-3 bg-gray-50 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-750 text-gray-500 rounded-full transition-all cursor-pointer border border-gray-100 dark:border-slate-800"
                title="Reset session"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={handleToggleTimer}
                className={`px-8 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                id="focus-timer-toggle"
              >
                {isTimerRunning ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
                <span>{isTimerRunning ? 'Pause Study' : 'Start Focus'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 3. DISTRACTION-FREE FULL SCREEN ZEN VIEW PORT */}
      {isZenMode && (
        <div className="fixed inset-0 z-100 bg-slate-950 text-white flex flex-col justify-between items-center p-8 sm:p-16 transition-all duration-500 animate-fade-in">
          
          {/* Header */}
          <div className="w-full max-w-4xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Headphones className="h-5 w-5 text-emerald-400 animate-pulse" />
              <span className="text-3xs font-extrabold text-emerald-400 uppercase tracking-widest">
                Zen Reading Sanctum
              </span>
            </div>
            
            <button
              onClick={() => setIsZenMode(false)}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border border-white/10"
            >
              Exit Sanctuary
            </button>
          </div>

          {/* Central Sanctuary Clock & Pulsing Cover */}
          <div className="max-w-md w-full text-center space-y-12">
            
            {/* Book cover visual simulation */}
            <div className="relative mx-auto w-40 h-56 bg-gradient-to-br from-emerald-900 to-slate-950 rounded-2xl shadow-2xl border border-emerald-500/10 flex flex-col justify-between p-4 transform hover:scale-105 transition-transform duration-500 group">
              <span className="text-4xs font-black tracking-widest text-emerald-400 uppercase">Bookverse</span>
              <div className="space-y-1">
                <span className="text-xs font-black leading-tight text-white block line-clamp-3">
                  {currentSelectedBook ? currentSelectedBook.title : 'My Masterpiece'}
                </span>
                <span className="text-4xs text-emerald-300 block line-clamp-1">
                  {currentSelectedBook ? currentSelectedBook.authors?.[0] : 'Author'}
                </span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: currentSelectedBook ? `${(currentSelectedBook.currentPage / currentSelectedBook.pageCount) * 100}%` : '40%' }}
                />
              </div>
            </div>

            {/* Pulsing clock */}
            <div className="space-y-3">
              <div className="text-7xl font-black font-mono tracking-tighter text-white animate-pulse">
                {formatTime(timeLeft)}
              </div>
              <p className="text-3xs text-emerald-400 font-bold uppercase tracking-widest">
                {selectedSound === 'none' ? 'quiet mind focus' : `${selectedSound} white noise is playing`}
              </p>
            </div>

            {/* Zen Sound Controller */}
            <div className="flex gap-2 justify-center flex-wrap">
              {['none', 'rain', 'campfire', 'drone'].map((sId) => {
                const isS = selectedSound === sId;
                return (
                  <button
                    key={sId}
                    onClick={() => setSelectedSound(sId as any)}
                    className={`px-3 py-1 bg-white/5 border text-3xs font-semibold rounded-lg hover:bg-white/15 cursor-pointer ${
                      isS ? 'border-emerald-400 text-emerald-400' : 'border-white/5 text-gray-400'
                    }`}
                  >
                    {sId === 'none' ? 'Silence' : sId.charAt(0).toUpperCase() + sId.slice(1)}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Quick instructions */}
          <div className="text-4xs text-gray-500 uppercase tracking-widest text-center">
            distraction-free mode. take deep, slow breaths. open your book.
          </div>

        </div>
      )}

      {/* 4. POST-TIMER COMPLETION PAGES LOGGING MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-100 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-scale-up space-y-6">
            
            <div className="text-center space-y-3">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Magnificent Session Complete!</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Congratulations! You completed a focused reading stretch of <span className="font-extrabold text-emerald-600">{timerDuration} minutes</span>. Let's document your progress.
                </p>
              </div>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl space-y-3 border border-gray-100 dark:border-slate-800">
                <span className="text-4xs font-bold text-gray-400 uppercase tracking-widest block">Logged Subject:</span>
                <span className="text-xs font-black text-gray-800 dark:text-white block line-clamp-1">
                  {currentSelectedBook ? currentSelectedBook.title : 'My Masterpiece'}
                </span>

                <div className="pt-2">
                  <label className="text-3xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    How many pages did you cover?
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pagesInput}
                    onChange={(e) => setPagesInput(e.target.value)}
                    className="block w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-emerald-500"
                  />
                  {currentSelectedBook && (
                    <span className="text-4xs text-gray-400 block mt-1">
                      Currently at page {currentSelectedBook.currentPage} / {currentSelectedBook.pageCount}.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-xs font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer"
                >
                  Skip logging
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Log pages & progress
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
