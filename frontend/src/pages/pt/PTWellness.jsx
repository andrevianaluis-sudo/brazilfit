import { useState, useEffect } from 'react';
import {
  Plus, Leaf, Droplets, Zap, Weight, Dumbbell, CircleDot, Star, Send,
  Brain, Wind, Heart, Waves, Pencil, Trash2, ChevronDown, ChevronUp, X, Save,
  MessageSquare, Users, Calendar,
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { key: 'pre-workout', label: 'Pre-Workout', icon: Zap, color: 'text-green-400 bg-green-400/20' },
  { key: 'hydration', label: 'Hydration', icon: Droplets, color: 'text-blue-400 bg-blue-400/20' },
  { key: 'recovery', label: 'Recovery', icon: CircleDot, color: 'text-purple-400 bg-purple-400/20' },
  { key: 'weight-loss', label: 'Weight Loss', icon: Weight, color: 'text-orange-400 bg-orange-400/20' },
  { key: 'muscle-gain', label: 'Muscle Gain', icon: Dumbbell, color: 'text-teal-400 bg-teal-400/20' },
  { key: 'general', label: 'General', icon: Leaf, color: 'text-grey-200 bg-grey-100' },
];

const MIND_TYPES = [
  { key: 'mindfulness', label: 'Mindfulness', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { key: 'breathing', label: 'Breathing', icon: Wind, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { key: 'rest_day', label: 'Rest Day', icon: Leaf, color: 'text-green-400', bg: 'bg-green-500/20' },
  { key: 'mental_wellness', label: 'Mental Health', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/20' },
  { key: 'stress', label: 'Stress', icon: Waves, color: 'text-teal-400', bg: 'bg-teal-500/20' },
];

const SUBTYPES = {
  mindfulness: ['pre-workout', 'post-workout', 'morning', 'sleep', 'reset', 'general'],
  breathing: ['pre-workout', 'post-workout', 'recovery', 'energise', 'calm', 'general'],
  rest_day: ['stretching', 'foam-rolling', 'active-recovery', 'yoga', 'general'],
  mental_wellness: ['mindset', 'motivation', 'recovery', 'general'],
  stress: ['pre-competition', 'post-training', 'daily', 'sleep', 'general'],
};

function getCategoryStyle(cat) {
  return CATEGORIES.find(c => c.key === cat) || CATEGORIES[CATEGORIES.length - 1];
}

function getMindTypeInfo(type) {
  return MIND_TYPES.find(t => t.key === type) || MIND_TYPES[0];
}

// ─── Mind Content Form ───────────────────────────────────────────────────────

const EMPTY_MIND_FORM = {
  type: 'mindfulness', subtype: 'general', title: '', description: '',
  duration_minutes: '', difficulty: 'beginner', is_featured: false,
  // Non-breathing content
  stepsText: '',
  // Breathing-specific
  breatheInhale: '4', breatheHoldIn: '4', breatheExhale: '4', breatheHoldOut: '4', breatheRounds: '6', breatheCues: '',
};

function buildContent(form) {
  if (form.type === 'breathing') {
    return JSON.stringify({
      pattern: {
        inhale: parseInt(form.breatheInhale) || 4,
        hold_in: parseInt(form.breatheHoldIn) || 0,
        exhale: parseInt(form.breatheExhale) || 4,
        hold_out: parseInt(form.breatheHoldOut) || 0,
      },
      rounds: parseInt(form.breatheRounds) || 6,
      cues: form.breatheCues.split('\n').map(s => s.trim()).filter(Boolean),
    });
  }
  if (form.type === 'rest_day') {
    const exercises = form.stepsText.split('\n').map(line => {
      const parts = line.split('|').map(s => s.trim());
      return { name: parts[0] || '', duration: parts[1] || '', instruction: parts[2] || '' };
    }).filter(ex => ex.name);
    return JSON.stringify({ exercises });
  }
  if (form.type === 'mental_wellness' || form.type === 'stress') {
    const paras = form.stepsText.split('\n\n').map(s => s.trim()).filter(Boolean);
    return JSON.stringify({ body: paras });
  }
  // mindfulness: simple steps
  const steps = form.stepsText.split('\n').map(s => s.trim()).filter(Boolean);
  return JSON.stringify(steps);
}

function formFromItem(item) {
  let parsed;
  try { parsed = JSON.parse(item.content); } catch { parsed = null; }

  const base = {
    type: item.type, subtype: item.subtype || 'general',
    title: item.title, description: item.description || '',
    duration_minutes: item.duration_minutes || '',
    difficulty: item.difficulty || 'beginner',
    is_featured: !!item.is_featured,
    stepsText: '',
    breatheInhale: '4', breatheHoldIn: '4', breatheExhale: '4', breatheHoldOut: '4',
    breatheRounds: '6', breatheCues: '',
  };

  if (item.type === 'breathing' && parsed?.pattern) {
    return {
      ...base,
      breatheInhale: String(parsed.pattern.inhale || 4),
      breatheHoldIn: String(parsed.pattern.hold_in || 0),
      breatheExhale: String(parsed.pattern.exhale || 4),
      breatheHoldOut: String(parsed.pattern.hold_out || 0),
      breatheRounds: String(parsed.rounds || 6),
      breatheCues: (parsed.cues || []).join('\n'),
    };
  }
  if (item.type === 'rest_day' && parsed?.exercises) {
    return { ...base, stepsText: parsed.exercises.map(ex => `${ex.name} | ${ex.duration || ''} | ${ex.instruction || ''}`).join('\n') };
  }
  if ((item.type === 'mental_wellness' || item.type === 'stress') && parsed?.body) {
    return { ...base, stepsText: parsed.body.join('\n\n') };
  }
  if (Array.isArray(parsed)) {
    return { ...base, stepsText: parsed.join('\n') };
  }
  return base;
}

function MindForm({ form, setForm, onSave, onCancel }) {
  const isBreathing = form.type === 'breathing';
  const isRestDay = form.type === 'rest_day';
  const isArticle = form.type === 'mental_wellness' || form.type === 'stress';

  const subtypes = SUBTYPES[form.type] || ['general'];

  let stepsPlaceholder = 'Enter steps, one per line\n\nExample:\nFind a comfortable position...\nClose your eyes and breathe slowly...\nFocus on your breath...';
  if (isRestDay) stepsPlaceholder = 'One exercise per line: Name | Duration | Instructions\n\nExample:\nHip Flexor Stretch | 45s each side | Step forward into a lunge...';
  if (isArticle) stepsPlaceholder = 'Enter paragraphs separated by blank lines\n\nParagraph one goes here...\n\nParagraph two goes here...';

  const f = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="card-dark border border-brazil-green/20 mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Type</label>
          <select className="input" value={form.type} onChange={e => f('type', e.target.value)}>
            {MIND_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Subtype</label>
          <select className="input" value={form.subtype} onChange={e => f('subtype', e.target.value)}>
            {subtypes.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Title</label>
        <input className="input" value={form.title} onChange={e => f('title', e.target.value)} placeholder="Session title..." />
      </div>

      <div>
        <label className="label">Description</label>
        <input className="input" value={form.description} onChange={e => f('description', e.target.value)} placeholder="Brief summary shown on the card..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {!isArticle && (
          <div>
            <label className="label">Duration (minutes)</label>
            <input type="number" className="input" value={form.duration_minutes} onChange={e => f('duration_minutes', e.target.value)} placeholder="e.g. 5" min="0" />
          </div>
        )}
        <div>
          <label className="label">Difficulty</label>
          <select className="input" value={form.difficulty} onChange={e => f('difficulty', e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {isBreathing ? (
        <>
          <div>
            <label className="label">Breathing Pattern (seconds)</label>
            <div className="grid grid-cols-4 gap-2">
              {[['Inhale', 'breatheInhale'], ['Hold In', 'breatheHoldIn'], ['Exhale', 'breatheExhale'], ['Hold Out', 'breatheHoldOut']].map(([lbl, key]) => (
                <div key={key}>
                  <p className="text-[10px] text-grey-100 mb-1">{lbl}</p>
                  <input type="number" className="input text-center" value={form[key]} onChange={e => f(key, e.target.value)} min="0" max="20" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Number of Rounds</label>
            <input type="number" className="input" value={form.breatheRounds} onChange={e => f('breatheRounds', e.target.value)} min="1" max="30" />
          </div>
          <div>
            <label className="label">Guidance Cues (one per line, optional)</label>
            <textarea className="input resize-none h-24 text-sm" value={form.breatheCues} onChange={e => f('breatheCues', e.target.value)} placeholder="Optional coaching notes shown before the session starts..." />
          </div>
        </>
      ) : (
        <div>
          <label className="label">Content</label>
          <textarea className="input resize-none h-40 text-sm leading-relaxed" value={form.stepsText} onChange={e => f('stepsText', e.target.value)} placeholder={stepsPlaceholder} />
        </div>
      )}

      <div className="flex items-center gap-3">
        <input type="checkbox" id="mind-featured" checked={form.is_featured} onChange={e => f('is_featured', e.target.checked)} />
        <label htmlFor="mind-featured" className="text-sm text-grey-200 cursor-pointer">Mark as Featured</label>
      </div>

      <div className="flex gap-2">
        <button onClick={onSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Save
        </button>
        <button onClick={onCancel} className="btn-secondary px-4"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ─── Mind Content List ────────────────────────────────────────────────────────

function MindContentTab({ mindContent, onReload }) {
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_MIND_FORM);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = filterType === 'all'
    ? mindContent
    : mindContent.filter(c => c.type === filterType);

  const openCreate = () => {
    setForm(EMPTY_MIND_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm(formFromItem(item));
    setEditingId(item.id);
    setShowForm(true);
    setExpandedId(null);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    const payload = {
      type: form.type, subtype: form.subtype, title: form.title,
      description: form.description,
      duration_minutes: parseInt(form.duration_minutes) || 0,
      difficulty: form.difficulty, is_featured: form.is_featured,
      content: buildContent(form),
      is_active: true,
    };
    try {
      if (editingId) {
        await api.put(`/pt/wellness/mind/${editingId}`, payload);
        toast.success('Content updated');
      } else {
        await api.post('/pt/wellness/mind', payload);
        toast.success('Content created');
      }
      setShowForm(false);
      setEditingId(null);
      onReload();
    } catch {
      toast.error('Failed to save content');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this content?')) return;
    try {
      await api.delete(`/pt/wellness/mind/${id}`);
      toast.success('Deleted');
      onReload();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <>
      <button onClick={openCreate} className="btn-primary w-full mb-4 flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Add Wellness Content
      </button>

      {showForm && (
        <MindForm form={form} setForm={setForm} onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 mb-3">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all ${filterType === 'all' ? 'bg-brazil-green text-white' : 'bg-grey-100 text-grey-200'}`}
        >
          All ({mindContent.length})
        </button>
        {MIND_TYPES.map(t => {
          const count = mindContent.filter(c => c.type === t.key).length;
          return (
            <button key={t.key} onClick={() => setFilterType(t.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all ${filterType === t.key ? `${t.bg} ${t.color}` : 'bg-grey-100 text-grey-200'}`}>
              <t.icon className="w-3 h-3" />
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.map(item => {
          const typeInfo = getMindTypeInfo(item.type);
          const Icon = typeInfo.icon;
          const isExpanded = expandedId === item.id;

          return (
            <div key={item.id} className={`card-dark ${item.is_featured ? 'border border-brazil-yellow/30' : ''} ${!item.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg ${typeInfo.bg} flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${typeInfo.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeInfo.bg} ${typeInfo.color}`}>{typeInfo.label}</span>
                        {item.subtype && item.subtype !== 'general' && (
                          <span className="text-[10px] text-grey-100 capitalize">{item.subtype.replace(/-/g, ' ')}</span>
                        )}
                        {item.duration_minutes > 0 && (
                          <span className="text-[10px] text-grey-100">{item.duration_minutes}m</span>
                        )}
                        {item.is_featured ? <span className="badge-yellow text-[10px] flex items-center gap-1"><Star className="w-2.5 h-2.5" />Featured</span> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-grey-100 hover:bg-white/20 transition-all">
                        <Pencil className="w-3.5 h-3.5 text-grey-200" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-grey-100 hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-3.5 h-3.5 text-grey-200 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-xs text-grey-200 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full flex items-center justify-end gap-1 mt-2 text-xs text-grey-100 hover:text-grey-200 transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {isExpanded && item.content && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-[10px] text-grey-100 mb-1">Stored content (JSON):</p>
                  <pre className="text-[10px] text-grey-200 bg-grey-100 p-2 rounded-lg overflow-x-auto max-h-32 leading-relaxed whitespace-pre-wrap break-words">
                    {item.content}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-grey-100 py-8 text-sm">No content yet. Add some above.</p>
        )}
      </div>
    </>
  );
}

// ─── Quotes Tab ──────────────────────────────────────────────────────────────

const EMPTY_QUOTE_FORM = { quote: '', author: 'Your PT', show_date: '', client_id: '' };

function QuotesTab({ ptQuotes, clients, onReload, ptName }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_QUOTE_FORM, author: ptName || 'Your PT' });
  const [editingId, setEditingId] = useState(null);

  const f = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setForm({ ...EMPTY_QUOTE_FORM, author: ptName || 'Your PT' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (q) => {
    setForm({ quote: q.quote, author: q.author, show_date: q.show_date, client_id: q.client_id ? String(q.client_id) : '' });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.quote.trim()) { toast.error('Quote text is required'); return; }
    if (!form.show_date) { toast.error('Show date is required'); return; }
    const payload = {
      quote: form.quote.trim(),
      author: form.author.trim() || 'Your PT',
      show_date: form.show_date,
      client_id: form.client_id ? parseInt(form.client_id) : null,
    };
    try {
      if (editingId) {
        await api.put(`/pt/quotes/${editingId}`, { ...payload, is_active: true });
        toast.success('Quote updated');
      } else {
        await api.post('/pt/quotes', payload);
        toast.success('Quote scheduled!');
      }
      setShowForm(false);
      setEditingId(null);
      onReload();
    } catch { toast.error('Failed to save quote'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheduled quote?')) return;
    try {
      await api.delete(`/pt/quotes/${id}`);
      toast.success('Quote deleted');
      onReload();
    } catch { toast.error('Failed to delete'); }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = ptQuotes.filter(q => q.show_date >= today).sort((a, b) => a.show_date.localeCompare(b.show_date));
  const past = ptQuotes.filter(q => q.show_date < today).sort((a, b) => b.show_date.localeCompare(a.show_date));

  const fmtDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      {/* Intro */}
      <div className="mb-4 p-3 bg-brazil-yellow/10 border border-brazil-yellow/20 rounded-[12px]">
        <p className="text-xs text-brazil-yellow/90 leading-relaxed">
          <strong>Custom quotes override the automatic daily library</strong> on the chosen date.
          Send a personal message to all clients, or target just one person.
        </p>
      </div>

      <button onClick={openCreate} className="btn-primary w-full mb-4 flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Schedule a Quote
      </button>

      {showForm && (
        <div className="card-dark border border-brazil-green/20 mb-5 space-y-3">
          <div>
            <label className="label">Your Quote</label>
            <textarea
              className="input resize-none h-28"
              value={form.quote}
              onChange={e => f('quote', e.target.value)}
              placeholder="Write something powerful and personal for your clients..."
            />
          </div>
          <div>
            <label className="label">Author name</label>
            <input className="input" value={form.author} onChange={e => f('author', e.target.value)} placeholder="Your PT" />
          </div>
          <div>
            <label className="label">Show on date</label>
            <input type="date" className="input" value={form.show_date} onChange={e => f('show_date', e.target.value)} min={today} />
          </div>
          <div>
            <label className="label">Target</label>
            <select className="input" value={form.client_id} onChange={e => f('client_id', e.target.value)}>
              <option value="">All clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-grey-100 mt-1">A client-specific quote overrides the global one for that person.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Schedule Quote'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary px-4"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <p className="text-xs font-semibold text-grey-100 uppercase tracking-wider mb-2">Scheduled ({upcoming.length})</p>
          <div className="space-y-2 mb-5">
            {upcoming.map(q => (
              <QuoteRow key={q.id} q={q} onEdit={openEdit} onDelete={handleDelete} fmtDate={fmtDate} isUpcoming />
            ))}
          </div>
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <p className="text-xs font-semibold text-grey-100 uppercase tracking-wider mb-2">Past ({past.length})</p>
          <div className="space-y-2">
            {past.slice(0, 10).map(q => (
              <QuoteRow key={q.id} q={q} onEdit={openEdit} onDelete={handleDelete} fmtDate={fmtDate} />
            ))}
          </div>
        </>
      )}

      {ptQuotes.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-10 h-10 text-grey-200 mx-auto mb-3" />
          <p className="text-grey-100 text-sm font-medium">No custom quotes scheduled yet</p>
          <p className="text-xs text-grey-100 mt-1">Your clients see the automatic daily library until you add one.</p>
        </div>
      )}
    </>
  );
}

function QuoteRow({ q, onEdit, onDelete, fmtDate, isUpcoming }) {
  return (
    <div
      className={`card-dark border ${isUpcoming ? 'border-brazil-yellow/20' : 'border-white/5 opacity-70'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-[8px] flex-shrink-0 ${isUpcoming ? 'bg-brazil-yellow/15' : 'bg-grey-100'}`}>
          <Calendar className={`w-4 h-4 ${isUpcoming ? 'text-brazil-yellow' : 'text-grey-100'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-xs font-bold ${isUpcoming ? 'text-brazil-yellow' : 'text-grey-100'}`}>{fmtDate(q.show_date)}</p>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => onEdit(q)} className="p-1.5 rounded-lg bg-grey-100 hover:bg-white/20 transition-all">
                <Pencil className="w-3.5 h-3.5 text-grey-200" />
              </button>
              <button onClick={() => onDelete(q.id)} className="p-1.5 rounded-lg bg-grey-100 hover:bg-red-500/20 transition-all">
                <Trash2 className="w-3.5 h-3.5 text-grey-200" />
              </button>
            </div>
          </div>
          <p className="text-sm italic text-black leading-relaxed line-clamp-2">"{q.quote}"</p>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-xs text-grey-100">— {q.author}</p>
            {q.client_name ? (
              <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                <Users className="w-2.5 h-2.5" /> {q.client_name} only
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-grey-100 bg-grey-100 px-2 py-0.5 rounded-full">
                <Users className="w-2.5 h-2.5" /> All clients
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PTWellness() {
  const [tips, setTips] = useState([]);
  const [meals, setMeals] = useState([]);
  const [mindContent, setMindContent] = useState([]);
  const [ptQuotes, setPtQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [ptName, setPtName] = useState('Your PT');
  const [tab, setTab] = useState('tips');
  const [showTipForm, setShowTipForm] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [tipForm, setTipForm] = useState({ category: 'general', title: '', content: '', is_featured: false, featured_week: '' });
  const [mealForm, setMealForm] = useState({ name: '', calories: '', goal: 'muscle-gain', emoji: '🥗', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [tipsRes, mealsRes, mindRes, quotesRes, clientsRes] = await Promise.all([
        api.get('/wellness/tips'),
        api.get('/wellness/meals'),
        api.get('/pt/wellness/mind'),
        api.get('/pt/quotes'),
        api.get('/pt/clients'),
      ]);
      setTips(tipsRes.data);
      setMeals(mealsRes.data);
      setMindContent(mindRes.data);
      setPtQuotes(quotesRes.data);
      const clientList = clientsRes.data || [];
      setClients(clientList);
    } catch {
      toast.error('Failed to load wellness data');
    } finally {
      setLoading(false);
    }
  };

  const saveTip = async () => {
    if (!tipForm.title || !tipForm.content) { toast.error('Title and content required'); return; }
    try {
      await api.post('/pt/wellness/tips', tipForm);
      toast.success('Tip published!');
      setShowTipForm(false);
      setTipForm({ category: 'general', title: '', content: '', is_featured: false, featured_week: '' });
      loadData();
    } catch { toast.error('Failed to publish tip'); }
  };

  const setFeatured = async (tipId) => {
    const weekStart = new Date().toISOString().split('T')[0];
    try {
      await api.post('/pt/wellness/tip-of-week', { tip_id: tipId, week_start: weekStart });
      toast.success('Tip of the week set!');
      loadData();
    } catch { toast.error('Failed to set tip of the week'); }
  };

  const saveMeal = async () => {
    if (!mealForm.name) { toast.error('Meal name required'); return; }
    try {
      await api.post('/pt/wellness/meals', mealForm);
      toast.success('Meal idea added!');
      setShowMealForm(false);
      setMealForm({ name: '', calories: '', goal: 'muscle-gain', emoji: '🥗', description: '' });
      loadData();
    } catch { toast.error('Failed to add meal'); }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const featuredTip = tips.find(t => t.is_featured);

  return (
    <div className="px-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-black mb-1">Wellness Hub</h1>
      <p className="text-grey-200 text-sm mb-4">Manage tips, meals, and mind & wellness content for clients</p>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto hide-scrollbar">
        {[
          { key: 'tips', label: `Tips (${tips.length})` },
          { key: 'meals', label: `Meals (${meals.length})` },
          { key: 'mind', label: `Mind (${mindContent.length})` },
          { key: 'quotes', label: `Quotes (${ptQuotes.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 flex-1 min-w-[80px] py-2.5 rounded-[8px] text-sm font-medium transition-all ${tab === t.key ? 'bg-brazil-green text-white' : 'bg-grey-100 text-grey-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tips Tab ── */}
      {tab === 'tips' && (
        <>
          {featuredTip && (
            <div className="mb-4 card-dark border border-brazil-yellow/30">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-brazil-yellow fill-brazil-yellow" />
                <p className="text-xs font-bold text-brazil-yellow">Current Tip of the Week</p>
              </div>
              <p className="font-semibold text-sm">{featuredTip.title}</p>
              <p className="text-xs text-grey-200 mt-0.5">{getCategoryStyle(featuredTip.category).label}</p>
            </div>
          )}

          <button onClick={() => setShowTipForm(!showTipForm)} className="btn-primary w-full mb-4 flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Publish New Tip
          </button>

          {showTipForm && (
            <div className="card-dark border border-brazil-green/20 mb-4 space-y-3">
              <div>
                <label className="label">Category</label>
                <select value={tipForm.category} onChange={e => setTipForm(f => ({ ...f, category: e.target.value }))} className="input">
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input className="input" value={tipForm.title} onChange={e => setTipForm(f => ({ ...f, title: e.target.value }))} placeholder="Tip title..." />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea className="input resize-none h-28" value={tipForm.content} onChange={e => setTipForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your tip..." />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={tipForm.is_featured} onChange={e => setTipForm(f => ({ ...f, is_featured: e.target.checked }))} />
                <label htmlFor="featured" className="text-sm text-grey-200 cursor-pointer">Set as Tip of the Week</label>
              </div>
              {tipForm.is_featured && (
                <input type="date" className="input text-sm" value={tipForm.featured_week} onChange={e => setTipForm(f => ({ ...f, featured_week: e.target.value }))} />
              )}
              <div className="flex gap-2">
                <button onClick={saveTip} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Publish
                </button>
                <button onClick={() => setShowTipForm(false)} className="btn-secondary px-4">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {tips.map(tip => {
              const cat = getCategoryStyle(tip.category);
              const Icon = cat.icon;
              return (
                <div key={tip.id} className={`card-dark ${tip.is_featured ? 'border border-brazil-yellow/30' : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${cat.color}`}><Icon className="w-3.5 h-3.5" /></div>
                      <div>
                        <p className="font-semibold text-sm">{tip.title}</p>
                        <p className="text-xs text-grey-100">{cat.label}</p>
                      </div>
                    </div>
                    {tip.is_featured ? (
                      <span className="badge-yellow flex items-center gap-1"><Star className="w-3 h-3" />Featured</span>
                    ) : (
                      <button onClick={() => setFeatured(tip.id)} className="text-xs text-grey-100 hover:text-brazil-yellow transition-colors flex items-center gap-1">
                        <Star className="w-3 h-3" /> Set Featured
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-grey-200 leading-relaxed line-clamp-3">{tip.content}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Meals Tab ── */}
      {tab === 'meals' && (
        <>
          <button onClick={() => setShowMealForm(!showMealForm)} className="btn-primary w-full mb-4 flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Add Meal Idea
          </button>

          {showMealForm && (
            <div className="card-dark border border-brazil-green/20 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Emoji</label>
                  <input className="input" value={mealForm.emoji} onChange={e => setMealForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🥗" />
                </div>
                <div>
                  <label className="label">Calories</label>
                  <input type="number" className="input" value={mealForm.calories} onChange={e => setMealForm(f => ({ ...f, calories: e.target.value }))} placeholder="450" />
                </div>
              </div>
              <div>
                <label className="label">Meal Name</label>
                <input className="input" value={mealForm.name} onChange={e => setMealForm(f => ({ ...f, name: e.target.value }))} placeholder="Chicken & Sweet Potato" />
              </div>
              <div>
                <label className="label">Goal</label>
                <select className="input" value={mealForm.goal} onChange={e => setMealForm(f => ({ ...f, goal: e.target.value }))}>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="recovery">Recovery</option>
                  <option value="pre-workout">Pre-Workout</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none h-20" value={mealForm.description} onChange={e => setMealForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." />
              </div>
              <div className="flex gap-2">
                <button onClick={saveMeal} className="btn-primary flex-1">Add Meal</button>
                <button onClick={() => setShowMealForm(false)} className="btn-secondary px-4">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {meals.map(m => (
              <div key={m.id} className="card-dark flex items-center gap-3">
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-grey-200">{m.calories} cal · {m.goal?.replace('-', ' ')}</p>
                </div>
                {m.calories && (
                  <span className="text-xs bg-grey-100 px-2 py-1 rounded-lg text-grey-200">{m.calories} cal</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Mind Tab ── */}
      {tab === 'mind' && (
        <MindContentTab mindContent={mindContent} onReload={loadData} />
      )}

      {/* ── Quotes Tab ── */}
      {tab === 'quotes' && (
        <QuotesTab
          ptQuotes={ptQuotes}
          clients={clients}
          ptName={ptName}
          onReload={loadData}
        />
      )}
    </div>
  );
}
