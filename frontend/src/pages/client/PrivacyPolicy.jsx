import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BG='#0f0f0f';const SURFACE='#1a1a1a';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#888';const ORANGE='#FF6B2B';const GREEN='#4CAF50';

const SECTIONS = [
  {
    title: '1. Who We Are',
    content: `BrazilFit is a personal training service operated by Andre Viana, based in Newcastle, United Kingdom. We provide fitness coaching, wellness support, and health tracking through the BrazilFit app available at brazilfit.co.uk.

Data Controller: Andre Viana
Contact: andre@brazilfit.co.uk
Address: Newcastle, United Kingdom`
  },
  {
    title: '2. What Data We Collect',
    content: `We collect the following personal data when you use BrazilFit:

Personal Information
• Full name, email address, username
• Date of birth, gender, height, weight

Health & Fitness Data (Special Category)
• Body measurements (waist, hips, chest)
• Progress photos
• Session attendance and workout logs
• Weekly check-in responses (mood, sleep, stress, energy)
• Habit tracking data (water, steps, nutrition)
• Wearable device data (heart rate, HRV, sleep, steps)

Usage Data
• Login times and session activity
• Messages with your PT
• Nutrition diary entries`
  },
  {
    title: '3. Why We Process Your Data',
    content: `We process your data for the following purposes:

Providing the Service (Contractual Basis)
• Scheduling and tracking PT sessions
• Monitoring your progress and adapting your programme
• Sending you relevant notifications

Health Coaching (Explicit Consent)
• Processing special category health data to personalise your training
• Tracking physical and mental wellbeing over time
• Analysing trends to improve your results

You provide explicit consent to process your health data when you create your account. You may withdraw this consent at any time by deleting your account.

Legitimate Interests
• Improving the BrazilFit service
• Maintaining the security of the platform`
  },
  {
    title: '4. How We Store Your Data',
    content: `Your data is stored securely on Railway infrastructure located in the United States, protected by industry-standard encryption.

• Data in transit is encrypted using HTTPS/TLS
• Passwords are hashed using bcrypt (never stored in plain text)
• Progress photos are stored securely and only accessible by you and your PT
• Wearable data is processed through Open Wearables, our self-hosted integration

We retain your data for as long as you are an active client. If you delete your account, all personal data is permanently deleted within 30 days.`
  },
  {
    title: '5. Who We Share Your Data With',
    content: `We do not sell your personal data to any third party.

Your data is shared with:
• Railway (infrastructure hosting) — under data processing agreement
• Open Wearables (wearable data sync) — self-hosted, data stays within our infrastructure

Your PT (Andre Viana) has access to all your health, fitness, and check-in data for the purpose of coaching you. This is essential to the service.

We do not share your data with advertisers, marketing companies, or any other third parties.`
  },
  {
    title: '6. Your Rights Under GDPR',
    content: `As a UK resident, you have the following rights:

Right to Access — Request a copy of all data we hold about you
Right to Rectification — Correct inaccurate data
Right to Erasure — Request deletion of your data ("right to be forgotten")
Right to Restriction — Limit how we process your data
Right to Portability — Receive your data in a machine-readable format
Right to Object — Object to processing based on legitimate interests
Right to Withdraw Consent — For health data processing at any time

To exercise any of these rights, contact us at andre@brazilfit.co.uk. We will respond within 30 days. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.`
  },
  {
    title: '7. Data Export & Deletion',
    content: `You can export all your personal data at any time from Settings → Privacy → Export My Data. This includes all your health metrics, check-ins, progress photos, messages, and session history in JSON format.

You can delete your account at any time from Settings → Privacy → Delete Account. All your data will be permanently erased within 30 days of deletion.`
  },
  {
    title: '8. Cookies',
    content: `BrazilFit uses a session token stored in your browser to keep you logged in. This is essential for the app to function and does not require your consent under the PECR "strictly necessary" exemption.

We do not use advertising cookies, tracking cookies, or third-party analytics cookies.`
  },
  {
    title: '9. Children',
    content: `BrazilFit is not intended for children under the age of 16. We do not knowingly collect data from children. If you believe we have collected data from a child, please contact us immediately at andre@brazilfit.co.uk.`
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via the app or email. The date of the last update is shown below.

Last updated: May 2026`
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor:BG, minHeight:'100vh', paddingBottom:'6rem', fontFamily:"'DM Sans',system-ui" }}>
      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'2rem 1.25rem' }}>

        {/* Header */}
        <button onClick={()=>navigate(-1)} style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', color:MUTED, cursor:'pointer', fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', fontWeight:600, padding:0, minHeight:'auto', marginBottom:'1.5rem' }}>
          <ChevronLeft size={18}/> Back
        </button>

        <div style={{ marginBottom:'2rem' }}>
          <p style={{ fontSize:'0.6rem', fontWeight:700, letterSpacing:'0.2em', color:ORANGE, textTransform:'uppercase', margin:'0 0 6px' }}>Legal</p>
          <h1 style={{ fontSize:'2.5rem', fontWeight:800, color:TEXT, letterSpacing:'-0.05em', margin:'0 0 4px', lineHeight:1 }}>Privacy Policy</h1>
          <p style={{ fontSize:'0.82rem', color:MUTED, margin:'0 0 1rem' }}>Last updated: May 2026</p>
          <div style={{ background:'rgba(76,175,80,0.08)', border:'1px solid rgba(76,175,80,0.2)', borderRadius:'12px', padding:'1rem', display:'flex', gap:'10px' }}>
            <span style={{ fontSize:'1.2rem', flexShrink:0 }}>🔒</span>
            <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', color:'#c0c0c0', margin:0, lineHeight:1.6 }}>
              BrazilFit is fully GDPR compliant. We never sell your data. Your health information is used only to deliver your coaching programme.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {SECTIONS.map((s, i) => (
            <div key={i} style={{ background:SURFACE, borderRadius:'14px', border:`1px solid ${BORDER}`, overflow:'hidden' }}>
              <div style={{ height:'3px', background:`linear-gradient(90deg,${ORANGE},#FFD600)`, opacity: i===0?1:0.4 }}/>
              <div style={{ padding:'1.1rem 1.25rem' }}>
                <h3 style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.95rem', fontWeight:800, color:TEXT, margin:'0 0 10px', letterSpacing:'-0.01em' }}>{s.title}</h3>
                <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', color:'#c0c0c0', margin:0, lineHeight:1.8, whiteSpace:'pre-line' }}>{s.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ marginTop:'1.5rem', background:'linear-gradient(135deg,#1a1a0a,#1a1a1a)', border:'1px solid rgba(255,107,43,0.2)', borderRadius:'14px', padding:'1.25rem', textAlign:'center' }}>
          <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', fontWeight:700, color:TEXT, margin:'0 0 6px' }}>Questions about your data?</p>
          <p style={{ fontFamily:"'DM Sans',system-ui", fontSize:'0.82rem', color:MUTED, margin:'0 0 12px' }}>Contact us and we'll respond within 30 days</p>
          <a href="mailto:andre@brazilfit.co.uk" style={{ display:'inline-block', padding:'10px 24px', background:`linear-gradient(135deg,${ORANGE},#FFD600)`, borderRadius:'10px', color:'#000', fontFamily:"'DM Sans',system-ui", fontSize:'0.875rem', fontWeight:800, textDecoration:'none' }}>
            andre@brazilfit.co.uk
          </a>
        </div>

      </div>
    </div>
  );
}
