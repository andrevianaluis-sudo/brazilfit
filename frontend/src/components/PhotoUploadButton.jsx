import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import api from '../utils/api';

export default function PhotoUploadButton({ clientId, onUploadSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState('front');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const angles = [
    { value: 'front', label: 'Front' },
    { value: 'side', label: 'Side' },
    { value: 'back', label: 'Back' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
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

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setSelectedAngle('front');
      setNotes('');
      setIsOpen(false);

      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload photo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brazil-green text-white rounded-lg font-semibold hover:bg-brazil-green-dark transition-all"
      >
        <Camera className="w-4 h-4" />
        Upload Photo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={e => e.stopPropagation()}>
          <div className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "#1e1e1e", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: "#ffffff" }}>Upload Progress Photo</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-grey-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Preview */}
            {preview && (
              <div className="mb-4 rounded-lg overflow-hidden border border-grey-100">
                <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
              </div>
            )}

            {/* File Input */}
            <div className="block mb-4" onClick={() => document.getElementById('photo-file-input').click()}>
              <div className="border-2 border-dashed border-brazil-green/30 rounded-lg p-6 text-center cursor-pointer hover:border-brazil-green/60 transition-all">
                <Camera className="w-8 h-8 text-brazil-green mx-auto mb-2" />
                <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>Click to select a photo</p>
                <p className="text-xs text-grey-200 mt-1">or drag and drop</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Angle Selection */}
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2" style={{ color: "#ffffff" }}>Photo Angle</p>
              <div className="grid grid-cols-3 gap-2">
                {angles.map(angle => (
                  <button
                    key={angle.value}
                    onClick={() => setSelectedAngle(angle.value)}
                    className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                      selectedAngle === angle.value
                        ? 'bg-brazil-green text-white'
                        : 'bg-grey-100 text-grey-200 hover:bg-grey-200'
                    }`}
                  >
                    {angle.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2" style={{ color: "#ffffff" }}>Notes (Optional)</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this photo..."
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: "#2a2a2a", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
                rows="3"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all" style={{ backgroundColor: "#2a2a2a", color: "#888888" }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="flex-1 px-4 py-2 bg-brazil-green text-white rounded-lg font-semibold hover:bg-brazil-green-dark disabled:opacity-50 transition-all"
              >
                {isLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
