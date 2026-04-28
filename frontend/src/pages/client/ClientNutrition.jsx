import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Star, Crown, Heart } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { RecipeModal } from '../../components/RecipeModal';
import { ShoppingListTab } from '../../components/ShoppingListTab';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const GOAL_COLORS = {
  'muscle-gain': { bg: '#3B82F6', text: 'white' },
  'weight-loss': { bg: '#F97316', text: 'white' },
  'recovery': { bg: '#8B5CF6', text: 'white' },
  'pre-workout': { bg: '#27AE60', text: 'white' },
  'energy': { bg: '#EAB308', text: '#1A1A1A' },
};

const GOAL_GRADIENTS = {
  'muscle-gain': 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
  'weight-loss': 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
  'recovery': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  'pre-workout': 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)',
  'energy': 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)',
};

const DEFAULT_PHOTOS = {
  'muscle-gain': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=150&h=150&fit=crop&auto=format',
  'weight-loss': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=150&fit=crop&auto=format',
  'recovery': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=150&h=150&fit=crop&auto=format',
  'pre-workout': 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=150&h=150&fit=crop&auto=format',
};

const CATEGORY_COLORS = {
  'all': { bg: '#888888', text: 'white', emoji: '🔲' },
  'pre-workout': { bg: '#27AE60', text: 'white', emoji: '⚡' },
  'hydration': { bg: '#3B82F6', text: 'white', emoji: '💧' },
  'recovery': { bg: '#8B5CF6', text: 'white', emoji: '🌙' },
  'weight-loss': { bg: '#F97316', text: 'white', emoji: '🔥' },
  'muscle-gain': { bg: '#06B6D4', text: 'white', emoji: '💪' },
  'general': { bg: '#6B7280', text: 'white', emoji: '🍃' },
};

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'pre-workout', label: 'Pre-Workout' },
  { key: 'hydration', label: 'Hydration' },
  { key: 'recovery', label: 'Recovery' },
  { key: 'weight-loss', label: 'Weight Loss' },
  { key: 'muscle-gain', label: 'Muscle Gain' },
  { key: 'general', label: 'General' },
];

