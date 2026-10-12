import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface ScheduledPost {
  id: string;
  topic: string;
  platform: string;
  date: string;
  time: string;
  status: 'Draft' | 'Ready to Render' | 'Scheduled' | 'Published';
}

interface ContentCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic?: string;
  currentPlatform?: string;
}

export const ContentCalendarModal: React.FC<ContentCalendarModalProps> = ({
  isOpen,
  onClose,
  currentTopic,
  currentPlatform,
}) => {
  const [scheduleList, setScheduleList] = useState<ScheduledPost[]>(() => {
    const saved = localStorage.getItem('topic_to_video_schedule');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'post_1',
        topic: 'Why Commercial Airplane Windows Are Never Square',
        platform: 'YouTube Shorts',
        date: '2026-10-13',
        time: '17:00 EST',
        status: 'Scheduled',
      },
      {
        id: 'post_2',
        topic: 'The 2-Minute Dopamine Rule to Defeat Procrastination',
        platform: 'TikTok',
        date: '2026-10-15',
        time: '18:30 EST',
        status: 'Ready to Render',
      },
    ];
  });

  const [newTopicInput, setNewTopicInput] = useState(currentTopic || '');
  const [newPlatformInput, setNewPlatformInput] = useState(currentPlatform || 'YouTube Shorts');
  const [newDateInput, setNewDateInput] = useState('2026-10-16');
  const [newTimeInput, setNewTimeInput] = useState('18:00 EST');

  if (!isOpen) return null;

  const handleAddPost = () => {
    if (!newTopicInput.trim()) return;
    const newPost: ScheduledPost = {
      id: `post_${Date.now()}`,
      topic: newTopicInput.trim(),
      platform: newPlatformInput,
      date: newDateInput,
      time: newTimeInput,
      status: 'Draft',
    };
    const updated = [newPost, ...scheduleList];
    setScheduleList(updated);
    localStorage.setItem('topic_to_video_schedule', JSON.stringify(updated));
    setNewTopicInput('');
  };

  const handleDeletePost = (id: string) => {
    const updated = scheduleList.filter((p) => p.id !== id);
    setScheduleList(updated);
    localStorage.setItem('topic_to_video_schedule', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Content Calendar & Batch Planner</h2>
              <p className="text-xs text-slate-400">
                Plan weekly video drops across YouTube Shorts, TikTok, and Instagram.
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
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* Add Post Form */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="font-bold text-slate-200 block">Schedule a New Video Drop</span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Video topic or working title..."
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newPlatformInput}
                  onChange={(e) => setNewPlatformInput(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  <option value="YouTube Shorts">YouTube Shorts</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram Reels">Instagram Reels</option>
                  <option value="YouTube long-form">YouTube Long</option>
                </select>
                <input
                  type="date"
                  value={newDateInput}
                  onChange={(e) => setNewDateInput(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  value={newTimeInput}
                  onChange={(e) => setNewTimeInput(e.target.value)}
                  placeholder="e.g. 18:00 EST"
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddPost}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Schedule</span>
            </button>
          </div>

          {/* List of Posts */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-300">Upcoming Video Drops ({scheduleList.length})</h3>
            <div className="space-y-2">
              {scheduleList.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white text-xs block">{post.topic}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="text-emerald-400 font-medium">{post.platform}</span>
                      <span>·</span>
                      <span className="tabular-nums">{post.date}</span>
                      <span>·</span>
                      <span className="tabular-nums">{post.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                      {post.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
