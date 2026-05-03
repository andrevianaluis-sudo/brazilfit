import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Crown, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { RecipeModal } from '../../components/RecipeModal';
import { ShoppingListTab } from '../../components/ShoppingListTab';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG = '#141414';
const SURFACE = '#2a2a2a';
const SURFACE2 = '#333333';
const BORDER = 'rgba(255,255,255,0.15)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFD600';
const GREEN = '#4CAF50';

const CATEGORY_COLORS = {
  'all':         { color: '#b0b0b0', emoji: '🔲' },
  'pre-workout': { color: GREEN,     emoji: '⚡' },
  'hydration':   { color: '#60a5fa', emoji: '💧' },
  'recovery':    { color: '#a78bfa', emoji: '🌙' },
  'weight-loss': { color: ORANGE,    emoji: '🔥' },
  'muscle-gain': { color: '#22d3ee', emoji: '💪' },
  'general':     { color: '#b0b0b0', emoji: '🍃' },
};

const GOAL_COLORS = {
  'muscle-gain': '#22d3ee',
  'weight-loss': ORANGE,
  'recovery':    '#a78bfa',
  'pre-workout': GREEN,
  'energy':      YELLOW,
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

const DEFAULT_PHOTOS = {
  'muscle-gain': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=150&h=150&fit=crop&auto=format',
  'weight-loss': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=150&fit=crop&auto=format',
  'recovery':    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=150&h=150&fit=crop&auto=format',
  'pre-workout': 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=150&h=150&fit=crop&auto=format',
};

// ── Tip Card ─────────────────────────────────────────────────────────────────
function TipCard({ tip, isExpanded, onToggleExpand, isSaved, onToggleSave }) {
  const cat = CATEGORY_COLORS[tip.category] || CATEGORY_COLORS['general'];
  return (
    <div
      onClick={onToggleExpand}
      style={{
        backgroundColor: SURFACE, borderRadius: '12px', padding: '1.25rem',
        cursor: 'pointer', border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${cat.color}`,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.backgroundColor = SURFACE2; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.borderLeftColor = cat.color; e.currentTarget.style.backgroundColor = SURFACE; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
        <span style={{
          backgroundColor: `${cat.color}20`, color: cat.color,
          padding: '3px 10px', borderRadius: '4px',
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>{cat.emoji} {tip.category}</span>
        <button onClick={e => { e.stopPropagation(); onToggleSave(); }} style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '2px', minHeight: 'auto', minWidth: 'auto',
        }}>{isSaved ? '⭐' : '☆'}</button>
      </div>
      <h3 style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>{tip.title}</h3>
      <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.82rem', color: '#b0b0b0', lineHeight: 1.65, margin: '0 0 0.5rem',
        ...(isExpanded ? {} : { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' })
      }}>{tip.content}</p>
      <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.7rem', color: cat.color, fontStyle: 'italic', margin: 0 }}>
        {isExpanded ? 'Tap to collapse' : 'Tap to read more'}
      </p>
    </div>
  );
}

// ── Meal Card ─────────────────────────────────────────────────────────────────
function MealCard({ meal, onFavorite, onRecipe, isPro }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const goalColor = GOAL_COLORS[meal.goal] || '#b0b0b0';
  const photoUrl = meal.photo_url || DEFAULT_PHOTOS[meal.goal] || DEFAULT_PHOTOS['weight-loss'];

  return (
    <div
      onClick={onRecipe}
      style={{
        backgroundColor: SURFACE, borderRadius: '12px', padding: '1rem',
        display: 'flex', alignItems: 'flex-start', gap: '1rem',
        cursor: 'pointer', border: `1px solid ${BORDER}`,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${goalColor}44`; e.currentTarget.style.backgroundColor = SURFACE2; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.backgroundColor = SURFACE; }}
    >
      {/* Image */}
      <div style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, backgroundColor: `${goalColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {photoUrl ? (
          <>
            <img src={photoUrl} alt={meal.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: imageLoaded ? 'block' : 'none' }}
              onLoad={() => setImageLoaded(true)}
              onError={e => { e.target.src = DEFAULT_PHOTOS['weight-loss']; setImageLoaded(true); }} />
            {!imageLoaded && <span style={{ fontSize: '1.75rem', position: 'absolute' }}>{meal.emoji}</span>}
          </>
        ) : (
          <span style={{ fontSize: '1.75rem' }}>{meal.emoji}</span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
          <p style={{ fontFamily: "'Clash Display', system-ui", fontSize: '0.95rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.01em', margin: 0, lineHeight: 1.2 }}>{meal.name}</p>
          {isPro && (
            <button onClick={e => { e.stopPropagation(); onFavorite(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '2px', minHeight: 'auto', minWidth: 'auto' }}>
              <Heart size={16} style={{ color: meal.isFavorite ? '#ef4444' : MUTED, fill: meal.isFavorite ? '#ef4444' : 'none' }} />
            </button>
          )}
        </div>
        <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.78rem', color: MUTED, margin: '0 0 6px', fontWeight: 500 }}>{meal.calories} cal</p>
        {meal.goal && (
          <span style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: goalColor, backgroundColor: `${goalColor}15`, padding: '2px 8px', borderRadius: '3px' }}>
            {meal.goal.replace('-', ' ')}
          </span>
        )}
        {meal.description && (
          <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.78rem', color: '#808080', margin: '6px 0 0', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{meal.description}</p>
        )}
      </div>
    </div>
  );
}

// ── Pro Gate ──────────────────────────────────────────────────────────────────
function ProGate({ count, type, onUpgrade }) {
  return (
    <div style={{ backgroundColor: SURFACE, border: `1px solid rgba(255,214,0,0.2)`, borderRadius: '12px', padding: '2rem', textAlign: 'center', marginTop: '1rem' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,214,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
        <Crown size={20} color={YELLOW} />
      </div>
      <p style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', margin: '0 0 0.4rem' }}>Unlock Full {type} Library</p>
      <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.8rem', color: MUTED, margin: '0 0 1.25rem', lineHeight: 1.6 }}>
        Get access to all {count} {type.toLowerCase()} with BrazilFit Pro
      </p>
      <button onClick={onUpgrade} style={{
        padding: '0.8rem 2rem', background: `linear-gradient(135deg, ${ORANGE}, ${YELLOW})`,
        border: 'none', borderRadius: '8px', color: '#000',
        fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', fontWeight: 800,
        cursor: 'pointer', minHeight: 'auto',
      }}>Upgrade to Pro</button>
    </div>
  );
}

// ── Filter Pills ──────────────────────────────────────────────────────────────
function FilterPills({ options, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '1rem' }}>
      {options.map(opt => {
        const isActive = active === opt.key;
        const col = CATEGORY_COLORS[opt.key]?.color || '#b0b0b0';
        return (
          <button key={opt.key} onClick={() => onChange(opt.key)} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 12px', borderRadius: '6px',
            border: `1px solid ${isActive ? col : BORDER}`,
            backgroundColor: isActive ? `${col}20` : 'transparent',
            color: isActive ? col : MUTED,
            fontFamily: "'Satoshi', system-ui", fontSize: '0.75rem', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s ease', minHeight: 'auto', whiteSpace: 'nowrap',
          }}>
            {CATEGORY_COLORS[opt.key]?.emoji && <span style={{ fontSize: '0.9rem' }}>{CATEGORY_COLORS[opt.key].emoji}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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
      setTips(tipsRes.data); setMeals(mealsRes.data); setTipOfWeek(tipRes.data); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggleFavorite = async (mealId) => {
    if (!user?.isPro) { navigate('/client/upgrade'); return; }
    try {
      const res = await api.post(`/wellness/meals/${mealId}/favorite`);
      setMeals(meals.map(m => m.id === mealId ? { ...m, isFavorite: res.data.favorited } : m));
    } catch { toast.error('Failed to update favourite'); }
  };

  const handleAddToList = async (mealId) => {
    try { await api.post(`/shopping/add-meal/${mealId}`); } catch (error) { throw error; }
  };

  const toggleSaveTip = (tipId) => {
    const newSaved = new Set(savedTips);
    newSaved.has(tipId) ? newSaved.delete(tipId) : newSaved.add(tipId);
    setSavedTips(newSaved);
  };

  const filteredTips = tips.filter(t => categoryFilter === 'all' || t.category === categoryFilter);
  const filteredMeals = mealFilter === 'favourites' ? meals.filter(m => m.isFavorite) : mealFilter === 'all' ? meals : meals.filter(m => m.goal === mealFilter);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', backgroundColor: BG }}>
      <div style={{ width: '20px', height: '20px', border: `2px solid ${ORANGE}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        <BackButton to="/client" />

        {/* Header */}
        <div style={{ margin: '1.25rem 0 1.5rem' }}>
          <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', color: ORANGE, textTransform: 'uppercase', margin: '0 0 0.4rem' }}>Fuel</p>
          <h1 style={{ fontFamily: "'Clash Display', system-ui", fontSize: '2rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', margin: 0 }}>Nutrition</h1>
        </div>

        {/* Tip of the Week */}
        {tipOfWeek && (
          <div style={{
            backgroundColor: SURFACE, borderRadius: '16px', padding: '1.5rem',
            marginBottom: '1.5rem', border: `1px solid ${BORDER}`,
            borderTop: `3px solid ${YELLOW}`, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', fontSize: '3rem', color: `${YELLOW}20`, fontWeight: 900, lineHeight: 1 }}>"</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <span>⭐</span>
              <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', color: YELLOW, textTransform: 'uppercase', margin: 0 }}>Tip of the Week</p>
            </div>
            <span style={{ backgroundColor: `${CATEGORY_COLORS[tipOfWeek.category]?.color || ORANGE}20`, color: CATEGORY_COLORS[tipOfWeek.category]?.color || ORANGE, padding: '3px 10px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {tipOfWeek.category}
            </span>
            <h2 style={{ fontFamily: "'Clash Display', system-ui", fontSize: '1.2rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', margin: '0.6rem 0 0.5rem' }}>{tipOfWeek.title}</h2>
            <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.85rem', color: '#c0c0c0', lineHeight: 1.65, margin: 0 }}>{tipOfWeek.content}</p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.25rem', borderBottom: `1px solid ${BORDER}` }}>
          {['tips', 'meals', 'shopping'].map(tabName => (
            <button key={tabName} onClick={() => setTab(tabName)} style={{
              padding: '0.75rem 1.25rem',
              fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', fontWeight: 600,
              color: tab === tabName ? ORANGE : MUTED,
              borderBottom: `2px solid ${tab === tabName ? ORANGE : 'transparent'}`,
                background: 'none', border: 'none',
              cursor: 'pointer', transition: 'all 0.15s ease', minHeight: 'auto',
              display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize',
            }}>
              {tabName === 'tips' && `Tips (${tips.length})`}
              {tabName === 'meals' && <>{`Meals (${meals.length})`}{!user?.isPro && <Crown size={12} color={YELLOW} />}</>}
              {tabName === 'shopping' && 'Shopping'}
            </button>
          ))}
        </div>

        {/* TIPS TAB */}
        {tab === 'tips' && (
          <>
            {user?.isPro ? (
              <>
                <FilterPills options={CATEGORIES} active={categoryFilter} onChange={setCategoryFilter} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredTips.length === 0 ? (
                    <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', color: MUTED, textAlign: 'center', padding: '2rem 0' }}>No tips in this category</p>
                  ) : filteredTips.map(tip => (
                    <TipCard key={tip.id} tip={tip}
                      isExpanded={expandedTipId === tip.id}
                      onToggleExpand={() => setExpandedTipId(expandedTipId === tip.id ? null : tip.id)}
                      isSaved={savedTips.has(tip.id)}
                      onToggleSave={() => toggleSaveTip(tip.id)} />
                  ))}
                </div>
              </>
            ) : (
              <>
                {tips.slice(0, 1).map(tip => (
                  <TipCard key={tip.id} tip={tip}
                    isExpanded={expandedTipId === tip.id}
                    onToggleExpand={() => setExpandedTipId(expandedTipId === tip.id ? null : tip.id)}
                    isSaved={false} onToggleSave={() => {}} />
                ))}
                <ProGate count={tips.length} type="Tips" onUpgrade={() => navigate('/client/upgrade')} />
              </>
            )}
          </>
        )}

        {/* MEALS TAB */}
        {tab === 'meals' && (
          <>
            {user?.isPro ? (
              <>
                <FilterPills
                  options={[
                    { key: 'all', label: `All (${meals.length})` },
                    { key: 'favourites', label: `❤️ Saved (${meals.filter(m => m.isFavorite).length})` },
                    { key: 'muscle-gain', label: 'Muscle Gain' },
                    { key: 'weight-loss', label: 'Weight Loss' },
                    { key: 'recovery', label: 'Recovery' },
                    { key: 'pre-workout', label: 'Pre-Workout' },
                  ]}
                  active={mealFilter}
                  onChange={setMealFilter}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredMeals.length === 0 ? (
                    <p style={{ fontFamily: "'Satoshi', system-ui", fontSize: '0.875rem', color: MUTED, textAlign: 'center', padding: '2rem 0' }}>No meals here</p>
                  ) : filteredMeals.map(m => (
                    <MealCard key={m.id} meal={m} isPro={user?.isPro}
                      onFavorite={() => toggleFavorite(m.id)}
                      onRecipe={() => { setSelectedMeal(m); setShowRecipeModal(true); }} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {meals.slice(0, 3).map(m => (
                    <MealCard key={m.id} meal={m} isPro={false}
                      onFavorite={() => navigate('/client/upgrade')}
                      onRecipe={() => navigate('/client/upgrade')} />
                  ))}
                </div>
                <ProGate count={meals.length} type="Meals" onUpgrade={() => navigate('/client/upgrade')} />
              </>
            )}
          </>
        )}

        {/* SHOPPING TAB */}
        {tab === 'shopping' && (
          <div style={{ backgroundColor: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <ShoppingListTab />
          </div>
        )}
      </div>

      <RecipeModal meal={selectedMeal} isOpen={showRecipeModal}
        onClose={() => { setShowRecipeModal(false); setSelectedMeal(null); }}
        onAddToList={handleAddToList} />
    </div>
  );
}
