import { useState, useEffect } from 'react';
import { Trash2, Share2, ShoppingCart, Check, Plus } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const BG = '#141414';
const SURFACE = '#1e1e1e';
const SURFACE2 = '#272727';
const BORDER = 'rgba(255,255,255,0.1)';
const TEXT = '#ffffff';
const MUTED = '#707070';
const ORANGE = '#FF6B2B';
const YELLOW = '#FFD600';
const GREEN = '#4CAF50';

const CATEGORIES = ['PRODUCE', 'PROTEIN', 'DAIRY', 'GRAINS', 'PANTRY', 'OTHER'];

const CATEGORY_CONFIG = {
  PRODUCE: { color: '#4CAF50', emoji: '🥦' },
  PROTEIN: { color: '#FF6B2B', emoji: '🥩' },
  DAIRY:   { color: '#60a5fa', emoji: '🥛' },
  GRAINS:  { color: '#a78bfa', emoji: '🌾' },
  PANTRY:  { color: '#FFD600', emoji: '🫙' },
  OTHER:   { color: '#b0b0b0', emoji: '🛒' },
};

function ShoppingItemRow({ item, onToggle, onDelete }) {
  const isChecked = item.is_checked || false;
  const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG['OTHER'];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '0.875rem 1rem',
      backgroundColor: isChecked ? '#1a1a1a' : SURFACE,
      borderBottom: `1px solid ${BORDER}`,
      transition: 'all 0.15s ease',
      opacity: isChecked ? 0.6 : 1,
    }}>
      {/* Checkbox */}
      <button onClick={onToggle} style={{
        width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
        border: `1px solid ${isChecked ? GREEN : BORDER}`,
        backgroundColor: isChecked ? GREEN : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'auto', minWidth: 'auto', transition: 'all 0.15s ease',
      }}>
        {isChecked && <Check size={13} color="#000" strokeWidth={3} />}
      </button>

      {/* Category dot */}
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cat.color, flexShrink: 0 }} />

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'DM Sans', system-ui", fontSize: '0.9rem', fontWeight: 600,
          color: isChecked ? MUTED : TEXT, margin: 0,
          textDecoration: isChecked ? 'line-through' : 'none',
        }}>{item.name}</p>
        {item.quantity && <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.72rem', color: MUTED, margin: '2px 0 0' }}>{item.quantity}</p>}
      </div>

      {/* Delete */}
      <button onClick={onDelete} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        color: MUTED, display: 'flex', alignItems: 'center', minHeight: 'auto', minWidth: 'auto',
        transition: 'color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = MUTED}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function ShoppingListTab() {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('PRODUCE');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadShoppingList(); }, []);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shopping/list');
      setItems(res.data || []);
    } catch { toast.error('Failed to load shopping list'); setItems([]);
    } finally { setLoading(false); }
  };

  const addItem = async () => {
    if (!inputValue.trim()) { toast.error('Enter an item'); return; }
    try {
      const res = await api.post('/shopping/item', { name: inputValue, quantity: '', category: selectedCategory });
      setItems([...items, res.data]); setInputValue('');
    } catch { toast.error('Failed to add item'); }
  };

  const toggleItem = async (id, isChecked) => {
    try {
      await api.put(`/shopping/item/${id}`, { is_checked: !isChecked });
      setItems(items.map(item => item.id === id ? { ...item, is_checked: !isChecked } : item));
    } catch { toast.error('Failed to update item'); }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/shopping/item/${id}`);
      setItems(items.filter(item => item.id !== id));
    } catch { toast.error('Failed to delete item'); }
  };

  const clearBought = async () => {
    try {
      await api.delete('/shopping/clear-bought');
      setItems(items.filter(item => !item.is_checked));
      toast.success('Bought items cleared');
    } catch { toast.error('Failed to clear items'); }
  };

  const shareList = () => {
    const text = items.map(item => `${item.is_checked ? '✓' : '○'} ${item.name}${item.quantity ? ` - ${item.quantity}` : ''}`).join('\n');
    const message = `My Shopping List:\n\n${text}`;
    if (navigator.share) {
      navigator.share({ title: 'My Shopping List', text: message }).catch(() => {});
    } else {
      navigator.clipboard.writeText(message);
      toast.success('List copied to clipboard');
    }
  };

  const checkedCount = items.filter(item => item.is_checked).length;
  const isComplete = items.length > 0 && checkedCount === items.length;
  const displayItems = activeFilter === 'ALL' ? items : items.filter(item => item.category === activeFilter);
  const groupedItems = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = displayItems.filter(item => item.category === cat);
    return acc;
  }, {});

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div style={{ width: '20px', height: '20px', border: `2px solid ${ORANGE}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ backgroundColor: SURFACE, borderRadius: '12px', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingCart size={18} color={ORANGE} />
          <h2 style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1.1rem', fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', margin: 0 }}>My Shopping List</h2>
        </div>
        {checkedCount > 0 && (
          <button onClick={clearBought} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', system-ui", fontSize: '0.75rem', fontWeight: 600, color: MUTED, minHeight: 'auto', padding: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = MUTED}>
            Clear bought
          </button>
        )}
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${BORDER}` }}>
          {isComplete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={16} color={GREEN} />
              <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.875rem', fontWeight: 700, color: GREEN, margin: 0 }}>Shopping complete! 🎉</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.78rem', color: MUTED, margin: 0 }}>{checkedCount} of {items.length} items checked</p>
                <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.9rem', fontWeight: 700, color: ORANGE, margin: 0 }}>{Math.round((checkedCount/items.length)*100)}%</p>
              </div>
              <div style={{ width: '100%', height: '3px', backgroundColor: SURFACE2, borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${(checkedCount/items.length)*100}%`, background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})`, borderRadius: '2px', transition: 'width 0.3s ease' }} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Add item */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', gap: '0', marginBottom: '0.75rem' }}>
          <input
            type="text" value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && addItem()}
            placeholder="Add an item..."
            style={{
              flex: 1, padding: '0.7rem 1rem', height: '42px',
              border: `1px solid ${BORDER}`, borderRight: 'none',
              borderRadius: '8px 0 0 8px', backgroundColor: SURFACE2,
              color: TEXT, fontFamily: "'DM Sans', system-ui", fontSize: '0.875rem',
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = ORANGE}
            onBlur={e => e.target.style.borderColor = BORDER}
          />
          <button onClick={addItem} style={{
            padding: '0 1.25rem', height: '42px', backgroundColor: ORANGE, color: '#000',
            fontFamily: "'DM Sans', system-ui", fontWeight: 800, fontSize: '0.875rem',
            border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '5px', minHeight: 'auto',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FF8C55'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = ORANGE}>
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {/* ALL tab */}
          <button onClick={() => setActiveFilter('ALL')} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
            padding: '5px 10px', borderRadius: '6px',
            border: `1px solid ${activeFilter === 'ALL' ? '#ffffff' : BORDER}`,
            backgroundColor: activeFilter === 'ALL' ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeFilter === 'ALL' ? '#ffffff' : MUTED,
            fontFamily: "'DM Sans', system-ui", fontSize: '0.7rem', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s ease', minHeight: 'auto', whiteSpace: 'nowrap',
          }}>All</button>
          {CATEGORIES.map(cat => {
            const config = CATEGORY_CONFIG[cat];
            const isActive = activeFilter === cat;
            return (
              <button key={cat} onClick={() => setActiveFilter(isActive ? 'ALL' : cat)} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
                padding: '5px 10px', borderRadius: '6px',
                border: `1px solid ${isActive ? config.color : BORDER}`,
                backgroundColor: isActive ? `${config.color}20` : 'transparent',
                color: isActive ? config.color : MUTED,
                fontFamily: "'DM Sans', system-ui", fontSize: '0.7rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s ease', minHeight: 'auto', whiteSpace: 'nowrap',
              }}>
                <span style={{ fontSize: '0.8rem' }}>{config.emoji}</span>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <ShoppingCart size={36} color={MUTED} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '1.1rem', fontWeight: 700, color: MUTED, letterSpacing: '-0.02em', margin: '0 0 0.4rem' }}>Your list is empty</p>
          <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.82rem', color: MUTED, margin: '0 0 1.25rem', opacity: 0.7 }}>Add ingredients from any meal or add items manually above</p>
        </div>
      ) : (
        <div>
          {CATEGORIES.map(category => {
            const categoryItems = groupedItems[category];
            if (!categoryItems || categoryItems.length === 0) return null;
            const config = CATEGORY_CONFIG[category];
            return (
              <div key={category}>
                {/* Category header */}
                <div style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: `${config.color}08` }}>
                  <span style={{ fontSize: '0.85rem' }}>{config.emoji}</span>
                  <p style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', color: config.color, textTransform: 'uppercase', margin: 0 }}>{category}</p>
                  <span style={{ fontFamily: "'DM Sans', system-ui", fontSize: '0.65rem', color: MUTED, marginLeft: '2px' }}>({categoryItems.length})</span>
                </div>
                {categoryItems.map(item => (
                  <ShoppingItemRow key={item.id} item={item}
                    onToggle={() => toggleItem(item.id, item.is_checked)}
                    onDelete={() => deleteItem(item.id)} />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Share */}
      {items.length > 0 && (
        <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${BORDER}` }}>
          <button onClick={shareList} style={{
            width: '100%', padding: '0.75rem',
            backgroundColor: 'transparent', border: `1px solid ${BORDER}`,
            borderRadius: '8px', color: TEXT,
            fontFamily: "'DM Sans', system-ui", fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', minHeight: 'auto', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ORANGE; e.currentTarget.style.color = ORANGE; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT; }}>
            <Share2 size={15} /> Share List
          </button>
        </div>
      )}
    </div>
  );
}
