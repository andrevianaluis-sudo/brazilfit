import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CustomVideoPlayer from '../../components/CustomVideoPlayer';
import ProUpgradeModal from '../../components/ProUpgradeModal';
import toast from 'react-hot-toast';

export default function SuccessStories() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (!user?.isPro) {
      setShowUpgradeModal(true);
      setLoading(false);
      return;
    }
    fetchTestimonials();
  }, [user]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      // Fetch testimonials from API (endpoint to be created)
      const res = await fetch('/api/testimonials');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin text-4xl">⏳</div></div>;
  }

  if (!user?.isPro) {
    return (
      <>
        <ProUpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(true)} />
      </>
    );
  }

  if (showPlayer && selectedTestimonial) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => {
              setShowPlayer(false);
              setSelectedTestimonial(null);
            }}
            className="text-emerald-600 hover:text-emerald-700 font-semibold mb-6 transition"
          >
            ← Back to Stories
          </button>

          <div className="bg-white rounded-[8px] shadow overflow-hidden">
            <CustomVideoPlayer
              videoUrl={`/api/media/serve/${selectedTestimonial.media_id}`}
              mediaId={selectedTestimonial.media_id}
              isPlaceholder={false}
              title={selectedTestimonial.caption}
            />

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTestimonial.clientName}</h2>
              <p className="text-gray-600 mb-4">{selectedTestimonial.caption}</p>
              {selectedTestimonial.transformation_start_date && (
                <p className="text-sm text-gray-500">
                  Transformation: {selectedTestimonial.transformation_start_date} to {selectedTestimonial.transformation_end_date}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Success Stories</h1>
          <p className="text-gray-600 mt-2">Inspiring transformations from our clients</p>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🌟</div>
            <p className="text-gray-600 text-lg mb-4">Success stories coming soon</p>
            <p className="text-gray-500">
              Your PT will share inspiring client transformations here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(testimonial => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer group"
                onClick={() => {
                  setSelectedTestimonial(testimonial);
                  setShowPlayer(true);
                }}
              >
                {/* Video thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center text-black">
                    <div className="text-4xl mb-2">▶️</div>
                    <p className="text-sm">Watch Story</p>
                  </div>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/30 transition" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{testimonial.clientName}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{testimonial.caption}</p>

                  {testimonial.transformation_start_date && (
                    <p className="text-xs text-gray-500">
                      {testimonial.transformation_start_date} → {testimonial.transformation_end_date}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
