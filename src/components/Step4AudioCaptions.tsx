import React, { useState } from 'react';
import { VideoProject, VoiceConfig, MusicConfig, CaptionConfig, PresenterConfig } from '../types/video';
import { ROYALTY_FREE_MUSIC_TRACKS } from '../data/royaltyFreeLibrary';
import { PRESENTER_CHARACTERS } from '../data/presenterCharacters';
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
  ShieldCheck,
  User,
  CheckCircle2
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

  const [isMatchingHost, setIsMatchingHost] = useState(false);
  const [hostMatchReason, setHostMatchReason] = useState<string | null>(null);

  const handleAutoMatchHost = async () => {
    setIsMatchingHost(true);
    try {
      const res = await fetch('/api/generate-character-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic,
          tone: project.tone,
          platform: project.platform,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.characterId) {
          setProject((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              voiceConfig: {
                ...prev.voiceConfig,
                voiceName: data.voiceMatch || prev.voiceConfig.voiceName,
              },
              presenterConfig: {
                ...(prev.presenterConfig || {
                  position: 'bottom_right',
                  showSpeakingWave: true,
                  mode: 'pip_corner',
                }),
                enabled: true,
                characterId: data.characterId,
              },
            };
          });
          setHostMatchReason(data.deliveryNotes || `Matched for optimal delivery on "${project.topic}"`);
        }
      }
    } catch (e) {
      console.warn('Auto match host note:', e);
    } finally {
      setIsMatchingHost(false);
    }
  };

  const handleTestVoice = async (
    voiceName: VoiceConfig['voiceName'],
    emotion: string = 'explaining',
    samplePhrase?: string
  ) => {
    if (activeVoiceStopper) {
      activeVoiceStopper();
      setActiveVoiceStopper(null);
      setIsPlayingVoiceTest(false);
      return;
    }

    setIsPlayingVoiceTest(true);
    const testSample =
      samplePhrase || project.hook || 'Welcome to this breakdown. Here is what you need to know.';
    const controller = await synthesizeVoice(testSample, voiceName, project.voiceConfig.speed, emotion);

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

      {/* 2. Real Human Presenter / Host & Emotion Synchronization */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Real Human Presenter & Host Persona</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  Model-Released CC0 Safe
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Photorealistic studio character with scene-synchronized human facial emotions (intrigued, explaining, shocked, inspiring).
              </p>
            </div>
          </div>

          {/* Host Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isMatchingHost}
              onClick={handleAutoMatchHost}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-700 text-xs font-semibold transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isMatchingHost ? 'Matching...' : 'Auto-Match to Topic'}</span>
            </button>

            {/* Enable / Disable Toggle */}
            <button
              type="button"
              onClick={() => {
                const currentEnabled = project.presenterConfig?.enabled ?? true;
                setProject((prev) =>
                  prev
                    ? {
                        ...prev,
                        presenterConfig: {
                          ...(prev.presenterConfig || {
                            characterId: 'char_marcus',
                            mode: 'pip_corner',
                            position: 'bottom_right',
                            showSpeakingWave: true,
                          }),
                          enabled: !currentEnabled,
                        },
                      }
                    : prev
                );
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                project.presenterConfig?.enabled ?? true
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {project.presenterConfig?.enabled ?? true ? 'Host Active' : '+ Enable Host'}
            </button>
          </div>
        </div>

        {hostMatchReason && (
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>AI Recommendation:</strong> {hostMatchReason}</span>
          </div>
        )}

        {(project.presenterConfig?.enabled ?? true) && (
          <div className="space-y-4 pt-1">
            {/* Host Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESENTER_CHARACTERS.map((char) => {
                const isSelected =
                  (project.presenterConfig?.characterId || 'char_marcus') === char.id;

                return (
                  <div
                    key={char.id}
                    onClick={() => {
                      setProject((prev) =>
                        prev
                          ? {
                              ...prev,
                              voiceConfig: {
                                ...prev.voiceConfig,
                                voiceName: char.voiceMatch,
                              },
                              presenterConfig: {
                                ...(prev.presenterConfig || {
                                  position: 'bottom_right',
                                  showSpeakingWave: true,
                                }),
                                enabled: true,
                                characterId: char.id,
                                mode: prev.presenterConfig?.mode || 'pip_corner',
                              },
                            }
                          : prev
                      );
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 shadow-sm'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative w-13 h-13 rounded-full overflow-hidden shrink-0 border border-slate-700 bg-slate-900">
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-600/20 ring-2 ring-indigo-400 rounded-full" />
                      )}
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{char.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{char.title}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-indigo-300">
                        <span>Voice: {char.voiceMatch}</span>
                        <span>·</span>
                        <span className="text-emerald-400">Natural Emotion</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Host Emotion & Voice Synchronization Matrix */}
            {(() => {
              const activeChar =
                PRESENTER_CHARACTERS.find(
                  (c) => c.id === (project.presenterConfig?.characterId || 'char_marcus')
                ) || PRESENTER_CHARACTERS[0];

              return (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Emotion & Delivery Synchronization</span>
                        <span className="text-[10px] text-indigo-400 font-semibold px-1.5 py-0.2 rounded bg-indigo-950/80 border border-indigo-800/50">
                          {activeChar.name}
                        </span>
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Preview how {activeChar.name} adjusts facial expressions, gaze, and vocal delivery for each scene state.
                      </p>
                    </div>
                  </div>

                  {/* Emotion Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    {(
                      [
                        { id: 'intrigued' as const, label: 'Intrigued', phrase: 'Did you know this completely changes how you see it?' },
                        { id: 'explaining' as const, label: 'Explaining', phrase: 'Here is the fundamental mechanism behind this concept.' },
                        { id: 'shocked' as const, label: 'Shocked', phrase: 'The actual truth completely surprised researchers.' },
                        { id: 'thoughtful' as const, label: 'Thoughtful', phrase: 'When you reflect on this, the implications run deep.' },
                        { id: 'inspiring' as const, label: 'Inspiring', phrase: 'Master this principle and you can achieve incredible growth.' },
                      ]
                    ).map((item) => {
                      const exprUrl =
                        activeChar.emotionalExpressions?.[item.id] || activeChar.avatarUrl;

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-lg p-2.5 flex flex-col items-center text-center space-y-1.5 transition-all"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                            <img
                              src={exprUrl}
                              alt={item.label}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <span className="text-[11px] font-bold text-slate-200 capitalize">
                            {item.label}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              handleTestVoice(activeChar.voiceMatch, item.id, item.phrase);
                            }}
                            className="mt-1 w-full py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-750 text-[10px] font-semibold text-indigo-300 hover:text-white transition-colors flex items-center justify-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5" />
                            <span>Audition</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Host Staging Layout & Position Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              {/* Layout Mode */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Host Video Placement
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'pip_corner' as const, label: 'Corner PIP' },
                    { id: 'split_screen' as const, label: 'Split Screen' },
                    { id: 'cinema_host' as const, label: 'Cinema Bar' },
                    { id: 'cuts_only' as const, label: 'Key Cuts' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setProject((prev) =>
                          prev
                            ? {
                                ...prev,
                                presenterConfig: {
                                  ...(prev.presenterConfig || {
                                    enabled: true,
                                    characterId: 'char_marcus',
                                    position: 'bottom_right',
                                    showSpeakingWave: true,
                                  }),
                                  mode: m.id,
                                },
                              }
                            : prev
                        );
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                        (project.presenterConfig?.mode || 'pip_corner') === m.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Corner Anchor Position
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'bottom_right' as const, label: 'Bottom Right' },
                    { id: 'bottom_left' as const, label: 'Bottom Left' },
                    { id: 'top_right' as const, label: 'Top Right' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => {
                        setProject((prev) =>
                          prev
                            ? {
                                ...prev,
                                presenterConfig: {
                                  ...(prev.presenterConfig || {
                                    enabled: true,
                                    characterId: 'char_marcus',
                                    mode: 'pip_corner',
                                    showSpeakingWave: true,
                                  }),
                                  position: pos.id,
                                },
                              }
                            : prev
                        );
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                        (project.presenterConfig?.position || 'bottom_right') === pos.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Copyright Protection Note */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>100% Monetization & Copyright Claim Protection:</strong> All presenter portraits and stock assets are model-released under open commercial licenses with zero risk of copyright strikes on YouTube, TikTok, Reels, or Facebook.
              </span>
            </div>
          </div>
        )}
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
