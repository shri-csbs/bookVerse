import React from 'react';
import { BookOpen, Layers, Cpu, ShieldCheck, HeartHandshake, Database } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in" id="about-section">
      
      {/* Editorial Title */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          About Bookverse
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto">
          An aesthetic ecosystem designed to bridge classical reading habits with cutting-edge semantic AI capabilities.
        </p>
      </div>

      {/* Grid: Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-6 rounded-2xl shadow-xs space-y-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl inline-block">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Personal Bookshelf Tracking</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Organize your physical or digital reading materials locally with absolute state controls. Log pages, set star ratings, write comprehensive summaries, and manage transitions between wanting to read, reading, and complete milestones.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-6 rounded-2xl shadow-xs space-y-3">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl inline-block">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Gemini & Hugging Face AI Discovery</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            By analyzing your saved books list, our integration proxy feeds your reading patterns through Gemini model endpoints to output personalized reading archetype reports and recommendation dossiers. 
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-6 rounded-2xl shadow-xs space-y-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl inline-block">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">High-Fidelity Google Books API</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Harnessing the breadth of Google's global library indexing catalog, users can query and locate details of millions of classical and contemporary volumes instantly, complete with publishing metadata, genres, and artwork.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-6 rounded-2xl shadow-xs space-y-3">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl inline-block">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Security & Offline-First Integrity</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            All reviews, notes, goal milestones, and custom parameters are cached instantly and securely inside your local browser storage. No personal analytics, telemetry trackers, or marketing payloads are recorded.
          </p>
        </div>
      </div>

      {/* Tech stack list */}
      <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 text-center space-y-4">
        <h3 className="font-extrabold text-sm text-gray-400 uppercase tracking-wider">Under the Hood: Technical Architecture</h3>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-mono font-semibold text-gray-600 dark:text-gray-300">
          <span className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">React 18 & TypeScript</span>
          <span className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">Tailwind CSS (v4)</span>
          <span className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">Vite Bundler</span>
          <span className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">Express Node Server</span>
          <span className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">Google Gemini API</span>
          <span className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">Hugging Face API</span>
          <span className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">HTML5 LocalStorage</span>
        </div>
      </div>

      {/* Philosophy banner */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <HeartHandshake className="h-7 w-7 text-emerald-600 mx-auto" />
        <h4 className="font-bold text-sm text-gray-700 dark:text-white">Active Discovery Philosophy</h4>
        <p className="text-xs text-gray-400 leading-relaxed">
          We believe reading should not be an algorithmically optimized hamster wheel. Bookverse aims to act as a silent, humble companion that inspires you to read deep and broad, organizing your reflections with absolute simplicity.
        </p>
      </div>

    </div>
  );
}
