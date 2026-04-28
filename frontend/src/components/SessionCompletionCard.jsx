import { useRef } from 'react';
import { Share2, CheckCircle, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export function SessionCompletionCard({ session, onClose }) {
  const cardRef = useRef(null);

  const generateShareImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#000000',
        scale: 2,
      });

      const image = canvas.toDataURL('image/png');

      // Try to use Web Share API
      if (navigator.share && navigator.canShare({ files: [] })) {
        const blob = await fetch(image).then(res => res.blob());
        const file = new File([blob], 'workout-complete.png', { type: 'image/png' });
        navigator.share({
          files: [file],
          title: 'My Workout',
          text: `I just completed "${session.name}" on BrazilFit!`,
        });
      } else {
        // Fallback: download image
        const link = document.createElement('a');
        link.href = image;
        link.download = 'workout-complete.png';
        link.click();
      }
    } catch (err) {
      console.error('Error generating share image:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-white w-full h-full z-50 flex flex-col items-center justify-center p-6">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white">
        <div className="h-full w-full bg-brazil-green" />
      </div>

      <div className="flex flex-col items-center justify-center text-center mb-12">
        <div className="checkmark-animate mb-8">
          <CheckCircle className="w-20 h-20 text-brazil-green" />
        </div>
        <h1 className="text-4xl font-black text-black mb-6 uppercase">Session Complete</h1>

        {/* Stats Grid */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-8">
          {[
            { label: 'DURATION', value: `${session.duration}m` },
            { label: 'EXERCISES', value: session.exercises },
            { label: 'SETS', value: session.sets },
            { label: 'CALORIES', value: session.calories },
          ].map((stat, i) => (
            <div key={i} className="bg-grey-300 rounded-[12px] p-4">
              <p className="text-grey-200 text-xs font-bold mb-1">{stat.label}</p>
              <p className="text-black text-2xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Share Card Preview */}
        <div
          ref={cardRef}
          className="w-full max-w-sm bg-gradient-to-br from-dark-grey-200 to-black rounded-[16px] p-6 mb-8 border-2 border-brazil-green"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="text-2xl font-black text-brazil-green">BrazilFit</div>
            <p className="text-grey-200 text-xs">Andre Viana</p>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-black uppercase">{session.name}</h3>
            <p className="text-grey-200 text-sm mt-2">{session.date}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {[
              { label: 'Duration', value: `${session.duration}m` },
              { label: 'Exercises', value: session.exercises },
              { label: 'Sets', value: session.sets },
              { label: 'Calories', value: session.calories },
            ].map((stat, i) => (
              <div key={i} className="bg-grey-1000 rounded p-2">
                <p className="text-grey-200 text-xs">{stat.label}</p>
                <p className="text-black font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-brazil-green pt-4 text-center">
            <p className="text-grey-200 text-xs">Completed {session.time}</p>
            <p className="text-brazil-green text-xs font-bold mt-1">✓ Session Logged</p>
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={generateShareImage}
          className="w-full max-w-sm bg-brazil-green hover:bg-brazil-green-dark text-black font-bold py-4 rounded-[8px] mb-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Share2 className="w-5 h-5" />
          SHARE
        </button>
        <button
          onClick={onClose}
          className="w-full max-w-sm bg-grey-300 hover:bg-white text-black font-bold py-4 rounded-[8px] active:scale-95 transition-transform"
        >
          DONE
        </button>
      </div>
    </div>
  );
}
