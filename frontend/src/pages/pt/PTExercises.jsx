import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ExerciseLibrary from '../../components/ExerciseLibrary';
import AddExerciseModal from '../../components/AddExerciseModal';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function PTExercises() {
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async (payload) => {
    try {
      await api.post('/exercises', payload);
      toast.success('Exercise added!');
      setShowAdd(false);
      // Trigger reload in ExerciseLibrary
      window.dispatchEvent(new Event('exerciseLibraryRefresh'));
    } catch {
      toast.error('Failed to save exercise');
    }
  };

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-black">Exercise Library</h1>
          <p className="text-grey-200 mt-2">Strength exercises & stretching GIFs</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-brazil-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-brazil-green/90 transition"
        >
          <Plus className="w-5 h-5" />
          Add Exercise
        </button>
      </div>

      <ExerciseLibrary />

      {showAdd && <AddExerciseModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
