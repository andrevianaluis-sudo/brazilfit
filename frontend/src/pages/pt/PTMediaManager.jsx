import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit, Eye, Grid, List, Filter, Search, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const UPLOAD_SPECS = {
  login_splash: { desc: 'Login/Splash Background', format: 'JPG/PNG/WebP', size: '1920x1080 (landscape)', maxMB: 50 },
  home_banner: { desc: 'Home Screen Banner', format: 'JPG/PNG/WebP', size: '1920x1080', maxMB: 50 },
  'home_banner/morning': { desc: 'Morning Banner', format: 'JPG/PNG/WebP', size: '1920x1080', maxMB: 50 },
  'home_banner/afternoon': { desc: 'Afternoon Banner', format: 'JPG/PNG/WebP', size: '1920x1080', maxMB: 50 },
  'home_banner/evening': { desc: 'Evening Banner', format: 'JPG/PNG/WebP', size: '1920x1080', maxMB: 50 },
  'wellness/meditation': { desc: 'Meditation Background', format: 'JPG/PNG/WebP', size: '1920x1440', maxMB: 50 },
  'wellness/breathing': { desc: 'Breathing Background', format: 'JPG/PNG/WebP', size: '1920x1440', maxMB: 50 },
  exercise_demo: { desc: 'Exercise Demo Video', format: 'MP4 (H.264)', size: 'Portrait or Landscape', maxMB: 500 },
  class_preview: { desc: 'Class Preview Video', format: 'MP4 (H.264)', size: 'Portrait or Landscape', maxMB: 500 },
  welcome: { desc: 'Welcome Video', format: 'MP4 (H.264)', size: 'Portrait or Landscape', maxMB: 500 },
  motivation: { desc: 'Weekly Motivation Video', format: 'MP4 (H.264)', size: 'Portrait or Landscape', maxMB: 500 },
  testimonial: { desc: 'Client Testimonial Video', format: 'MP4 (H.264)', size: 'Portrait or Landscape', maxMB: 500 },
  'empty_state/progress': { desc: 'Progress Empty State', format: 'JPG/PNG/WebP', size: '1920x1080', maxMB: 50 },
  'empty_state/diary': { desc: 'Diary Empty State', format: 'JPG/PNG/WebP', size: '1920x1080', maxMB: 50 },
  'empty_state/badges': { desc: 'Badges Empty State', format: 'JPG/PNG/WebP', size: '1920x1080', maxMB: 50 },
  'empty_state/messages': { desc: 'Messages Empty State', format: 'JPG/PNG/WebP', size: '1920x1080', maxMB: 50 },
};

