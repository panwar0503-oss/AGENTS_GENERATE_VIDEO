import React from 'react';
import { Video, ShieldCheck, Calendar, Sparkles, FolderOpen, Plus } from 'lucide-react';

interface NavbarProps {
  onNewVideo: () => void;
  onOpenTrending: () => void;
  onOpenCalendar: () => void;
  onOpenCompliance: () => void;
  onOpenTemplates: () => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewVideo,
  onOpenTrending,
  onOpenCalendar,
  onOpenCompliance,
  onOpenTemplates,
  activeView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Video className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            TopicToVideo
          </span>
        </div>

        {/* Zone 2: 4-5 single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {}}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeView === 'editor' ? 'text-indigo-400' : ''
            }`}
          >
            Video Studio
          </button>
          <button
            onClick={onOpenTrending}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Trending Topics
          </button>
          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            Content Calendar
          </button>
          <button
            onClick={onOpenCompliance}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            Monetization Safe
          </button>
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-slate-400" />
            Saved Projects
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewVideo}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Video</span>
          </button>
        </div>
      </div>
    </header>
  );
};
