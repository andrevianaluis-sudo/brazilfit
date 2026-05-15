import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle, ChevronRight, ChevronLeft, User, Heart, ClipboardList,
  FileText, Pen, AlertTriangle, Loader2,
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import SignaturePad from '../../components/SignaturePad';

const TOTAL_STEPS = 5;

const STEP_META = [
  { label: 'Personal Details', icon: User },
  { label: 'Lifestyle & Goals', icon: Heart },
  { label: 'PAR-Q', icon: ClipboardList },
  { label: 'Informed Consent', icon: FileText },
  { label: 'Terms & Conditions', icon: Pen },
];

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <div style={{padding:"1.25rem 1rem 1rem",backgroundColor:"#0f0f0f",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
        <p style={{fontSize:"0.75rem",color:"#606060"}}>Step {step} of {TOTAL_STEPS}</p>
        <p style={{fontSize:"0.75rem",fontWeight:600,color:"#4CAF50"}}>{STEP_META[step-1].label}</p>
      </div>
      <div style={{display:"flex",gap:"6px"}}>
        {STEP_META.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < step ? 'bg-brazil-green' : 'rgba(255,255,255,0.1)'}`} />
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:"12px"}}>
        {STEP_META.map((s, i) => {
          const Icon = s.icon;
          const done = i < step - 1;
          const active = i === step - 1;
          return (
            <div key={i} className={`flex flex-col items-center gap-1 ${active ? 'opacity-100' : done ? 'opacity-70' : 'opacity-30'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs
                ${done ? 'bg-brazil-green' : active ? 'bg-brazil-green/30 border border-brazil-green' : '#1a1a1a'}`}>
                {done ? <CheckCircle className="w-4 h-4 text-white" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Nav Buttons ───────────────────────────────────────────────────────────────
function NavButtons({ onBack, onNext, nextLabel = 'Continue', saving = false, canGoBack = true }) {
  return (
    <div style={{display:"flex",gap:"12px",padding:"1rem 1rem 1.5rem"}}>
      {canGoBack && (
        <button onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-3 rounded-[8px] #1a1a1a #606060 text-sm font-medium hover:rgba(255,255,255,0.08) active:scale-95 transition-all">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      <button onClick={onNext} disabled={saving}
        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[8px] font-bold text-sm transition-all active:scale-95
          ${saving ? '#1a1a1a #888' : 'bg-brazil-green text-white hover:bg-brazil-green/90'}`}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {nextLabel}
        {!saving && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Step 1: Personal Details ──────────────────────────────────────────────────
function Step1({ data, onChange, onNext }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  const validate = () => {
    if (!data.full_name?.trim()) return toast.error('Full name is required');
    if (!data.dob) return toast.error('Date of birth is required');
    if (!data.gender) return toast.error('Please select your gender');
    if (!data.emergency_contact_name?.trim()) return toast.error('Emergency contact name is required');
    if (!data.emergency_contact_phone?.trim()) return toast.error('Emergency contact phone is required');
    onNext();
  };

  return (
    <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"16px"}}>
      <div>
        <h2 style={{fontSize:"1.25rem",fontWeight:800,color:"#fff",marginBottom:"4px"}}>Personal Details</h2>
        <p style={{fontSize:"0.875rem",color:"#606060"}}>This information is collected once and used across all your documents.</p>
      </div>

      <Field label="Full Name *" value={data.full_name} onChange={v => set('full_name', v)} placeholder="Your full legal name" />
      <Field label="Date of Birth *" type="date" value={data.dob} onChange={v => set('dob', v)} />

      <div>
        <label style={{fontSize:"0.75rem",color:"#888",marginBottom:"6px",display:"block"}}>Gender *</label>
        <div className="grid grid-cols-2 gap-3">
          {['Male', 'Female'].map(g => (
            <button key={g} type="button"
              onClick={() => set('gender', g)}
              className={`py-3 rounded-[8px] text-sm font-medium border transition-all active:scale-95
                ${data.gender === g ? 'border-brazil-green bg-brazil-green/20 text-brazil-green' : 'border-white/15 #1a1a1a #606060'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <Field label="Phone Number" value={data.phone} onChange={v => set('phone', v)} placeholder="+44 7700 000000" type="tel" />
      <Field label="Email Address" value={data.email} onChange={v => set('email', v)} placeholder="your@email.com" type="email" />
      <Field label="Full Address" value={data.address} onChange={v => set('address', v)} placeholder="House number, street, city, postcode" multiline />
      <Field label="Occupation" value={data.occupation} onChange={v => set('occupation', v)} placeholder="Your job title or role" />

      <div className="card-dark space-y-3">
        <p className="text-xs font-bold #606060 uppercase tracking-wide">Emergency Contact</p>
        <Field label="Contact Name *" value={data.emergency_contact_name} onChange={v => set('emergency_contact_name', v)} placeholder="Full name" />
        <Field label="Contact Phone *" value={data.emergency_contact_phone} onChange={v => set('emergency_contact_phone', v)} placeholder="+44 7700 000000" type="tel" />
      </div>

      <NavButtons canGoBack={false} onNext={validate} />
    </div>
  );
}

// ── Step 2: Lifestyle & Goals ─────────────────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  const validate = () => {
    if (!data.motivation?.trim()) return toast.error('Please describe your motivation');
    if (!data.goal_short?.trim()) return toast.error('Please set a short-term goal');
    onNext();
  };

  return (
    <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"16px"}}>
      <div>
        <h2 style={{fontSize:"1.25rem",fontWeight:800,color:"#fff",marginBottom:"4px"}}>Lifestyle & Goals</h2>
        <p style={{fontSize:"0.875rem",color:"#606060"}}>Help your trainer understand you better.</p>
      </div>

      <Field label="Describe your lifestyle — occupation, working hours, hobbies, family commitments, time available to exercise"
        value={data.lifestyle_description} onChange={v => set('lifestyle_description', v)} multiline rows={4}
        placeholder="e.g. Office job, 9-5 Mon-Fri, two young children, can train 3 mornings per week..." />

      {/* Smoking */}
      <div className="card-dark space-y-3">
        <ToggleRow label="Do you smoke?" value={data.smokes} onChange={v => set('smokes', v)} />
        {data.smokes && (
          <Field label="How many cigarettes per day?" type="number" value={data.cigarettes_per_day}
            onChange={v => set('cigarettes_per_day', v)} placeholder="e.g. 10" />
        )}
      </div>

      {/* Alcohol */}
      <div className="card-dark space-y-3">
        <ToggleRow label="Do you drink alcohol?" value={data.drinks_alcohol} onChange={v => set('drinks_alcohol', v)} />
        {data.drinks_alcohol && (
          <Field label="Approximately how many units per week?" type="number" value={data.alcohol_units_per_week}
            onChange={v => set('alcohol_units_per_week', v)} placeholder="e.g. 14" />
        )}
      </div>

      <Field label="Current motivation and attitude to exercise *"
        value={data.motivation} onChange={v => set('motivation', v)} multiline rows={3}
        placeholder="Why do you want to start training? How committed do you feel?" />

      <Field label="Exercise you enjoy (likes)"
        value={data.exercise_likes} onChange={v => set('exercise_likes', v)} multiline rows={2}
        placeholder="e.g. Running, swimming, group classes..." />

      <Field label="Exercise you dislike or want to avoid"
        value={data.exercise_dislikes} onChange={v => set('exercise_dislikes', v)} multiline rows={2}
        placeholder="e.g. Running due to bad knees, heavy lifting..." />

      {/* FITT */}
      <div className="card-dark space-y-3">
        <p className="text-xs font-bold #606060 uppercase tracking-wide">Current Exercise — FITT Principle</p>
        <Field label="Frequency (how often per week?)" value={data.fitt_frequency} onChange={v => set('fitt_frequency', v)} placeholder="e.g. 2 times per week" />
        <Field label="Intensity (how hard do you exercise?)" value={data.fitt_intensity} onChange={v => set('fitt_intensity', v)} placeholder="e.g. Moderate, I break a sweat but can talk" />
        <Field label="Type (what do you currently do?)" value={data.fitt_type} onChange={v => set('fitt_type', v)} placeholder="e.g. Walking, occasional gym, yoga" />
        <Field label="Time (how long per session?)" value={data.fitt_time} onChange={v => set('fitt_time', v)} placeholder="e.g. 30-45 minutes" />
      </div>

      <Field label="Barriers to exercise"
        value={data.barriers} onChange={v => set('barriers', v)} multiline rows={2}
        placeholder="e.g. Lack of time, low energy after work, unsure what to do..." />

      <Field label="Strategies to overcome those barriers"
        value={data.barriers_strategies} onChange={v => set('barriers_strategies', v)} multiline rows={2}
        placeholder="e.g. Schedule sessions in diary, train with trainer for accountability..." />

      {/* SMART Goals */}
      <div className="card-dark space-y-3">
        <p className="text-xs font-bold #606060 uppercase tracking-wide">SMART Goals</p>
        <Field label="Short-term goal (0-3 months) *"
          value={data.goal_short} onChange={v => set('goal_short', v)} multiline rows={2}
          placeholder="e.g. Complete 3 sessions per week consistently for 8 weeks" />
        <Field label="Medium-term goal (3-6 months)"
          value={data.goal_medium} onChange={v => set('goal_medium', v)} multiline rows={2}
          placeholder="e.g. Lose 8kg and fit into size 14 comfortably" />
        <Field label="Long-term goal (6-12 months)"
          value={data.goal_long} onChange={v => set('goal_long', v)} multiline rows={2}
          placeholder="e.g. Run a 5K in under 30 minutes and feel confident in my body" />
      </div>

      <Field label="Nutritional information / food diary notes"
        value={data.nutrition_notes} onChange={v => set('nutrition_notes', v)} multiline rows={3}
        placeholder="Describe your typical diet, any dietary restrictions, food habits..." />

      <NavButtons onBack={onBack} onNext={validate} />
    </div>
  );
}

// ── Step 3: PAR-Q ─────────────────────────────────────────────────────────────
const PARQ_QUESTIONS = [
  'Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?',
  'Do you feel pain in your chest when you do physical activity?',
  'In the past month, have you had chest pain when you were not doing physical activity?',
  'Do you lose your balance because of dizziness or do you ever lose consciousness?',
  'Do you have a bone or joint problem (for example, back, knee or hip) that could be made worse by a change in your physical activity?',
  'Is your doctor currently prescribing drugs (for example, water pills) for your blood pressure or heart condition?',
  'Do you know of any other reason why you should not do physical activity?',
];

function Step3({ data, onChange, onNext, onBack, clientName }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const keys = ['q1','q2','q3','q4','q5','q6','q7'];
  const anyYes = keys.some(k => data[k]);

  return (
    <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"16px"}}>
      <div>
        <h2 style={{fontSize:"1.25rem",fontWeight:800,color:"#fff",marginBottom:"4px"}}>PAR-Q Health Questionnaire</h2>
        <p style={{fontSize:"0.875rem",color:"#606060"}}>Physical Activity Readiness Questionnaire</p>
      </div>

      <div className="#1a1a1a rounded-[8px] px-4 py-3 flex gap-3">
        <User className="w-4 h-4 text-brazil-green mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">{clientName}</p>
          <p className="text-xs #888">Please answer each question honestly</p>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
        {PARQ_QUESTIONS.map((q, i) => (
          <div key={i} className={`card-dark border transition-all ${data[keys[i]] ? 'border-red-500/30 bg-red-500/5' : 'border-white/8'}`}>
            <p className="text-sm text-white leading-relaxed mb-3">
              <span className="text-brazil-green font-bold">Q{i+1}. </span>{q}
            </p>
            <div className="flex gap-3">
              {[false, true].map(val => (
                <button key={String(val)} type="button"
                  onClick={() => set(keys[i], val)}
                  className={`flex-1 py-2.5 rounded-[8px] text-sm font-bold border transition-all active:scale-95
                    ${data[keys[i]] === val
                      ? val ? 'border-red-500/60 bg-red-500/20 text-red-400' : 'border-brazil-green/60 bg-brazil-green/20 text-brazil-green'
                      : 'border-white/15 #1a1a1a #606060 hover:#0f0f0f'
                    }`}>
                  {val ? 'YES' : 'NO'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Field label="Additional notes (optional)" value={data.additional_notes}
        onChange={v => set('additional_notes', v)} multiline rows={3}
        placeholder="Any other health information your trainer should know..." />

      {/* Result message */}
      {anyYes ? (
        <div className="flex gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-[8px] px-4 py-4">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-400 mb-1">Medical Consultation Recommended</p>
            <p style={{fontSize:"0.75rem",color:"#606060"}}>You have answered YES to one or more questions. Please consult your doctor before starting your programme. Your trainer has been notified.</p>
          </div>
        </div>
      ) : (
        keys.every(k => data[k] === false) && (
          <div className="flex gap-3 bg-brazil-green/10 border border-brazil-green/30 rounded-[8px] px-4 py-4">
            <CheckCircle className="w-5 h-5 text-brazil-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-brazil-green mb-1">You are ready to start!</p>
              <p style={{fontSize:"0.75rem",color:"#606060"}}>Great — you answered NO to all questions. You are cleared to begin your fitness journey!</p>
            </div>
          </div>
        )
      )}

      <NavButtons onBack={onBack} onNext={() => {
        if (keys.some(k => data[k] === null || data[k] === undefined)) return toast.error('Please answer all 7 questions');
        onNext();
      }} />
    </div>
  );
}

// ── Step 4: Informed Consent ──────────────────────────────────────────────────
const INFORMED_CONSENT_TEXT = `I voluntarily agree to engage in a programme of physical activity under the supervision of Andre Viana, Personal Trainer.

NATURE OF THE PROGRAMME
The programme may include cardiovascular exercise, strength training, flexibility work, functional movement and other fitness-related activities. The programme will be designed to meet my individual goals and health status.

RISKS OF EXERCISE
I understand that physical exercise involves certain inherent risks, including but not limited to: muscle soreness, fatigue, joint stress, falls, and in rare cases cardiovascular complications. I confirm that I have answered the PAR-Q health questionnaire honestly and that I am not aware of any medical reason that would prevent me from undertaking a programme of physical exercise.

EMERGENCY PROCEDURES
In the event of an emergency, my trainer has my emergency contact details. I consent to my trainer calling emergency services on my behalf if required.

TRAINER'S ROLE
I understand that my trainer will design, supervise and progress my programme based on my goals and feedback. Results are dependent on my effort, consistency, nutrition and lifestyle choices.

CONSENT TO DATA USE
I consent to my personal and health data being stored securely and used for the purpose of delivering personal training services, in accordance with the UK GDPR. This data will not be shared with any third party without my explicit consent.

RIGHT TO WITHDRAW
I understand that I may withdraw from any activity or exercise at any time, without question, without penalty.

VOLUNTARY PARTICIPATION
I confirm that my participation in this programme is entirely voluntary. I have read this document, had the opportunity to ask questions, and all my questions have been answered to my satisfaction.

MEDICAL DISCLAIMER
I acknowledge that the personal trainer is not a medical professional. Any advice given relating to exercise, lifestyle or nutrition is general guidance only and is not a substitute for professional medical advice.

INDEMNITY
I agree to participate in all activities at my own risk. The trainer carries public liability insurance. I release Andre Viana Personal Training from liability for any injury, loss or damage except where caused by gross negligence.`;

function Step4({ data, onChange, onNext, onBack, clientName, existingSignature }) {
  const sigRef = useRef(null);
  const [checked, setChecked] = useState(data.read_understood || false);
  const [signed, setSigned] = useState(!!data.signature_data);

  // Load existing signature if available
  useEffect(() => {
    if (data.signature_data && sigRef.current) {
      sigRef.current.loadFromDataURL(data.signature_data);
    }
  }, []);

  const handleUseExisting = () => {
    if (existingSignature && sigRef.current) {
      sigRef.current.loadFromDataURL(existingSignature);
      setSigned(true);
    }
  };

  const validate = () => {
    if (!checked) return toast.error('Please check the box confirming you have read the document');
    if (!sigRef.current || sigRef.current.isEmpty()) return toast.error('Please sign in the signature box');
    onChange({
      ...data,
      read_understood: true,
      signature_data: sigRef.current.getDataURL(),
      signed_name: clientName,
      signed_date: new Date().toISOString().split('T')[0],
    });
    onNext();
  };

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"16px"}}>
      <div>
        <h2 style={{fontSize:"1.25rem",fontWeight:800,color:"#fff",marginBottom:"4px"}}>Informed Consent</h2>
        <p style={{fontSize:"0.875rem",color:"#606060"}}>Please read the full document before signing.</p>
      </div>

      <div className="card-dark max-h-64 overflow-y-auto">
        <p className="text-xs font-bold text-brazil-green mb-3 uppercase tracking-wide">
          Informed Consent for Physical Fitness Programme — BrazilFit
        </p>
        <p className="text-xs #606060 whitespace-pre-line leading-relaxed">{INFORMED_CONSENT_TEXT}</p>
      </div>

      <label className="flex gap-3 p-4 #1a1a1a rounded-[8px] border border-white/10 cursor-pointer active:#1a1a1a">
        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all border
          ${checked ? 'bg-brazil-green border-brazil-green' : 'border-white/30 bg-transparent'}`}
          onClick={() => setChecked(!checked)}>
          {checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
        </div>
        <p style={{fontSize:"0.875rem",color:"#fff"}}>I have read and understood the above information and all my questions have been answered.</p>
      </label>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs #888">Signature *</label>
          {existingSignature && !signed && (
            <button type="button" onClick={handleUseExisting}
              className="text-xs text-brazil-green hover:underline">
              Use same signature as consent
            </button>
          )}
        </div>
        <SignaturePad ref={sigRef} onSign={() => setSigned(true)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="#1a1a1a rounded-[8px] px-3 py-2.5">
          <p className="text-[10px] #888 mb-0.5">Name</p>
          <p className="text-sm font-medium">{clientName}</p>
        </div>
        <div className="#1a1a1a rounded-[8px] px-3 py-2.5">
          <p className="text-[10px] #888 mb-0.5">Date</p>
          <p className="text-sm font-medium">{today}</p>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={validate} />
    </div>
  );
}

// ── Step 5: Terms & Conditions ────────────────────────────────────────────────
const TC_TERMS = [
  {
    num: 1, title: 'AGREEMENT TO PARTICIPATE',
    text: 'The client agrees to participate in a personal training programme designed and delivered by Andre Viana Personal Training. This agreement commences on the date of signing and continues for the duration of the training relationship.',
  },
  {
    num: 2, title: 'HEALTH AND MEDICAL CLEARANCE',
    text: 'The client confirms they have completed the PAR-Q health questionnaire honestly and completely. The client accepts responsibility for informing the trainer of any changes to their medical condition, injury or health status before each session. The trainer reserves the right to refuse to conduct a session if safety is a concern.',
  },
  {
    num: 3, title: 'PAYMENT TERMS',
    text: "Personal training is sold in blocks of 10 sessions. Payment is due in full before the block commences. The agreed block price is confirmed at the start of each block. Prices are subject to review with one calendar month's notice.",
  },
  {
    num: 4, title: 'CANCELLATION POLICY',
    text: "A minimum of 24 hours' notice is required to cancel or reschedule a session. Sessions cancelled with less than 24 hours' notice will be charged in full and deducted from the client's block. The trainer will endeavour to provide the same notice for any trainer-initiated cancellations.",
  },
  {
    num: 5, title: 'LATENESS',
    text: 'If the client is late to a session, the session will end at the originally scheduled time and the full session fee applies. If the trainer is late, the session will be extended or an alternative arrangement will be made.',
  },
  {
    num: 6, title: 'PERSONAL TRAINING SESSIONS',
    text: 'All sessions are one-to-one unless otherwise agreed. Sessions are non-transferable. Block sessions expire 12 weeks from the date of purchase unless otherwise agreed in writing.',
  },
  {
    num: 7, title: 'CONDUCT AND PROFESSIONALISM',
    text: 'Both parties agree to treat each other with courtesy and respect. The trainer will maintain professional standards at all times. The client agrees to arrive appropriately dressed and equipped for training. The trainer reserves the right to terminate the training relationship if conduct is inappropriate.',
  },
  {
    num: 8, title: 'LIABILITY',
    text: "The client participates in all activities entirely at their own risk. The trainer carries public liability insurance. The trainer accepts no liability for loss or damage to the client's personal property. The client accepts that results depend on individual effort, lifestyle choices and adherence to the programme.",
  },
  {
    num: 9, title: 'DATA PROTECTION (GDPR)',
    text: "Personal data collected during onboarding is stored securely and used solely for delivering personal training services. Data will not be shared with third parties without the client's consent. The client has the right to access, amend or request deletion of their data.",
  },
  {
    num: 10, title: 'VARIATION AND ENTIRE AGREEMENT',
    text: 'These terms constitute the entire agreement between the parties. Any variation must be agreed in writing by both parties. By signing, the client confirms they have read, understood and agree to all terms for the duration of their training with Andre Viana Personal Training.',
  },
];

function Step5({ data, onChange, onNext, onBack, clientName, consentSignature }) {
  const sigRef = useRef(null);
  const [agreed, setAgreed] = useState(data.agreed || false);
  const [signed, setSigned] = useState(!!data.signature_data);

  useEffect(() => {
    if (data.signature_data && sigRef.current) {
      sigRef.current.loadFromDataURL(data.signature_data);
    }
  }, []);

  const handleUseConsent = () => {
    if (consentSignature && sigRef.current) {
      sigRef.current.loadFromDataURL(consentSignature);
      setSigned(true);
    }
  };

  const validate = () => {
    if (!agreed) return toast.error('Please check the agreement box');
    if (!sigRef.current || sigRef.current.isEmpty()) return toast.error('Please sign in the signature box');
    onChange({
      ...data,
      agreed: true,
      signature_data: sigRef.current.getDataURL(),
      signed_name: clientName,
      signed_date: new Date().toISOString().split('T')[0],
    });
    onNext();
  };

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{padding:"1rem",display:"flex",flexDirection:"column",gap:"16px"}}>
      <div>
        <h2 style={{fontSize:"1.25rem",fontWeight:800,color:"#fff",marginBottom:"4px"}}>Terms & Conditions</h2>
        <p style={{fontSize:"0.875rem",color:"#606060"}}>Please read all terms before signing.</p>
      </div>

      <div className="card-dark max-h-72 overflow-y-auto space-y-4">
        {TC_TERMS.map(t => (
          <div key={t.num}>
            <p className="text-xs font-bold text-brazil-green uppercase mb-1">
              {t.num}. {t.title}
            </p>
            <p className="text-xs #606060 leading-relaxed">{t.text}</p>
          </div>
        ))}
      </div>

      <label className="flex gap-3 p-4 #1a1a1a rounded-[8px] border border-white/10 cursor-pointer active:#1a1a1a">
        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all border
          ${agreed ? 'bg-brazil-green border-brazil-green' : 'border-white/30 bg-transparent'}`}
          onClick={() => setAgreed(!agreed)}>
          {agreed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
        </div>
        <p style={{fontSize:"0.875rem",color:"#fff"}}>I agree to the above Terms and Conditions for the duration of my training with Andre Viana Personal Trainer.</p>
      </label>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs #888">Signature *</label>
          {consentSignature && !signed && (
            <button type="button" onClick={handleUseConsent}
              className="text-xs text-brazil-green hover:underline">
              Use same signature from Step 4
            </button>
          )}
        </div>
        <SignaturePad ref={sigRef} onSign={() => setSigned(true)} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="#1a1a1a rounded-[8px] px-3 py-2.5 col-span-2">
          <p className="text-[10px] #888 mb-0.5">Client name</p>
          <p className="text-sm font-medium">{clientName}</p>
        </div>
        <div className="#1a1a1a rounded-[8px] px-3 py-2.5">
          <p className="text-[10px] #888 mb-0.5">Date</p>
          <p className="text-sm font-medium">{today}</p>
        </div>
        <div className="#1a1a1a rounded-[8px] px-3 py-2.5 col-span-3">
          <p className="text-[10px] #888 mb-0.5">Trainer</p>
          <p className="text-sm font-medium">Andre Viana</p>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={validate} nextLabel="Complete Onboarding" />
    </div>
  );
}

// ── Complete screen ───────────────────────────────────────────────────────────
function CompletionScreen({ onGoHome }) {
  return (
    <div style={{minHeight:"100vh",backgroundColor:"#0f0f0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"1.5rem",textAlign:"center"}}>
      <div className="w-20 h-20 bg-brazil-green/20 rounded-full flex items-center justify-center mb-6 animate-fade-in">
        <CheckCircle className="w-12 h-12 text-brazil-green" />
      </div>
      <h1 className="text-3xl font-black mb-2 animate-fade-in">
        Welcome to <span className="text-brazil-green">Brazil</span><span className="text-brazil-yellow">Fit</span>!
      </h1>
      <p className="#606060 mb-2 max-w-xs animate-fade-in">
        Your documents have been signed and saved.
      </p>
      <p className="#888 text-sm mb-8 max-w-xs animate-fade-in">
        Andre will be in touch shortly to get you started on your fitness journey.
      </p>
      <div className="#1a1a1a rounded-[12px] px-6 py-4 mb-8 border border-white/10 w-full max-w-xs animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-4 h-4 text-brazil-green" />
          <p style={{fontSize:"0.875rem"}}>Personal details saved</p>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-4 h-4 text-brazil-green" />
          <p style={{fontSize:"0.875rem"}}>Lifestyle & goals recorded</p>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-4 h-4 text-brazil-green" />
          <p style={{fontSize:"0.875rem"}}>PAR-Q health questionnaire complete</p>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-4 h-4 text-brazil-green" />
          <p style={{fontSize:"0.875rem"}}>Informed Consent signed</p>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-brazil-green" />
          <p style={{fontSize:"0.875rem"}}>Terms & Conditions signed</p>
        </div>
      </div>
      <button onClick={onGoHome}
        className="bg-brazil-green text-white font-bold px-8 py-4 rounded-[12px] text-sm active:scale-95 transition-transform animate-fade-in">
        Go to My Dashboard
      </button>
    </div>
  );
}

// ── Shared form components ────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', multiline = false, rows = 3 }) {
  const cls = 'w-full #1a1a1a border border-white/10 rounded-[8px] px-3 py-2.5 text-sm focus:outline-none focus:border-brazil-green/50 placeholder:#606060';
  return (
    <div>
      <label style={{fontSize:"0.75rem",color:"#888",marginBottom:"6px",display:"block"}}>{label}</label>
      {multiline
        ? <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${cls} resize-none`} />
        : <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type} className={cls} />
      }
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <p style={{fontSize:"0.875rem",color:"#fff"}}>{label}</p>
      <div style={{display:"flex",gap:"8px"}}>
        {[false, true].map(v => (
          <button key={String(v)} type="button" onClick={() => onChange(v)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95
              ${value === v
                ? v ? 'border-red-500/60 bg-red-500/20 text-red-400' : 'border-brazil-green/60 bg-brazil-green/20 text-brazil-green'
                : 'border-white/15 #1a1a1a #606060'}`}>
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [step1, setStep1] = useState({ full_name: user?.name || '', dob: '', gender: '', phone: '', email: user?.email || '', address: '', occupation: '', emergency_contact_name: '', emergency_contact_phone: '' });
  const [step2, setStep2] = useState({ lifestyle_description:'', smokes:false, cigarettes_per_day:'', drinks_alcohol:false, alcohol_units_per_week:'', motivation:'', exercise_likes:'', exercise_dislikes:'', fitt_frequency:'', fitt_intensity:'', fitt_type:'', fitt_time:'', barriers:'', barriers_strategies:'', goal_short:'', goal_medium:'', goal_long:'', nutrition_notes:'' });
  const [step3, setStep3] = useState({ q1:null, q2:null, q3:null, q4:null, q5:null, q6:null, q7:null, additional_notes:'' });
  const [step4, setStep4] = useState({ read_understood:false, signature_data:'', signed_name:'', signed_date:'' });
  const [step5, setStep5] = useState({ agreed:false, signature_data:'', signed_name:'', signed_date:'' });

  useEffect(() => {
    loadExisting();
  }, []);

  const loadExisting = async () => {
    try {
      const [statusRes, dataRes] = await Promise.all([
        api.get('/onboarding/status'),
        api.get('/onboarding/data'),
      ]);
      const status = statusRes.data;
      const data = dataRes.data;

      // Pre-fill from saved data
      if (data.personal) setStep1(s => ({ ...s, ...data.personal }));
      if (data.lifestyle) setStep2(s => ({ ...s, ...data.lifestyle }));
      if (data.parq) setStep3(s => ({ ...s, ...data.parq }));

      // Jump to first incomplete step
      if (status.completed) {
        setCompleted(true);
      } else if (status.step4_complete) {
        setStep(5);
      } else if (status.step3_complete) {
        setStep(4);
      } else if (status.step2_complete) {
        setStep(3);
      } else if (status.step1_complete) {
        setStep(2);
      }
    } catch {
      // New client, start from step 1
    } finally {
      setLoading(false);
    }
  };

  const saveStep = async (stepNum, data) => {
    setSaving(true);
    try {
      await api.post(`/onboarding/step${stepNum}`, data);
      setStep(stepNum + 1);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (finalStep5Data) => {
    setSaving(true);
    try {
      await Promise.all([
        api.post('/onboarding/step4', step4),
        api.post('/onboarding/step5', finalStep5Data),
      ]);
      await api.post('/onboarding/complete');
      setCompleted(true);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to complete onboarding. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{minHeight:"100vh",backgroundColor:"#0f0f0f",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px"}}>
        <div style={{width:"40px",height:"40px",border:"2px solid #4CAF50",borderTop:"2px solid transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}} />
        <p style={{color:"#606060",fontSize:"0.875rem"}}>Loading your onboarding...</p>
      </div>
    </div>
  );

  if (completed) return <CompletionScreen onGoHome={() => navigate('/client')} />;

  return (
    <div style={{minHeight:"100vh",backgroundColor:"#0f0f0f",display:"flex",flexDirection:"column"}}>
      <ProgressBar step={step} />
      <div style={{flex:1,overflowY:"auto",paddingBottom:"1rem",maxWidth:"512px",margin:"0 auto",width:"100%"}}>
        {step === 1 && <Step1 data={step1} onChange={setStep1} onNext={() => saveStep(1, step1)} />}
        {step === 2 && <Step2 data={step2} onChange={setStep2} onBack={() => setStep(1)} onNext={() => saveStep(2, step2)} />}
        {step === 3 && <Step3 data={step3} onChange={setStep3} onBack={() => setStep(2)} onNext={() => saveStep(3, step3)} clientName={step1.full_name} />}
        {step === 4 && <Step4 data={step4} onChange={setStep4} onBack={() => setStep(3)} onNext={() => setStep(5)} clientName={step1.full_name} existingSignature={step4.signature_data} />}
        {step === 5 && <Step5 data={step5} onChange={d => { setStep5(d); handleComplete(d); }} onBack={() => setStep(4)} onNext={() => {}} clientName={step1.full_name} consentSignature={step4.signature_data} />}
      </div>
    </div>
  );
}
