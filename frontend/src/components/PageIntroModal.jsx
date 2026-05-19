import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function PageIntroModal({ pageKey, title, description, color = '#FF6B2B' }) {
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  useEffect(() => { const seen = localStorage.getItem('brazilfit_intro_' + pageKey); if (!seen) setVisible(true); }, [pageKey]);
  const handleClose = () => { if (dontShow) localStorage.setItem('brazilfit_intro_' + pageKey, '1'); setVisible(false); };
  if (!visible) return null;
  return (
    <div style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'0 0 24px',backdropFilter:'blur(4px)'}}>
      <div style={{width:'100%',maxWidth:'480px',background:'#1a1a1a',borderRadius:'24px 24px 16px 16px',border:'1px solid '+color+'40',overflow:'hidden',margin:'0 16px'}}>
        <div style={{background:'linear-gradient(135deg,'+color+'dd,'+color+'88)',padding:'24px 20px 20px',position:'relative'}}>
          <button onClick={handleClose} style={{position:'absolute',top:12,right:12,background:'rgba(0,0,0,0.2)',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',color:'#fff'}}><X size={16}/></button>
          <h2 style={{fontFamily:"'DM Sans',system-ui",fontSize:'1.4rem',fontWeight:800,color:'#fff',margin:0}}>{title}</h2>
        </div>
        <div style={{padding:'20px'}}>
          <p style={{fontFamily:"'DM Sans',system-ui",fontSize:'0.9rem',color:'#ccc',lineHeight:1.6,margin:'0 0 20px'}}>{description}</p>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}} onClick={()=>setDontShow(!dontShow)}>
            <div style={{width:22,height:22,borderRadius:6,border:'2px solid '+(dontShow?color:'rgba(255,255,255,0.2)'),background:dontShow?color:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              {dontShow && <Check size={13} color='#000' strokeWidth={3}/>}
            </div>
            <span style={{fontSize:'0.82rem',color:'#888',cursor:'pointer'}}>Don't show this again</span>
          </div>
          <button onClick={handleClose} style={{width:'100%',background:'linear-gradient(135deg,'+color+','+color+'aa)',border:'none',borderRadius:12,padding:'14px',fontSize:'0.95rem',fontWeight:700,color:'#fff',cursor:'pointer'}}>Got it, let's go!</button>
        </div>
      </div>
    </div>
  );
}
