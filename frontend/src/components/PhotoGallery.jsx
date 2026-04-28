import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../utils/api';

export default function PhotoGallery({ clientId }) {
  const [photos, setPhotos] = useState([]);
  const [photoDataMap, setPhotoDataMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, [clientId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/progress/photos/client/${clientId}`);
      const photoList = res.data || [];
      setPhotos(photoList);

      const dataMap = {};
      for (const photo of photoList) {
        try {
          const photoRes = await api.get(`/progress/photos/${photo.id}/data`, {
            responseType: 'blob'
          });
          dataMap[photo.id] = URL.createObjectURL(photoRes.data);
        } catch (err) {
          console.error(`Failed to fetch photo ${photo.id}:`, err);
        }
      }
      setPhotoDataMap(dataMap);
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId) => {
    try {
      await api.delete(`/progress/photos/${photoId}`);
      setPhotos(photos.filter(p => p.id !== photoId));
      if (photoDataMap[photoId]) {
        URL.revokeObjectURL(photoDataMap[photoId]);
        const newMap = { ...photoDataMap };
        delete newMap[photoId];
        setPhotoDataMap(newMap);
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete photo:', err);
      alert('Failed to delete photo');
    }
  };

  const getPhotoUrl = (photoId) => photoDataMap[photoId] || '';

  const angleLabels = { 'Front': 'Front', 'Side': 'Side', 'Back': 'Back' };
  const angles = ['Front', 'Side', 'Back'];

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-grey-100 p-8 text-center">
        <p className="text-grey-200">Loading photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-grey-100 p-8 text-center">
        <p className="text-grey-200">No progress photos yet. Upload your first photo to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-black font-bold text-sm uppercase tracking-widest mb-4">Photo Gallery</h3>

      {/* Group by angle */}
      <div className="space-y-6">
        {angles.map(angle => {
          const anglePhotos = photos.filter(p => p.angle === angle);
          if (anglePhotos.length === 0) return null;

          return (
            <div key={angle}>
              <h4 className="text-black font-semibold text-xs uppercase tracking-wider mb-3 text-grey-200">
                {angleLabels[angle]} View
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {anglePhotos.map(photo => (
                  <div
                    key={photo.id}
                    className="relative group rounded-lg overflow-hidden border border-grey-100 cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={getPhotoUrl(photo.id)}
                      alt={`${angleLabels[angle]} - ${photo.upload_date}`}
                      className="w-full h-48 object-cover group-hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100">
                        View
                      </p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(photo.id);
                        }}
                        className="p-1.5 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-semibold bg-black/40 px-2 py-1 rounded">
                        {photo.upload_date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedPhoto(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={getPhotoUrl(selectedPhoto.id)}
              alt={`${angleLabels[selectedPhoto.angle]}`}
              className="w-full h-96 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-black font-bold">{angleLabels[selectedPhoto.angle]} - {selectedPhoto.upload_date}</p>
              </div>
              {selectedPhoto.notes && (
                <p className="text-grey-200 text-sm mb-3">{selectedPhoto.notes}</p>
              )}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-full px-4 py-2 bg-grey-100 text-black rounded-lg font-semibold hover:bg-grey-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-6 max-w-sm">
            <h3 className="text-black font-bold mb-2">Delete Photo?</h3>
            <p className="text-grey-200 text-sm mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-grey-100 text-black rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
