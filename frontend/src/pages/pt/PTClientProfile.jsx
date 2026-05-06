import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, Calendar, CheckCircle, XCircle,
  Edit3, Plus, Save, Ban, AlertTriangle, RotateCcw, X,
  ClipboardList, Activity, FileText, ChevronDown, ChevronUp,
  Download, Bell, User, Heart, Dumbbell, BookOpen, Image, Send,
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { fmtDate, fmtDateWithDay, fmtDateTime, fmtSQLiteDateTime, fmtSQLiteDate, sortNewestFirst, sortOldestFirst, timeAgo } from '../../utils/dateUtils';
import PhotoGallery from '../../components/PhotoGallery';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Override Cancel Modal ─────────────────────────────────────────────────────

function OverrideModal({ session, onConfirm, onClose }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(session.id, note);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-sm bg-dark-grey-100 rounded-[12px] border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-bold">Override Cancellation</p>
                <p className="text-xs text-grey-200">
                  {new Date(session.scheduled_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at {session.scheduled_time}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-grey-100 hover:text-white hover:bg-grey-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-[8px] px-4 py-3 mb-4">
            <p className="text-sm text-orange-400 font-medium mb-1">Session will be carried over</p>
            <p className="text-xs text-grey-200">
              This overrides the 24-hour policy. The session will be cancelled and returned to the client's block, not counted as used.
            </p>
          </div>
          <label className="block text-xs text-grey-200 mb-1.5">Override reason (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Emergency — rescheduling next week"
            className="input resize-none h-20 text-sm w-full"
          />
        </div>
        <div className="flex border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-3.5 text-sm text-grey-200 hover:bg-grey-100 transition-all">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3.5 text-sm font-semibold text-orange-400 hover:bg-orange-500/10 border-l border-white/10 transition-all disabled:opacity-50"
          >
            {loading ? 'Applying…' : 'Approve Override'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function CheckinsTab({ clientId }) {
  const [checkins, setCheckins] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    api.get("/checkins/pt/summary").then(r => {
      const client = r.data.summary?.find(c => c.clientId === parseInt(clientId));
      setCheckins(client?.pastCheckins || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [clientId]);
  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" /></div>;
  if (checkins.length === 0) return <p className="text-center text-grey-100 py-8">No check-ins submitted yet.</p>;
  return (
    <div className="space-y-4">
      {checkins.map((c, i) => (
        <div key={i} className="card-dark border border-white/5 p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <p className="font-semibold text-brazil-green">{c.checkin_week}</p>
            <span className="text-xs text-grey-100">{c.checkin_date}</span>
          </div>
          {(c.motivation_score||c.stress_score) && <div className="flex gap-6 mt-2"><div><p className="text-xs text-grey-200">Motivation</p><p className="text-xl font-bold text-brazil-green">{c.motivation_score}/10</p></div><div><p className="text-xs text-grey-200">Stress</p><p className="text-xl font-bold text-brazil-yellow">{c.stress_score}/10</p></div>{c.overall_mood&&<div><p className="text-xs text-grey-200">Mood</p><p className="text-xl font-bold">{c.overall_mood}</p></div>}</div>}
          {c.workouts_felt&&<div><p className="text-xs text-grey-200 uppercase tracking-wider mb-1">Workouts felt</p><p className="text-sm">{c.workouts_felt}</p></div>}
          {c.insight&&<div><p className="text-xs text-grey-200 uppercase tracking-wider mb-1">Insight</p><p className="text-sm italic opacity-80">{c.insight}</p></div>}
          {c.wins&&<div><p className="text-xs text-grey-200 uppercase tracking-wider mb-1">Wins</p><p className="text-sm text-brazil-green">{c.wins}</p></div>}
          {c.challenges&&<div><p className="text-xs text-grey-200 uppercase tracking-wider mb-1">Challenges</p><p className="text-sm">{c.challenges}</p></div>}
          {c.what_was_challenging&&<div><p className="text-xs text-grey-200 uppercase tracking-wider mb-1">What was challenging</p><p className="text-sm">{c.what_was_challenging}</p></div>}
          {(c.sleep_hours||c.water_glasses||c.daily_steps)&&<div className="flex gap-4 text-xs text-grey-200 mt-2"><span>Sleep: {c.sleep_hours}h</span><span>Water: {c.water_glasses} glasses</span><span>Steps: {c.daily_steps}</span></div>}
        </div>
      ))}
    </div>
  );
}
export default function PTClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [overrideTarget, setOverrideTarget] = useState(null);

  // Onboarding tab state
  const [onboardingData, setOnboardingData] = useState(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  // Assessment tab state
  const [assessments, setAssessments] = useState([]);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({});
  const [assessmentSaving, setAssessmentSaving] = useState(false);
  // Workouts tab state
  const [clientPlans, setClientPlans] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [assigningPlan, setAssigningPlan] = useState(false);

  // Programme tab state
  const [programmeCards, setProgrammeCards] = useState([]);
  const [programmeLoading, setProgrammeLoading] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);
  const [cardForm, setCardForm] = useState({ title: 'Programme Card', card_date: new Date().toISOString().split('T')[0], session_notes: '', activities_away: '', resistance: [], cardio: [], warm_up_pulse: [], warm_up_stretches: [], cool_down_cv: [], cool_down_stretches: [] });
  const [cardSaving, setCardSaving] = useState(false);
  // Messages tab state
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadClient(); }, [id]); // eslint-disable-line

  useEffect(() => {
    if (activeTab === 'onboarding' && !onboardingData) loadOnboarding();
    if (activeTab === 'assessment' && assessments.length === 0) loadAssessments();
    if (activeTab === 'programme' && programmeCards.length === 0) loadProgramme();
    if (activeTab === 'workouts') loadClientPlans();
    if (activeTab === 'messages') {
      loadMessages();
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [activeTab]); // eslint-disable-line

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadOnboarding = async () => {
    setOnboardingLoading(true);
    try {
      const res = await api.get(`/onboarding/data?clientId=${id}`);
      setOnboardingData(res.data);
    } catch { toast.error('Failed to load onboarding data'); }
    finally { setOnboardingLoading(false); }
  };

  const loadAssessments = async () => {
    setAssessmentLoading(true);
    try {
      const res = await api.get(`/onboarding/assessments/${id}`);
      setAssessments(res.data);
    } catch { toast.error('Failed to load assessments'); }
    finally { setAssessmentLoading(false); }
  };

  const loadClientPlans = async () => {
    setPlansLoading(true);
    try {
      const [clientRes, allRes] = await Promise.all([
        api.get(`/workouts/plans?clientId=${id}`),
        api.get('/workouts/plans')
      ]);
      setClientPlans(Array.isArray(clientRes.data) ? clientRes.data : []);
      setAllPlans(Array.isArray(allRes.data) ? allRes.data : []);
    } catch { toast.error('Failed to load workout plans'); }
    finally { setPlansLoading(false); }
  };

  const assignPlan = async (planId) => {
    setAssigningPlan(true);
    try {
      await api.put(`/workouts/plans/${planId}`, { client_id: id });
      toast.success('Plan assigned!');
      loadClientPlans();
    } catch { toast.error('Failed to assign plan'); }
    finally { setAssigningPlan(false); }
  };

  const unassignPlan = async (planId) => {
    try {
      await api.put(`/workouts/plans/${planId}`, { client_id: id });
      toast.success('Plan unassigned');
      loadClientPlans();
    } catch { toast.error('Failed to unassign'); }
  };
  const loadProgramme = async () => {
    setProgrammeLoading(true);
    try {
      const res = await api.get(`/onboarding/programme/${id}`);
      setProgrammeCards(res.data);
    } catch { toast.error('Failed to load programme cards'); }
    finally { setProgrammeLoading(false); }
  };

  const loadMessages = async () => {
    try {
      const res = await api.get(`/messages/pt/client/${id}`);
      setMessages(res.data.messages || []);
      const unread = res.data.messages?.filter(m => m.sender_type === 'client' && !m.is_read).length || 0;
      setUnreadCount(unread);
      setMessagesLoading(false);
    } catch {
      console.error('Failed to load messages');
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    setMessageSending(true);
    try {
      await api.post(`/messages/pt/client/${id}`, { message_text: messageText });
      setMessageText('');
      await loadMessages();
      toast.success('Message sent');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setMessageSending(false);
    }
  };

  const saveAssessment = async () => {
    setAssessmentSaving(true);
    try {
      await api.post(`/onboarding/assessments/${id}`, assessmentForm);
      toast.success('Assessment saved');
      setShowNewAssessment(false);
      setAssessmentForm({});
      loadAssessments();
    } catch { toast.error('Failed to save assessment'); }
    finally { setAssessmentSaving(false); }
  };

  const saveCard = async () => {
    setCardSaving(true);
    try {
      await api.post(`/onboarding/programme/${id}`, cardForm);
      toast.success('Programme card saved');
      setShowNewCard(false);
      setCardForm({ title: 'Programme Card', card_date: new Date().toISOString().split('T')[0], session_notes: '', activities_away: '', resistance: [], cardio: [], warm_up_pulse: [], warm_up_stretches: [], cool_down_cv: [], cool_down_stretches: [] });
      loadProgramme();
    } catch { toast.error('Failed to save card'); }
    finally { setCardSaving(false); }
  };

  const deleteCard = async (cardId) => {
    if (!confirm('Delete this programme card?')) return;
    try {
      await api.delete(`/onboarding/programme/card/${cardId}`);
      setProgrammeCards(c => c.filter(x => x.id !== cardId));
      toast.success('Card deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const sendReminder = async () => {
    try {
      await api.post(`/onboarding/reminder/${id}`);
      toast.success('Reminder sent to client');
    } catch { toast.error('Failed to send reminder'); }
  };

  const loadClient = async () => {
    try {
      const res = await api.get(`/pt/clients/${id}`);
      setClient(res.data);
      const pNote = res.data.notes?.find(n => n.is_progress_note);
      if (pNote) setProgressNote(pNote.content);
    } catch {
      toast.error('Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    try {
      await api.post(`/pt/clients/${id}/notes`, { content: noteText, note_type: 'general' });
      toast.success('Note saved');
      setNoteText('');
      setShowNoteForm(false);
      loadClient();
    } catch {
      toast.error('Failed to save note');
    }
  };

  const saveProgressNote = async () => {
    try {
      await api.post('/wellness/notes', { client_id: parseInt(id), content: progressNote, is_progress_note: true });
      toast.success('Progress note updated');
      loadClient();
    } catch {
      toast.error('Failed to save note');
    }
  };

  const handleOverride = async (sessionId, note) => {
    try {
      await api.post(`/sessions/${sessionId}/override-cancel`, { override_note: note });
      toast.success('Override applied — session carried over.');
      setOverrideTarget(null);
      loadClient();
    } catch {
      toast.error('Failed to apply override');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!client) return (
    <div className="px-4 py-12 text-center text-grey-200">Client not found</div>
  );

  const sessionsRemaining = 10 - client.sessions_used;
  const pct = Math.min(100, (client.sessions_used / 10) * 100);
  const genNotes = client.notes?.filter(n => !n.is_progress_note) || [];
  const latestProgress = client.progress?.[0];

  const upcomingSessions = client.sessions?.filter(s => s.status === 'upcoming') || [];
  const cancelledSessions = client.sessions?.filter(s => s.status === 'cancelled') || [];

  const tabs = ['overview', 'sessions', 'cancellations', 'progress', 'photos', 'notes', 'messages', 'blocks', 'checkins', 'onboarding', 'assessment', 'programme', 'workouts'];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-dark-grey-100 border-b border-white/10 px-4 pt-4 pb-4">
        <button onClick={() => navigate('/pt/clients')} className="flex items-center gap-2 text-grey-200 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Clients
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-[12px] flex items-center justify-center text-2xl font-black flex-shrink-0
            ${client.client_type === 'Online' ? 'bg-blue-500/20 text-blue-400' : 'bg-brazil-green/20 text-brazil-green'}`}>
            {client.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black">{client.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${client.client_type === 'Online' ? 'bg-blue-500/20 text-blue-400' : 'bg-grey-100 text-grey-200'}`}>
                {client.client_type}
              </span>
              {client.is_pro === 1 && <span className="badge-pro">PRO</span>}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-grey-200">
              {client.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{client.email}</span>}
            </div>
            {client.phone && (
              <p className="text-sm text-grey-200 flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5" />{client.phone}
              </p>
            )}
          </div>
        </div>

        {/* Block progress */}
        <div className="mt-4 card-dark p-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs text-grey-200">Block {client.current_block_number} · Started {fmtDate(client.block_start_date)}</p>
              <p className="font-bold">
                <span className="text-brazil-green">{client.sessions_used}</span>
                <span className="text-grey-100"> / 10 sessions</span>
                <span className={`ml-2 text-sm ${sessionsRemaining <= 1 ? 'text-red-400' : sessionsRemaining <= 2 ? 'text-orange-400' : 'text-grey-200'}`}>
                  ({sessionsRemaining} remaining)
                </span>
              </p>
            </div>
            <p className="text-lg font-bold text-brazil-yellow">£{client.block_price}</p>
          </div>
          <div className="bg-grey-100 rounded-full h-2.5">
            <div className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 80 ? 'bg-orange-400' : 'bg-brazil-green'}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Schedule */}
        {client.schedule?.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {client.schedule.map((s, i) => (
              <span key={i} className="text-xs bg-grey-100 text-grey-200 px-2.5 py-1 rounded-lg">
                {DAY_NAMES[s.day_of_week]} {s.session_time}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto hide-scrollbar sticky top-0 bg-black z-10">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-3 text-sm font-medium capitalize whitespace-nowrap transition-all border-b-2 ${activeTab === tab ? 'border-brazil-green text-brazil-green' : 'border-transparent text-grey-200 hover:text-black'}`}
          >
            {tab}
            {tab === 'cancellations' && cancelledSessions.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-white/15 text-grey-200 px-1.5 py-0.5 rounded-full">
                {cancelledSessions.length}
              </span>
            )}
            {tab === 'messages' && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="metric-card text-center">
                <p className="text-2xl font-black text-brazil-green">{client.sessions_used}</p>
                <p className="text-xs text-grey-200">Sessions Done</p>
              </div>
              <div className="metric-card text-center">
                <p className="text-2xl font-black text-brazil-yellow">{sessionsRemaining}</p>
                <p className="text-xs text-grey-200">Remaining</p>
              </div>
              <div className="metric-card text-center">
                <p className="text-2xl font-black">{client.current_block_number}</p>
                <p className="text-xs text-grey-200">Block #</p>
              </div>
            </div>

            {cancelledSessions.length > 0 && (
              <div className="bg-grey-100 border border-white/10 rounded-[8px] px-4 py-3">
                <p className="text-xs font-semibold text-grey-200 mb-1">Cancellations this block</p>
                <p className="text-2xl font-black text-grey-200">{cancelledSessions.length}</p>
                <p className="text-xs text-grey-200 mt-0.5">
                  {cancelledSessions.filter(s => s.session_carried_over).length} carried over · {cancelledSessions.filter(s => s.cancelled_by === 'pt_override').length} PT override
                </p>
              </div>
            )}

            {latestProgress && (
              <div className="card-dark">
                <p className="text-xs text-grey-200 mb-2">Latest Progress</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {latestProgress.weight_kg && <div><span className="text-grey-200">Weight </span><span className="font-bold">{latestProgress.weight_kg}kg</span></div>}
                  {latestProgress.waist_cm && <div><span className="text-grey-200">Waist </span><span className="font-bold">{latestProgress.waist_cm}cm</span></div>}
                </div>
                <p className="text-xs text-grey-100 mt-1">{latestProgress.entry_date}</p>
              </div>
            )}

            <div className="card-dark border border-brazil-green/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-brazil-green">Encouragement Note</p>
                <p className="text-xs text-grey-100">Shown to client</p>
              </div>
              <textarea
                value={progressNote}
                onChange={e => setProgressNote(e.target.value)}
                placeholder="Write an encouraging note for this client..."
                className="input text-sm resize-none h-20 mb-2"
              />
              <button onClick={saveProgressNote} className="btn-primary text-sm py-2 w-full flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Note
              </button>
            </div>
          </div>
        )}

        {/* ── Sessions ── */}
        {activeTab === 'sessions' && (
          <div className="space-y-2">
            {/* Upcoming sessions with override option */}
            {upcomingSessions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-grey-100 uppercase tracking-wider mb-2">Upcoming</p>
                <div className="space-y-2">
                  {upcomingSessions.map(s => {
                    const sessionDt = new Date(`${s.scheduled_date}T${s.scheduled_time}:00`);
                    const hrs = (sessionDt - new Date()) / (1000 * 60 * 60);
                    const isWithin24 = hrs < 24 && hrs > 0;
                    return (
                      <div key={s.id} className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 bg-grey-100 border border-white/10">
                        <div className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{s.scheduled_date} at {s.scheduled_time}</p>
                          <p className="text-xs text-grey-100">
                            {isWithin24
                              ? <span className="text-orange-400">Within 24hrs — client cannot cancel</span>
                              : 'Upcoming'}
                          </p>
                        </div>
                        <button
                          onClick={() => setOverrideTarget(s)}
                          title="Override cancel — carry session over"
                          className="flex items-center gap-1 text-[10px] text-orange-400/70 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/15 px-2 py-1 rounded-lg transition-all"
                        >
                          <RotateCcw className="w-3 h-3" /> Override
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All sessions history */}
            <p className="text-xs font-semibold text-grey-100 uppercase tracking-wider mb-2">History</p>
            {client.sessions?.filter(s => s.status !== 'upcoming').length === 0 ? (
              <p className="text-center text-grey-100 py-8">No session history yet</p>
            ) : client.sessions?.filter(s => s.status !== 'upcoming').map(s => (
              <div key={s.id} className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 ${
                s.status === 'attended' ? 'bg-brazil-green/10 border border-brazil-green/20' :
                s.status === 'missed' ? 'bg-red-500/10 border border-red-500/20' :
                s.status === 'cancelled' ? 'bg-white/3 border border-white/8' :
                'bg-grey-100 border border-white/10'
              }`}>
                {s.status === 'attended' ? <CheckCircle className="w-5 h-5 text-brazil-green flex-shrink-0" /> :
                 s.status === 'missed' ? <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> :
                 s.status === 'cancelled' ? <Ban className="w-5 h-5 text-grey-200 flex-shrink-0" /> :
                 <div className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.scheduled_date} at {s.scheduled_time}</p>
                  {s.status === 'missed' && <p className="text-xs text-red-400">Missed — carried over</p>}
                  {s.status === 'cancelled' && (
                    <p className="text-xs text-grey-200">
                      Cancelled · {s.cancellation_notice_hours != null ? `${Math.floor(s.cancellation_notice_hours)}h notice` : '—'}
                      {s.cancelled_by === 'pt_override' ? ' · PT override' : ''}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.status === 'attended' ? 'bg-brazil-green/20 text-brazil-green' :
                  s.status === 'missed' ? 'bg-red-500/20 text-red-400' :
                  s.status === 'cancelled' ? 'bg-grey-100 text-grey-200' :
                  'bg-grey-100 text-grey-200'
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Cancellations ── */}
        {activeTab === 'cancellations' && (
          <div className="space-y-3">
            {cancelledSessions.length === 0 ? (
              <div className="text-center py-12">
                <Ban className="w-10 h-10 text-grey-200 mx-auto mb-2" />
                <p className="text-grey-100 text-sm">No cancellations</p>
                <p className="text-grey-200 text-xs mt-1">All sessions have been attended or are upcoming</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-grey-100 rounded-[8px] p-2.5 text-center">
                    <p className="text-xl font-black text-grey-200">{cancelledSessions.length}</p>
                    <p className="text-[10px] text-grey-100">Total</p>
                  </div>
                  <div className="bg-brazil-green/8 rounded-[8px] p-2.5 text-center">
                    <p className="text-xl font-black text-brazil-green/70">{cancelledSessions.filter(s => s.session_carried_over).length}</p>
                    <p className="text-[10px] text-grey-100">Carried Over</p>
                  </div>
                  <div className="bg-orange-500/8 rounded-[8px] p-2.5 text-center">
                    <p className="text-xl font-black text-orange-400/70">{cancelledSessions.filter(s => s.cancelled_by === 'pt_override').length}</p>
                    <p className="text-[10px] text-grey-100">PT Override</p>
                  </div>
                </div>

                {cancelledSessions.map(s => {
                  const byPT = s.cancelled_by === 'pt_override';
                  const noticeHours = s.cancellation_notice_hours;
                  const noticeDays = noticeHours != null ? (noticeHours / 24).toFixed(1) : null;
                  return (
                    <div key={s.id} className="card-dark border border-white/8">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-semibold">
                            {new Date(s.scheduled_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            {' '}at {s.scheduled_time}
                          </p>
                          {s.cancelled_at && (
                            <p className="text-xs text-grey-200 mt-0.5">
                              Cancelled {new Date(s.cancelled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at {new Date(s.cancelled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${byPT ? 'bg-orange-500/15 text-orange-400' : 'bg-grey-100 text-grey-100'}`}>
                          {byPT ? 'PT Override' : 'Client'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-grey-100 rounded-lg px-2.5 py-2">
                          <p className="text-grey-100 mb-0.5">Notice given</p>
                          <p className={`font-semibold ${noticeHours != null && noticeHours >= 24 ? 'text-brazil-green' : 'text-orange-400'}`}>
                            {noticeHours != null
                              ? noticeHours >= 48
                                ? `${noticeDays} days`
                                : `${Math.floor(noticeHours)} hours`
                              : '—'}
                          </p>
                        </div>
                        <div className="bg-grey-100 rounded-lg px-2.5 py-2">
                          <p className="text-grey-100 mb-0.5">Session</p>
                          <p className={`font-semibold ${s.session_carried_over ? 'text-brazil-green' : 'text-red-400'}`}>
                            {s.session_carried_over ? 'Carried over' : 'Counted'}
                          </p>
                        </div>
                      </div>

                      {s.pt_override_note && (
                        <div className="mt-2 text-xs text-grey-100 italic bg-white/4 rounded-lg px-2.5 py-2">
                          "{s.pt_override_note}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── Progress ── */}
        {activeTab === 'progress' && (
          <div className="space-y-3">
            {client.progress?.length === 0 ? (
              <p className="text-center text-grey-100 py-8">No progress entries yet</p>
            ) : client.progress?.map(p => (
              <div key={p.id} className="card-dark">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold">{p.entry_date}</p>
                  {p.weight_kg && <p className="font-bold text-brazil-green">{p.weight_kg}kg</p>}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-grey-200">
                  {p.waist_cm && <span>Waist: {p.waist_cm}cm</span>}
                  {p.hips_cm && <span>Hips: {p.hips_cm}cm</span>}
                  {p.chest_cm && <span>Chest: {p.chest_cm}cm</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Photos ── */}
        {activeTab === 'photos' && (
          <div>
            <PhotoGallery clientId={id} />
          </div>
        )}

        {/* ── Notes ── */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Note
            </button>
            {showNoteForm && (
              <div className="card-dark border border-brazil-green/20">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Private note about this client..."
                  className="input resize-none h-24 mb-3"
                />
                <div className="flex gap-2">
                  <button onClick={saveNote} className="btn-primary flex-1 text-sm py-2">Save</button>
                  <button onClick={() => setShowNoteForm(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
                </div>
              </div>
            )}
            {genNotes.length === 0 ? (
              <p className="text-center text-grey-100 py-8">No notes yet</p>
            ) : genNotes.map(n => (
              <div key={n.id} className="card-dark">
                <p className="text-sm text-black leading-relaxed">{n.content}</p>
                <p className="text-xs text-grey-100 mt-2">{n.created_at?.split('T')[0]}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Messages ── */}
        {activeTab === 'messages' && (
          <div className="flex flex-col h-[500px] gap-3">
            {messagesLoading && messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-6 h-6 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Messages list */}
                <div className="flex-1 overflow-y-auto space-y-2 pb-3">
                  {messages.length === 0 ? (
                    <p className="text-center text-grey-100 py-8">No messages yet</p>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'pt' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div style={{
                          maxWidth: '280px',
                          padding: '0.875rem',
                          borderRadius: '0.5rem',
                          backgroundColor: msg.sender_type === 'pt' ? '#1a4a3a' : '#f3f4f6',
                          color: msg.sender_type === 'pt' ? '#ffffff' : '#000000'
                        }}>
                          <p className="text-sm leading-relaxed break-words">{msg.message_text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_type === 'pt'
                              ? 'text-white/70'
                              : 'text-grey-200'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="flex gap-2 border-t border-white/10 pt-3">
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="flex-1 input text-sm resize-none h-12 py-2"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim() || messageSending}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 bg-brazil-green hover:bg-brazil-green/80 disabled:bg-grey-100 disabled:text-grey-200 text-white rounded-lg transition-all text-sm font-semibold"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Blocks ── */}
        {activeTab === 'blocks' && (
          <div className="space-y-3">
            {client.blocks?.length === 0 ? (
              <p className="text-center text-grey-100 py-8">No block history</p>
            ) : client.blocks?.map(b => (
              <div key={b.id} className={`card-dark border ${b.is_current ? 'border-brazil-green/30' : 'border-white/5'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">Block {b.block_number}</p>
                    <p className="text-xs text-grey-200">Started {b.start_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brazil-yellow">£{b.amount_paid}</p>
                    {b.is_current ? <span className="badge-green text-[10px]">Current</span> : <span className="text-xs text-grey-100">Completed</span>}
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-brazil-green">✓ {b.sessions_attended} attended</span>
                  {b.sessions_missed > 0 && <span className="text-red-400">✕ {b.sessions_missed} missed</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Onboarding ── */}
        {activeTab === 'onboarding' && (
          <div className="space-y-4">
            {onboardingLoading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" /></div>
            ) : !onboardingData ? (
              <p className="text-center text-grey-100 py-8">No onboarding data</p>
            ) : (
              <>
                {/* Status cards */}
                <div className="grid grid-cols-5 gap-2">
                  {['Step 1', 'Step 2', 'PAR-Q', 'Consent', 'T&C'].map((label, i) => {
                    const done = onboardingData.status?.[`step${i+1}_complete`];
                    return (
                      <div key={i} className={`rounded-[8px] p-2 text-center border ${done ? 'border-brazil-green/30 bg-brazil-green/10' : 'border-white/10 bg-white/4'}`}>
                        {done ? <CheckCircle className="w-4 h-4 text-brazil-green mx-auto mb-1" /> : <div className="w-4 h-4 rounded-full border-2 border-white/20 mx-auto mb-1" />}
                        <p className="text-[9px] text-grey-200">{label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Incomplete warning */}
                {!onboardingData.status?.completed && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-[8px] px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400 flex-1">Onboarding incomplete</p>
                    <button onClick={sendReminder}
                      className="flex items-center gap-1.5 text-xs bg-grey-100 hover:bg-white/15 text-grey-200 px-3 py-1.5 rounded-lg active:scale-95">
                      <Bell className="w-3 h-3" /> Remind
                    </button>
                  </div>
                )}

                {/* PAR-Q */}
                {onboardingData.parq && (
                  <div className="card-dark">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-grey-200 uppercase">PAR-Q Results</p>
                      {onboardingData.parq.any_yes
                        ? <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">⚠ Medical flag</span>
                        : <span className="text-xs bg-brazil-green/20 text-brazil-green px-2 py-0.5 rounded-full font-semibold">✓ All clear</span>}
                    </div>
                    {['Has heart condition', 'Chest pain during activity', 'Chest pain at rest', 'Dizziness/balance issues', 'Bone/joint problems', 'BP/heart medication', 'Other reason'].map((q, i) => {
                      const ans = onboardingData.parq[`q${i+1}`];
                      return (
                        <div key={i} className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
                          <span className={`text-xs font-bold flex-shrink-0 ${ans ? 'text-red-400' : 'text-brazil-green'}`}>{ans ? 'YES' : 'NO'}</span>
                          <p className="text-xs text-grey-200">{q}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Personal details */}
                {onboardingData.personal && (
                  <div className="card-dark">
                    <p className="text-xs font-bold text-grey-200 uppercase mb-3">Personal Details</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {[
                        ['Full Name', onboardingData.personal.full_name],
                        ['Date of Birth', onboardingData.personal.dob],
                        ['Gender', onboardingData.personal.gender],
                        ['Phone', onboardingData.personal.phone],
                        ['Occupation', onboardingData.personal.occupation],
                        ['Address', onboardingData.personal.address],
                      ].map(([l, v]) => v ? (
                        <div key={l}>
                          <p className="text-[10px] text-grey-100">{l}</p>
                          <p className="text-black">{v}</p>
                        </div>
                      ) : null)}
                    </div>
                    {(onboardingData.personal.emergency_contact_name) && (
                      <div className="mt-3 pt-3 border-t border-white/8">
                        <p className="text-[10px] text-grey-100 mb-1">Emergency Contact</p>
                        <p className="text-sm">{onboardingData.personal.emergency_contact_name} · {onboardingData.personal.emergency_contact_phone}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Lifestyle & Goals */}
                {onboardingData.lifestyle && (
                  <div className="card-dark">
                    <p className="text-xs font-bold text-grey-200 uppercase mb-3">Lifestyle & Goals</p>
                    {[
                      ['Lifestyle', onboardingData.lifestyle.lifestyle_description],
                      ['Motivation', onboardingData.lifestyle.motivation],
                      ['Exercise Likes', onboardingData.lifestyle.exercise_likes],
                      ['Exercise Dislikes', onboardingData.lifestyle.exercise_dislikes],
                      ['FITT — Frequency', onboardingData.lifestyle.fitt_frequency],
                      ['FITT — Intensity', onboardingData.lifestyle.fitt_intensity],
                      ['FITT — Type', onboardingData.lifestyle.fitt_type],
                      ['FITT — Time', onboardingData.lifestyle.fitt_time],
                      ['Barriers', onboardingData.lifestyle.barriers],
                      ['Strategies', onboardingData.lifestyle.barriers_strategies],
                      ['Short-term Goal', onboardingData.lifestyle.goal_short],
                      ['Medium-term Goal', onboardingData.lifestyle.goal_medium],
                      ['Long-term Goal', onboardingData.lifestyle.goal_long],
                      ['Nutrition Notes', onboardingData.lifestyle.nutrition_notes],
                    ].map(([l, v]) => v ? (
                      <div key={l} className="mb-3">
                        <p className="text-[10px] text-grey-100 mb-0.5">{l}</p>
                        <p className="text-xs text-black leading-relaxed">{v}</p>
                      </div>
                    ) : null)}
                    {onboardingData.lifestyle.smokes && (
                      <p className="text-xs text-grey-200">🚬 Smokes: {onboardingData.lifestyle.cigarettes_per_day || '?'} per day</p>
                    )}
                    {onboardingData.lifestyle.drinks_alcohol && (
                      <p className="text-xs text-grey-200 mt-1">🍷 Alcohol: {onboardingData.lifestyle.alcohol_units_per_week || '?'} units/week</p>
                    )}
                  </div>
                )}

                {/* PDF Downloads */}
                {onboardingData.status?.completed && (
                  <div className="card-dark">
                    <p className="text-xs font-bold text-grey-200 uppercase mb-3">Signed Documents</p>
                    <div className="flex gap-3">
                      {onboardingData.status.pdf_parq_consent && (
                        <a href={`/api/onboarding/pdf/${id}/parq`}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] bg-grey-100 hover:bg-white/12 text-sm font-medium transition-all active:scale-95">
                          <Download className="w-4 h-4 text-brazil-green" /> PAR-Q & Consent
                        </a>
                      )}
                      {onboardingData.status.pdf_tc && (
                        <a href={`/api/onboarding/pdf/${id}/tc`}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] bg-grey-100 hover:bg-white/12 text-sm font-medium transition-all active:scale-95">
                          <Download className="w-4 h-4 text-brazil-yellow" /> Terms & Conditions
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Assessment ── */}
        {activeTab === 'assessment' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-grey-200">{assessments.length} assessment{assessments.length !== 1 ? 's' : ''}</p>
              <button onClick={() => setShowNewAssessment(!showNewAssessment)}
                className="flex items-center gap-1.5 bg-brazil-green text-white text-xs font-semibold px-3 py-2 rounded-[8px] active:scale-95">
                <Plus className="w-3.5 h-3.5" /> New Assessment
              </button>
            </div>

            {showNewAssessment && (
              <div className="card-dark space-y-4">
                <p className="font-bold text-sm">New Fitness Assessment</p>
                <div>
                  <label className="text-xs text-grey-100 mb-1 block">Assessment Date</label>
                  <input type="date" value={assessmentForm.assessment_date || new Date().toISOString().split('T')[0]}
                    onChange={e => setAssessmentForm(f => ({ ...f, assessment_date: e.target.value }))}
                    className="w-full bg-grey-100 border border-white/10 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50" />
                </div>
                <AssessSection title="Static Measurements">
                  <AssessGrid form={assessmentForm} setForm={setAssessmentForm} fields={[
                    ['resting_hr', 'Resting HR (bpm)', 'number'],
                    ['height_cm', 'Height (cm)', 'number'],
                    ['weight_kg', 'Weight (kg)', 'number'],
                    ['bmi', 'BMI', 'number'],
                  ]} />
                </AssessSection>
                <AssessSection title="Circumference Measurements (cm)">
                  <AssessGrid form={assessmentForm} setForm={setAssessmentForm} fields={[
                    ['bicep_cm', 'Bicep', 'number'],
                    ['chest_cm', 'Chest', 'number'],
                    ['waist_cm', 'Waist', 'number'],
                    ['hip_cm', 'Hip', 'number'],
                    ['upper_leg_cm', 'Upper Leg', 'number'],
                    ['lower_leg_cm', 'Lower Leg', 'number'],
                    ['waist_hip_ratio', 'Waist:Hip Ratio', 'number'],
                  ]} />
                </AssessSection>
                <AssessSection title="Skinfold Measurements (mm)">
                  <AssessGrid form={assessmentForm} setForm={setAssessmentForm} fields={[
                    ['sf_triceps', 'Triceps', 'number'],
                    ['sf_biceps', 'Biceps', 'number'],
                    ['sf_subscapula', 'Sub-scapula', 'number'],
                    ['sf_suprailiac', 'Suprailiac', 'number'],
                    ['sf_total', 'Total', 'number'],
                    ['body_fat_pct', 'Body Fat %', 'number'],
                  ]} />
                </AssessSection>
                <AssessSection title="Blood Pressure">
                  <AssessGrid form={assessmentForm} setForm={setAssessmentForm} fields={[
                    ['bp_systolic', 'Systolic 1', 'number'],
                    ['bp_diastolic', 'Diastolic 1', 'number'],
                    ['bp_avg_systolic', 'Avg Systolic', 'number'],
                    ['bp_avg_diastolic', 'Avg Diastolic', 'number'],
                  ]} />
                  <AssessField label="Classification" field="bp_classification" form={assessmentForm} setForm={setAssessmentForm} placeholder="e.g. Normal, Stage 1 Hypertension" />
                </AssessSection>
                <AssessSection title="Peak Flow & Flexibility">
                  <AssessGrid form={assessmentForm} setForm={setAssessmentForm} fields={[
                    ['peak_flow', 'Peak Flow (L/min)', 'number'],
                    ['flex_sit_reach', 'Sit & Reach (cm)', 'number'],
                  ]} />
                  {[
                    ['flex_hamstrings','Hamstrings'],['flex_quads','Quadriceps'],
                    ['flex_iliopsoas','Iliopsoas'],['flex_adductors','Adductors'],
                    ['flex_pectorals','Pectorals'],['flex_gastroc','Gastrocnemius'],
                  ].map(([f, l]) => (
                    <AssessField key={f} label={l} field={f} form={assessmentForm} setForm={setAssessmentForm} placeholder="Good / Average / Poor" />
                  ))}
                </AssessSection>
                <AssessSection title="Cardiovascular Tests">
                  <AssessGrid form={assessmentForm} setForm={setAssessmentForm} fields={[
                    ['cv_step_test_hr', "Queen's Step Test HR", 'number'],
                    ['cv_step_test_vo2', "VO₂ Max (ml/kg/min)", 'number'],
                    ['cv_cooper_time', 'Cooper 1.5mi Run (min)', 'number'],
                  ]} />
                  <AssessField label="Bleep Test Level" field="cv_bleep_level" form={assessmentForm} setForm={setAssessmentForm} placeholder="e.g. Level 8.5" />
                </AssessSection>
                <AssessSection title="Muscular Endurance Tests">
                  <AssessGrid form={assessmentForm} setForm={setAssessmentForm} fields={[
                    ['me_curl_ups', 'Abdominal Curl Ups', 'number'],
                    ['me_sit_ups', 'Full Sit Ups', 'number'],
                    ['me_push_ups', 'Push Ups', 'number'],
                    ['me_plank_secs', 'Plank Hold (secs)', 'number'],
                    ['me_squats', 'Squat Test (reps)', 'number'],
                  ]} />
                </AssessSection>
                <AssessSection title="Muscular Strength Tests">
                  <AssessGrid form={assessmentForm} setForm={setAssessmentForm} fields={[
                    ['ms_bench_1rm', 'Bench Press 1RM (kg)', 'number'],
                    ['ms_leg_press_1rm', 'Leg Press 1RM (kg)', 'number'],
                    ['ms_vertical_jump', 'Vertical Jump (cm)', 'number'],
                    ['ms_broad_jump', 'Broad Jump (cm)', 'number'],
                  ]} />
                </AssessSection>
                <AssessSection title="Posture Analysis">
                  {[
                    ['posture_head','Head'],['posture_shoulders','Shoulders'],
                    ['posture_hips','Hips & Pelvis'],['posture_knees','Knees'],['posture_ankles','Ankles'],
                  ].map(([f, l]) => (
                    <AssessField key={f} label={l} field={f} form={assessmentForm} setForm={setAssessmentForm} placeholder="Normal / Observation" />
                  ))}
                  <AssessField label="Observations" field="posture_observations" form={assessmentForm} setForm={setAssessmentForm} multiline />
                  <AssessField label="Actions Required" field="posture_actions" form={assessmentForm} setForm={setAssessmentForm} multiline />
                </AssessSection>
                <AssessField label="General Notes" field="notes" form={assessmentForm} setForm={setAssessmentForm} multiline />
                <div className="flex gap-3">
                  <button onClick={() => setShowNewAssessment(false)}
                    className="px-4 py-3 rounded-[8px] bg-grey-100 text-grey-200 text-sm font-medium active:scale-95">Cancel</button>
                  <button onClick={saveAssessment} disabled={assessmentSaving}
                    className="flex-1 py-3 rounded-[8px] bg-brazil-green text-white font-bold text-sm active:scale-95 disabled:opacity-50">
                    {assessmentSaving ? 'Saving…' : 'Save Assessment'}
                  </button>
                </div>
              </div>
            )}

            {assessmentLoading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" /></div>
            ) : assessments.length === 0 ? (
              <p className="text-center text-grey-100 py-8">No assessments recorded yet</p>
            ) : (
              <div className="space-y-3">
                {assessments.map(a => <AssessmentCard key={a.id} assessment={a} />)}
              </div>
            )}
          </div>
        )}

        {/* ── Programme ── */}
        {activeTab === 'programme' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-grey-200">{programmeCards.length} card{programmeCards.length !== 1 ? 's' : ''}</p>
              <button onClick={() => setShowNewCard(!showNewCard)}
                className="flex items-center gap-1.5 bg-brazil-green text-white text-xs font-semibold px-3 py-2 rounded-[8px] active:scale-95">
                <Plus className="w-3.5 h-3.5" /> New Card
              </button>
            </div>

            {showNewCard && (
              <div className="card-dark space-y-4">
                <p className="font-bold text-sm">New Programme Card</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-grey-100 mb-1 block">Title</label>
                    <input value={cardForm.title} onChange={e => setCardForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full bg-grey-100 border border-white/10 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-grey-100 mb-1 block">Date</label>
                    <input type="date" value={cardForm.card_date} onChange={e => setCardForm(f => ({ ...f, card_date: e.target.value }))}
                      className="w-full bg-grey-100 border border-white/10 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none" />
                  </div>
                </div>
                <CardSectionEditor title="Warm Up — Pulse Raiser" items={cardForm.warm_up_pulse}
                  onChange={items => setCardForm(f => ({ ...f, warm_up_pulse: items }))}
                  columns={['Equipment','Duration','Level','Resistance','Speed','RPE','Heart Rate']} />
                <CardSectionEditor title="Warm Up — Preparatory Stretches" items={cardForm.warm_up_stretches}
                  onChange={items => setCardForm(f => ({ ...f, warm_up_stretches: items }))}
                  columns={['Muscle Group','Position','Duration','Reps']} />
                <CardSectionEditor title="Cardiovascular Training" items={cardForm.cardio}
                  onChange={items => setCardForm(f => ({ ...f, cardio: items }))}
                  columns={['Machine/Activity','Duration','System','Level','Resistance','Speed','RPE','HR']} />
                <CardSectionEditor title="Resistance Training" items={cardForm.resistance}
                  onChange={items => setCardForm(f => ({ ...f, resistance: items }))}
                  columns={['Exercise','Equipment','Weight','System','Reps','Sets','Rest','Notes']} />
                <CardSectionEditor title="Cool Down — Cardiovascular" items={cardForm.cool_down_cv}
                  onChange={items => setCardForm(f => ({ ...f, cool_down_cv: items }))}
                  columns={['Machine/Activity','Duration','System','Level','Speed','RPE','HR']} />
                <CardSectionEditor title="Post-Workout Stretches (incl. PNF)" items={cardForm.cool_down_stretches}
                  onChange={items => setCardForm(f => ({ ...f, cool_down_stretches: items }))}
                  columns={['Muscle Group','Position','Duration']} />
                <div>
                  <label className="text-xs text-grey-100 mb-1 block">Exercise & Activities Away from the Gym</label>
                  <textarea value={cardForm.activities_away} onChange={e => setCardForm(f => ({ ...f, activities_away: e.target.value }))} rows={2}
                    className="w-full bg-grey-100 border border-white/10 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-xs text-grey-100 mb-1 block">Session Notes</label>
                  <textarea value={cardForm.session_notes} onChange={e => setCardForm(f => ({ ...f, session_notes: e.target.value }))} rows={3}
                    className="w-full bg-grey-100 border border-white/10 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowNewCard(false)}
                    className="px-4 py-3 rounded-[8px] bg-grey-100 text-grey-200 text-sm font-medium active:scale-95">Cancel</button>
                  <button onClick={saveCard} disabled={cardSaving}
                    className="flex-1 py-3 rounded-[8px] bg-brazil-green text-white font-bold text-sm active:scale-95 disabled:opacity-50">
                    {cardSaving ? 'Saving…' : 'Save Card'}
                  </button>
                </div>
              </div>
            )}

            {programmeLoading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" /></div>
            ) : programmeCards.length === 0 && !showNewCard ? (
              <p className="text-center text-grey-100 py-8">No programme cards yet. Tap "New Card" to create one.</p>
            ) : (
              <div className="space-y-3">
                {programmeCards.map(card => <ProgrammeCardView key={card.id} card={card} onDelete={deleteCard} />)}
              </div>
            )}
          </div>
        )}

      </div>
        {/* -- Workouts -- */}
        {activeTab === 'workouts' && (
          <div className="space-y-4">
            {/* Assigned Plans */}
            <div>
              <p className="text-sm font-semibold text-grey-200 mb-3">Assigned Plans</p>
              {plansLoading ? (
                <div className="flex justify-center py-6"><div className="w-6 h-6 border-4 border-brazil-orange border-t-transparent rounded-full animate-spin" /></div>
              ) : clientPlans.length === 0 ? (
                <p className="text-center text-grey-100 py-6 text-sm">No workout plans assigned yet</p>
              ) : (
                <div className="space-y-2">
                  {clientPlans.map(plan => (
                    <div key={plan.id} className="card-dark flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[8px] bg-brazil-orange/20 flex items-center justify-center text-lg flex-shrink-0">??</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{plan.name}</p>
                        {plan.description && <p className="text-xs text-grey-200 truncate">{plan.description}</p>}
                      </div>
                      <button onClick={() => unassignPlan(plan.id)}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 flex-shrink-0">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Plans - assign from here */}
            <div>
              <p className="text-sm font-semibold text-grey-200 mb-3">All Workout Plans</p>
              {allPlans.length === 0 ? (
                <p className="text-center text-grey-100 py-6 text-sm">No workout plans created yet. Go to Workouts to create one.</p>
              ) : (
                <div className="space-y-2">
                  {allPlans.map(plan => {
                    const isAssigned = clientPlans.some(p => p.id === plan.id);
                    return (
                      <div key={plan.id} className="card-dark flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[8px] bg-grey-100 flex items-center justify-center text-lg flex-shrink-0">??</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{plan.name}</p>
                          {plan.description && <p className="text-xs text-grey-200 truncate">{plan.description}</p>}
                          {plan.client_name && !isAssigned && <p className="text-xs text-grey-100">Currently: {plan.client_name}</p>}
                        </div>
                        {isAssigned ? (
                          <span className="text-xs text-brazil-green font-bold px-2 py-1 rounded bg-brazil-green/10 flex-shrink-0">? Assigned</span>
                        ) : (
                          <button onClick={() => assignPlan(plan.id)} disabled={assigningPlan}
                            className="text-xs text-white font-bold px-3 py-1.5 rounded-[6px] bg-brazil-orange flex-shrink-0 disabled:opacity-50">
                            Assign
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}


      {/* Override modal */}
      {overrideTarget && (
        <OverrideModal
          session={overrideTarget}
          onConfirm={handleOverride}
          onClose={() => setOverrideTarget(null)}
        />
      )}
    </div>
  );
}

// ── Assessment helpers ────────────────────────────────────────────────────────

function AssessSection({ title, children }) {
  return (
    <div className="bg-white/4 rounded-[8px] p-3 space-y-2">
      <p className="text-[10px] font-bold text-brazil-green uppercase tracking-wide mb-2">{title}</p>
      {children}
    </div>
  );
}

function AssessGrid({ form, setForm, fields }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {fields.map(([field, label, type]) => (
        <div key={field}>
          <label className="text-[9px] text-grey-100 block mb-0.5">{label}</label>
          <input type={type || 'text'}
            value={form[field] || ''}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            className="w-full bg-grey-100 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-brazil-green/50" />
        </div>
      ))}
    </div>
  );
}

function AssessField({ label, field, form, setForm, placeholder, multiline }) {
  const cls = 'w-full bg-grey-100 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-brazil-green/50 placeholder:text-grey-200';
  return (
    <div>
      <label className="text-[9px] text-grey-100 block mb-0.5">{label}</label>
      {multiline
        ? <textarea value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            placeholder={placeholder} rows={2} className={`${cls} resize-none`} />
        : <input value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            placeholder={placeholder} className={cls} />
      }
    </div>
  );
}

function AssessmentCard({ assessment }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card-dark">
      <div className="flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <div>
          <p className="font-semibold text-sm">{fmtDate(assessment.assessment_date)}</p>
          <div className="flex gap-3 text-xs text-grey-100 mt-0.5">
            {assessment.weight_kg && <span>{assessment.weight_kg}kg</span>}
            {assessment.body_fat_pct && <span>{assessment.body_fat_pct}% BF</span>}
            {assessment.resting_hr && <span>{assessment.resting_hr} bpm</span>}
          </div>
        </div>
        <button className="p-1.5 text-grey-100 hover:text-grey-200">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/8 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          {[
            ['Height', assessment.height_cm, 'cm'],
            ['Weight', assessment.weight_kg, 'kg'],
            ['BMI', assessment.bmi, ''],
            ['Body Fat', assessment.body_fat_pct, '%'],
            ['Resting HR', assessment.resting_hr, 'bpm'],
            ['Waist', assessment.waist_cm, 'cm'],
            ['Hips', assessment.hip_cm, 'cm'],
            ['W:H Ratio', assessment.waist_hip_ratio, ''],
            ['BP', assessment.bp_avg_systolic ? `${assessment.bp_avg_systolic}/${assessment.bp_avg_diastolic}` : null, 'mmHg'],
            ['Peak Flow', assessment.peak_flow, 'L/min'],
            ['Sit & Reach', assessment.flex_sit_reach, 'cm'],
            ['Push Ups', assessment.me_push_ups, ''],
            ['Plank', assessment.me_plank_secs, 's'],
            ['Bench 1RM', assessment.ms_bench_1rm, 'kg'],
            ['Leg Press 1RM', assessment.ms_leg_press_1rm, 'kg'],
            ['VO₂ Max', assessment.cv_step_test_vo2, 'ml/kg/min'],
          ].map(([label, val, unit]) => val != null ? (
            <div key={label}>
              <p className="text-grey-100">{label}</p>
              <p className="text-black font-medium">{val}{unit}</p>
            </div>
          ) : null)}
          {assessment.notes && (
            <div className="col-span-2 mt-2 pt-2 border-t border-white/8">
              <p className="text-grey-100 mb-0.5">Notes</p>
              <p className="text-grey-200">{assessment.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgrammeCardView({ card, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const parse = (str) => { try { return JSON.parse(str || '[]'); } catch { return []; } };

  return (
    <div className="card-dark">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{card.title}</p>
          <p className="text-xs text-grey-100">{fmtDate(card.card_date)}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-grey-100 text-grey-100">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(card.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-grey-200 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/8 space-y-3">
          {[
            ['Warm Up — Pulse Raiser', parse(card.warm_up_pulse), ['Equipment','Duration','Level','Resistance','Speed','RPE','HR']],
            ['Warm Up — Stretches', parse(card.warm_up_stretches), ['Muscle Group','Position','Duration','Reps']],
            ['Cardiovascular', parse(card.cardio), ['Machine/Activity','Duration','System','Level','Resistance','Speed','RPE','HR']],
            ['Resistance Training', parse(card.resistance), ['Exercise','Equipment','Weight','System','Reps','Sets','Rest','Notes']],
            ['Cool Down CV', parse(card.cool_down_cv), ['Machine/Activity','Duration','System','Level','Speed','RPE','HR']],
            ['Cool Down Stretches', parse(card.cool_down_stretches), ['Muscle Group','Position','Duration']],
          ].map(([title, items, cols]) => items.length > 0 && (
            <div key={title}>
              <p className="text-[10px] font-bold text-brazil-green uppercase mb-1.5">{title}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>{cols.map(c => <th key={c} className="text-left text-grey-100 font-normal pr-3 pb-1 whitespace-nowrap">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {items.map((row, i) => (
                      <tr key={i} className="border-t border-white/5">
                        {cols.map(c => <td key={c} className="pr-3 py-1 text-grey-200 whitespace-nowrap">{row[c.toLowerCase().replace(/[\s\/]/g,'_')] || '—'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {card.activities_away && (
            <div>
              <p className="text-[10px] font-bold text-brazil-green uppercase mb-1">Away Activities</p>
              <p className="text-xs text-grey-200">{card.activities_away}</p>
            </div>
          )}
          {card.session_notes && (
            <div>
              <p className="text-[10px] font-bold text-brazil-green uppercase mb-1">Session Notes</p>
              <p className="text-xs text-grey-200">{card.session_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CardSectionEditor({ title, items, onChange, columns }) {
  const addRow = () => {
    const row = {};
    columns.forEach(c => { row[c.toLowerCase().replace(/[\s\/]/g,'_')] = ''; });
    onChange([...items, row]);
  };
  const updateRow = (i, col, val) => {
    const key = col.toLowerCase().replace(/[\s\/]/g,'_');
    onChange(items.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  };
  const removeRow = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="bg-white/4 rounded-[8px] p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-brazil-green uppercase">{title}</p>
        <button type="button" onClick={addRow}
          className="text-[10px] text-brazil-green hover:text-brazil-green/80 flex items-center gap-1 active:scale-95">
          <Plus className="w-3 h-3" /> Add Row
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-grey-200 italic">No rows yet</p>
      ) : (
        <div className="space-y-2">
          {items.map((row, i) => (
            <div key={i} className="flex gap-1.5 items-start">
              <div className="grid grid-cols-2 gap-1.5 flex-1">
                {columns.map(col => (
                  <input key={col}
                    value={row[col.toLowerCase().replace(/[\s\/]/g,'_')] || ''}
                    onChange={e => updateRow(i, col, e.target.value)}
                    placeholder={col}
                    className="bg-grey-100 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-brazil-green/50 placeholder:text-grey-200" />
                ))}
              </div>
              <button type="button" onClick={() => removeRow(i)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-grey-200 hover:text-red-400 flex-shrink-0 mt-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
