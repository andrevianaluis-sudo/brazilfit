import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
export default function PageIntroModal({ pageKey, title, description, color }) {
  color = color || '#FF6B2B';
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  useEffect(() => { if (!localStorage.getItem('bfit_' + pageKey)) setVisible(true); }, [pageKey]);
  const close = () => { if (dontShow) localStorage.setItem('bfit_' + pageKey, '1'); setVisible(false); };
  if (!visible) return null;
  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'0 0 24px',backdropFilter:'blur(4px)'}}>
      <div style={{width:'100%',maxWidth:'480px',background:'#1a1a1a',borderRadius:'24px 24px 16px 16px',overflow:'hidden',margin:'0 16px',boxShadow:'0 -8px 40px '+color+'30'}}>
        <div style={{background:'linear-gradient(135deg,'+color+','+color+'99)',padding:'20px',position:'relative'}}>
          <button onClick={close} style={{position:'absolute',top:12,right:12,background:'rgba(0,0,0,0.25)',border:'none',borderRadius:'50%',width:30,height:30,cursor:'pointer',color:'#fff',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}><X size={15}/></button>
          <h2 style={{fontFamily:'DM Sans',system-ui,fontSize:'1.3rem',fontWeight:800,color:'#fff',margin:0}}>{title}</h2>
        </div>
        <div style={{padding:'18px'}}>
          <p style={{fontFamily:'DM Sans',system-ui,fontSize:'0.875rem',color:'#bbb',lineHeight:1.6,margin:'0 0 18px'}}>{description}</p>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,cursor:'pointer'}} onClick={()=>setDontShow(d=>!d)}>
            <div style={{width:20,height:20,borderRadius:5,border:'2px solid '+(dontShow?color:'#444'),background:dontShow?color:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {dontShow && <Check size={12} color='#000' strokeWidth={3}/>}
            </div>
            <span style={{fontSize:'0.8rem',color:'#777'}}>Don't show this again</span>
          </div>
          <button onClick={close} style={{width:'100%',background:'linear-gradient(135deg,'+color+','+color+'bb)',border:'none',borderRadius:10,padding:13,fontSize:'0.9rem',fontWeight:700,color:'#fff',cursor:'pointer'}}>Got it, let's go!</button>
        </div>
      </div>
    </div>
  );
}
