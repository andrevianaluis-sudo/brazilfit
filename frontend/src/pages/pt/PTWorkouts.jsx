import { useState, useEffect } from 'react';
import { Plus, Dumbbell, BookOpen } from 'lucide-react';
import api from '../../utils/api';
import ExerciseLibrary from '../../components/ExerciseLibrary';
import WorkoutBuilder from '../../components/WorkoutBuilder';

export default function PTWorkouts() {
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'builder'
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      setLoading(true);
      const res = await api.get('/workout-templates');
      setTemplates(res.data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleTemplateCreated() {
    fetchTemplates();
    setShowBuilder(false);
    setSelectedTemplate(null);
  }

  return (
    <div className="min-h-screen bg-grey-300 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-black mb-1">Workouts</h1>
          <p className="text-grey-200 text-sm">Build, manage, and assign workouts to clients</p>
        </div>










      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'library'
              ? 'bg-brazil-green text-white'
              : 'bg-white text-grey-200 hover:bg-grey-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Exercise Library
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'builder'
              ? 'bg-brazil-green text-white'
              : 'bg-white text-grey-200 hover:bg-grey-100'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Workout Builder
        </button>
      </div>

      {/* Content Sections */}
      {activeTab === 'library' ? (
        <ExerciseLibrary />
      ) : (
        <div>
          {/* Templates Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-black mb-4">Saved Templates</h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-grey-200">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center border border-grey-100">
                <Dumbbell className="w-12 h-12 text-grey-100 mx-auto mb-3" />
                <p className="text-grey-200 mb-4">No workout templates yet</p>
                <button
                  onClick={() => setShowBuilder(true)}
                  className="bg-brazil-green text-white px-4 py-2 rounded-lg font-semibold hover:bg-brazil-green-dark"
                >
                  Create First Workout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg p-5 border border-grey-100 hover:shadow-lg transition-all exercise-card-enter workout-template-shimmer"
                  >
                    <h3 className="font-bold text-black mb-2">{template.name}</h3>
                    <p className="text-sm text-grey-200 mb-3">{template.description || 'No description'}</p>
                    <div className="flex items-center gap-2 mb-4 text-xs">
                      <span className="bg-brazil-green/10 text-brazil-green px-2 py-1 rounded">{template.difficulty}</span>
                      <span className="bg-grey-100 text-grey-200 px-2 py-1 rounded">{template.estimated_duration_minutes} min</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowBuilder(true);
                      }}
                      className="w-full bg-brazil-green text-white py-2 rounded-lg font-semibold hover:bg-brazil-green-dark transition-all"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workout Builder Modal/Section */}
          {showBuilder && (
            <WorkoutBuilder
              template={selectedTemplate}
              onClose={() => {
                setShowBuilder(false);
                setSelectedTemplate(null);
              }}
              onSuccess={handleTemplateCreated}
            />
          )}
        </div>
      )}
    </div>
  );
}
