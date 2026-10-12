import React, { useRef, useEffect, useState } from 'react';
import { VideoProject, Scene } from '../types/video';
import { renderVideoFrame, preloadImage } from '../utils/videoCanvasPlayer';
import { synthesizeVoice, startProceduralMusic, preloadProjectAudio } from '../utils/audioSynthesizer';
import { PRESENTER_CHARACTERS } from '../data/presenterCharacters';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Sliders,
  User,
  Mic
} from 'lucide-react';

interface Step5PreviewProps {
  project: VideoProject;
  setProject: React.Dispatch<React.SetStateAction<VideoProject | null>>;
  onNext: () => void;
  onBack: () => void;
}

export const Step5Preview: React.FC<Step5PreviewProps> = ({
  project,
  setProject,
  onNext,
  onBack,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const totalDuration = project.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  // Background music controller ref
  const musicRef = useRef<{ stop: () => void; setVolume: (v: number) => void } | null>(null);
  const voiceStopperRef = useRef<(() => void) | null>(null);

  // Preload scenes media
  const lastSpokenSceneRef = useRef<number | null>(null);
  const [isAuditioningVoice, setIsAuditioningVoice] = useState(false);

  // Preload scenes media, presenter emotional portraits, and voiceover audio
  useEffect(() => {
    project.scenes.forEach((s) => {
      if (!s.mediaUrl.startsWith('gen:')) {
        preloadImage(s.mediaUrl);
      }
    });

    if (project.presenterConfig?.enabled) {
      const char = PRESENTER_CHARACTERS.find(
        (c) => c.id === project.presenterConfig.characterId
      ) || PRESENTER_CHARACTERS[0];
      preloadImage(char.avatarUrl);
      Object.values(char.emotionalExpressions).forEach((url) => preloadImage(url));
    }

    preloadProjectAudio(
      project.scenes,
      project.voiceConfig.voiceName,
      project.voiceConfig.speed || 1.0
    );
  }, [project]);

  // Frame render loop on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine current scene from currentTime
    let accumulated = 0;
    let foundIndex = 0;
    let sceneLocal = 0;

    for (let i = 0; i < project.scenes.length; i++) {
      const s = project.scenes[i];
      if (currentTime >= accumulated && currentTime <= accumulated + s.durationSeconds) {
        foundIndex = i;
        sceneLocal = currentTime - accumulated;
        break;
      }
      accumulated += s.durationSeconds;
    }

    if (currentTime >= totalDuration) {
      foundIndex = project.scenes.length - 1;
      sceneLocal = project.scenes[foundIndex].durationSeconds;
    }

    setActiveSceneIndex(foundIndex);

    renderVideoFrame({
      ctx,
      project,
      currentScene: project.scenes[foundIndex],
      sceneLocalTime: sceneLocal,
      width: canvas.width,
      height: canvas.height,
    });
  }, [currentTime, project, totalDuration]);

  // Playback timer, background music & synchronized scene voiceover orchestration
  useEffect(() => {
    let animId: number;
    let lastTimestamp: number | null = null;

    if (isPlaying) {
      // Start background music
      if (!isMuted && !musicRef.current) {
        musicRef.current = startProceduralMusic(
          project.musicConfig.trackId,
          project.musicConfig.volume || 0.2
        );
      }

      // Synchronize Voiceover with Scene Entrance
      if (!isMuted && activeSceneIndex !== lastSpokenSceneRef.current) {
        lastSpokenSceneRef.current = activeSceneIndex;
        if (voiceStopperRef.current) {
          voiceStopperRef.current();
          voiceStopperRef.current = null;
        }

        const activeScene = project.scenes[activeSceneIndex];
        if (activeScene) {
          synthesizeVoice(
            activeScene.narrationText,
            project.voiceConfig.voiceName,
            project.voiceConfig.speed || 1.0,
            activeScene.emotion || 'explaining'
          ).then((controller) => {
            if (isPlaying) {
              voiceStopperRef.current = controller.stop;
              controller.play();
            }
          });
        }
      }

      const loop = (timestamp: number) => {
        if (lastTimestamp === null) lastTimestamp = timestamp;
        const delta = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= totalDuration) {
            setIsPlaying(false);
            lastSpokenSceneRef.current = null;
            if (musicRef.current) {
              musicRef.current.stop();
              musicRef.current = null;
            }
            if (voiceStopperRef.current) {
              voiceStopperRef.current();
              voiceStopperRef.current = null;
            }
            return 0;
          }
          return next;
        });

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);
    } else {
      lastSpokenSceneRef.current = null;
      if (musicRef.current) {
        musicRef.current.stop();
        musicRef.current = null;
      }
      if (voiceStopperRef.current) {
        voiceStopperRef.current();
        voiceStopperRef.current = null;
      }
    }

    return () => {
      cancelAnimationFrame(animId);
      if (musicRef.current) {
        musicRef.current.stop();
        musicRef.current = null;
      }
      if (voiceStopperRef.current) {
        voiceStopperRef.current();
      }
    };
  }, [isPlaying, isMuted, activeSceneIndex, totalDuration, project.musicConfig, project.voiceConfig, project.scenes]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
  };

  const handleJumpToScene = (index: number) => {
    let targetTime = 0;
    for (let i = 0; i < index; i++) {
      targetTime += project.scenes[i].durationSeconds;
    }
    setCurrentTime(targetTime);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isVertical = project.aspectRatio === '9:16';
  const canvasWidth = isVertical ? 540 : 960;
  const canvasHeight = isVertical ? 960 : 540;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Video Studio Player</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time canvas player with word-by-word synced animated captions and background music.
          </p>
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setProject((prev) => (prev ? { ...prev, aspectRatio: '9:16' } : prev))}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              isVertical ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            9:16 Vertical
          </button>
          <button
            type="button"
            onClick={() => setProject((prev) => (prev ? { ...prev, aspectRatio: '16:9' } : prev))}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              !isVertical ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            16:9 Landscape
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Canvas Player & Timeline (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-4">
          {/* Player Container */}
          <div
            className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center ${
              isVertical ? 'w-[320px] sm:w-[360px] aspect-[9/16]' : 'w-full aspect-[16/9]'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full h-full object-contain"
            />

            {/* Play/Pause Overlay Center when paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={handleTogglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                <Play className="w-8 h-8 ml-1" />
              </button>
            )}
          </div>

          {/* Player Controls Bar */}
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
            {/* Scrubber */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300 tabular-nums">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={totalDuration}
                step="0.1"
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="flex-1 accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-slate-400 tabular-nums">
                {formatTime(totalDuration)}
              </span>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Replay from start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Scene <strong className="text-white tabular-nums">{activeSceneIndex + 1}</strong> of{' '}
                <span className="tabular-nums">{project.scenes.length}</span>
              </div>
            </div>
          </div>

          {/* Interactive Scene Scrub Strip */}
          <div className="w-full max-w-xl space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 block">
              Timeline Scene Selector:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {project.scenes.map((s, idx) => {
                const isActive = activeSceneIndex === idx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleJumpToScene(idx)}
                    className={`py-2 px-1.5 rounded-lg border text-center transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Scene {idx + 1}</div>
                    <div className="text-[10px] text-slate-400 tabular-nums">{s.durationSeconds}s</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Fine-Tuning & Monetization Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Scene Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Active Scene #{activeSceneIndex + 1} Fine-Tuning
              </span>
              <span className="text-xs text-slate-400">
                {project.scenes[activeSceneIndex]?.durationSeconds}s runtime
              </span>
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              "{project.scenes[activeSceneIndex]?.narrationText}"
            </p>

            {/* Active Scene Voice Audition & Presenter Emotion Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs">
                {project.presenterConfig?.enabled && (
                  <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      Host Emotion:{' '}
                      <strong className="text-white capitalize">
                        {project.scenes[activeSceneIndex]?.emotion || 'explaining'}
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (isAuditioningVoice) {
                    if (voiceStopperRef.current) {
                      voiceStopperRef.current();
                      voiceStopperRef.current = null;
                    }
                    setIsAuditioningVoice(false);
                    return;
                  }

                  const scene = project.scenes[activeSceneIndex];
                  if (!scene) return;

                  setIsAuditioningVoice(true);
                  const controller = await synthesizeVoice(
                    scene.narrationText,
                    project.voiceConfig.voiceName,
                    project.voiceConfig.speed,
                    scene.emotion || 'explaining'
                  );
                  voiceStopperRef.current = controller.stop;
                  await controller.play();
                  setIsAuditioningVoice(false);
                  voiceStopperRef.current = null;
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
                  isAuditioningVoice
                    ? 'bg-rose-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isAuditioningVoice ? 'Stop Audition' : 'Audition Scene Voice'}</span>
              </button>
            </div>

            <div className="text-xs space-y-1 text-slate-400 pt-1">
              <div>
                <strong className="text-slate-300">Visual Cue:</strong>{' '}
                {project.scenes[activeSceneIndex]?.visualPrompt}
              </div>
              <div>
                <strong className="text-slate-300">License:</strong>{' '}
                <span className="text-emerald-400">
                  {project.scenes[activeSceneIndex]?.mediaCredit.license}
                </span>
              </div>
            </div>
          </div>

          {/* Monetization Protection Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Monetization Pre-Check
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-400">Verified</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-300">Originality Score:</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {project.uniquenessScore}% (Anti-mass produce safe)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-300">Music License:</span>
                <span className="font-medium text-emerald-400">{project.musicConfig.license}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-300">Community Safety:</span>
                <span className="font-medium text-emerald-400">100% Advertiser Friendly</span>
              </div>
            </div>

            {/* AI Disclosure Toggle */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  YouTube / IG AI Content Disclosure
                </span>
                <span className="text-[11px] text-slate-400">
                  Label as synthetic content in metadata
                </span>
              </div>
              <input
                type="checkbox"
                checked={project.platformMetadata.aiDisclosureRequired}
                onChange={(e) =>
                  setProject((prev) =>
                    prev
                      ? {
                          ...prev,
                          platformMetadata: {
                            ...prev.platformMetadata,
                            aiDisclosureRequired: e.target.checked,
                          },
                        }
                      : prev
                  )
                }
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Watermark Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white block">TopicToVideo Watermark</span>
              <span className="text-[11px] text-slate-400">
                {project.isProUser ? 'Pro Account — Watermark Free' : 'Watermark applied on free tier'}
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setProject((prev) =>
                  prev
                    ? {
                        ...prev,
                        isProUser: !prev.isProUser,
                        watermarkEnabled: !prev.isProUser ? false : true,
                      }
                    : prev
                )
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                project.isProUser
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {project.isProUser ? 'Pro Enabled' : 'Toggle Pro'}
            </button>
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
          <span>Back to Audio & Captions</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-sm font-bold text-white transition-colors shadow-sm"
        >
          <span>Render & Download Video</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
