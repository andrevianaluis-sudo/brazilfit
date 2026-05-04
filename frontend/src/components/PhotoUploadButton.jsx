import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import api from '../utils/api';

export default function PhotoUploadButton({ clientId, onUploadSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState('front');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const angles = [
    { value: 'front', label: 'Front' },
    { value: 'side', label: 'Side' },
    { value: 'back', label: 'Back' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedAngle) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('angle', selectedAngle);
      formData.append('notes', notes);
      await api.post('/progress/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFile(null);
      setPreview(null);
      setSelectedAngle('front');
      setNotes('');
      setIsOpen(false);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{ display:'flex', alignItems:'center', gap:8, background:'#4CAF50', color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontSize:14, fontWeight:700, cursor:'pointer' }}
      >
        <Camera size={16} />
        Upload Photo
      </button>

      {isOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center', background:'rgba(0,0,0,0.8)' }}>
          <div style={{ width:'100%', maxWidth:480, background:'#1e1e1e', borderRadius:'20px 20px 0 0', padding:24, maxHeight:'90vh', overflowY:'auto', border:'1px solid rgba(255,255,255,0.1)', borderBottom:'none' }}>
            
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ color:'#fff', fontWeight:700, fontSize:18, margin:0 }}>Upload Progress Photo</h2>
              <button onClick={() => setIsOpen(false)} style={{ background:'#2a2a2a', border:'none', color:'#888', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:16 }}>X</button>
            </div>

            {/* File input - visible label for iPhone compatibility */}
            <label style={{ display:'block', marginBottom:16, cursor:'pointer' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ position:'absolute', width:1, height:1, opacity:0, overflow:'hidden' }}
              />
              {preview ? (
                <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)' }}>
                  <img src={preview} alt="Preview" style={{ width:'100%', height:200, objectFit:'cover', display:'block' }}/>
                  <div style={{ background:'#2a2a2a', padding:'8px 12px', textAlign:'center', color:'#FF6B2B', fontSize:13, fontWeight:600 }}>Tap to change photo</div>
                </div>
              ) : (
                <div style={{ border:'2px dashed rgba(76,175,80,0.4)', borderRadius:12, padding:32, textAlign:'center', background:'rgba(76,175,80,0.05)' }}>
                  <Camera size={32} color="#4CAF50" style={{ margin:'0 auto 10px', display:'block' }}/>
                  <p style={{ color:'#fff', fontWeight:600, fontSize:14, margin:'0 0 4px' }}>Tap to select a photo</p>
                  <p style={{ color:'#888', fontSize:12, margin:0 }}>Camera or Photo Library</p>
                </div>
              )}
            </label>

            {/* Angle */}
            <div style={{ marginBottom:16 }}>
              <p style={{ color:'#888', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Photo Angle</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {angles.map(angle => (
                  <button key={angle.value} onClick={() => setSelectedAngle(angle.value)}
                    style={{ padding:'10px', borderRadius:10, border:'none', fontWeight:700, fontSize:14, cursor:'pointer', background: selectedAngle === angle.value ? '#4CAF50' : '#2a2a2a', color: selectedAngle === angle.value ? '#fff' : '#888' }}>
                    {angle.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom:20 }}>
              <p style={{ color:'#888', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Notes (Optional)</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How are you feeling?" rows={2}
                style={{ width:'100%', background:'#2a2a2a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', padding:'10px 12px', fontSize:14, boxSizing:'border-box', resize:'none', outline:'none', fontFamily:'inherit' }}/>
            </div>

            {/* Buttons */}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setIsOpen(false)}
                style={{ flex:1, background:'#2a2a2a', border:'none', borderRadius:12, color:'#888', padding:'14px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={handleUpload} disabled={!selectedFile || isLoading}
                style={{ flex:2, background: !selectedFile || isLoading ? '#2a2a2a' : '#4CAF50', border:'none', borderRadius:12, color: !selectedFile || isLoading ? '#555' : '#fff', padding:'14px', fontSize:14, fontWeight:700, cursor: !selectedFile || isLoading ? 'default' : 'pointer' }}>
                {isLoading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
