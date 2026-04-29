import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ANGLES = ['Front', 'Side', 'Back'];

export default function ClientProgressPhotos() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAngle, setSelectedAngle] = useState('Front');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const sliderRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => { fetchPhotos(); }, []);

  useEffect(() => {
    if (!dropRef.current) return;
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        const evt = { target: { files: [file] } };
        handleFileSelect(evt);
      }
    };
    dropRef.current.addEventListener('dragenter', handleDrag);
    dropRef.current.addEventListener('dragleave', handleDrag);
    dropRef.current.addEventListener('dragover', handleDrag);
    dropRef.current.addEventListener('drop', handleDrop);
    return () => {
      if (!dropRef.current) return;
      dropRef.current.removeEventListener('dragenter', handleDrag);
      dropRef.current.removeEventListener('dragleave', handleDrag);
      dropRef.current.removeEventListener('dragover', handleDrag);
      dropRef.current.removeEventListener('drop', handleDrop);
    };
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/progress/photos');
      setPhotos(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load photos:', err);
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('angle', selectedAngle);
      formData.append('notes', notes);
      await api.post('/progress/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Photo uploaded successfully');
      setNotes('');
      setSelectedAngle('Front');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchPhotos();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await api.delete(`/progress/photos/${photoId}`);
      toast.success('Photo deleted');
      await fetchPhotos();
    } catch {
      toast.error('Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '2rem', height: '2rem', border: '3px solid #1a4a3a', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const latestByAngle = {};
  ANGLES.forEach(angle => {
    latestByAngle[angle] = photos.find(p => p.angle === angle);
  });

  const beforePhoto = latestByAngle[selectedAngle];
  const beforePhotos = photos.filter(p => p.angle === selectedAngle).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <button onClick={() => navigate('/client')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: 'none', border: 'none', color: '#1a4a3a', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
        <ArrowLeft style={{ width: '1rem', height: '1rem' }} /> Back
      </button>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem' }}>Progress Photos</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Track your transformation with photos</p>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem' }}>Upload Progress Photo</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.75rem' }}>Angle *</label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {ANGLES.map(angle => (
              <button key={angle} onClick={() => setSelectedAngle(angle)} style={{ padding: '0.75rem 1rem', border: selectedAngle === angle ? '2px solid #1a4a3a' : '1px solid #d1d5db', backgroundColor: selectedAngle === angle ? '#1a4a3a' : 'transparent', color: selectedAngle === angle ? '#ffffff' : '#1a1a1a', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: selectedAngle === angle ? '600' : '500', fontSize: '0.875rem', transition: 'all 0.2s' }}>
                {angle}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.75rem' }}>Upload Photo *</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          <div
            ref={dropRef}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: dragActive ? '2px dashed #1a4a3a' : '2px dashed #d1d5db',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: dragActive ? 'rgba(26, 74, 58, 0.05)' : '#f8faf9',
              transition: 'all 0.2s'
            }}
          >
            <Upload style={{ width: '2.5rem', height: '2.5rem', color: '#1a4a3a', marginBottom: '0.75rem', margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: '500', color: '#1a1a1a', marginBottom: '0.25rem' }}>Click to upload or drag and drop</p>
            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>JPG, PNG, HEIC up to 10MB</p>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.5rem' }}>Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this photo..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontFamily: 'Satoshi, system-ui, sans-serif', fontSize: '0.875rem', resize: 'vertical', minHeight: '3rem', color: '#1a1a1a' }} />
        </div>

        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem 1rem', backgroundColor: uploading ? '#d1d5db' : '#7dd4a8', color: '#ffffff', border: 'none', borderRadius: '0.5rem', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.2s' }}>
          <Upload style={{ width: '1rem', height: '1rem' }} /> {uploading ? 'Uploading...' : 'Choose Photo'}
        </button>
      </div>

      {beforePhotos.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1rem' }}>Latest {selectedAngle} Photos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {beforePhotos.slice(0, 6).map(photo => (
              <div key={photo.id} style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', aspectRatio: '3/4', backgroundColor: '#f3f4f6' }}>
                <img src={`/api/progress/photos/${photo.id}/data`} alt={photo.angle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'flex-end', padding: '0.75rem' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                  <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.8)', padding: '0.5rem', borderRadius: '0.375rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#ffffff', fontSize: '0.75rem' }}>{new Date(photo.created_at).toLocaleDateString()}</p>
                    <button onClick={() => deletePhoto(photo.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '0.25rem' }}>
                      <Trash2 style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {beforePhoto && beforePhotos.length > 1 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem' }}>Before & After Comparison</h2>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', backgroundColor: '#f3f4f6', borderRadius: '0.75rem', overflow: 'hidden', cursor: isDragging ? 'col-resize' : 'pointer' }} ref={sliderRef} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseMove={(e) => { if (!isDragging) return; const rect = sliderRef.current?.getBoundingClientRect(); if (!rect) return; const x = e.clientX - rect.left; const percent = Math.max(0, Math.min(100, (x / rect.width) * 100)); setSliderPosition(percent); }} onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} onTouchMove={(e) => { if (!isDragging) return; const rect = sliderRef.current?.getBoundingClientRect(); if (!rect) return; const x = e.touches[0].clientX - rect.left; const percent = Math.max(0, Math.min(100, (x / rect.width) * 100)); setSliderPosition(percent); }}>
            <img src={`/api/progress/photos/${beforePhotos[beforePhotos.length - 1].id}/data`} alt="Before" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, overflow: 'hidden' }}>
              <img src={`/api/progress/photos/${beforePhoto.id}/data`} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', left: `${sliderPosition}%`, top: 0, bottom: 0, width: '3px', backgroundColor: '#7dd4a8', transform: 'translateX(-50%)', cursor: 'col-resize' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#7dd4a8', width: '2.75rem', height: '2.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <ChevronLeft style={{ width: '1.1rem', height: '1.1rem', color: '#ffffff', marginRight: '0.1rem' }} />
                <ChevronRight style={{ width: '1.1rem', height: '1.1rem', color: '#ffffff', marginLeft: '0.1rem' }} />
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '1rem', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#ffffff', padding: '0.625rem 0.875rem', borderRadius: '0.375rem', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>BEFORE</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{new Date(beforePhotos[beforePhotos.length - 1].upload_date).toLocaleDateString()}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#ffffff', padding: '0.625rem 0.875rem', borderRadius: '0.375rem', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>AFTER</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{new Date(beforePhoto.upload_date).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {photos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#f8faf9', borderRadius: '0.75rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📸</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a1a1a', marginBottom: '0.5rem' }}>No photos yet</h3>
          <p style={{ color: '#6b7280' }}>Upload your first photo to start tracking progress</p>
        </div>
      )}
    </div>
  );
}
