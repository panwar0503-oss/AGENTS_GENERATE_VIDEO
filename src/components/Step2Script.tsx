import React from 'react';
import { VideoProject, Scene } from '../types/video';
import {
  Flame,
  CheckCircle,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  RefreshCw,
  Check
} from 'lucide-react';

interface Step2ScriptProps {
  project: VideoProject;
  setProject: React.Dispatch<React.SetStateAction<VideoProject | null>>;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Script: React.FC<Step2ScriptProps> = ({
  project,
  setProject,
  onNext,
  onBack,
}) => {
  const handleUpdateHook = (newHook: string) => {
    setProject((prev) => (prev ? { ...prev, hook: newHook } : prev));
  };

  const handleUpdateCTA = (newCta: string) => {
    setProject((prev) => (prev ? { ...prev, callToAction: newCta } : prev));
  };

  const handleUpdateSceneText = (sceneId: string, text: string) => {
    setProject((prev) => {
      if (!prev) return prev;
      const updatedScenes = prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, narrationText: text } : s
      );
      return { ...prev, scenes: updatedScenes };
    });
  };

  const handleUpdateSceneDuration = (sceneId: string, duration: number) => {
    setProject((prev) => {
      if (!prev) return prev;
      const updatedScenes = prev.scenes.map((s) =>
        s.id === sceneId ? { ...s, durationSeconds: Math.max(2, duration) } : s
      );
      return { ...prev, scenes: updatedScenes };
    });
  };

  const handleUpdateSceneEmotion = (sceneId: string, emotion: Scene['emotion']) => {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scenes: prev.scenes.map((s) => (s.id === sceneId ? { ...s, emotion } : s)),
      };
    });
  };

  const handleDeleteScene = (sceneId: string) => {
    if (project.scenes.length <= 2) return;
    setProject((prev) => {
      if (!prev) return prev;
      const updated = prev.scenes.filter((s) => s.id !== sceneId);
      return {
        ...prev,
        scenes: updated.map((s, idx) => ({ ...s, sceneNumber: idx + 1 })),
      };
    });
  };

  const handleAddScene = () => {
    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      sceneNumber: project.scenes.length + 1,
      title: `Key Insight #${project.scenes.length + 1}`,
      narrationText: 'Here is another crucial takeaway your viewers must keep in mind.',
      visualPrompt: 'High quality cinematic b-roll showcasing focus and clarity',
      searchKeywords: 'modern technology innovation',
      mediaType: 'canvas_art',
      mediaUrl: 'gen:aurora',
      mediaCredit: {
        source: 'Procedural Motion',
        license: 'CC0 / Royalty-Free Commercial Safe',
        commercialSafe: true,
      },
      captionKeywords: ['crucial', 'takeaway', 'mind'],
      durationSeconds: 6,
    };

    setProject((prev) => (prev ? { ...prev, scenes: [...prev.scenes, newScene] } : prev));
  };

  const totalWords = project.scenes.reduce(
    (acc, s) => acc + s.narrationText.split(/\s+/).filter(Boolean).length,
    0
  );
  const totalSeconds = project.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Review & Edit Script</h1>
          <p className="text-sm text-slate-400 mt-1">
            Paced for high viewer retention with verified facts, strong hook, and clear storytelling.
          </p>
        </div>

        {/* Script Metrics */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Est. Runtime</span>
            <span className="font-bold text-white tabular-nums">{totalSeconds}s</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[11px]">Total Words</span>
            <span className="font-bold text-white tabular-nums">{totalWords}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[11px]">Originality</span>
            <span className="font-bold text-emerald-400 tabular-nums">
              {project.uniquenessScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Monetization & Fact-Check Proof Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Fact-Check & Source Verification
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Monetization Safe</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="font-bold text-slate-300 block">Verified Claims</span>
            <ul className="space-y-1 text-slate-400">
              {project.factCheckNotes.slice(0, 3).map((note, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="font-bold text-slate-300 block">Authoritative Sources</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.sources.map((src, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium"
                >
                  {src}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hook Section (First 3 Seconds) */}
      <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Hook (First 3 Seconds)
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-medium">85%+ Retention Anchor</span>
        </div>
        <p className="text-xs text-slate-400">
          The opening sentence must stop the scroll instantly with curiosity, contrast, or a bold premise.
        </p>
        <textarea
          value={project.hook}
          onChange={(e) => handleUpdateHook(e.target.value)}
          rows={2}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Sequential Scenes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200">Video Scenes ({project.scenes.length})</h2>
          <button
            type="button"
            onClick={handleAddScene}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Scene</span>
          </button>
        </div>

        <div className="space-y-3">
          {project.scenes.map((scene, idx) => (
            <div
              key={scene.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 transition-colors hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{scene.title}</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Scene Duration Input */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-xs">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={scene.durationSeconds}
                      onChange={(e) =>
                        handleUpdateSceneDuration(scene.id, parseInt(e.target.value, 10) || 5)
                      }
                      className="w-8 text-center bg-transparent text-white font-bold focus:outline-none tabular-nums"
                    />
                    <span className="text-slate-500 text-[11px]">sec</span>
                  </div>

                  {project.scenes.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteScene(scene.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete scene"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Character & Voice Emotion Matching Selector */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Emotion & Delivery:
                </span>
                {(
                  [
                    { id: 'intrigued', label: 'Intrigued', color: 'amber', hint: 'Suspense & Hook' },
                    { id: 'explaining', label: 'Explaining', color: 'indigo', hint: 'Clear & Articulate' },
                    { id: 'shocked', label: 'Shocked', color: 'rose', hint: 'High-Impact Reveal' },
                    { id: 'thoughtful', label: 'Thoughtful', color: 'emerald', hint: 'Deep Insight' },
                    { id: 'inspiring', label: 'Inspiring', color: 'yellow', hint: 'Motivational' },
                  ] as const
                ).map((emo) => {
                  const isActive = (scene.emotion || 'explaining') === emo.id;
                  const activeClass =
                    emo.color === 'amber'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                      : emo.color === 'indigo'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/60'
                      : emo.color === 'rose'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                      : emo.color === 'emerald'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/60';

                  return (
                    <button
                      key={emo.id}
                      type="button"
                      onClick={() => handleUpdateSceneEmotion(scene.id, emo.id)}
                      title={`${emo.label}: ${emo.hint}`}
                      className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold border transition-all ${
                        isActive
                          ? `${activeClass} shadow-xs`
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {emo.label}
                    </button>
                  );
                })}
              </div>

              {/* Narration Text Area */}
              <textarea
                value={scene.narrationText}
                onChange={(e) => handleUpdateSceneText(scene.id, e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                placeholder="Narration voiceover spoken in this scene..."
              />

              {/* Visual Prompt Cues */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate pr-2">
                  <strong className="text-slate-300">Visual cue:</strong> {scene.visualPrompt}
                </span>
                <span className="shrink-0 text-indigo-400 font-medium">
                  Keyword: {scene.searchKeywords}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action (CTA) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Call to Action (Ending CTA)
          </span>
          <span className="text-[11px] text-slate-400">Subscribe / Follow Prompt</span>
        </div>
        <textarea
          value={project.callToAction}
          onChange={(e) => handleUpdateCTA(e.target.value)}
          rows={2}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Topic</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-sm font-bold text-white transition-colors shadow-sm"
        >
          <span>Continue to Visuals</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
