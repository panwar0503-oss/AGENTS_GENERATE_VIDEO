import React, { useState } from 'react';
import { VideoProject, Scene, CameraMotionType } from '../types/video';
import { STOCK_MEDIA_LIBRARY, StockMediaAsset } from '../data/royaltyFreeLibrary';
import { preloadImage } from '../utils/videoCanvasPlayer';
import {
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Search,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Wand2,
  Loader2,
  Film,
  Layers,
  Video,
  Move,
  ZoomIn,
  ZoomOut,
  Compass,
} from 'lucide-react';

interface Step3VisualsProps {
  project: VideoProject;
  setProject: React.Dispatch<React.SetStateAction<VideoProject | null>>;
  onNext: () => void;
  onBack: () => void;
  isGeneratingVisuals?: boolean;
  onTriggerAutoGenerateVisuals?: () => void;
}

export const Step3Visuals: React.FC<Step3VisualsProps> = ({
  project,
  setProject,
  onNext,
  onBack,
  isGeneratingVisuals = false,
  onTriggerAutoGenerateVisuals,
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'ai_prompt' | 'camera_motion' | 'stock_library' | 'motion_canvas'>('ai_prompt');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customVisualPrompt, setCustomVisualPrompt] = useState('');
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);
  const [isModalGenerating, setIsModalGenerating] = useState(false);

  const activeSceneToSwap = project.scenes.find((s) => s.id === selectedSceneId);

  // Open modal with scene's existing visual prompt
  const handleOpenSwapModal = (scene: Scene) => {
    setSelectedSceneId(scene.id);
    setCustomVisualPrompt(scene.visualPrompt || '');
    setModalTab('ai_prompt');
  };

  // Generate AI Visual for a specific scene
  const handleGenerateAiVisual = async (sceneId: string, promptToUse?: string) => {
    const targetScene = project.scenes.find((s) => s.id === sceneId);
    if (!targetScene) return;

    const promptText = promptToUse || targetScene.visualPrompt || targetScene.title;
    setGeneratingSceneId(sceneId);
    setIsModalGenerating(true);

    try {
      const response = await fetch('/api/generate-scene-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          topic: project.topic,
          sceneNumber: targetScene.sceneNumber,
          narrationText: targetScene.narrationText,
          aspectRatio: project.aspectRatio,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          preloadImage(data.imageUrl);

          setProject((prev) => {
            if (!prev) return prev;
            const updated = prev.scenes.map((s) => {
              if (s.id === sceneId) {
                return {
                  ...s,
                  visualPrompt: promptText,
                  mediaUrl: data.imageUrl,
                  mediaType: data.imageUrl.startsWith('gen:') ? ('canvas_art' as const) : ('image' as const),
                  mediaCredit: {
                    source: data.source === 'ai_generated' ? 'Gemini 3.1 AI Generation' : 'Procedural Vector Art',
                    license: data.license || '100% Commercial Safe Royalty-Free (Zero Copyright Claim Risk)',
                    commercialSafe: true,
                  },
                };
              }
              return s;
            });

            return {
              ...prev,
              scenes: updated,
            };
          });
        }
      }
    } catch (err) {
      console.warn('AI Scene visual generation note:', err);
    } finally {
      setGeneratingSceneId(null);
      setIsModalGenerating(false);
      setSelectedSceneId(null);
    }
  };

  const handleSelectAsset = (asset: StockMediaAsset) => {
    if (!selectedSceneId) return;

    setProject((prev) => {
      if (!prev) return prev;
      const updatedScenes = prev.scenes.map((s) => {
        if (s.id === selectedSceneId) {
          return {
            ...s,
            mediaUrl: asset.url,
            mediaType: asset.type === 'generative' ? ('canvas_art' as const) : ('image' as const),
            mediaCredit: {
              source: asset.source,
              license: asset.license,
              commercialSafe: true,
            },
          };
        }
        return s;
      });

      // Update licenses tracker
      const newLicenseEntry = {
        assetId: asset.id,
        type: 'footage' as const,
        name: asset.title,
        source: asset.source,
        license: asset.license,
        commercialUsable: true,
        verifiedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        scenes: updatedScenes,
        licenses: [...prev.licenses.filter((l) => l.assetId !== asset.id), newLicenseEntry],
      };
    });

    setSelectedSceneId(null);
  };

  const filteredAssets = STOCK_MEDIA_LIBRARY.filter((item) => {
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Scene Backgrounds & Visuals</h1>
          <p className="text-sm text-slate-400 mt-1">
            Background visuals are automatically tailored to the spoken narrative of each scene.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onTriggerAutoGenerateVisuals && (
            <button
              type="button"
              disabled={isGeneratingVisuals}
              onClick={onTriggerAutoGenerateVisuals}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isGeneratingVisuals
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-750 cursor-wait animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isGeneratingVisuals ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                  <span>Auto-Generating Visuals...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Auto-Generate All from Script</span>
                </>
              )}
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/50 px-3.5 py-2 rounded-xl text-xs text-emerald-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% CC0 Commercial Safe</span>
          </div>
        </div>
      </div>

      {/* Auto-Generating Notice Banner */}
      {isGeneratingVisuals && (
        <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center gap-3 text-xs text-indigo-200">
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-white">AI Background Engine Active: </span>
            Generating customized broadcast scene backgrounds based on your narration script. You can edit or re-generate any scene at any time.
          </div>
        </div>
      )}

      {/* Scenes Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {project.scenes.map((scene, idx) => {
          const isGenerative = scene.mediaUrl.startsWith('gen:');
          const isSceneGenerating = generatingSceneId === scene.id;
          const isAiImage = scene.mediaUrl.startsWith('data:image/');

          return (
            <div
              key={scene.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all"
            >
              {/* Thumbnail Frame */}
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                {isSceneGenerating ? (
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    <Loader2 className="w-7 h-7 text-indigo-400 animate-spin mb-2" />
                    <span className="text-xs font-bold text-white">Generating AI Visual...</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Based on script prompt</span>
                  </div>
                ) : isGenerative ? (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 flex flex-col items-center justify-center p-4 text-center">
                    <Sparkles className="w-6 h-6 text-indigo-400 mb-1" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Generative Motion Canvas
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Preset: {scene.mediaUrl.replace('gen:', '')}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full overflow-hidden relative">
                    <img
                      src={scene.mediaUrl}
                      alt={scene.title}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        scene.motionType === 'ken_burns_zoom_out'
                          ? 'anim-doc-zoom-out'
                          : scene.motionType === 'pan_left'
                          ? 'anim-doc-pan-left'
                          : scene.motionType === 'pan_right'
                          ? 'anim-doc-pan-right'
                          : scene.motionType === 'tilt_up'
                          ? 'anim-doc-tilt-up'
                          : scene.motionType === 'tilt_down'
                          ? 'anim-doc-tilt-down'
                          : scene.motionType === 'orbital_drift'
                          ? 'anim-doc-orbital-drift'
                          : 'anim-doc-zoom-in'
                      }`}
                    />
                    {/* Organic Vignette Overlay for Documentary Film Feel */}
                    <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />
                  </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[80%]">
                  <div className="px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-sm text-[11px] font-bold text-white border border-slate-800">
                    Scene {idx + 1}
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-indigo-950/90 backdrop-blur-sm text-[10px] font-bold text-indigo-300 border border-indigo-750 capitalize">
                    {scene.emotion || 'explaining'}
                  </div>
                  {/* Camera Motion Badge */}
                  <div className="px-2 py-0.5 rounded-md bg-cyan-950/90 backdrop-blur-sm text-[10px] font-semibold text-cyan-300 border border-cyan-800/80 flex items-center gap-1">
                    <Video className="w-2.5 h-2.5 text-cyan-400" />
                    <span>
                      {scene.motionType === 'ken_burns_zoom_out'
                        ? 'Zoom Out'
                        : scene.motionType === 'pan_left'
                        ? 'Pan Left'
                        : scene.motionType === 'pan_right'
                        ? 'Pan Right'
                        : scene.motionType === 'tilt_up'
                        ? 'Tilt Up'
                        : scene.motionType === 'tilt_down'
                        ? 'Tilt Down'
                        : scene.motionType === 'orbital_drift'
                        ? 'Orbital Drift'
                        : 'Push-In Zoom'}
                    </span>
                  </div>
                  {isAiImage && (
                    <div className="px-2 py-0.5 rounded-md bg-purple-950/90 backdrop-blur-sm text-[10px] font-bold text-purple-300 border border-purple-800 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                      <span>AI Generated</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons on Hover / Overlay */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleGenerateAiVisual(scene.id)}
                    disabled={isSceneGenerating}
                    title="Regenerate unique visual with AI"
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1 backdrop-blur-sm"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>AI Generate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenSwapModal(scene)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold shadow-md transition-colors flex items-center gap-1 border border-slate-700 backdrop-blur-sm"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Options & Motion</span>
                  </button>
                </div>
              </div>

              {/* Scene Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{scene.title}</span>
                  <span className="text-slate-400 tabular-nums">{scene.durationSeconds}s</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  "{scene.narrationText}"
                </p>

                {/* Camera Motion Selector Pill Bar */}
                <div className="pt-2 flex items-center justify-between gap-1 text-[11px] border-t border-slate-800/80">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Compass className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] font-semibold text-slate-300">Camera Pan/Zoom:</span>
                  </div>
                  <select
                    value={scene.motionType || (
                      idx % 5 === 1 ? 'ken_burns_zoom_in' :
                      idx % 5 === 2 ? 'pan_left' :
                      idx % 5 === 3 ? 'tilt_up' :
                      idx % 5 === 4 ? 'pan_right' :
                      'orbital_drift'
                    )}
                    onChange={(e) => {
                      const newMotion = e.target.value as CameraMotionType;
                      setProject((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          scenes: prev.scenes.map((s) =>
                            s.id === scene.id ? { ...s, motionType: newMotion } : s
                          ),
                        };
                      });
                    }}
                    className="bg-slate-950 border border-slate-750 text-cyan-300 rounded-md px-2 py-0.5 text-[11px] font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="ken_burns_zoom_in">Ken Burns: Slow Push-In</option>
                    <option value="ken_burns_zoom_out">Ken Burns: Pull-Back Reveal</option>
                    <option value="pan_left">Documentary Pan Left</option>
                    <option value="pan_right">Documentary Pan Right</option>
                    <option value="tilt_up">Pedestal Tilt Up</option>
                    <option value="tilt_down">Pedestal Tilt Down</option>
                    <option value="orbital_drift">Organic Handheld Drift</option>
                  </select>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[200px]">Prompt: {scene.visualPrompt}</span>
                  <span className="text-emerald-400 font-medium shrink-0">100% Commercial Safe</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Options / Custom Generator Modal */}
      {selectedSceneId && activeSceneToSwap && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Visual Direction for Scene #{activeSceneToSwap.sceneNumber}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 capitalize">
                    {activeSceneToSwap.emotion || 'explaining'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate a custom AI visual from your script prompt, choose procedural motion canvas, or pick CC0 footage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSceneId(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center border-b border-slate-800 px-4 bg-slate-950/60">
              <button
                type="button"
                onClick={() => setModalTab('ai_prompt')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'ai_prompt'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Prompt Generator</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('camera_motion')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'camera_motion'
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Camera Motion & Pans</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('motion_canvas')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'motion_canvas'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generative Motion Canvases</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('stock_library')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'stock_library'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>CC0 Stock Footage</span>
              </button>
            </div>

            {/* TAB 0: Camera Motion & Pans */}
            {modalTab === 'camera_motion' && (
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>Cinematic Documentary Camera Moves</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Static images are given subtle, organic camera motions with smooth cubic easing and micro-handheld drift, converting static frames into high-end documentary footage.
                  </p>
                </div>

                {/* Motion Type Presets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    {
                      id: 'ken_burns_zoom_in',
                      title: 'Ken Burns: Push-In Zoom',
                      desc: 'Gradual forward push (1.04x → 1.16x) with subtle focal drift. Focuses viewer attention on the core subject.',
                      badge: 'High Focus',
                      animClass: 'anim-doc-zoom-in',
                    },
                    {
                      id: 'ken_burns_zoom_out',
                      title: 'Ken Burns: Pull-Back Reveal',
                      desc: 'Smooth backward dolly (1.16x → 1.05x). Broadens the perspective to emphasize scale and context.',
                      badge: 'Grand Reveal',
                      animClass: 'anim-doc-zoom-out',
                    },
                    {
                      id: 'pan_left',
                      title: 'Documentary Pan Left',
                      desc: 'Horizontal camera glide to the left with cinematic ease-in/out and micro vertical stabilization.',
                      badge: 'Narrative Glide',
                      animClass: 'anim-doc-pan-left',
                    },
                    {
                      id: 'pan_right',
                      title: 'Documentary Pan Right',
                      desc: 'Horizontal camera glide to the right, guiding the viewer eye across the visual landscape.',
                      badge: 'Scene Exploration',
                      animClass: 'anim-doc-pan-right',
                    },
                    {
                      id: 'tilt_up',
                      title: 'Pedestal Tilt Up',
                      desc: 'Vertical camera rise from lower details up toward the horizon. Great for inspiring statements.',
                      badge: 'Uplifting Pacing',
                      animClass: 'anim-doc-tilt-up',
                    },
                    {
                      id: 'tilt_down',
                      title: 'Pedestal Tilt Down',
                      desc: 'Vertical camera descent emphasizing ground facts, technical schematics, or serious premises.',
                      badge: 'Deep Detail',
                      animClass: 'anim-doc-tilt-down',
                    },
                    {
                      id: 'orbital_drift',
                      title: 'Organic Handheld Drift',
                      desc: 'Subtle 2-axis micro orbital pan mimicking a documentary cinematographer on shoulder-mount rig.',
                      badge: 'Humanized Feel',
                      animClass: 'anim-doc-orbital-drift',
                    },
                  ].map((motion) => {
                    const isSelected =
                      (activeSceneToSwap.motionType || 'ken_burns_zoom_in') === motion.id;

                    return (
                      <div
                        key={motion.id}
                        onClick={() => {
                          setProject((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              scenes: prev.scenes.map((s) =>
                                s.id === activeSceneToSwap.id
                                  ? { ...s, motionType: motion.id as CameraMotionType }
                                  : s
                              ),
                            };
                          });
                        }}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                            {motion.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-semibold">
                            {motion.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {motion.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedSceneId(null)}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
                  >
                    Done & Apply Motion
                  </button>
                </div>
              </div>
            )}

            {/* TAB 1: AI Prompt Generator */}
            {modalTab === 'ai_prompt' && (
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Visual Prompt for Background Image
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Describe what should appear behind the narrator for this scene. The AI generates an 8k broadcast visual with no copyright risk.
                  </p>
                  <textarea
                    rows={3}
                    value={customVisualPrompt}
                    onChange={(e) => setCustomVisualPrompt(e.target.value)}
                    placeholder="e.g. Cinematic documentary visual showing futuristic quantum computer core with glowing circuits, dark atmospheric lighting..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Quick Style Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Quick Style Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Cinematic Documentary Film',
                      'Hyper-Realistic 8k Photography',
                      'Dark Cyberpunk High-Tech',
                      'Clean Minimalist Studio 3D',
                      'Macro Scientific Discovery',
                    ].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          setCustomVisualPrompt((prev) => `${prev.trim()}, ${style}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-slate-300 hover:text-white transition-colors"
                      >
                        + {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spoken Scene Narration Reference */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    Scene Narration Script:
                  </span>
                  <p className="text-xs text-slate-300 italic">
                    "{activeSceneToSwap.narrationText}"
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={isModalGenerating}
                    onClick={() => handleGenerateAiVisual(activeSceneToSwap.id, customVisualPrompt)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-xs font-bold text-white transition-colors shadow-md"
                  >
                    {isModalGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Visual with AI...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Generate Scene Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Generative Motion Canvases */}
            {modalTab === 'motion_canvas' && (
              <div className="p-5 overflow-y-auto space-y-3">
                <p className="text-xs text-slate-400">
                  Mathematical Web Audio / Canvas procedural graphics generated in real time. 100% royalty-free and Content ID safe.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'gen:neural', name: 'Neural Network Synapses', desc: 'Glowing nodes and interactive data connections', cat: 'Tech / AI' },
                    { id: 'gen:candlestick', name: 'Candlestick Market Waves', desc: 'Real-time financial charts and trends', cat: 'Finance' },
                    { id: 'gen:nebula', name: 'Cosmic Nebula Starfield', desc: 'Deep space particles and cosmic colors', cat: 'Science' },
                    { id: 'gen:cyber_grid', name: 'Cyber Grid Matrix Flow', desc: 'Perspective neon cyberspace landscape', cat: 'Tech' },
                    { id: 'gen:synapse', name: 'Synaptic Brain Waves', desc: 'Neurological pulsing cognitive rings', cat: 'Mind / Bio' },
                    { id: 'gen:aurora', name: 'Atmospheric Aurora Flow', desc: 'Organic harmonic color gradient waves', cat: 'Ambient' },
                  ].map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        handleSelectAsset({
                          id: preset.id,
                          title: preset.name,
                          category: 'tech',
                          type: 'generative',
                          url: preset.id,
                          source: 'Procedural Motion',
                          license: 'CC0 / Royalty-Free Commercial Safe',
                          tags: [preset.name.toLowerCase()],
                        });
                      }}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div className="aspect-video rounded-lg bg-gradient-to-br from-indigo-950 to-slate-900 flex items-center justify-center mb-2">
                        <Sparkles className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{preset.name}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{preset.desc}</p>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-semibold mt-2">100% CC0 Safe</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Stock Library */}
            {modalTab === 'stock_library' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Filter Bar */}
                <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search stock footage tags (ai, finance, cosmos, ocean)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {['all', 'tech', 'finance', 'science', 'nature', 'urban', 'abstract'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFilterCategory(cat)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                          filterCategory === cat
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assets Grid */}
                <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectAsset(asset)}
                      className="bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl overflow-hidden cursor-pointer transition-all group flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                        {asset.type === 'generative' ? (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-slate-900 flex items-center justify-center p-2 text-center">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                          </div>
                        ) : (
                          <img
                            src={asset.url}
                            alt={asset.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>

                      <div className="p-2.5 space-y-1">
                        <span className="text-xs font-bold text-white block truncate">{asset.title}</span>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{asset.source}</span>
                          <span className="text-emerald-400">CC0 Safe</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Script</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-sm font-bold text-white transition-colors shadow-sm"
        >
          <span>Continue to Voice & Host</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
