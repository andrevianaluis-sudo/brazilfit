import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, Check, ChevronLeft, Lock } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BG='#141414';const SURFACE='#1e1e1e';const SURFACE2='#2a2a2a';const BORDER='rgba(255,255,255,0.08)';const ORANGE='#FF6B2B';const GREEN='#4CAF50';const YELLOW='#FFD600';const TEXT='#ffffff';const MUTED='#888888';
const STRIPE_LINK='https://buy.stripe.com/00w8wPaFv0ujbfpbMy8Ra00';

const BENEFITS=['Weekly check-in to share your progress with your PT','Wellness hub - mindfulness, breathing and mental health tips','85+ healthy meals with recipes and shopping lists','200+ expert nutrition tips across all categories','Stretching library with 400+ exercises and routine builder','Full session history - never lose track of a session','Food diary to log your daily meals'];

export default function ProUpgradePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (user?.isPro) {
    return (
      <div style={{backgroundColor:BG,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',textAlign:'center'}}>
        <h1 style={{color:YELLOW,fontSize:'1.8rem',fontWeight:800,margin:'0 0 8px'}}>You are already Pro!</h1>
        <p style={{color:MUTED,marginBottom:24}}>You have full access to all features.</p>
        <button onClick={()=>navigate('/client')} style={{background:ORANGE,color:'#fff',border:'none',borderRadius:12,padding:'14px 32px',fontSize:15,fontWeight:700,cursor:'pointer'}}>Go to Dashboard</button>
      </div>
    );
  }

  const handleMonthly = async () => {
    setLoading(true);
    try {
      await api.post('/subscriptions/checkout', { plan: 'monthly' });
      toast.success('Upgraded to Pro!');
      await refreshUser();
      navigate('/client');
    } catch(e) { toast.error('Payment failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{backgroundColor:BG,minHeight:'100vh',color:TEXT,fontFamily:"'DM Sans',system-ui",paddingBottom:80}}>
      <div style={{padding:'16px 20px 0'}}>
        <button onClick={()=>navigate(-1)} style={{background:'none',border:'none',color:MUTED,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:14}}>
          <ChevronLeft size={18}/> Back
        </button>
      </div>
      <div style={{textAlign:'center',padding:'24px 24px 0'}}>
        <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:64,height:64,borderRadius:20,background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,marginBottom:16}}>
          <Zap size={32} color="#000" fill="#000"/>
        </div>
        <h1 style={{fontFamily:"'DM Sans',system-ui",fontSize:'2rem',fontWeight:800,margin:'0 0 10px',letterSpacing:'-0.03em'}}>BrazilFit <span style={{color:ORANGE}}>Pro</span></h1>
        <p style={{fontSize:'1.1rem',fontWeight:600,color:YELLOW,margin:'0 0 6px'}}>Train smarter. Eat better. Track everything.</p>
        <p style={{fontSize:'14px',color:MUTED,margin:0}}>Everything you need to reach your goals - all in one place.</p>
      </div>

      <div style={{padding:'28px 20px 0'}}>
        <div style={{background:`linear-gradient(135deg,rgba(255,107,43,0.08),rgba(255,214,0,0.08))`,border:`2px solid ${ORANGE}`,borderRadius:20,padding:'24px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,right:0,background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,padding:'4px 14px',borderBottomLeftRadius:12,fontSize:11,fontWeight:800,color:'#000'}}>BEST VALUE</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,marginBottom:4}}>
            <span style={{fontSize:'3rem',fontWeight:800,color:TEXT,letterSpacing:'-0.05em',lineHeight:1}}>£24.99</span>
            <span style={{fontSize:'1rem',color:MUTED,marginBottom:6}}>/year</span>
          </div>
          <p style={{color:GREEN,fontWeight:700,fontSize:'0.875rem',margin:'0 0 4px'}}>Save 79% vs monthly - just £2.08/month</p>
          <p style={{color:MUTED,fontSize:'0.75rem',margin:0}}>One payment, full year of Pro access</p>
        </div>
      </div>

      <div style={{padding:'20px 20px 0'}}>
        <button onClick={()=>window.location.href=STRIPE_LINK} style={{width:'100%',border:'none',cursor:'pointer',background:`linear-gradient(135deg,${ORANGE},${YELLOW})`,borderRadius:16,padding:'18px 24px',fontSize:'17px',fontWeight:800,color:'#000',boxShadow:`0 4px 24px ${ORANGE}44`}}>
          Get Pro - £24.99/year
        </button>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:10}}>
          <Lock size={12} color={MUTED}/>
          <span style={{fontSize:12,color:MUTED}}>Secure payment via Stripe - Cancel anytime</span>
        </div>
      </div>

      <div style={{padding:'10px 20px 0'}}>
        <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p style={{fontSize:'0.75rem',color:MUTED,margin:'0 0 2px'}}>Or pay monthly</p>
            <p style={{fontSize:'1rem',fontWeight:700,color:TEXT,margin:0}}>£9.99/month</p>
          </div>
          <button onClick={handleMonthly} disabled={loading} style={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:10,padding:'8px 16px',color:MUTED,fontSize:'0.8rem',fontWeight:600,cursor:'pointer'}}>
            {loading ? '...' : 'Choose'}
          </button>
        </div>
      </div>

      <div style={{padding:'28px 20px 0'}}>
        <p style={{fontSize:'11px',fontWeight:700,color:ORANGE,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:12}}>Everything included</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {BENEFITS.map((b,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:14,background:SURFACE,borderRadius:12,padding:'12px 16px',border:`1px solid ${BORDER}`}}>
              <Check size={16} color={GREEN} style={{flexShrink:0}}/>
              <span style={{fontSize:14,fontWeight:500,color:TEXT}}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
