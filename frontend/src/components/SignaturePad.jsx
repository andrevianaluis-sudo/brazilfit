import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { RotateCcw } from 'lucide-react';

/**
 * SignaturePad — HTML5 canvas signature with touch and mouse support.
 * Usage:
 *   const sigRef = useRef();
 *   <SignaturePad ref={sigRef} onSign={() => {}} />
 *   sigRef.current.getDataURL()  → 'data:image/png;base64,...'
 *   sigRef.current.isEmpty()     → boolean
 *   sigRef.current.clear()
 *   sigRef.current.loadFromDataURL(dataUrl)
 */
const SignaturePad = forwardRef(({ onSign, className = '' }, ref) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const lastPos = useRef(null);
  const resizeObserver = useRef(null);

  useImperativeHandle(ref, () => ({
    getDataURL: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL('image/png');
    },
    isEmpty: () => !hasSignature,
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    },
    loadFromDataURL: (dataUrl) => {
      const canvas = canvasRef.current;
      if (!canvas || !dataUrl) return;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSignature(true);
      };
      img.src = dataUrl;
    },
  }));

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    setupCanvas();
    resizeObserver.current = new ResizeObserver(() => setupCanvas());
    if (canvasRef.current) resizeObserver.current.observe(canvasRef.current.parentElement);
    return () => resizeObserver.current?.disconnect();
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    if (!hasSignature) {
      setHasSignature(true);
      onSign?.();
    }
  };

  const stopDrawing = (e) => {
    e?.preventDefault();
    setDrawing(false);
    lastPos.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative bg-white-dark border-2 border-grey-100 rounded-[8px] overflow-hidden"
           style={{ height: '130px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          style={{ display: 'block' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {/* baseline guide */}
        <div className="absolute bottom-8 left-6 right-6 border-b border-white/15 pointer-events-none" />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-grey-200 text-sm select-none">Sign here with your finger or mouse</p>
          </div>
        )}
      </div>
      {hasSignature && (
        <button
          type="button"
          onClick={handleClear}
          className="mt-2 flex items-center gap-1.5 text-xs text-grey-100 hover:text-grey-200 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Clear signature
        </button>
      )}
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