export default function ClientNutrition() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tips, setTips] = useState([]);
  const [meals, setMeals] = useState([]);
  const [tipOfWeek, setTipOfWeek] = useState(null);
  const [tab, setTab] = useState('tips');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [mealFilter, setMealFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [expandedTipId, setExpandedTipId] = useState(null);
  const [savedTips, setSavedTips] = useState(new Set());

  useEffect(() => {
    Promise.all([
      api.get('/wellness/tips'),
      api.get('/wellness/meals'),
      api.get('/wellness/tip-of-week'),
    ]).then(([tipsRes, mealsRes, tipRes]) => {
      setTips(tipsRes.data);
      setMeals(mealsRes.data);
      setTipOfWeek(tipRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleFavorite = async (mealId) => {
    if (!user?.isPro) {
      navigate('/client/upgrade');
      return;
    }
    try {
      const res = await api.post(`/wellness/meals/${mealId}/favorite`);
      setMeals(meals.map(m => m.id === mealId ? { ...m, isFavorite: res.data.favorited } : m));
    } catch {
      toast.error('Failed to update favourite');
    }
  };

  const handleAddToList = async (mealId) => {
    try {
      await api.post(`/shopping/add-meal/${mealId}`);
    } catch (error) {
      throw error;
    }
  };

  const toggleSaveTip = (tipId) => {
    const newSaved = new Set(savedTips);
    if (newSaved.has(tipId)) {
      newSaved.delete(tipId);
    } else {
      newSaved.add(tipId);
    }
    setSavedTips(newSaved);
  };

  const filteredTips = tips.filter(t => categoryFilter === 'all' || t.category === categoryFilter);
  const filteredMeals = mealFilter === 'favourites'
    ? meals.filter(m => m.isFavorite)
    : mealFilter === 'all'
    ? meals
    : meals.filter(m => m.goal === mealFilter);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen px-5 py-6 animate-fade-in">
      <BackButton to="/client/home" />
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000', marginBottom: '24px' }}>Nutrition</h1>

      {/* Featured Tip of Week */}
      {tipOfWeek && (
        <div
          className="mb-8 rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#1A1A2E',
            padding: '32px',
            position: 'relative',
          }}
        >
          {/* Green Quotation Mark */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '24px',
              fontSize: '60px',
              color: '#27AE60',
              fontWeight: 'bold',
              lineHeight: '1',
            }}
          >
            "
          </div>

          <div style={{ marginTop: '20px' }}>
            {/* Category Pill */}
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#27AE60',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                marginBottom: '12px',
              }}
            >
              {tipOfWeek.category?.toUpperCase()}
            </div>

            {/* Title */}
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '12px',
                marginTop: '12px',
              }}
            >
              {tipOfWeek.title}
            </h2>

            {/* Description */}
            <p
              style={{
                color: '#CCCCCC',
                fontSize: '15px',
                lineHeight: '1.7',
                marginBottom: '20px',
              }}
            >
              {tipOfWeek.content}
            </p>

            {/* Bottom Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>⭐</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    color: '#F59E0B',
                    textTransform: 'uppercase',
                  }}
                >
                  Tip of the Week
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#999999' }}>
                Week of {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '24px',
          borderBottom: '1px solid #E5E5E5',
        }}
      >
        {['tips', 'meals', 'shopping'].map(tabName => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: tab === tabName ? '#27AE60' : '#000',
              borderBottom: tab === tabName ? '2px solid #27AE60' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tabName === 'tips' && `Tips (${tips.length})`}
            {tabName === 'meals' && (
              <>
                Meals {!user?.isPro && <Crown className="w-4 h-4 text-brazil-yellow" />}
              </>
            )}
            {tabName === 'shopping' && 'Shopping'}
          </button>
        ))}
      </div>

      {tab === 'tips' && (
        <>
          {user?.isPro ? (
            <>
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px' }}>
                {CATEGORIES.map(c => {
                  const colors = CATEGORY_COLORS[c.key];
                  const isActive = categoryFilter === c.key;
                  return (
                    <button
                      key={c.key}
                      onClick={() => setCategoryFilter(c.key)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: isActive ? 'bold' : '500',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: isActive ? colors.bg : 'white',
                        color: isActive ? colors.text : colors.bg,
                        border: isActive ? 'none' : `2px solid ${colors.bg}`,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{colors.emoji}</span>
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {/* Tips List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredTips.map(tip => (
                  <TipCard
                    key={tip.id}
                    tip={tip}
                    isExpanded={expandedTipId === tip.id}
                    onToggleExpand={() => setExpandedTipId(expandedTipId === tip.id ? null : tip.id)}
                    isSaved={savedTips.has(tip.id)}
                    onToggleSave={() => toggleSaveTip(tip.id)}
                  />
                ))}
                {filteredTips.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#999999', padding: '24px' }}>
                    No tips in this category
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {tips.slice(0, 1).map(tip => (
                <TipCard key={tip.id} tip={tip} isExpanded={expandedTipId === tip.id} onToggleExpand={() => setExpandedTipId(expandedTipId === tip.id ? null : tip.id)} isSaved={false} onToggleSave={() => {}} />
              ))}
              <div
                style={{
                  backgroundColor: 'white',
                  border: '2px dashed #FBBF24',
                  borderRadius: '12px',
                  textAlign: 'center',
                  padding: '32px',
                  marginTop: '24px',
                }}
              >
                <Crown style={{ width: '32px', height: '32px', color: '#FBBF24', margin: '0 auto 16px' }} />
                <p style={{ fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Unlock Full Tips Library</p>
                <p style={{ fontSize: '12px', color: '#999999', marginBottom: '16px' }}>
                  Get access to all {tips.length} tips across 6 categories with BrazilFit Pro
                </p>
                <button
                  onClick={() => navigate('/client/upgrade')}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#FBBF24',
                    color: '#1A1A2E',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Upgrade to Pro
                </button>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'meals' && (
        <>
          {user?.isPro ? (
            <>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px' }}>
                {['all', 'favourites', 'muscle-gain', 'weight-loss', 'recovery', 'pre-workout'].map(f => {
                  let count = meals.length;
                  if (f === 'favourites') {
                    count = meals.filter(m => m.isFavorite).length;
                  } else if (f !== 'all') {
                    count = meals.filter(m => m.goal === f).length;
                  }
                  const colors = CATEGORY_COLORS[f] || CATEGORY_COLORS['general'];
                  const isActive = mealFilter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setMealFilter(f)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: isActive ? 'bold' : '500',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: isActive ? colors.bg : 'white',
                        color: isActive ? colors.text : colors.bg,
                        border: isActive ? 'none' : `2px solid ${colors.bg}`,
                      }}
                    >
                      {f === 'favourites' ? `❤️ Saved ${count}` : f === 'all' ? `All ${meals.length}` : `${f.replace('-', ' ')} ${count}`}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredMeals.map(m => (
                  <MealCard
                    key={m.id}
                    meal={m}
                    onFavorite={() => toggleFavorite(m.id)}
                    onRecipe={() => {
                      setSelectedMeal(m);
                      setShowRecipeModal(true);
                    }}
                    isPro={user?.isPro}
                  />
                ))}
                {filteredMeals.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#999999', padding: '24px' }}>No meals here</p>
                )}
              </div>
            </>
          ) : (
            <>
              {meals.slice(0, 3).map(m => (
                <MealCard
                  key={m.id}
                  meal={m}
                  onFavorite={() => navigate('/client/upgrade')}
                  onRecipe={() => navigate('/client/upgrade')}
                  isPro={false}
                />
              ))}
              <div
                style={{
                  backgroundColor: 'white',
                  border: '2px dashed #FBBF24',
                  borderRadius: '12px',
                  textAlign: 'center',
                  padding: '32px',
                  marginTop: '24px',
                }}
              >
                <Crown style={{ width: '32px', height: '32px', color: '#FBBF24', margin: '0 auto 16px' }} />
                <p style={{ fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Full Meal Ideas Library</p>
                <p style={{ fontSize: '12px', color: '#999999', marginBottom: '16px' }}>
                  Save favourites, filter by goal, and unlock all meals with Pro
                </p>
                <button
                  onClick={() => navigate('/client/upgrade')}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#FBBF24',
                    color: '#1A1A2E',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Upgrade to Pro
                </button>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'shopping' && <ShoppingListTab />}

      {/* Recipe Modal */}
      <RecipeModal
        meal={selectedMeal}
        isOpen={showRecipeModal}
        onClose={() => {
          setShowRecipeModal(false);
          setSelectedMeal(null);
        }}
        onAddToList={handleAddToList}
      />
    </div>
  );
}

