import React, { useState } from 'react';
import { VideoProject, Scene } from '../types/video';
import { STOCK_MEDIA_LIBRARY, StockMediaAsset } from '../data/royaltyFreeLibrary';
import {
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Search,
  Check,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';

interface Step3VisualsProps {
  project: VideoProject;
  setProject: React.Dispatch<React.SetStateAction<VideoProject | null>>;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Visuals: React.FC<Step3VisualsProps> = ({
  project,
  setProject,
  onNext,
  onBack,
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeSceneToSwap = project.scenes.find((s) => s.id === selectedSceneId);

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
          <h1 className="text-2xl font-extrabold text-white">Visuals & Royalty-Free Footage</h1>
          <p className="text-sm text-slate-400 mt-1">
            Every scene is paired with commercial-safe, properly licensed visual b-roll or motion graphics.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/50 px-3.5 py-2 rounded-xl text-xs text-emerald-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% CC0 Commercial Licensed</span>
        </div>
      </div>

      {/* Scenes Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {project.scenes.map((scene, idx) => {
          const isGenerative = scene.mediaUrl.startsWith('gen:');

          return (
            <div
              key={scene.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all"
            >
              {/* Thumbnail Frame */}
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                {isGenerative ? (
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
                  <img
                    src={scene.mediaUrl}
                    alt={scene.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Scene Number & Emotion Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <div className="px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-sm text-[11px] font-bold text-white border border-slate-800">
                    Scene {idx + 1}
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-indigo-950/90 backdrop-blur-sm text-[10px] font-bold text-indigo-300 border border-indigo-750 capitalize">
                    {scene.emotion || 'explaining'}
                  </div>
                </div>

                {/* Swap Button on Hover */}
                <button
                  type="button"
                  onClick={() => setSelectedSceneId(scene.id)}
                  className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Swap Clip</span>
                </button>
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

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
                  <span>Source: {scene.mediaCredit.source}</span>
                  <span className="text-emerald-400 font-medium">Royalty-Free Safe</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Media Picker Modal */}
      {selectedSceneId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Select Royalty-Free Visual for Scene #{activeSceneToSwap?.sceneNumber}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Search stock footage & high-tech motion canvases with verified commercial license.
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

            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search visual keywords (ai, tech, cosmos, finance, ocean)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {['all', 'tech', 'finance', 'science', 'nature', 'urban', 'abstract'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
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
          <span>Continue to Voice & Audio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
