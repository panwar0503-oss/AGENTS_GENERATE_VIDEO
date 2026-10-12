import React, { useState } from 'react';
import { Sparkles, Clock, Globe, Mic, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { VideoDuration, VideoTone, TargetPlatform, AspectRatio } from '../types/video';
import { TRENDING_TOPICS } from '../data/trendingTopics';

interface Step1TopicProps {
  topic: string;
  setTopic: (t: string) => void;
  duration: VideoDuration;
  setDuration: (d: VideoDuration) => void;
  platform: TargetPlatform;
  setPlatform: (p: TargetPlatform) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  tone: VideoTone;
  setTone: (t: VideoTone) => void;
  language: string;
  setLanguage: (l: string) => void;
  personalTouch: string;
  setPersonalTouch: (pt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  duplicateWarning: string | null;
}

const DURATIONS: { id: VideoDuration; label: string; desc: string }[] = [
  { id: '30s', label: '30 Seconds', desc: 'Punchy viral short / Reel' },
  { id: '60s', label: '60 Seconds', desc: 'Standard YouTube Short / TikTok' },
  { id: '3 min', label: '3 Minutes', desc: 'Snackable explainer deep dive' },
  { id: '5 min', label: '5 Minutes', desc: 'In-depth tutorial & breakdown' },
  { id: '10 min', label: '10 Minutes', desc: 'Long-form documentary / essay' },
];

const PLATFORMS: { id: TargetPlatform; defaultAspect: AspectRatio; ratioLabel: string }[] = [
  { id: 'YouTube Shorts', defaultAspect: '9:16', ratioLabel: '9:16 Vertical' },
  { id: 'TikTok', defaultAspect: '9:16', ratioLabel: '9:16 Vertical' },
  { id: 'Instagram Reels', defaultAspect: '9:16', ratioLabel: '9:16 Vertical' },
  { id: 'YouTube long-form', defaultAspect: '16:9', ratioLabel: '16:9 Landscape' },
  { id: 'Facebook', defaultAspect: '16:9', ratioLabel: '16:9 Landscape' },
];

const TONES: { id: VideoTone; label: string; desc: string }[] = [
  { id: 'educational', label: 'Educational', desc: 'Clear, insightful, factual explanations' },
  { id: 'motivational', label: 'Motivational', desc: 'High energy, inspiring, actionable' },
  { id: 'storytelling', label: 'Storytelling', desc: 'Narrative arc, suspense, emotional hook' },
  { id: 'news-style', label: 'News-Style', desc: 'Objective, authoritative, fast-paced' },
];

const LANGUAGES = [
  'English (US)',
  'English (UK)',
  'Spanish',
  'French',
  'German',
  'Hindi',
  'Japanese',
  'Portuguese',
  'Italian',
];

export const Step1Topic: React.FC<Step1TopicProps> = ({
  topic,
  setTopic,
  duration,
  setDuration,
  platform,
  setPlatform,
  aspectRatio,
  setAspectRatio,
  tone,
  setTone,
  language,
  setLanguage,
  personalTouch,
  setPersonalTouch,
  onGenerate,
  isGenerating,
  duplicateWarning,
}) => {
  const [showPersonalTouch, setShowPersonalTouch] = useState(false);

  const handlePlatformChange = (p: TargetPlatform) => {
    setPlatform(p);
    const target = PLATFORMS.find(item => item.id === p);
    if (target) {
      setAspectRatio(target.defaultAspect);
    }
  };

  const handleSelectTrending = (itemTopic: string, itemDuration: VideoDuration, itemPlatform: any) => {
    setTopic(itemTopic);
    setDuration(itemDuration);
    if (itemPlatform) handlePlatformChange(itemPlatform);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Introduction */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Generate Monetization-Safe Video
        </h1>
        <p className="text-sm text-slate-400">
          Transform any topic into a fully researched video with viral hook, licensed stock footage, AI voiceover, and word-by-word animated captions.
        </p>
      </div>

      {/* Duplicate warning notification if detected */}
      {duplicateWarning && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-200">
            <span className="font-semibold block text-amber-300">Originality & Monetization Advisory</span>
            <p>{duplicateWarning}</p>
          </div>
        </div>
      )}

      {/* 1. Topic Input */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-200">
          Video Topic or Idea
        </label>
        <div className="relative">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Why airplane windows are always oval, or The 2-minute dopamine rule to defeat procrastination..."
            rows={3}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Quick Trending Suggestions */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Trending Spark Ideas:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TOPICS.slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTrending(item.topic, item.recommendedDuration, item.platform)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors text-left"
              >
                {item.topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Platform & Aspect Ratio Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-200">
          Target Platform & Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {PLATFORMS.map((p) => {
            const isSelected = platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePlatformChange(p.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-white truncate">{p.id}</div>
                <div className="text-[11px] text-slate-400 mt-1">{p.ratioLabel}</div>
              </button>
            );
          })}
        </div>

        {/* Aspect Ratio Override Toggle */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs text-slate-400">Canvas Format:</span>
          <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                aspectRatio === '9:16'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              9:16 (Shorts / Reels)
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                aspectRatio === '16:9'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9 (YouTube Widescreen)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Duration Selector */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Desired Video Duration</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {DURATIONS.map((d) => {
            const isSelected = duration === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDuration(d.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-white tabular-nums">{d.label}</div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{d.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tone & Language Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Tone */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-200">
            Narrative Tone
          </label>
          <div className="space-y-2">
            {TONES.map((t) => {
              const isSelected = tone === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{t.label}</span>
                    <span className="text-[11px] text-slate-400">{t.desc}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Target Language</span>
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Monetization Protection Callout */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Monetization Safety Standards Built-In</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every video generates original factual synthesis, 100% royalty-free CC0 media licenses, advertiser-friendly safety checks, and cited sources to avoid YouTube/Meta mass-produced content strikes.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Personal Touch Accordion (Monetization Best Practice) */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-4 space-y-3">
        <button
          type="button"
          onClick={() => setShowPersonalTouch(!showPersonalTouch)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">
              Add Personal Touch & Creator Commentary (Recommended)
            </span>
          </div>
          <span className="text-xs text-indigo-400 font-medium">
            {showPersonalTouch ? 'Collapse' : '+ Expand'}
          </span>
        </button>

        {showPersonalTouch && (
          <div className="pt-2 space-y-2 text-xs">
            <p className="text-slate-400">
              Adding your personal viewpoint, intro hook, or reaction drastically elevates retention and establishes authentic creator ownership.
            </p>
            <textarea
              value={personalTouch}
              onChange={(e) => setPersonalTouch(e.target.value)}
              placeholder="e.g. Start by saying 'I tested this for 30 days and...', or add your unique hot take to the final segment."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Submit / Generate Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={!topic.trim() || isGenerating}
          onClick={onGenerate}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 transition-all shadow-md ${
            !topic.trim() || isGenerating
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 cursor-pointer shadow-indigo-600/25'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Researching & Generating Production Script...</span>
            </>
          ) : (
            <>
              <span>Generate Video Package</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