function TipCard({ tip, isExpanded, onToggleExpand, isSaved, onToggleSave }) {
  const colors = CATEGORY_COLORS[tip.category] || CATEGORY_COLORS['general'];
  const previewText = tip.content.substring(0, 100) + (tip.content.length > 100 ? '...' : '');

  return (
    <div
      onClick={onToggleExpand}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        borderLeft: `4px solid ${colors.bg}`,
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'inline-block' }}>
          <span
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            {tip.category?.toUpperCase()}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '4px',
          }}
        >
          {isSaved ? '⭐' : '☆'}
        </button>
      </div>

      <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
        {tip.title}
      </h3>

      {!isExpanded ? (
        <>
          <p
            style={{
              fontSize: '14px',
              color: '#555555',
              lineHeight: '1.6',
              marginBottom: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {previewText}
          </p>
          <p style={{ fontSize: '12px', color: '#27AE60', fontStyle: 'italic' }}>
            Tap to read more
          </p>
        </>
      ) : (
        <>
          <p style={{ fontSize: '14px', color: '#555555', lineHeight: '1.6', marginBottom: '8px' }}>
            {tip.content}
          </p>
          <p style={{ fontSize: '12px', color: '#27AE60', fontStyle: 'italic' }}>
            Tap to collapse
          </p>
        </>
      )}
    </div>
  );
}

function MealCard({ meal, onFavorite, onRecipe, isPro }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const goalColors = GOAL_COLORS[meal.goal] || { bg: '#888888', text: 'white' };
  const goalGradient = GOAL_GRADIENTS[meal.goal] || '#888888';
  const defaultPhoto = DEFAULT_PHOTOS[meal.goal] || DEFAULT_PHOTOS['weight-loss'];
  const photoUrl = meal.photo_url || defaultPhoto;

  return (
    <div
      className="bg-white rounded-lg overflow-hidden flex items-start gap-4 p-4 cursor-pointer hover:shadow-md transition"
      onClick={onRecipe}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      <div
        className="w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden"
        style={{ background: imageLoaded ? 'transparent' : goalGradient }}
      >
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt={meal.name}
              className="w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = DEFAULT_PHOTOS[meal.goal] || DEFAULT_PHOTOS['weight-loss'];
                setImageLoaded(true);
              }}
            />
            {!imageLoaded && <span className="absolute text-4xl">{meal.emoji}</span>}
          </>
        ) : (
          <span className="text-4xl">{meal.emoji}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 relative">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-bold text-black text-base" style={{ fontSize: '16px' }}>
            {meal.name}
          </p>
          {isPro && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite();
              }}
              className="flex-shrink-0 p-1"
            >
              <Heart
                className="w-5 h-5 transition-all"
                style={{
                  color: meal.isFavorite ? '#EF4444' : '#CCCCCC',
                  fill: meal.isFavorite ? '#EF4444' : 'none',
                }}
              />
            </button>
          )}
        </div>

        <p style={{ color: '#888888', fontSize: '13px', fontWeight: '500' }}>
          {meal.calories} cal
        </p>

        {meal.goal && (
          <span
            className="text-xs px-2 py-1 rounded-full inline-block mt-1.5 font-medium"
            style={{ backgroundColor: goalColors.bg, color: goalColors.text, fontSize: '12px' }}
          >
            {meal.goal.replace('-', ' ')}
          </span>
        )}

        {meal.description && (
          <p
            className="text-xs mt-2 leading-relaxed"
            style={{ color: '#555555', lineHeight: '1.5' }}
          >
            {meal.description}
          </p>
        )}
      </div>
    </div>
  );
}
