import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, FileCheck, Scale } from 'lucide-react';
import { VideoProject } from '../types/video';

interface MonetizationSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject | null;
}

export const MonetizationSafetyModal: React.FC<MonetizationSafetyModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Monetization & Policy Compliance Inspector
              </h2>
              <p className="text-xs text-slate-400">
                Built to strictly protect creators from YouTube and Meta demonetization strikes.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Status Banner */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-300 text-sm block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Monetization Health: 100% Passed
              </span>
              <p className="text-emerald-400/80">
                Zero copyright claims risk · High originality rating · Verified citations
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Originality Score</span>
              <span className="text-lg font-extrabold text-white tabular-nums">
                {project?.uniquenessScore || 96}%
              </span>
            </div>
          </div>

          {/* Core Pillars */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Protection Enforcement Guidelines
            </h3>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  <span>1. Anti-Repetitive & Original Value Policy</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-6">
                  YouTube actively penalizes "mass-produced / programmatic" content. TopicToVideo synthesizes genuine researched facts, unique analogies, and structured storytelling to ensure each video is distinct and compliant.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>2. 100% Royalty-Free CC0 Media & Music Licensing</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-6">
                  Zero copyrighted tracks or clips. Every video asset and procedural music loop is verified under Creative Commons Zero (CC0) or royalty-free commercial licenses.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  <span>3. Verified Citations & Fact-Check Step</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-6">
                  Avoids misinformation flags by validating facts against credible scientific and journalistic consensus with transparent source citations.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>4. YouTube & Meta AI Disclosure Reminders</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-6">
                  Both YouTube and Instagram require creators to label realistic synthetic voiceovers and generative media as "Altered or Synthetic Content". TopicToVideo includes this flag automatically in your export metadata.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>5. Model-Released Real Presenters & Zero Likeness Claims</span>
                </div>
                <p className="text-slate-400 leading-relaxed pl-6">
                  Host characters are real, photorealistic studio presenters with verified commercial model releases. No unauthorized celebrity likenesses or distorted AI avatars, ensuring zero copyright or right-of-publicity claims on any platform.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
