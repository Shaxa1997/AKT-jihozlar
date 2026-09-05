import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string, signerName: string) => void;
  initialSignerName?: string;
  initialSignatureUrl?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  initialSignerName = '',
  initialSignatureUrl = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState(initialSignerName);
  const [savedUrl, setSavedUrl] = useState<string>(initialSignatureUrl);

  useEffect(() => {
    // Check localStorage for previously saved signature (Requirement 3: single signature auto-applies everywhere)
    const localSig = localStorage.getItem('app_saved_user_signature') || '';
    const localName = localStorage.getItem('app_saved_signer_name') || '';

    const effectiveSig = initialSignatureUrl || localSig;
    const effectiveName = initialSignerName || localName || signerName;

    if (effectiveName && !signerName) {
      setSignerName(effectiveName);
    }

    if (effectiveSig) {
      setSavedUrl(effectiveSig);
      setHasSignature(true);
      onSave(effectiveSig, effectiveName || 'Xodim');
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high pixel density
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (effectiveSig) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = effectiveSig;
    }
  }, [initialSignatureUrl, initialSignerName]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Auto capture on stroke end
      const canvas = canvasRef.current;
      if (canvas && hasSignature) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setSavedUrl(dataUrl);
        localStorage.setItem('app_saved_user_signature', dataUrl);
        if (signerName) {
          localStorage.setItem('app_saved_signer_name', signerName);
        }
        onSave(dataUrl, signerName || 'Xodim');
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSavedUrl('');
    localStorage.removeItem('app_saved_user_signature');
    onSave('', signerName);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const nameToSave = signerName.trim() || 'Xodim';

    // Create compact JPEG representation of signature
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setSavedUrl(dataUrl);
    localStorage.setItem('app_saved_user_signature', dataUrl);
    localStorage.setItem('app_saved_signer_name', nameToSave);
    onSave(dataUrl, nameToSave);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Elektron Qabul Imzosi *
          </span>
        </div>
        <span className="text-[10px] text-slate-400">Touch / Sichqoncha / Ekran pen</span>
      </div>

      {/* Signer Name Input */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
          Imzo qo'yuvchi shaxs F.I.O.
        </label>
        <input
          type="text"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="F.I.O. masalan: Jasur Toshmatov"
          className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
        />
      </div>

      {/* Canvas Pad */}
      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 overflow-hidden touch-none h-36">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />
        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs font-medium">
            Shu yerga qo'l barmog'ingiz yoki sichqoncha bilan imzo cheking
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Tozalash</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasSignature || !signerName.trim()}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
            hasSignature && signerName.trim()
              ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{savedUrl ? "Imzo saqlandi ✓" : "Imzoni tasdiqlash"}</span>
        </button>
      </div>

      {savedUrl && (
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Elektron imzo qabul qilindi ({signerName})</span>
        </div>
      )}
    </div>
  );
};