export default function PTMediaManager() {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    category: 'login_splash',
    subCategory: '',
    description: '',
    altText: ''
  });
  const [editForm, setEditForm] = useState({
    description: '',
    altText: '',
    subCategory: ''
  });

  useEffect(() => {
    fetchMedia();
  }, [filterType, filterCategory]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      let url = '/api/media/list';
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterCategory) params.append('category', filterCategory);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.category) {
      toast.error('File and category required');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('category', uploadForm.category);
      if (uploadForm.subCategory) formData.append('subCategory', uploadForm.subCategory);
      if (uploadForm.description) formData.append('description', uploadForm.description);
      if (uploadForm.altText) formData.append('altText', uploadForm.altText);

      // Simulate upload progress for file transfer
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 200);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(uploadInterval);

      if (res.ok) {
        const data = await res.json();
        setUploadProgress(100);

        if (data.status === 'processing') {
          toast.success('Video uploaded! Processing optimized versions... Please wait.');
          // Poll for processing completion
          pollProcessingStatus(data.id);
        } else {
          toast.success('Media uploaded successfully');
          setShowUploadForm(false);
          setUploadForm({ file: null, category: 'login_splash', subCategory: '', description: '', altText: '' });
          setUploadProgress(0);
          fetchMedia();
        }
      } else {
        const error = await res.json();
        toast.error(error.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const pollProcessingStatus = (mediaId, attempts = 0) => {
    if (attempts > 120) { // 2 minutes max
      toast.error('Video processing timed out');
      return;
    }

    setTimeout(async () => {
      try {
        const res = await fetch(`/api/media/${mediaId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.media.processing_status === 'completed') {
            toast.success('Video processing complete! All versions ready.');
            setShowUploadForm(false);
            setUploadForm({ file: null, category: 'login_splash', subCategory: '', description: '', altText: '' });
            setUploadProgress(0);
            fetchMedia();
          } else if (data.media.processing_status === 'failed') {
            toast.error('Video processing failed');
            setShowUploadForm(false);
            setUploadProgress(0);
          } else {
            // Still processing, poll again
            pollProcessingStatus(mediaId, attempts + 1);
          }
        }
      } catch (err) {
        console.error('Status check error:', err);
        pollProcessingStatus(mediaId, attempts + 1);
      }
    }, 1000);
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Delete this media?')) return;

    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Media deleted');
        fetchMedia();
      } else {
        toast.error('Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Delete failed');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/media/${selectedMedia.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        toast.success('Media updated');
        setShowEditModal(false);
        fetchMedia();
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      console.error('Edit error:', err);
      toast.error('Update failed');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const filteredMedia = media.filter(m => {
    const matchesSearch = m.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const openEditModal = (item) => {
    setSelectedMedia(item);
    setEditForm({
      description: item.description || '',
      altText: item.alt_text || '',
      subCategory: item.sub_category || ''
    });
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Manager</h1>
            <p className="text-gray-600 mt-1">Upload and manage your photos and videos</p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2"
          >
            <Upload size={20} />
            Upload Media
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-[8px] shadow mb-8 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upload New Media</h2>

            {/* Upload Specs Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">📋 Upload Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {Object.entries(UPLOAD_SPECS).map(([key, spec]) => (
                  <div key={key} className="text-sm bg-white rounded p-2 border border-blue-100">
                    <p className="font-semibold text-gray-800">{spec.desc}</p>
                    <p className="text-gray-600">Format: {spec.format}</p>
                    <p className="text-gray-600">Size: {spec.size}</p>
                    <p className="text-gray-600">Max: {spec.maxMB}MB</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Choose File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,video/*"
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-600">{uploadForm.file?.name || 'Click to select or drag & drop'}</p>
                  </label>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category *</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(UPLOAD_SPECS).map(([key, spec]) => (
                    <option key={key} value={key}>{spec.desc}</option>
                  ))}
                </select>
              </div>

              {/* Description & Alt Text */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <input
                    type="text"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Optional description"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Alt Text</label>
                  <input
                    type="text"
                    value={uploadForm.altText}
                    onChange={(e) => setUploadForm({ ...uploadForm, altText: e.target.value })}
                    placeholder="Accessibility text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {uploadProgress < 100 ? 'Uploading...' : 'Processing video (this may take a few minutes)...'}
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {uploadProgress < 90 ? 'Uploading file to server...' : 'Compressing video to 1080p and 720p versions...'}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploading || !uploadForm.file}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
                >
                  {uploading ? 'Uploading...' : 'Upload Media'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setUploadProgress(0);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Types</option>
              <option value="photo">Photos</option>
              <option value="video">Videos</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              {Object.entries(UPLOAD_SPECS).map(([key, spec]) => (
                <option key={key} value={key}>{spec.desc}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin text-4xl">⏳</div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-600 text-lg">No media yet</p>
            <p className="text-gray-500">Upload your first photo or video to get started</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredMedia.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-900 flex items-center justify-center relative group">
                  {item.media_type === 'video' ? (
                    <>
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">🎥</div>
                        <p className="text-sm">{item.file_name.substring(0, 30)}</p>
                      </div>
                      {item.thumbnail_path && (
                        <img
                          src={`/api/media/${item.id}/thumbnail`}
                          alt="Thumbnail"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                    </>
                  ) : (
                    <img
                      src={`/api/media/serve/${item.id}`}
                      alt={item.alt_text || item.file_name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Status Badge */}
                  {item.media_type === 'video' && (
                    <div className="absolute top-2 right-2">
                      {item.processing_status === 'processing' && (
                        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Clock size={12} /> Processing
                        </div>
                      )}
                      {item.processing_status === 'completed' && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle size={12} /> Ready
                        </div>
                      )}
                      {item.processing_status === 'failed' && (
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <AlertCircle size={12} /> Failed
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Versions */}
                  {item.versions && item.versions.length > 0 && (
                    <div className="absolute bottom-2 left-2">
                      <div className="flex gap-1">
                        {item.versions.map(v => (
                          <span key={v.resolution} className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            {v.resolution}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-gray-900 truncate">{item.file_name}</h3>
                  <p className="text-xs text-gray-500">
                    {item.media_type === 'video' && item.duration_seconds
                      ? `${Math.round(item.duration_seconds / 60)}:${String(Math.round(item.duration_seconds % 60)).padStart(2, '0')}`
                      : `${item.width} × ${item.height}`}
                  </p>
                  <p className="text-xs text-gray-500">{(item.file_size / 1024 / 1024).toFixed(1)}MB</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1 text-sm"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1 text-sm"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[8px] max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Media</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Alt Text</label>
                <input
                  type="text"
                  value={editForm.altText}
                  onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
