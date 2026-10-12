import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, ArrowRight, Flame } from 'lucide-react';
import { TRENDING_TOPICS, TrendingTopicItem } from '../data/trendingTopics';

interface TrendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (item: TrendingTopicItem) => void;
}

export const TrendingModal: React.FC<TrendingModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    'all',
    'Tech & AI',
    'Finance & Money',
    'Science & Nature',
    'Productivity & Mind',
    'Curious Facts',
  ];

  const filtered = TRENDING_TOPICS.filter(
    (t) => activeCategory === 'all' || t.category === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trending Topic Sparks</h2>
              <p className="text-xs text-slate-400">
                Curated high-velocity topics from YouTube Shorts, Google Trends, and TikTok.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Sparks' : cat}
            </button>
          ))}
        </div>

        {/* List of Trending Topics */}
        <div className="p-5 overflow-y-auto space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {item.trendVelocity}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{item.category}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{item.recommendedDuration}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{item.topic}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  <strong>Hook:</strong> "{item.estimatedHook}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectTopic(item);
                  onClose();
                }}
                className="self-end sm:self-center px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Use Topic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
