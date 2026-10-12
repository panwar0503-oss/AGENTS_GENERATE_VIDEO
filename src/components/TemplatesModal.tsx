import React from 'react';
import { X, FolderOpen, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { VideoProject } from '../types/video';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (project: VideoProject) => void;
  savedProjects: VideoProject[];
  onDeleteProject: (id: string) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onLoadProject,
  savedProjects,
  onDeleteProject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Saved Projects & Templates</h2>
              <p className="text-xs text-slate-400">
                Pick up where you left off or load a previously generated video project.
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
        <div className="p-5 overflow-y-auto space-y-3">
          {savedProjects.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No saved projects yet. Projects are saved automatically as you generate videos!
            </div>
          ) : (
            savedProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="font-bold text-white text-xs block truncate max-w-sm">
                    {proj.title}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-indigo-400">{proj.platform}</span>
                    <span>·</span>
                    <span className="tabular-nums">{proj.duration}</span>
                    <span>·</span>
                    <span>{proj.scenes.length} Scenes</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadProject(proj);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProject(proj.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
