import { useState, useEffect } from 'react';
import { X, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import api from '../utils/api';
import ExercisePickerModal from './ExercisePickerModal';
import toast from 'react-hot-toast';

export default function WorkoutBuilder({ template, onClose, onSuccess }) {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    difficulty: template?.difficulty || 'intermediate',
    estimated_duration_minutes: template?.estimated_duration_minutes || 60,
    assigned_client_id: '',
    scheduled_date: ''
  });
  const [exercises, setExercises] = useState(template?.exercises || []);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [removingExerciseId, setRemovingExerciseId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setClientsLoading(true);
      const res = await api.get('/pt/clients');
      setClients(res.data || []);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setClientsLoading(false);
    }
  }

  function handleAddExercise(exercise) {
    const newExercise = {
      exercise_id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      difficulty: exercise.difficulty,
      sets: 3,
      reps: '10',
      weight_kg: null,
      rest_seconds: 60,
      notes: '',
      sort_order: exercises.length
    };
    setExercises([...exercises, newExercise]);
    setShowExercisePicker(false);
  }

  function handleRemoveExercise(index) {
    const exercise = exercises[index];
    setRemovingExerciseId(index);
    setTimeout(() => {
      setExercises(exercises.filter((_, i) => i !== index));
      setRemovingExerciseId(null);
    }, 300);
  }

  function handleMoveExercise(index, direction) {
    if ((direction === -1 && index === 0) || (direction === 1 && index === exercises.length - 1)) {
      return;
    }

    const newExercises = [...exercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[index + direction];
    newExercises[index + direction] = temp;
    setExercises(newExercises);
  }

  function handleExerciseChange(index, field, value) {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  }

  async function handleSave(asTemplate = false) {
    if (!formData.name.trim()) {
      toast.error('Workout name required');
      return;
    }

    if (exercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }

    if (!asTemplate && !formData.assigned_client_id) {
      toast.error('Select a client to assign workout');
      return;
    }

    if (!asTemplate && !formData.scheduled_date) {
      toast.error('Select a scheduled date');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        difficulty: formData.difficulty,
        estimated_duration_minutes: parseInt(formData.estimated_duration_minutes),
        exercises: exercises.map((ex, i) => ({
          exercise_id: ex.exercise_id,
          sets: parseInt(ex.sets),
          reps: ex.reps,
          weight_kg: ex.weight_kg ? parseFloat(ex.weight_kg) : null,
          rest_seconds: parseInt(ex.rest_seconds),
          notes: ex.notes,
          sort_order: i
        }))
      };

      if (asTemplate) {
        await api.post('/workout-templates', payload);
        toast.success('Template saved successfully!');
      } else {
        payload.client_id = parseInt(formData.assigned_client_id);
        payload.scheduled_date = formData.scheduled_date;
        await api.post('/assigned-workouts', payload);
        toast.success('Workout assigned to client!');
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to save:', err);
      toast.error(err.response?.data?.error || 'Failed to save workout');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl border border-grey-100 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-grey-100">
          <h2 className="text-2xl font-black text-black">Build Workout</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-grey-100 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-grey-200" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Workout Details */}
          <div>
            <h3 className="font-bold text-black mb-3">Workout Details</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Workout name (e.g., Monday Upper Body)"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="input w-full"
              />

              <textarea
                placeholder="Description/notes (optional)"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="input w-full resize-none h-20"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={formData.difficulty}
                  onChange={e => setFormData({...formData, difficulty: e.target.value})}
                  className="input"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                <input
                  type="number"
                  min="15"
                  max="300"
                  value={formData.estimated_duration_minutes}
                  onChange={e => setFormData({...formData, estimated_duration_minutes: e.target.value})}
                  placeholder="Duration (min)"
                  className="input"
                />
              </div>

              <select
                value={formData.assigned_client_id}
                onChange={e => setFormData({...formData, assigned_client_id: e.target.value})}
                className="input w-full"
              >
                <option value="">Assign to Client (optional for template)</option>
                {!clientsLoading && clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>

              {formData.assigned_client_id && (
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={e => setFormData({...formData, scheduled_date: e.target.value})}
                  className="input w-full"
                />
              )}
            </div>
          </div>

          {/* Exercise List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-black">Exercises ({exercises.length})</h3>
              <button
                onClick={() => setShowExercisePicker(true)}
                className="flex items-center gap-1 text-brazil-green font-semibold text-sm hover:underline"
              >
                <Plus className="w-4 h-4" />
                Add Exercise
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="bg-grey-100 rounded-lg p-6 text-center text-grey-200">
                No exercises added yet
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className={`bg-grey-100 rounded-lg p-4 space-y-3 ${
                      removingExerciseId === idx ? 'exercise-list-exit' : 'exercise-list-enter'
                    }`}
                  >
                    {/* Exercise Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-black">{ex.name}</h4>
                        <p className="text-xs text-grey-200">{ex.category}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMoveExercise(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 hover:bg-white rounded disabled:opacity-50"
                        >
                          <ChevronUp className="w-4 h-4 text-grey-200" />
                        </button>
                        <button
                          onClick={() => handleMoveExercise(idx, 1)}
                          disabled={idx === exercises.length - 1}
                          className="p-1 hover:bg-white rounded disabled:opacity-50"
                        >
                          <ChevronDown className="w-4 h-4 text-grey-200" />
                        </button>
                        <button
                          onClick={() => handleRemoveExercise(idx)}
                          className="p-1 hover:bg-white rounded text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Exercise Fields */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-xs text-grey-200 font-semibold">Sets</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={ex.sets}
                          onChange={e => handleExerciseChange(idx, 'sets', e.target.value)}
                          className="input text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-grey-200 font-semibold">Reps</label>
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={e => handleExerciseChange(idx, 'reps', e.target.value)}
                          placeholder="10"
                          className="input text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-grey-200 font-semibold">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={ex.weight_kg || ''}
                          onChange={e => handleExerciseChange(idx, 'weight_kg', e.target.value)}
                          placeholder="ÔÇö"
                          className="input text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-grey-200 font-semibold">Rest (sec)</label>
                        <input
                          type="number"
                          min="0"
                          step="15"
                          value={ex.rest_seconds}
                          onChange={e => handleExerciseChange(idx, 'rest_seconds', e.target.value)}
                          className="input text-sm w-full"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      value={ex.notes}
                      onChange={e => handleExerciseChange(idx, 'notes', e.target.value)}
                      placeholder="Notes (form cues, variations, etc.)"
                      className="input w-full text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-grey-100 p-5 space-y-2">
          {formData.assigned_client_id ? (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className={`w-full bg-brazil-green text-white py-3 rounded-lg font-semibold hover:bg-brazil-green-dark transition-all disabled:opacity-50 ${
                !saving && exercises.length > 0 ? 'assign-pulse-glow' : ''
              }`}
            >
              {saving ? 'Assigning...' : 'Assign to Client'}
            </button>
          ) : null}

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="w-full bg-grey-100 text-black py-3 rounded-lg font-semibold hover:bg-grey-200 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Template'}
          </button>

          <button
            onClick={onClose}
            className="w-full bg-white text-grey-200 py-3 rounded-lg font-semibold border border-grey-100 hover:bg-grey-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <ExercisePickerModal
          onSelect={handleAddExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      )}
    </div>
  );
}
