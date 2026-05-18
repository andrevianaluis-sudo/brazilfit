import { useNavigate } from 'react-router-dom';
import { Watch } from 'lucide-react';
const BG='#0f0f0f';const SURFACE='#1a1a1a';const BORDER='rgba(255,255,255,0.08)';const TEXT='#fff';const MUTED='#606060';const ORANGE='#FF6B2B';
export default function ClientWearable() {
  const navigate = useNavigate();
  return (
    <div style={{backgroundColor:BG,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center',fontFamily:"'DM Sans',system-ui"}}>
      <div style={{width:'64px',height:'64px',borderRadius:'16px',background:ORANGE+'15',border:'1px solid '+ORANGE+'30',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.5rem'}}>
        <Watch size={28} color={ORANGE}/>
      </div>
      <h2 style={{fontSize:'1.5rem',fontWeight:800,color:TEXT,letterSpacing:'-0.03em',margin:'0 0 8px'}}>Wearables Coming Soon</h2>
      <p style={{fontSize:'0.875rem',color:MUTED,margin:'0 0 1.5rem',lineHeight:1.6,maxWidth:'280px'}}>Apple Watch, Garmin, Oura Ring and Fitbit integration is on its way.</p>
      <button onClick={()=>navigate('/client')} style={{padding:'0.75rem 1.5rem',background:SURFACE,border:'1px solid '+BORDER,borderRadius:'12px',color:MUTED,fontSize:'0.875rem',fontWeight:600,cursor:'pointer'}}>Back to Dashboard</button>
    </div>
  );
}
