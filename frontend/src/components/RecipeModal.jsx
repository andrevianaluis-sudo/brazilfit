import { useState } from 'react';
import { X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const QUOTES = [
  { text: 'Let food be thy medicine and medicine be thy food', author: 'Hippocrates' },
  { text: 'You are what you eat so don\'t be fast cheap easy or fake', author: 'Anonymous' },
  { text: 'Take care of your body it is the only place you have to live', author: 'Jim Rohn' },
  { text: 'Eat to fuel your body not to feed your emotions', author: 'Anonymous' },
  { text: 'The food you eat can be either the safest and most powerful form of medicine or the slowest form of poison', author: 'Ann Wigmore' },
  { text: 'A healthy outside starts from the inside', author: 'Robert Urich' },
  { text: 'Your body is a reflection of your lifestyle', author: 'Anonymous' },
  { text: 'Fuel your body like a champion', author: 'Anonymous' },
];

export function RecipeModal({ meal, isOpen, onClose, onAddToList }) {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [buttonState, setButtonState] = useState('add'); // add, loading, added
  const [addedCount, setAddedCount] = useState(0);

  if (!isOpen || !meal) return null;

  const ingredients = Array.isArray(meal.ingredients) ? meal.ingredients : JSON.parse(meal.ingredients || '[]');
  const method = Array.isArray(meal.method) ? meal.method : JSON.parse(meal.method || '[]');

  const handleAddToList = async () => {
    setButtonState('loading');
    try {
      const res = await api.post(`/shopping/add-meal/${meal.id}`);
      const addedCount = res.data?.added || ingredients.length;
      setAddedCount(addedCount);

      // Show success toast
      toast.custom((t) => (
        <div className="bg-brazil-green text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" />
          <span className="font-medium">Added {addedCount} ingredients to your shopping list</span>
        </div>
      ), { duration: 2000 });

      setButtonState('added');
      setTimeout(() => setButtonState('add'), 2000);
    } catch (error) {
      console.error('Add to shopping list error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to add to shopping list';
      toast.error(errorMsg);
      setButtonState('add');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
      <div className="w-full max-w-4xl md:max-h-[90vh] bg-white rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Column - Recipe Content (65% on desktop, full width on mobile) */}
        <div className="flex-1 md:w-[65%] overflow-y-auto max-h-screen md:max-h-full">
          {/* Close button */}
          <div className="sticky top-0 bg-white px-5 py-3 border-b border-grey-100 flex justify-end md:hidden">
            <button
              onClick={onClose}
              className="p-2 hover:bg-grey-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Quote Card - No Background */}
            <div className="text-center space-y-2">
              <p className="text-5xl text-brazil-green" style={{ fontSize: '3rem', lineHeight: '1' }}>
                "
              </p>
              <p
                className="italic"
                style={{ fontSize: '15px', lineHeight: '1.6', color: '#555555' }}
              >
                {quote.text}
              </p>
              <p className="text-xs" style={{ color: '#888888' }}>
                — {quote.author}
              </p>
            </div>

            {/* Meal Title */}
            <div>
              <h2 className="text-2xl font-black text-black mb-1">{meal.name}</h2>
              {meal.description && (
                <p className="text-sm" style={{ color: '#cccccc' }}>
                  {meal.description}
                </p>
              )}
            </div>

            {/* Nutrition Stats - Borderless Horizontal Row */}
            {(meal.protein || meal.carbs || meal.fat || meal.calories) && (
              <div className="flex items-center justify-between">
                {meal.protein > 0 && (
                  <>
                    <div className="text-center flex-1">
                      <p className="text-xs uppercase tracking-widest font-medium" style={{ color: '#888888' }}>
                        Protein
                      </p>
                      <p className="text-2xl font-black mt-1" style={{ color: "#ffffff" }}">{meal.protein}g</p>
                    </div>
                    <div className="w-px h-12 mx-2" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}" />
                  </>
                )}
                {meal.carbs > 0 && (
                  <>
                    <div className="text-center flex-1">
                      <p className="text-xs uppercase tracking-widest font-medium" style={{ color: '#888888' }}>
                        Carbs
                      </p>
                      <p className="text-2xl font-black mt-1" style={{ color: "#ffffff" }}">{meal.carbs}g</p>
                    </div>
                    <div className="w-px h-12 mx-2" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}" />
                  </>
                )}
                {meal.fat > 0 && (
                  <>
                    <div className="text-center flex-1">
                      <p className="text-xs uppercase tracking-widest font-medium" style={{ color: '#888888' }}>
                        Fat
                      </p>
                      <p className="text-2xl font-black mt-1" style={{ color: "#ffffff" }}">{meal.fat}g</p>
                    </div>
                    <div className="w-px h-12 mx-2" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}" />
                  </>
                )}
                <div className="text-center flex-1">
                  <p className="text-xs uppercase tracking-widest font-medium" style={{ color: '#888888' }}>
                    Calories
                  </p>
                  <p className="text-2xl font-black mt-1" style={{ color: "#ffffff" }}">{meal.calories}</p>
                </div>
              </div>
            )}

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: '#888888' }}>
                  Ingredients
                </p>
                <ul className="space-y-2.5">
                  {ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-3 mt-1.5 flex-shrink-0" style={{ color: '#27AE60' }}>
                        —
                      </span>
                      <span className="text-sm" style={{ color: '#cccccc', fontSize: '14px' }}>
                        {ingredient}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Method */}
            {method.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: '#888888' }}>
                  Method
                </p>
                <ol className="space-y-3">
                  {method.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white mt-0.5"
                        style={{ backgroundColor: '#FF6B2B', minWidth: '24px' }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm pt-0.5" style={{ color: '#cccccc', lineHeight: '1.7' }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Add to Shopping List Button */}
            <button
              onClick={handleAddToList}
              disabled={buttonState === 'loading'}
              className="w-full font-bold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#FF6B2B',
                height: '52px',
                borderRadius: '8px',
              }}
            >
              {buttonState === 'add' && 'Add Ingredients to Shopping List'}
              {buttonState === 'loading' && 'Adding...'}
              {buttonState === 'added' && (
                <>
                  <Check className="w-5 h-5" />
                  Added to List
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Meal Photo (35% on desktop, hidden on mobile) */}
        <div className="hidden md:flex md:w-[35%] relative h-full min-h-[500px] items-start justify-center pt-8 bg-white">
          {meal.photo_url && (
            <img
              src={meal.photo_url}
              alt={meal.name}
              className="object-cover"
              style={{
                width: '280px',
                height: '280px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              onError={(e) => {
                e.target.src = getDefaultPhotoForGoal(meal.goal);
              }}
            />
          )}

          {/* Close button for desktop */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white hover:bg-grey-100 rounded-full transition shadow-lg"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getDefaultPhotoForGoal(goal) {
  const defaults = {
    'muscle-gain': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=150&h=150&fit=crop',
    'weight-loss': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=150&fit=crop',
    'recovery': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=150&h=150&fit=crop',
    'pre-workout': 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=150&h=150&fit=crop',
  };
  return defaults[goal] || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=150&fit=crop';
}
