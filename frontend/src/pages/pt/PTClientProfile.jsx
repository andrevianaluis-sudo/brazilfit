import React from 'react';
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
    <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,0.85)",padding:"1rem",backdropFilter:"blur(4px)"}}>
      <div style={{width:"100%",maxWidth:"400px",background:"#1a1a1a",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.1)",overflow:"hidden"}}>
        <div style={{padding:"1.25rem 1.25rem 1rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <div className="w-10 h-10 rounded-[8px] bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <RotateCcw  />
              </div>
              <div>
                <p style={{fontWeight:700}}>Override Cancellation</p>
                <p style={{fontSize:"0.75rem",color:"#606060"}}>
                  {new Date(session.scheduled_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at {session.scheduled_time}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-grey-100 hover:text-white hover:bg-grey-100">
              <X  />
            </button>
          </div>
          <div style={{background:"rgba(255,107,43,0.1)",border:"1px solid rgba(255,107,43,0.2)",borderRadius:"8px",padding:"0.75rem 1rem",marginBottom:"1rem"}}>
            <p style={{fontSize:"0.875rem",color:"#FF6B2B",fontWeight:500,marginBottom:"4px"}}>Session will be carried over</p>
            <p style={{fontSize:"0.75rem",color:"#606060"}}>
              This overrides the 24-hour policy. The session will be cancelled and returned to the client's block, not counted as used.
            </p>
          </div>
          <label style={{display:"block",fontSize:"0.75rem",color:"#606060",marginBottom:"6px"}}>Override reason (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Emergency — rescheduling next week"
            style={{width:"100%",height:"80px",padding:"0.75rem",background:"#222",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",color:"#fff",fontSize:"0.875rem",outline:"none",resize:"none"}}
          />
        </div>
        <div style={{display:"flex",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
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
  const parse = v => { try { const a=JSON.parse(v); return Array.isArray(a)?a:[v]; } catch { return v?[v]:[]; } };
  React.useEffect(() => {
    api.get("/checkins/pt/summary").then(r => {
      const cl = r.data.summary?.find(x => x.clientId === parseInt(clientId));
      setCheckins(cl?.pastCheckins || []);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, [clientId]);
  if (loading) return <div style={{display:"flex",justifyContent:"center",padding:"2rem"}}><div style={{width:24,height:24,border:"2px solid #4CAF50",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/></div>;
  if (!checkins.length) return <p style={{textAlign:"center",color:"#707070",padding:"2rem"}}>No check-ins submitted yet</p>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {checkins.map((c,i)=>(
        <div key={i} style={{background:"#1a1a1a",borderRadius:14,padding:"1.5rem",border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <span style={{fontSize:"0.7rem",fontWeight:400,letterSpacing:"0.15em",color:"#4CAF50",textTransform:"uppercase"}}>{c.checkin_week}</span>
            <span style={{fontSize:"0.75rem",color:"#606060"}}>{c.checkin_date}</span>
          </div>
          {(c.motivation_score||c.stress_score||c.overall_mood)&&(
            <div style={{display:"flex",gap:24,marginBottom:16}}>
              {c.motivation_score&&<div><p style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#505050",margin:"0 0 4px"}}>Motivation</p><p style={{fontSize:"1.75rem",fontWeight:300,color:"#4CAF50",margin:0,lineHeight:1}}>{c.motivation_score}<span style={{fontSize:"0.875rem",color:"#404040"}}>/10</span></p></div>}
              {c.stress_score&&<div><p style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#505050",margin:"0 0 4px"}}>Stress</p><p style={{fontSize:"1.75rem",fontWeight:300,color:"#FFD600",margin:0,lineHeight:1}}>{c.stress_score}<span style={{fontSize:"0.875rem",color:"#404040"}}>/10</span></p></div>}
              {c.overall_mood&&<div><p style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#505050",margin:"0 0 4px"}}>Mood</p><p style={{fontSize:"1.75rem",fontWeight:300,color:"#fff",margin:0,lineHeight:1}}>{c.overall_mood}</p></div>}
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            {c.workouts_felt&&<div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 12px"}}><p style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#505050",margin:"0 0 4px"}}>Workouts</p><p style={{fontSize:"0.875rem",color:"#fff",margin:0,fontWeight:300}}>{c.workouts_felt}</p></div>}
            {c.goals_last_week&&<div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 12px"}}><p style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#505050",margin:"0 0 4px"}}>Goals last week</p><p style={{fontSize:"0.875rem",color:"#fff",margin:0,fontWeight:300}}>{c.goals_last_week}</p></div>}
          </div>
          {c.insight&&<div style={{background:"rgba(76,175,80,0.06)",borderRadius:8,padding:"10px 14px",marginBottom:12,borderLeft:"2px solid #4CAF50"}}><p style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#4CAF50",margin:"0 0 4px"}}>Insight</p><p style={{fontSize:"0.875rem",color:"rgba(255,255,255,0.8)",margin:0,fontStyle:"italic",fontWeight:300}}>{c.insight}</p></div>}
          {c.wins&&parse(c.wins).length>0&&<div style={{marginBottom:12}}><p style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#505050",margin:"0 0 8px"}}>Wins</p><div style={{display:"flex",flexDirection:"column",gap:4}}>{parse(c.wins).map((w,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#4CAF50",fontSize:"0.75rem"}}>✓</span><span style={{fontSize:"0.875rem",color:"rgba(255,255,255,0.8)",fontWeight:300}}>{w}</span></div>)}</div></div>}
          {c.challenges&&parse(c.challenges).length>0&&<div style={{marginBottom:12}}><p style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#505050",margin:"0 0 8px"}}>Challenges</p><div style={{display:"flex",flexDirection:"column",gap:4}}>{parse(c.challenges).map((ch,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#FF6B2B",fontSize:"0.75rem"}}>!</span><span style={{fontSize:"0.875rem",color:"rgba(255,255,255,0.8)",fontWeight:300}}>{ch}</span></div>)}</div></div>}
          {(c.sleep_hours||c.water_glasses||c.daily_steps)&&<div style={{display:"flex",gap:16,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.04)"}}>{c.sleep_hours&&<span style={{fontSize:"0.75rem",color:"#606060"}}>Sleep <strong style={{color:"#fff",fontWeight:400}}>{c.sleep_hours}h</strong></span>}{c.water_glasses&&<span style={{fontSize:"0.75rem",color:"#606060"}}>Water <strong style={{color:"#fff",fontWeight:400}}>{c.water_glasses} glasses</strong></span>}{c.daily_steps&&<span style={{fontSize:"0.75rem",color:"#606060"}}>Steps <strong style={{color:"#fff",fontWeight:400}}>{c.daily_steps?.toLocaleString()}</strong></span>}</div>}
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
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
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
  const [showEditClient, setShowEditClient] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
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

  const handleResetPassword = async () => {
    if (!resetPasswordValue || resetPasswordValue.length < 6) return;
    setResettingPassword(true);
    try {
      await api.post('/auth/pt-reset-password', { username: client.username, newPassword: resetPasswordValue });
      toast.success(`Password reset for ${client.name} ✅`);
      setShowResetPassword(false);
      setResetPasswordValue('');
    } catch(e) {
      toast.error(e.response?.data?.error || 'Failed to reset password');
    } finally { setResettingPassword(false); }
  };

  const saveEditClient = async () => {
    setEditSaving(true);
    try {
      await api.put(`/pt/clients/${id}`, {
        email: editForm.email,
        phone: editForm.phone,
        sessions_used: parseInt(editForm.sessions_used) || 0,
        current_block_number: parseInt(editForm.block_number) || 1,
        block_start_date: editForm.block_start_date,
        block_price: parseInt(editForm.block_price) || 0,
        client_type: editForm.client_type,
      });
      toast.success('Client updated ✅');
      setShowEditClient(false);
      loadClient();
    } catch(e) {
      toast.error(e.response?.data?.error || 'Failed to save changes');
    } finally { setEditSaving(false); }
  };

  const handleReinstate = async (sessionId) => {
    if (!window.confirm('Reinstate this cancelled session? It will become upcoming again.')) return;
    try {
      await api.post(`/sessions/${sessionId}/reinstate`);
      toast.success('Session reinstated — it\'s upcoming again ✅');
      loadClient();
    } catch {
      toast.error('Failed to reinstate session');
    }
  };

  if (loading) return (
    <div style={{display:"flex",justifyContent:"center",padding:"3rem 0"}}>
      <div style={{width:"32px",height:"32px",border:"2px solid #FF6B2B",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}} />
    </div>
  );

  if (!client) return (
    <div style={{padding:"3rem 1rem",textAlign:"center",color:"#606060"}}>Client not found</div>
  );

  const sessionsRemaining = 10 - client.sessions_used;
  const pct = Math.min(100, (client.sessions_used / 10) * 100);
  const genNotes = client.notes?.filter(n => !n.is_progress_note) || [];
  const latestProgress = client.progress?.[0];

  const upcomingSessions = client.sessions?.filter(s => s.status === 'upcoming') || [];
  const cancelledSessions = client.sessions?.filter(s => s.status === 'cancelled') || [];

  const tabs = ['overview', 'sessions', 'cancellations', 'progress', 'photos', 'notes', 'messages', 'blocks', 'checkins', 'onboarding', 'assessment', 'programme', 'workouts'];

  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      {/* Header */}
      <div style={{backgroundColor:"#1a1a1a",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"1rem"}}>
        <button onClick={() => navigate('/pt/clients')} style={{display:"flex",alignItems:"center",gap:"8px",color:"#606060",marginBottom:"1rem",background:"none",border:"none",cursor:"pointer",fontFamily:"DM Sans,system-ui",fontSize:"0.875rem"}}>
          <ArrowLeft  /> Back to Clients
        </button>

        <div style={{display:"flex",alignItems:"flex-start",gap:"16px"}}>
          <div className={`w-16 h-16 rounded-[12px] flex items-center justify-center text-2xl font-black flex-shrink-0
            ${client.client_type === 'Online' ? 'bg-blue-500/20 text-blue-400' : 'bg-brazil-green/20 text-brazil-green'}`}>
            {client.name.charAt(0)}
          </div>
          <div style={{flex:1}}>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black">{client.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${client.client_type === 'Online' ? 'bg-blue-500/20 text-blue-400' : 'bg-grey-100 text-grey-200'}`}>
                {client.client_type}
              </span>
              {client.is_pro === 1 && <span className="badge-pro">PRO</span>}
              <button onClick={() => { setEditForm({ email: client.email||'', phone: client.phone||'', sessions_used: client.sessions_used??0, block_number: client.current_block_number??1, block_start_date: client.block_start_date||new Date().toISOString().split('T')[0], block_price: client.block_price||500, client_type: client.client_type||'F2F' }); setShowEditClient(true); }} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'4px',padding:'4px 10px',background:'rgba(255,107,43,0.12)',border:'1px solid rgba(255,107,43,0.3)',borderRadius:'8px',color:'#FF6B2B',fontSize:'0.75rem',fontWeight:600,cursor:'pointer'}}>
                ✏️ Edit
              </button>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-grey-200">
              {client.email && <span className="flex items-center gap-1"><Mail  />{client.email}</span>}
            </div>
            {client.phone && (
              <p className="text-sm text-grey-200 flex items-center gap-1 mt-0.5">
                <Phone  />{client.phone}
              </p>
            )}
          </div>
        </div>

        {/* Block progress */}
        <div className="mt-4 card-dark p-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p style={{fontSize:"0.75rem",color:"#606060"}}>Block {client.current_block_number} · Started {fmtDate(client.block_start_date)}</p>
              <p style={{fontWeight:700}}>
                <span style={{color:"#4CAF50"}}>{client.sessions_used}</span>
                <span style={{color:"#888"}}> / 10 sessions</span>
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

      <div style={{padding:"1rem"}}>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px"}}>
              <div style={{background:"#1a1a1a",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)",textAlign:"center"}}>
                <p className="text-2xl font-black text-brazil-green">{client.sessions_used}</p>
                <p style={{fontSize:"0.75rem",color:"#606060"}}>Sessions Done</p>
              </div>
              <div style={{background:"#1a1a1a",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)",textAlign:"center"}}>
                <p className="text-2xl font-black text-brazil-yellow">{sessionsRemaining}</p>
                <p style={{fontSize:"0.75rem",color:"#606060"}}>Remaining</p>
              </div>
              <div style={{background:"#1a1a1a",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)",textAlign:"center"}}>
                <p className="text-2xl font-black">{client.current_block_number}</p>
                <p style={{fontSize:"0.75rem",color:"#606060"}}>Block #</p>
              </div>
            </div>

            {cancelledSessions.length > 0 && (
              <div className="bg-grey-100 border border-white/10 rounded-[8px] px-4 py-3">
                <p className="text-xs font-semibold text-grey-200 mb-1">Cancellations this block</p>
                <p className="text-2xl font-black text-grey-200">{cancelledSessions.length}</p>
                <p style={{fontSize:"0.75rem",color:"#606060",marginTop:"2px"}}>
                  {cancelledSessions.filter(s => s.session_carried_over).length} carried over · {cancelledSessions.filter(s => s.cancelled_by === 'pt_override').length} PT override
                </p>
              </div>
            )}

            {latestProgress && (
              <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
                <p className="text-xs text-grey-200 mb-2">Latest Progress</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {latestProgress.weight_kg && <div><span style={{color:"#606060"}}>Weight </span><span style={{fontWeight:700}}>{latestProgress.weight_kg}kg</span></div>}
                  {latestProgress.waist_cm && <div><span style={{color:"#606060"}}>Waist </span><span style={{fontWeight:700}}>{latestProgress.waist_cm}cm</span></div>}
                </div>
                <p className="text-xs text-grey-100 mt-1">{latestProgress.entry_date}</p>
              </div>
            )}

            <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(76,175,80,0.2)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
                <p className="text-sm font-semibold text-brazil-green">Encouragement Note</p>
                <p style={{fontSize:"0.75rem",color:"#888"}}>Shown to client</p>
              </div>
              <textarea
                value={progressNote}
                onChange={e => setProgressNote(e.target.value)}
                placeholder="Write an encouraging note for this client..."
                className="input text-sm resize-none h-20 mb-2"
              />
              <button onClick={saveProgressNote} className="btn-primary text-sm py-2 w-full flex items-center justify-center gap-2">
                <Save  /> Save Note
              </button>
            </div>
            <div style={{background:"#1a1a1a",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
              <p style={{fontSize:"0.75rem",fontWeight:700,color:"#606060",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"10px"}}>Account</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
                <div>
                  <p style={{fontSize:"0.875rem",fontWeight:600,color:"#fff",margin:"0 0 2px"}}>Reset Client Password</p>
                  <p style={{fontSize:"0.75rem",color:"#606060",margin:0}}>Set a new temporary password for {client.name}</p>
                </div>
                <button onClick={()=>setShowResetPassword(true)} style={{padding:"8px 16px",borderRadius:"8px",border:"1px solid rgba(255,107,43,0.3)",background:"rgba(255,107,43,0.08)",color:"#FF6B2B",fontFamily:"'DM Sans',system-ui",fontSize:"0.78rem",fontWeight:700,cursor:"pointer",minHeight:"auto",whiteSpace:"nowrap",flexShrink:0}}>
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditClient && (
          <div onClick={()=>setShowEditClient(false)} style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem',backdropFilter:'blur(4px)'}}>
            <div onClick={e=>e.stopPropagation()} style={{background:'#111',borderRadius:'20px',border:'1px solid rgba(255,107,43,0.2)',padding:'1.75rem',maxWidth:'420px',width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem'}}>
                <h3 style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.1rem',fontWeight:800,color:'#fff',margin:0}}>Edit Client</h3>
                <button onClick={()=>setShowEditClient(false)} style={{background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:'1.2rem'}}>✕</button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                <div><label style={{fontSize:'0.72rem',color:'#888',display:'block',marginBottom:'4px'}}>Email</label>
                  <input value={editForm.email||''} onChange={e=>setEditForm(f=>({...f,email:e.target.value}))} type="email" style={{width:'100%',padding:'0.75rem',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}/></div>
                <div><label style={{fontSize:'0.72rem',color:'#888',display:'block',marginBottom:'4px'}}>Phone</label>
                  <input value={editForm.phone||''} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} style={{width:'100%',padding:'0.75rem',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  <div><label style={{fontSize:'0.72rem',color:'#888',display:'block',marginBottom:'4px'}}>Sessions Used</label>
                    <input value={editForm.sessions_used??0} onChange={e=>setEditForm(f=>({...f,sessions_used:e.target.value}))} type="number" min="0" max="10" style={{width:'100%',padding:'0.75rem',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}/></div>
                  <div><label style={{fontSize:'0.72rem',color:'#888',display:'block',marginBottom:'4px'}}>Block Number</label>
                    <input value={editForm.block_number??1} onChange={e=>setEditForm(f=>({...f,block_number:e.target.value}))} type="number" min="1" style={{width:'100%',padding:'0.75rem',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  <div><label style={{fontSize:'0.72rem',color:'#888',display:'block',marginBottom:'4px'}}>Block Started</label>
                    <input value={editForm.block_start_date||''} onChange={e=>setEditForm(f=>({...f,block_start_date:e.target.value}))} type="date" style={{width:'100%',padding:'0.75rem',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}/></div>
                  <div><label style={{fontSize:'0.72rem',color:'#888',display:'block',marginBottom:'4px'}}>Block Price (£)</label>
                    <input value={editForm.block_price||''} onChange={e=>setEditForm(f=>({...f,block_price:e.target.value}))} type="number" style={{width:'100%',padding:'0.75rem',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}/></div>
                </div>
                <div><label style={{fontSize:'0.72rem',color:'#888',display:'block',marginBottom:'4px'}}>Client Type</label>
                  <select value={editForm.client_type||'F2F'} onChange={e=>setEditForm(f=>({...f,client_type:e.target.value}))} style={{width:'100%',padding:'0.75rem',background:'#1a1a1a',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}>
                    <option value="F2F">F2F</option>
                    <option value="Online">Online</option>
                  </select></div>
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'1.5rem'}}>
                <button onClick={()=>setShowEditClient(false)} style={{flex:1,padding:'0.875rem',background:'#222',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',color:'#888',fontSize:'0.875rem',fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button onClick={saveEditClient} disabled={editSaving} style={{flex:2,padding:'0.875rem',background:'linear-gradient(135deg,#FF6B2B,#FFD600)',border:'none',borderRadius:'12px',color:'#000',fontSize:'0.875rem',fontWeight:800,cursor:'pointer'}}>{editSaving?'Saving…':'Save Changes'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPassword && (
          <div onClick={()=>setShowResetPassword(false)} style={{position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem",backdropFilter:"blur(4px)"}}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#111",borderRadius:"20px",border:"1px solid rgba(255,107,43,0.2)",padding:"1.75rem",maxWidth:"380px",width:"100%"}}>
              <h3 style={{fontFamily:"'DM Sans',system-ui",fontSize:"1.2rem",fontWeight:800,color:"#fff",margin:"0 0 6px",letterSpacing:"-0.02em"}}>Reset Password</h3>
              <p style={{fontSize:"0.82rem",color:"#606060",margin:"0 0 1.25rem"}}>Set a new temporary password for <strong style={{color:"#fff"}}>{client.name}</strong></p>
              <input
                type="password"
                value={resetPasswordValue}
                onChange={e=>setResetPasswordValue(e.target.value)}
                placeholder="New temporary password"
                style={{width:"100%",padding:"0.875rem 1rem",background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",color:"#fff",fontFamily:"'DM Sans',system-ui",fontSize:"0.875rem",outline:"none",boxSizing:"border-box",marginBottom:"8px"}}
                onFocus={e=>e.target.style.borderColor="#FF6B2B"}
                onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"}/>
              {resetPasswordValue && resetPasswordValue.length < 6 && (
                <p style={{fontSize:"0.75rem",color:"#ef4444",margin:"0 0 12px"}}>⚠ Password must be at least 6 characters</p>
              )}
              <div style={{display:"flex",gap:"8px",marginTop:"1rem"}}>
                <button onClick={()=>{setShowResetPassword(false);setResetPasswordValue('');}} style={{flex:1,padding:"0.875rem",background:"#222",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",color:"#888",fontFamily:"'DM Sans',system-ui",fontSize:"0.875rem",fontWeight:600,cursor:"pointer",minHeight:"auto"}}>
                  Cancel
                </button>
                <button onClick={handleResetPassword} disabled={!resetPasswordValue||resetPasswordValue.length<6||resettingPassword} style={{flex:1,padding:"0.875rem",background:resetPasswordValue&&resetPasswordValue.length>=6?"linear-gradient(135deg,#FF6B2B,#FFD600)":"#222",border:"none",borderRadius:"12px",color:resetPasswordValue&&resetPasswordValue.length>=6?"#000":"#606060",fontFamily:"'DM Sans',system-ui",fontSize:"0.875rem",fontWeight:800,cursor:resetPasswordValue&&resetPasswordValue.length>=6?"pointer":"not-allowed",minHeight:"auto"}}>
                  {resettingPassword?"Resetting...":"Reset Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {/* Upcoming sessions with override option */}
            {upcomingSessions.length > 0 && (
              <div style={{marginBottom:"1rem"}}>
                <p style={{fontSize:"0.75rem",fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px"}}>Upcoming</p>
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {upcomingSessions.map(s => {
                    const sessionDt = new Date(`${s.scheduled_date}T${s.scheduled_time}:00`);
                    const hrs = (sessionDt - new Date()) / (1000 * 60 * 60);
                    const isWithin24 = hrs < 24 && hrs > 0;
                    return (
                      <div key={s.id} className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 bg-grey-100 border border-white/10">
                        <div className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0" />
                        <div style={{flex:1}}>
                          <p style={{fontSize:"0.875rem",fontWeight:500}}>{s.scheduled_date} at {s.scheduled_time}</p>
                          <p style={{fontSize:"0.75rem",color:"#888"}}>
                            {isWithin24
                              ? <span style={{color:"#FF6B2B"}}>Within 24hrs — client cannot cancel</span>
                              : 'Upcoming'}
                          </p>
                        </div>
                        <button
                          onClick={() => setOverrideTarget(s)}
                          title="Override cancel — carry session over"
                          className="flex items-center gap-1 text-[10px] text-orange-400/70 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/15 px-2 py-1 rounded-lg transition-all"
                        >
                          <RotateCcw  /> Override
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All sessions history */}
            <p style={{fontSize:"0.75rem",fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px"}}>History</p>
            {client.sessions?.filter(s => s.status !== 'upcoming').length === 0 ? (
              <p style={{textAlign:"center",color:"#888",padding:"2rem 0"}}>No session history yet</p>
            ) : client.sessions?.filter(s => s.status !== 'upcoming').map(s => (
              <div key={s.id} className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 ${
                s.status === 'attended' ? 'bg-brazil-green/10 border border-brazil-green/20' :
                s.status === 'missed' ? 'bg-red-500/10 border border-red-500/20' :
                s.status === 'cancelled' ? 'bg-white/3 border border-white/8' :
                'bg-grey-100 border border-white/10'
              }`}>
                {s.status === 'attended' ? <CheckCircle className="w-5 h-5 text-brazil-green flex-shrink-0" /> :
                 s.status === 'missed' ? <XCircle  /> :
                 s.status === 'cancelled' ? <Ban className="w-5 h-5 text-grey-200 flex-shrink-0" /> :
                 <div className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0" />}
                <div style={{flex:1}}>
                  <p style={{fontSize:"0.875rem",fontWeight:500}}>{s.scheduled_date} at {s.scheduled_time}</p>
                  {s.status === 'missed' && <p className="text-xs text-red-400">Missed — carried over</p>}
                  {s.status === 'cancelled' && (
                    <p style={{fontSize:"0.75rem",color:"#606060"}}>
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
                {s.status === 'cancelled' && (
                  <button
                    onClick={() => handleReinstate(s.id)}
                    title="Reinstate — move back to upcoming"
                    className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-brazil-green/15 text-brazil-green hover:bg-brazil-green/30 transition-colors flex-shrink-0 font-semibold"
                  >
                    Reinstate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Cancellations ── */}
        {activeTab === 'cancellations' && (
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
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
                    <p style={{fontSize:"10px",color:"#888"}}>Total</p>
                  </div>
                  <div className="bg-brazil-green/8 rounded-[8px] p-2.5 text-center">
                    <p className="text-xl font-black text-brazil-green/70">{cancelledSessions.filter(s => s.session_carried_over).length}</p>
                    <p style={{fontSize:"10px",color:"#888"}}>Carried Over</p>
                  </div>
                  <div className="bg-orange-500/8 rounded-[8px] p-2.5 text-center">
                    <p className="text-xl font-black text-orange-400/70">{cancelledSessions.filter(s => s.cancelled_by === 'pt_override').length}</p>
                    <p style={{fontSize:"10px",color:"#888"}}>PT Override</p>
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
                          <p style={{fontSize:"0.875rem",fontWeight:600}}>
                            {new Date(s.scheduled_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            {' '}at {s.scheduled_time}
                          </p>
                          {s.cancelled_at && (
                            <p style={{fontSize:"0.75rem",color:"#606060",marginTop:"2px"}}>
                              Cancelled {new Date(s.cancelled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at {new Date(s.cancelled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${byPT ? 'bg-orange-500/15 text-orange-400' : 'bg-grey-100 text-grey-100'}`}>
                          {byPT ? 'PT Override' : 'Client'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div style={{background:"#222",borderRadius:"8px",padding:"0.5rem 0.625rem"}}>
                          <p style={{color:"#888",marginBottom:"2px"}}>Notice given</p>
                          <p className={`font-semibold ${noticeHours != null && noticeHours >= 24 ? 'text-brazil-green' : 'text-orange-400'}`}>
                            {noticeHours != null
                              ? noticeHours >= 48
                                ? `${noticeDays} days`
                                : `${Math.floor(noticeHours)} hours`
                              : '—'}
                          </p>
                        </div>
                        <div style={{background:"#222",borderRadius:"8px",padding:"0.5rem 0.625rem"}}>
                          <p style={{color:"#888",marginBottom:"2px"}}>Session</p>
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

                      <button
                        onClick={() => handleReinstate(s.id)}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brazil-green/10 text-brazil-green text-xs font-semibold hover:bg-brazil-green/20 transition-colors border border-brazil-green/20"
                      >
                        <RotateCcw  />
                        Reinstate Session
                      </button>
                    </div>
                  );
                })}              </>
            )}
          </div>
        )}

        {/* ── Progress ── */}
        {activeTab === 'progress' && (
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {client.progress?.length === 0 ? (
              <p style={{textAlign:"center",color:"#888",padding:"2rem 0"}}>No progress entries yet</p>
            ) : client.progress?.map(p => (
              <div key={p.id} style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
                <div className="flex justify-between items-start">
                  <p style={{fontSize:"0.875rem",fontWeight:600}}>{p.entry_date}</p>
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
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Plus  /> Add Note
            </button>
            {showNoteForm && (
              <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(76,175,80,0.2)"}}>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Private note about this client..."
                  className="input resize-none h-24 mb-3"
                />
                <div style={{display:"flex",gap:"8px"}}>
                  <button onClick={saveNote} className="btn-primary flex-1 text-sm py-2">Save</button>
                  <button onClick={() => setShowNoteForm(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
                </div>
              </div>
            )}
            {genNotes.length === 0 ? (
              <p style={{textAlign:"center",color:"#888",padding:"2rem 0"}}>No notes yet</p>
            ) : genNotes.map(n => (
              <div key={n.id} style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
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
                <div style={{width:"24px",height:"24px",border:"2px solid #4CAF50",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}} />
              </div>
            ) : (
              <>
                {/* Messages list */}
                <div className="flex-1 overflow-y-auto space-y-2 pb-3">
                  {messages.length === 0 ? (
                    <p style={{textAlign:"center",color:"#888",padding:"2rem 0"}}>No messages yet</p>
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
                    <Send  />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Blocks ── */}
        {activeTab === 'blocks' && (
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {client.blocks?.length === 0 ? (
              <p style={{textAlign:"center",color:"#888",padding:"2rem 0"}}>No block history</p>
            ) : client.blocks?.map(b => (
              <div key={b.id} className={`card-dark border ${b.is_current ? 'border-brazil-green/30' : 'border-white/5'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p style={{fontWeight:600}}>Block {b.block_number}</p>
                    <p style={{fontSize:"0.75rem",color:"#606060"}}>Started {b.start_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brazil-yellow">£{b.amount_paid}</p>
                    {b.is_current ? <span className="badge-green text-[10px]">Current</span> : <span style={{fontSize:"0.75rem",color:"#888"}}>Completed</span>}
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span style={{color:"#4CAF50"}}>✓ {b.sessions_attended} attended</span>
                  {b.sessions_missed > 0 && <span style={{color:"#ef4444"}}>✕ {b.sessions_missed} missed</span>}
                </div>
              </div>
            ))}
          </div>
        )}


        {/* -- Checkins -- */}
        {activeTab === 'checkins' && <CheckinsTab clientId={id} />}

        {/* ── Onboarding ── */}
        {activeTab === 'onboarding' && (
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            {onboardingLoading ? (
              <div style={{display:"flex",justifyContent:"center",padding:"2rem 0"}}><div style={{width:"24px",height:"24px",border:"2px solid #4CAF50",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}} /></div>
            ) : !onboardingData ? (
              <p style={{textAlign:"center",color:"#888",padding:"2rem 0"}}>No onboarding data</p>
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
                      <Bell  /> Remind
                    </button>
                  </div>
                )}

                {/* PAR-Q */}
                {onboardingData.parq && (
                  <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
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
                          <p style={{fontSize:"0.75rem",color:"#606060"}}>{q}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Personal details */}
                {onboardingData.personal && (
                  <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
                    <p style={{fontSize:"0.75rem",fontWeight:700,color:"#606060",textTransform:"uppercase",marginBottom:"12px"}}>Personal Details</p>
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
                          <p style={{fontSize:"10px",color:"#888"}}>{l}</p>
                          <p style={{color:"#ffffff"}}>{v}</p>
                        </div>
                      ) : null)}
                    </div>
                    {(onboardingData.personal.emergency_contact_name) && (
                      <div className="mt-3 pt-3 border-t border-white/8">
                        <p className="text-[10px] text-grey-100 mb-1">Emergency Contact</p>
                        <p style={{fontSize:"0.875rem"}}>{onboardingData.personal.emergency_contact_name} · {onboardingData.personal.emergency_contact_phone}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Lifestyle & Goals */}
                {onboardingData.lifestyle && (
                  <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
                    <p style={{fontSize:"0.75rem",fontWeight:700,color:"#606060",textTransform:"uppercase",marginBottom:"12px"}}>Lifestyle & Goals</p>
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
                      <p style={{fontSize:"0.75rem",color:"#606060"}}>🚬 Smokes: {onboardingData.lifestyle.cigarettes_per_day || '?'} per day</p>
                    )}
                    {onboardingData.lifestyle.drinks_alcohol && (
                      <p className="text-xs text-grey-200 mt-1">🍷 Alcohol: {onboardingData.lifestyle.alcohol_units_per_week || '?'} units/week</p>
                    )}
                  </div>
                )}

                {/* PDF Downloads */}
                {onboardingData.status?.completed && (
                  <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
                    <p style={{fontSize:"0.75rem",fontWeight:700,color:"#606060",textTransform:"uppercase",marginBottom:"12px"}}>Signed Documents</p>
                    <div style={{display:"flex",gap:"12px"}}>
                      {onboardingData.status.pdf_parq_consent && (
                        <a href={`/api/onboarding/pdf/${id}/parq`}
                          style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",padding:"0.625rem",borderRadius:"8px",background:"#222",fontSize:"0.875rem",fontWeight:500,border:"none",cursor:"pointer",minHeight:"auto",color:"#fff"}}>
                          <Download className="w-4 h-4 text-brazil-green" /> PAR-Q & Consent
                        </a>
                      )}
                      {onboardingData.status.pdf_tc && (
                        <a href={`/api/onboarding/pdf/${id}/tc`}
                          style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",padding:"0.625rem",borderRadius:"8px",background:"#222",fontSize:"0.875rem",fontWeight:500,border:"none",cursor:"pointer",minHeight:"auto",color:"#fff"}}>
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
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <p style={{fontSize:"0.875rem",fontWeight:600,color:"#606060"}}>{assessments.length} assessment{assessments.length !== 1 ? 's' : ''}</p>
              <button onClick={() => setShowNewAssessment(!showNewAssessment)}
                style={{display:"flex",alignItems:"center",gap:"6px",background:"#4CAF50",color:"#fff",fontSize:"0.75rem",fontWeight:600,padding:"0.5rem 0.75rem",borderRadius:"8px",border:"none",cursor:"pointer",minHeight:"auto"}}>
                <Plus  /> New Assessment
              </button>
            </div>

            {showNewAssessment && (
              <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)",display:"flex",flexDirection:"column",gap:"16px"}}>
                <p style={{fontWeight:700,fontSize:"0.875rem"}}>New Fitness Assessment</p>
                <div>
                  <label style={{fontSize:"0.75rem",color:"#888",marginBottom:"4px",display:"block"}}>Assessment Date</label>
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
                <div style={{display:"flex",gap:"12px"}}>
                  <button onClick={() => setShowNewAssessment(false)}
                    style={{padding:"0.75rem 1rem",borderRadius:"8px",background:"#222",color:"#606060",fontSize:"0.875rem",fontWeight:500,border:"none",cursor:"pointer",minHeight:"auto"}}>Cancel</button>
                  <button onClick={saveAssessment} disabled={assessmentSaving}
                    style={{flex:1,padding:"0.75rem",borderRadius:"8px",background:"#4CAF50",color:"#fff",fontWeight:700,fontSize:"0.875rem",cursor:"pointer",border:"none",minHeight:"auto"}}>
                    {assessmentSaving ? 'Saving…' : 'Save Assessment'}
                  </button>
                </div>
              </div>
            )}

            {assessmentLoading ? (
              <div style={{display:"flex",justifyContent:"center",padding:"2rem 0"}}><div style={{width:"24px",height:"24px",border:"2px solid #4CAF50",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}} /></div>
            ) : assessments.length === 0 ? (
              <p style={{textAlign:"center",color:"#888",padding:"2rem 0"}}>No assessments recorded yet</p>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                {assessments.map(a => <AssessmentCard key={a.id} assessment={a} />)}
              </div>
            )}
          </div>
        )}

        {/* ── Programme ── */}
        {activeTab === 'programme' && (
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <p style={{fontSize:"0.875rem",fontWeight:600,color:"#606060"}}>{programmeCards.length} card{programmeCards.length !== 1 ? 's' : ''}</p>
              <button onClick={() => setShowNewCard(!showNewCard)}
                style={{display:"flex",alignItems:"center",gap:"6px",background:"#4CAF50",color:"#fff",fontSize:"0.75rem",fontWeight:600,padding:"0.5rem 0.75rem",borderRadius:"8px",border:"none",cursor:"pointer",minHeight:"auto"}}>
                <Plus  /> New Card
              </button>
            </div>

            {showNewCard && (
              <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)",display:"flex",flexDirection:"column",gap:"16px"}}>
                <p style={{fontWeight:700,fontSize:"0.875rem"}}>New Programme Card</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                  <div>
                    <label style={{fontSize:"0.75rem",color:"#888",marginBottom:"4px",display:"block"}}>Title</label>
                    <input value={cardForm.title} onChange={e => setCardForm(f => ({ ...f, title: e.target.value }))}
                      style={{width:"100%",background:"#222",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",padding:"0.625rem 0.75rem",fontSize:"0.875rem",color:"#fff",outline:"none"}} />
                  </div>
                  <div>
                    <label style={{fontSize:"0.75rem",color:"#888",marginBottom:"4px",display:"block"}}>Date</label>
                    <input type="date" value={cardForm.card_date} onChange={e => setCardForm(f => ({ ...f, card_date: e.target.value }))}
                      style={{width:"100%",background:"#222",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",padding:"0.625rem 0.75rem",fontSize:"0.875rem",color:"#fff",outline:"none"}} />
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
                  <label style={{fontSize:"0.75rem",color:"#888",marginBottom:"4px",display:"block"}}>Exercise & Activities Away from the Gym</label>
                  <textarea value={cardForm.activities_away} onChange={e => setCardForm(f => ({ ...f, activities_away: e.target.value }))} rows={2}
                    style={{width:"100%",background:"#222",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",padding:"0.625rem 0.75rem",fontSize:"0.875rem",color:"#fff",outline:"none",resize:"none"}} />
                </div>
                <div>
                  <label style={{fontSize:"0.75rem",color:"#888",marginBottom:"4px",display:"block"}}>Session Notes</label>
                  <textarea value={cardForm.session_notes} onChange={e => setCardForm(f => ({ ...f, session_notes: e.target.value }))} rows={3}
                    style={{width:"100%",background:"#222",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",padding:"0.625rem 0.75rem",fontSize:"0.875rem",color:"#fff",outline:"none",resize:"none"}} />
                </div>
                <div style={{display:"flex",gap:"12px"}}>
                  <button onClick={() => setShowNewCard(false)}
                    style={{padding:"0.75rem 1rem",borderRadius:"8px",background:"#222",color:"#606060",fontSize:"0.875rem",fontWeight:500,border:"none",cursor:"pointer",minHeight:"auto"}}>Cancel</button>
                  <button onClick={saveCard} disabled={cardSaving}
                    style={{flex:1,padding:"0.75rem",borderRadius:"8px",background:"#4CAF50",color:"#fff",fontWeight:700,fontSize:"0.875rem",cursor:"pointer",border:"none",minHeight:"auto"}}>
                    {cardSaving ? 'Saving…' : 'Save Card'}
                  </button>
                </div>
              </div>
            )}

            {programmeLoading ? (
              <div style={{display:"flex",justifyContent:"center",padding:"2rem 0"}}><div style={{width:"24px",height:"24px",border:"2px solid #4CAF50",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}} /></div>
            ) : programmeCards.length === 0 && !showNewCard ? (
              <p style={{textAlign:"center",color:"#888",padding:"2rem 0"}}>No programme cards yet. Tap "New Card" to create one.</p>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                {programmeCards.map(card => <ProgrammeCardView key={card.id} card={card} onDelete={deleteCard} />)}
              </div>
            )}
          </div>
        )}

      </div>
        {/* -- Workouts -- */}
        {activeTab === 'workouts' && (
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            {/* Assigned Plans */}
            <div>
              <p style={{fontSize:"0.875rem",fontWeight:600,color:"#606060",marginBottom:"12px"}}>Assigned Plans</p>
              {plansLoading ? (
                <div className="flex justify-center py-6"><div style={{width:"24px",height:"24px",border:"2px solid #FF6B2B",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}} /></div>
              ) : clientPlans.length === 0 ? (
                <p style={{textAlign:"center",color:"#888",padding:"1.5rem 0",fontSize:"0.875rem"}}>No workout plans assigned yet</p>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {clientPlans.map(plan => (
                    <div key={plan.id} style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"12px"}}>
                      <div className="w-10 h-10 rounded-[8px] bg-brazil-orange/20 flex items-center justify-center text-lg flex-shrink-0">??</div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:700,fontSize:"0.875rem"}}>{plan.name}</p>
                        {plan.description && <p style={{fontSize:"0.75rem",color:"#606060",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{plan.description}</p>}
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
              <p style={{fontSize:"0.875rem",fontWeight:600,color:"#606060",marginBottom:"12px"}}>All Workout Plans</p>
              {allPlans.length === 0 ? (
                <p style={{textAlign:"center",color:"#888",padding:"1.5rem 0",fontSize:"0.875rem"}}>No workout plans created yet. Go to Workouts to create one.</p>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {allPlans.map(plan => {
                    const isAssigned = clientPlans.some(p => p.id === plan.id);
                    return (
                      <div key={plan.id} style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:"12px"}}>
                        <div className="w-10 h-10 rounded-[8px] bg-grey-100 flex items-center justify-center text-lg flex-shrink-0">??</div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontWeight:700,fontSize:"0.875rem"}}>{plan.name}</p>
                          {plan.description && <p style={{fontSize:"0.75rem",color:"#606060",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{plan.description}</p>}
                          {plan.client_name && !isAssigned && <p style={{fontSize:"0.75rem",color:"#888"}}>Currently: {plan.client_name}</p>}
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
          <label style={{fontSize:"9px",color:"#888",display:"block",marginBottom:"2px"}}>{label}</label>
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
      <label style={{fontSize:"9px",color:"#888",display:"block",marginBottom:"2px"}}>{label}</label>
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
    <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}} onClick={() => setExpanded(!expanded)}>
        <div>
          <p style={{fontWeight:600,fontSize:"0.875rem"}}>{fmtDate(assessment.assessment_date)}</p>
          <div className="flex gap-3 text-xs text-grey-100 mt-0.5">
            {assessment.weight_kg && <span>{assessment.weight_kg}kg</span>}
            {assessment.body_fat_pct && <span>{assessment.body_fat_pct}% BF</span>}
            {assessment.resting_hr && <span>{assessment.resting_hr} bpm</span>}
          </div>
        </div>
        <button className="p-1.5 text-grey-100 hover:text-grey-200">
          {expanded ? <ChevronUp  /> : <ChevronDown  />}
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
              <p style={{color:"#888"}}>{label}</p>
              <p className="text-black font-medium">{val}{unit}</p>
            </div>
          ) : null)}
          {assessment.notes && (
            <div className="col-span-2 mt-2 pt-2 border-t border-white/8">
              <p style={{color:"#888",marginBottom:"2px"}}>Notes</p>
              <p style={{color:"#606060"}}>{assessment.notes}</p>
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
    <div style={{background:"#222",borderRadius:"12px",padding:"1rem",border:"1px solid rgba(255,255,255,0.08)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontWeight:600,fontSize:"0.875rem"}}>{card.title}</p>
          <p style={{fontSize:"0.75rem",color:"#888"}}>{fmtDate(card.card_date)}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-grey-100 text-grey-100">
            {expanded ? <ChevronUp  /> : <ChevronDown  />}
          </button>
          <button onClick={() => onDelete(card.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-grey-200 hover:text-red-400">
            <X  />
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
                <table style={{width:"100%",fontSize:"0.75rem"}}>
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
              <p style={{fontSize:"10px",fontWeight:700,color:"#4CAF50",textTransform:"uppercase",marginBottom:"4px"}}>Away Activities</p>
              <p style={{fontSize:"0.75rem",color:"#606060"}}>{card.activities_away}</p>
            </div>
          )}
          {card.session_notes && (
            <div>
              <p style={{fontSize:"10px",fontWeight:700,color:"#4CAF50",textTransform:"uppercase",marginBottom:"4px"}}>Session Notes</p>
              <p style={{fontSize:"0.75rem",color:"#606060"}}>{card.session_notes}</p>
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
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
        <p className="text-[10px] font-bold text-brazil-green uppercase">{title}</p>
        <button type="button" onClick={addRow}
          className="text-[10px] text-brazil-green hover:text-brazil-green/80 flex items-center gap-1 active:scale-95">
          <Plus  /> Add Row
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-grey-200 italic">No rows yet</p>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
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
                <X  />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






