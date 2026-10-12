import React, { useState } from 'react';
import { VideoProject, VoiceConfig, MusicConfig, CaptionConfig } from '../types/video';
import { ROYALTY_FREE_MUSIC_TRACKS } from '../data/royaltyFreeLibrary';
import { synthesizeVoice, startProceduralMusic } from '../utils/audioSynthesizer';
import {
  Mic,
  Music,
  Type,
  Volume2,
  Play,
  Square,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface Step4AudioCaptionsProps {
  project: VideoProject;
  setProject: React.Dispatch<React.SetStateAction<VideoProject | null>>;
  onNext: () => void;
  onBack: () => void;
}

const VOICES: { id: VoiceConfig['voiceName']; name: string; role: string; timbre: string }[] = [
  { id: 'Zephyr', name: 'Zephyr', role: 'Modern & Crisp', timbre: 'Balanced modern tech host' },
  { id: 'Kore', name: 'Kore', role: 'Warm & Articulate', timbre: 'Engaging, friendly educator' },
  { id: 'Puck', name: 'Puck', role: 'High Energy Host', timbre: 'Enthusiastic viral shorts creator' },
  { id: 'Charon', name: 'Charon', role: 'Deep & Authoritative', timbre: 'Documentary & serious news' },
  { id: 'Fenrir', name: 'Fenrir', role: 'Dynamic Narrative', timbre: 'Storyteller & cinematic voice' },
];

const CAPTION_STYLES: { id: CaptionConfig['style']; label: string; desc: string }[] = [
  { id: 'tiktok_pop', label: 'TikTok Pop', desc: 'Active word pops up with yellow pill highlight' },
  { id: 'cinema_box', label: 'Cinema Box', desc: 'Dark translucent backdrop for contrast' },
  { id: 'neon_glow', label: 'Neon Glow', desc: 'Vibrant cyberpunk glow around words' },
  { id: 'minimal_clean', label: 'Minimal Clean', desc: 'Elegant typography with drop shadow' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Electric Yellow', hex: '#FACC15' },
  { name: 'Neon Cyan', hex: '#38BDF8' },
  { name: 'Hot Pink', hex: '#F43F5E' },
  { name: 'Lime Green', hex: '#4ADE80' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

export const Step4AudioCaptions: React.FC<Step4AudioCaptionsProps> = ({
  project,
  setProject,
  onNext,
  onBack,
}) => {
  const [isPlayingVoiceTest, setIsPlayingVoiceTest] = useState(false);
  const [activeVoiceStopper, setActiveVoiceStopper] = useState<(() => void) | null>(null);

  const [playingMusicTrack, setPlayingMusicTrack] = useState<string | null>(null);
  const [musicStopper, setMusicStopper] = useState<(() => void) | null>(null);

  const handleVoiceChange = (vName: VoiceConfig['voiceName']) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            voiceConfig: { ...prev.voiceConfig, voiceName: vName },
          }
        : prev
    );
  };

  const handleSpeedChange = (speed: number) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            voiceConfig: { ...prev.voiceConfig, speed },
          }
        : prev
    );
  };

  const handleTestVoice = async (voiceName: VoiceConfig['voiceName']) => {
    if (activeVoiceStopper) {
      activeVoiceStopper();
      setActiveVoiceStopper(null);
      setIsPlayingVoiceTest(false);
      return;
    }

    setIsPlayingVoiceTest(true);
    const testSample =
      project.hook || 'Welcome to this breakdown. Here is what you need to know.';
    const controller = await synthesizeVoice(testSample, voiceName, project.voiceConfig.speed);

    setActiveVoiceStopper(() => controller.stop);
    await controller.play();
    setIsPlayingVoiceTest(false);
    setActiveVoiceStopper(null);
  };

  const handleToggleMusicPreview = (trackId: string) => {
    if (playingMusicTrack === trackId) {
      if (musicStopper) musicStopper();
      setPlayingMusicTrack(null);
      setMusicStopper(null);
      return;
    }

    if (musicStopper) musicStopper();
    const controller = startProceduralMusic(trackId, project.musicConfig.volume || 0.25);
    setPlayingMusicTrack(trackId);
    setMusicStopper(() => controller.stop);
  };

  const handleSelectMusicTrack = (track: (typeof ROYALTY_FREE_MUSIC_TRACKS)[0]) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            musicConfig: {
              ...prev.musicConfig,
              trackId: track.id,
              title: track.title,
              genre: track.genre,
              license: track.license,
            },
          }
        : prev
    );
  };

  const handleCaptionStyleChange = (style: CaptionConfig['style']) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            captionConfig: { ...prev.captionConfig, style },
          }
        : prev
    );
  };

  const handleCaptionPosChange = (position: CaptionConfig['position']) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            captionConfig: { ...prev.captionConfig, position },
          }
        : prev
    );
  };

  const handleColorChange = (hex: string) => {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            captionConfig: { ...prev.captionConfig, highlightColor: hex },
          }
        : prev
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white">Voiceover, Music & Captions</h1>
        <p className="text-sm text-slate-400 mt-1">
          Fine-tune the acoustic pacing and visual caption styling for optimal retention.
        </p>
      </div>

      {/* 1. Voiceover Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">AI Voiceover Narrator</h2>
          </div>
          <span className="text-xs text-slate-400">Gemini 3.8 Natural Speech Synthesis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VOICES.map((v) => {
            const isSelected = project.voiceConfig.voiceName === v.id;
            return (
              <div
                key={v.id}
                onClick={() => handleVoiceChange(v.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{v.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {v.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{v.timbre}</p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Audition</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestVoice(v.id);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    {isPlayingVoiceTest ? (
                      <Square className="w-3 h-3 text-red-400" />
                    ) : (
                      <Play className="w-3 h-3 text-indigo-400" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Speed Slider */}
        <div className="pt-2 flex items-center gap-4">
          <span className="text-xs font-medium text-slate-400 w-28">
            Pacing Speed: <strong className="text-white tabular-nums">{project.voiceConfig.speed}x</strong>
          </span>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.05"
            value={project.voiceConfig.speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="flex-1 accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Royalty-Free Background Music */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Royalty-Free Background Music</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Monetization Safe</span>
          </div>
        </div>

        <div className="space-y-2">
          {ROYALTY_FREE_MUSIC_TRACKS.map((track) => {
            const isSelected = project.musicConfig.trackId === track.id;
            const isPlaying = playingMusicTrack === track.id;

            return (
              <div
                key={track.id}
                onClick={() => handleSelectMusicTrack(track)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-950/20 border-emerald-500/80 shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{track.title}</span>
                    <span className="text-[10px] text-slate-400">· {track.genre}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{track.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  {track.id !== 'track_none' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMusicPreview(track.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title={isPlaying ? 'Stop' : 'Listen'}
                    >
                      {isPlaying ? (
                        <Square className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </button>
                  )}
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Music Volume Slider */}
        <div className="pt-2 flex items-center gap-4">
          <span className="text-xs font-medium text-slate-400 w-28">
            Music Volume: <strong className="text-white tabular-nums">{Math.round((project.musicConfig.volume || 0.25) * 100)}%</strong>
          </span>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={project.musicConfig.volume}
            onChange={(e) =>
              setProject((prev) =>
                prev
                  ? {
                      ...prev,
                      musicConfig: {
                        ...prev.musicConfig,
                        volume: parseFloat(e.target.value),
                      },
                    }
                  : prev
              )
            }
            className="flex-1 accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Word-by-Word Animated Captions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">Auto-Synced Word Captions</h2>
          </div>
          <span className="text-xs text-slate-400">Word-by-word highlighted animation</span>
        </div>

        {/* Caption Styles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CAPTION_STYLES.map((c) => {
            const isSelected = project.captionConfig.style === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCaptionStyleChange(c.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-sky-950/30 border-sky-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold text-white block">{c.label}</span>
                <span className="text-[11px] text-slate-400 line-clamp-2 mt-1">{c.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Position & Color Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Position */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400 block">Caption Position</span>
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 w-full">
              {(['bottom', 'center', 'top'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handleCaptionPosChange(pos)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                    project.captionConfig.position === pos
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Color Highlight */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400 block">Highlight Color</span>
            <div className="flex items-center gap-2">
              {HIGHLIGHT_COLORS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => handleColorChange(col.hex)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    project.captionConfig.highlightColor === col.hex
                      ? 'scale-110 border-white'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Visuals</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-sm font-bold text-white transition-colors shadow-sm"
        >
          <span>Open Studio Preview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
