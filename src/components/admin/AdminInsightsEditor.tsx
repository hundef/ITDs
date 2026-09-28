import React, { useState } from 'react';
import { Insight } from '../../types';
import { Plus, Trash2, Edit2, Save, X, Lightbulb } from 'lucide-react';

interface AdminInsightsEditorProps {
  insights: Insight[];
  onInsightsChange: (insights: Insight[]) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
}

export const AdminInsightsEditor: React.FC<AdminInsightsEditorProps> = ({
  insights,
  onInsightsChange,
  onSave,
  isSaving = false
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Insight>>({});

  const handleAddInsight = () => {
    const newInsight: Insight = {
      id: Date.now().toString(),
      title: 'New Insight',
      description: 'Enter insight description',
      icon: 'Lightbulb',
      color: 'indigo-500',
      order: (insights?.length || 0)
    };
    onInsightsChange([...(insights || []), newInsight]);
  };

  const handleEditStart = (insight: Insight) => {
    setEditingId(insight.id || '');
    setEditForm({ ...insight });
  };

  const handleEditSave = () => {
    if (!editingId || !editForm.title || !editForm.description) return;
    
    const updated = (insights || []).map(i =>
      i.id === editingId ? { ...i, ...editForm } : i
    );
    onInsightsChange(updated);
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    const updated = (insights || []).filter(i => i.id !== id);
    onInsightsChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...(insights || [])];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    onInsightsChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === (insights?.length || 0) - 1) return;
    const updated = [...(insights || [])];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onInsightsChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Manage Insights
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add and manage key insights and findings to display on your website
            </p>
          </div>
        </div>
        <button
          onClick={handleAddInsight}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Insight</span>
        </button>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {(insights || []).length > 0 ? (
          (insights || []).map((insight, idx) => (
            <div
              key={insight.id}
              className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden"
            >
              {editingId === insight.id ? (
                // Edit Mode
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Insight Title"
                    value={editForm.title || ''}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <textarea
                    placeholder="Insight Description"
                    value={editForm.description || ''}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-y h-20"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                        Icon
                      </label>
                      <select
                        value={editForm.icon || 'Lightbulb'}
                        onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                      >
                        <option value="Lightbulb">💡 Lightbulb</option>
                        <option value="Zap">⚡ Zap</option>
                        <option value="Cloud">☁️ Cloud</option>
                        <option value="Target">🎯 Target</option>
                        <option value="Brain">🧠 Brain</option>
                        <option value="Sparkles">✨ Sparkles</option>
                        <option value="Rocket">🚀 Rocket</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                        Color
                      </label>
                      <select
                        value={editForm.color || 'indigo-500'}
                        onChange={e => setEditForm({ ...editForm, color: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-hidden"
                      >
                        <option value="indigo-500">Indigo</option>
                        <option value="cyan-500">Cyan</option>
                        <option value="violet-500">Violet</option>
                        <option value="rose-500">Rose</option>
                        <option value="emerald-500">Emerald</option>
                        <option value="amber-500">Amber</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleEditSave}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <span className="text-lg">{['💡', '⚡', '☁️', '🎯', '🧠', '✨', '🚀'][['Lightbulb', 'Zap', 'Cloud', 'Target', 'Brain', 'Sparkles', 'Rocket'].indexOf(insight.icon || 'Lightbulb')] || '💡'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                          {insight.color || 'indigo-500'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-3 shrink-0">
                    {idx > 0 && (
                      <button
                        onClick={() => handleMoveUp(idx)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-xs"
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    {idx < (insights?.length || 0) - 1 && (
                      <button
                        onClick={() => handleMoveDown(idx)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-xs"
                        title="Move down"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => handleEditStart(insight)}
                      className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(insight.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No insights added yet. Click "Add Insight" to get started.</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      {(insights || []).length > 0 && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-xs transition-all"
        >
          {isSaving ? 'Saving Insights...' : 'Save All Insights'}
        </button>
      )}
    </div>
  );
};
