import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Push', 'Pull', 'Legs', 'Core', 'Full Body'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const EQUIPMENT_LIST = ['bodyweight', 'barbell', 'dumbbell', 'cable', 'machine', 'kettlebell'];

export default function AddExerciseModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    category: 'Push',
    muscle_groups: '',
    difficulty: 'beginner',
    equipment: 'bodyweight',
    youtube_video_id: '',
    sets_reps: '3x10',
    instructions: '',
    common_mistakes: '',
    pro_tips: ''
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        muscle_groups: form.muscle_groups.split(',').map(s => s.trim()).filter(Boolean),
        instructions: form.instructions.split('\n').filter(Boolean),
        common_mistakes: form.common_mistakes.split('\n').filter(Boolean),
        pro_tips: form.pro_tips.split('\n').filter(Boolean)
      };
      await onSave(payload);
    } catch {
      toast.error('Failed to save exercise');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-lg bg-white rounded-[12px] border border-grey-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-grey-100 flex-shrink-0">
          <p className="font-bold text-black">Add Exercise</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-grey-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div>
            <label className="text-xs text-grey-200 mb-1 block font-semibold">Exercise Name *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full bg-white border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50"
              placeholder="e.g. Barbell Squat"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-grey-200 mb-1 block font-semibold">Category</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full bg-white border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-grey-200 mb-1 block font-semibold">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={e => set('difficulty', e.target.value)}
                className="w-full bg-white border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none"
              >
                {DIFFICULTIES.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-grey-200 mb-1 block font-semibold">Equipment</label>
              <select
                value={form.equipment}
                onChange={e => set('equipment', e.target.value)}
                className="w-full bg-white border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none"
              >
                {EQUIPMENT_LIST.map(eq => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-grey-200 mb-1 block font-semibold">Default SetsReps</label>
              <input
                value={form.sets_reps}
                onChange={e => set('sets_reps', e.target.value)}
                className="w-full bg-white border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none"
                placeholder="3x10"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-grey-200 mb-1 block font-semibold">Muscle Groups (comma-separated)</label>
            <input
              value={form.muscle_groups}
              onChange={e => set('muscle_groups', e.target.value)}
              className="w-full bg-white border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none"
              placeholder="Chest, Triceps, Shoulders"
            />
          </div>

          <div>
            <label className="text-xs text-grey-200 mb-1 block font-semibold">YouTube Video ID (optional)</label>
            <input
              value={form.youtube_video_id}
              onChange={e => set('youtube_video_id', e.target.value)}
              className="w-full bg-white border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm font-mono focus:outline-none"
              placeholder="e.g. dQw4w9WgXcQ"
            />
          </div>

          <div>
            <label className="text-xs text-grey-200 mb-1 block font-semibold">Instructions (one step per line)</label>
            <textarea
              value={form.instructions}
              onChange={e => set('instructions', e.target.value)}
              rows={4}
              className="w-full bg-white border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none resize-none"
              placeholder="Step 1&#10;Step 2&#10;Step 3"
            />
          </div>

          <div>
            <label className="text-xs text-grey-200 mb-1 block font-semibold">Common Mistakes (one per line)</label>
            <textarea
              value={form.common_mistakes}
              onChange={e => set('common_mistakes', e.target.value)}
              rows={3}
              className="w-full bg-white border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-grey-200 mb-1 block font-semibold">Pro Tips (one per line)</label>
            <textarea
              value={form.pro_tips}
              onChange={e => set('pro_tips', e.target.value)}
              rows={3}
              className="w-full bg-white border border-grey-100 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex border-t border-grey-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 text-sm text-grey-200 hover:text-black hover:bg-grey-100 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3.5 text-sm font-bold text-white bg-brazil-green hover:bg-brazil-green/90 border-l border-grey-100 disabled:opacity-50"
          >
            {saving ? 'Saving' : 'Add Exercise'}
          </button>
        </div>
      </div>
    </div>
  );
}

