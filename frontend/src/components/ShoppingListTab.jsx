import { useState, useEffect } from 'react';
import { Trash2, Share2, ShoppingCart, Check } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export function ShoppingListTab() {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('PRODUCE');
  const [loading, setLoading] = useState(true);

  const CATEGORIES = ['PRODUCE', 'PROTEIN', 'DAIRY', 'GRAINS', 'PANTRY', 'OTHER'];

  const CATEGORY_COLORS = {
    PRODUCE: '#10B981',
    PROTEIN: '#F59E0B',
    DAIRY: '#3B82F6',
    GRAINS: '#8B5CF6',
    PANTRY: '#EF4444',
    OTHER: '#6B7280',
  };

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shopping/list');
      setItems(res.data || []);
    } catch (error) {
      console.error('Failed to load shopping list:', error);
      toast.error('Failed to load shopping list');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!inputValue.trim()) {
      toast.error('Enter an item');
      return;
    }

    try {
      const res = await api.post('/shopping/item', {
        name: inputValue,
        quantity: '',
        category: selectedCategory,
      });
      setItems([...items, res.data]);
      setInputValue('');
      toast.success('Item added');
    } catch (error) {
      console.error('Failed to add item:', error);
      toast.error('Failed to add item');
    }
  };

  const toggleItem = async (id, isChecked) => {
    try {
      await api.put(`/shopping/item/${id}`, { is_checked: !isChecked });
      setItems(items.map(item =>
        item.id === id ? { ...item, is_checked: !isChecked } : item
      ));
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update item');
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/shopping/item/${id}`);
      setItems(items.filter(item => item.id !== id));
      toast.success('Item deleted');
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

  const clearBought = async () => {
    try {
      await api.delete('/shopping/clear-bought');
      setItems(items.filter(item => !item.is_checked));
      toast.success('Bought items cleared');
    } catch (error) {
      console.error('Failed to clear items:', error);
      toast.error('Failed to clear items');
    }
  };

  const shareList = () => {
    const text = items
      .map(item => `${item.is_checked ? '✓' : '○'} ${item.name}${item.quantity ? ` - ${item.quantity}` : ''}`)
      .join('\n');

    const message = `My Shopping List:\n\n${text}`;

    if (navigator.share) {
      navigator.share({
        title: 'My Shopping List',
        text: message,
      }).catch(err => console.log('Share error:', err));
    } else {
      navigator.clipboard.writeText(message);
      toast.success('List copied to clipboard');
    }
  };

  const checkedCount = items.filter(item => item.is_checked).length;
  const isComplete = items.length > 0 && checkedCount === items.length;
  const groupedItems = CATEGORIES.reduce((acc, category) => {
    acc[category] = items.filter(item => item.category === category);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '24px', background: 'white' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShoppingCart style={{ width: '28px', height: '28px', color: '#27AE60' }} />
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#000', margin: 0 }}>
            My Shopping List
          </h2>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearBought}
            style={{
              background: 'none',
              border: 'none',
              color: '#27AE60',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Clear Bought
          </button>
        )}
      </div>

      {/* Progress Card */}
      {items.length > 0 && (
        <div
          style={{
            backgroundColor: 'white',
            border: '3px solid #27AE60',
            borderLeft: '3px solid #27AE60',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {!isComplete ? (
            <>
              <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#000', margin: '0 0 4px 0' }}>
                {items.length - checkedCount} items remaining
              </p>
              <p style={{ fontSize: '12px', color: '#999999', margin: '0 0 12px 0' }}>
                {checkedCount} of {items.length} checked
              </p>
              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#E5E5E5',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#27AE60',
                    width: `${(checkedCount / items.length) * 100}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check style={{ width: '20px', height: '20px', color: '#27AE60' }} />
              <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#27AE60', margin: 0 }}>
                Congratulations! Shopping complete
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Item Form */}
      {items.length > 0 || true ? (
        <div style={{ marginBottom: '24px' }}>
          {/* Input Row */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '12px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="Add an item"
              style={{
                flex: 1,
                padding: '0 16px',
                height: '44px',
                border: '1px solid #E0E0E0',
                borderRadius: '8px 0 0 8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                backgroundColor: 'white',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#27AE60')}
              onBlur={(e) => (e.target.style.borderColor = '#E0E0E0')}
            />
            <button
              onClick={addItem}
              style={{
                padding: '0 20px',
                backgroundColor: '#27AE60',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '0 8px 8px 0',
                fontSize: '14px',
                cursor: 'pointer',
                height: '44px',
              }}
            >
              Add
            </button>
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: selectedCategory === cat ? 'bold' : '500',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  cursor: 'pointer',
                  backgroundColor: selectedCategory === cat ? '#27AE60' : 'white',
                  color: selectedCategory === cat ? 'white' : '#27AE60',
                  border: selectedCategory === cat ? 'none' : '2px solid #27AE60',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Shopping List Items */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
          <ShoppingCart
            style={{
              width: '64px',
              height: '64px',
              color: '#27AE60',
              margin: '0 auto 16px',
              opacity: 0.5,
            }}
          />
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>
            Your shopping list is empty
          </p>
          <p style={{ fontSize: '14px', color: '#999999', marginBottom: '20px' }}>
            Add ingredients from any meal recipe or add items manually
          </p>
          <button
            onClick={() => {
              setInputValue('');
              document.querySelector('input[placeholder="Add an item"]')?.focus();
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#27AE60',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Add your first item
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {CATEGORIES.map(category => {
            const categoryItems = groupedItems[category];
            if (categoryItems.length === 0) return null;

            return (
              <div key={category}>
                {/* Category Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    marginTop: category !== 'PRODUCE' ? '16px' : '0',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: CATEGORY_COLORS[category],
                    }}
                  />
                  <h3
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: '#333333',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      margin: 0,
                      marginRight: '8px',
                    }}
                  >
                    {category}
                  </h3>
                  <div
                    style={{
                      flex: 1,
                      height: '1px',
                      backgroundColor: '#E5E5E5',
                    }}
                  />
                </div>

                {/* Items */}
                {categoryItems.map(item => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItem(item.id, item.is_checked)}
                    onDelete={() => deleteItem(item.id)}
                    categoryColor={CATEGORY_COLORS[category]}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Share Button */}
      {items.length > 0 && (
        <button
          onClick={shareList}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'white',
            border: '2px solid #27AE60',
            color: '#27AE60',
            fontWeight: 'bold',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F8FFF8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <Share2 style={{ width: '18px', height: '18px' }} />
          Share List
        </button>
      )}
    </div>
  );
}

function ShoppingItemRow({ item, onToggle, onDelete, categoryColor }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const isChecked = item.is_checked || false;

  return (
    <div
      style={{
        backgroundColor: isChecked ? '#F8FFF8' : 'white',
        border: 'none',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isDeleting) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          border: isChecked ? 'none' : `2px solid #27AE60`,
          backgroundColor: isChecked ? '#27AE60' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isChecked && <Check style={{ width: '16px', height: '16px', color: 'white' }} />}
      </button>

      {/* Item Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 'bold',
            color: isChecked ? '#27AE60' : '#333333',
            margin: 0,
            textDecoration: isChecked ? 'line-through' : 'none',
          }}
        >
          {item.name}
        </p>
        {item.quantity && (
          <p style={{ fontSize: '12px', color: '#999999', margin: '4px 0 0 0' }}>
            {item.quantity}
          </p>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#EF4444',
          opacity: 0.7,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7';
        }}
      >
        <Trash2 style={{ width: '18px', height: '18px' }} />
      </button>
    </div>
  );
}
