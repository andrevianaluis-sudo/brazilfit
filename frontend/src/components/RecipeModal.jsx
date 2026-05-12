import { useState } from 'react';
import { X, Check, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ORANGE='#FF6B2B';const YELLOW='#FFD600';const GREEN='#4CAF50';const TEXT='#ffffff';const MUTED='#606060';

const MACRO_COLORS = { Protein: '#60a5fa', Carbs: YELLOW, Fat: ORANGE, Calories: GREEN };

export function RecipeModal({ meal, isOpen, onClose, onAddToList }) {
  const [buttonState, setButtonState] = useState('add');

  if (!isOpen || !meal) return null;

  const ingredients = Array.isArray(meal.ingredients) ? meal.ingredients : JSON.parse(meal.ingredients || '[]');
  const method = Array.isArray(meal.method) ? meal.method : JSON.parse(meal.method || '[]');

  const handleAddToList = async () => {
    setButtonState('loading');
    try {
      const res = await api.post(`/shopping/add-meal/${meal.id}`);
      const count = res.data?.added || ingredients.length;
      toast.success(`${count} ingredients added to shopping list`);
      setButtonState('added');
      setTimeout(() => setButtonState('add'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to shopping list');
      setButtonState('add');
    }
  };

  const macros = [
    meal.protein > 0 && { label: 'Protein', value: `${meal.protein}g`, color: MACRO_COLORS.Protein },
    meal.carbs   > 0 && { label: 'Carbs',   value: `${meal.carbs}g`,   color: MACRO_COLORS.Carbs },
    meal.fat     > 0 && { label: 'Fat',      value: `${meal.fat}g`,     color: MACRO_COLORS.Fat },
    meal.calories    && { label: 'Calories', value: `${meal.calories}`, color: MACRO_COLORS.Calories },
  ].filter(Boolean);

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'flex-end', justifyContent:'center', backdropFilter:'blur(4px)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:'520px', background:'#111', borderRadius:'20px 20px 0 0', border:'1px solid rgba(255,255,255,0.08)', borderBottom:'none', maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Handle bar */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0' }}>
          <div style={{ width:'36px', height:'4px', borderRadius:'2px', background:'rgba(255,255,255,0.15)' }}/>
        </div>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'16px 20px 0' }}>
          <div style={{ flex:1, paddingRight:'12px' }}>
            {meal.goal && (
              <span style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:ORANGE, background:'rgba(255,107,43,0.12)', border:'1px solid rgba(255,107,43,0.25)', borderRadius:'20px', padding:'2px 10px', display:'inline-block', marginBottom:'8px' }}>
                {meal.goal.replace('-', ' ')}
              </span>
            )}
            <h2 style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.3rem', fontWeight:800, color:TEXT, letterSpacing:'-0.03em', margin:'0 0 4px', lineHeight:1.2 }}>{meal.name}</h2>
            {meal.description && <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.8rem', color:MUTED, margin:0, lineHeight:1.55 }}>{meal.description}</p>}
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', color:TEXT, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:'10px', minHeight:'auto', minWidth:'auto' }}>
            <X size={15}/>
          </button>
        </div>

        {/* Full width photo */}
        {meal.photo_url && (
          <div style={{ margin:'16px 20px 0', borderRadius:'14px', overflow:'hidden', height:'200px', border:'1px solid rgba(255,255,255,0.08)' }}>
            <img src={meal.photo_url} alt={meal.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.parentElement.style.display='none'}/>
          </div>
        )}

        {/* Scrollable body */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px 0' }}>

          {/* Macros */}
          {macros.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${macros.length},1fr)`, gap:'8px', marginBottom:'20px' }}>
              {macros.map((m,i) => (
                <div key={i} style={{ background:`${m.color}12`, border:`1px solid ${m.color}30`, borderRadius:'12px', padding:'10px 8px', textAlign:'center' }}>
                  <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.55rem', fontWeight:700, letterSpacing:'0.12em', color:m.color, textTransform:'uppercase', margin:'0 0 4px' }}>{m.label}</p>
                  <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'1.1rem', fontWeight:800, color:m.color, margin:0, letterSpacing:'-0.02em' }}>{m.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div style={{ marginBottom:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${GREEN},${GREEN}88)` }}/>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.18em', color:GREEN, textTransform:'uppercase', margin:0 }}>Ingredients</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {ingredients.map((ing, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 12px', background:'rgba(76,175,80,0.05)', borderRadius:'8px', border:'1px solid rgba(76,175,80,0.1)' }}>
                    <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:GREEN, flexShrink:0 }}/>
                    <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', color:'#c0c0c0', margin:0 }}>{ing}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Method */}
          {method.length > 0 && (
            <div style={{ marginBottom:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                <div style={{ width:'3px', height:'14px', borderRadius:'2px', background:`linear-gradient(180deg,${ORANGE},${ORANGE}88)` }}/>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.18em', color:ORANGE, textTransform:'uppercase', margin:0 }}>Method</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {method.map((step, i) => (
                  <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                    <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:`linear-gradient(135deg,${ORANGE},${YELLOW})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'0.65rem', fontWeight:800, color:'#000' }}>{i+1}</div>
                    <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', color:'#c0c0c0', margin:0, lineHeight:1.65, paddingTop:'3px' }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{ padding:'16px 20px 28px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleAddToList} disabled={buttonState==='loading'} style={{
            width:'100%', padding:'0.9rem', borderRadius:'12px', border:'none', cursor:buttonState==='loading'?'not-allowed':'pointer',
            background: buttonState==='added' ? `linear-gradient(135deg,${GREEN},#2d8a30)` : `linear-gradient(135deg,${ORANGE},${YELLOW})`,
            color:'#000', fontFamily:"'DM Sans',system-ui", fontSize:'0.9rem', fontWeight:800,
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
            boxShadow: buttonState==='loading'?'none':`0 4px 20px ${buttonState==='added'?'rgba(76,175,80,0.4)':'rgba(255,107,43,0.4)'}`,
            opacity: buttonState==='loading'?0.6:1, minHeight:'auto', letterSpacing:'0.01em',
            transition:'all 0.2s',
          }}>
            {buttonState==='add'    && <><ShoppingCart size={16}/> Add Ingredients to Shopping List</>}
            {buttonState==='loading'&& 'Adding...'}
            {buttonState==='added'  && <><Check size={16}/> Added to Shopping List ✓</>}
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
    'recovery':    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=150&h=150&fit=crop',
    'pre-workout': 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=150&h=150&fit=crop',
  };
  return defaults[goal] || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=150&fit=crop';
}
