import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, QrCode, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { verifyArtwork } from '../lib/api';
import TurnstileWidget, { type TurnstileHandle } from '../components/TurnstileWidget';

const VerificationPage: React.FC = () => {
  const [artworkId, setArtworkId] = useState('');
  const [result, setResult] = useState<'not_found' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const hasAutoVerified = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleVerification = useCallback(async (idToVerify: string) => {
    if (!idToVerify) return;
    setIsLoading(true);
    setResult(null);
    setVerifyError(null);

    const token = turnstileRef.current?.getToken();
    if (!token) {
      setVerifyError('Please complete the security check below.');
      setIsLoading(false);
      return;
    }

    try {
      const foundArtwork = await verifyArtwork(idToVerify.trim(), token);
      if (foundArtwork) {
        navigate('/certificate', { state: { artwork: foundArtwork } });
      } else {
        setResult('not_found');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerifyError(error instanceof Error ? error.message : 'Verification failed');
      setResult('not_found');
    } finally {
      setIsLoading(false);
      turnstileRef.current?.reset();
    }
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get('id');
    if (idFromUrl && !hasAutoVerified.current) {
      hasAutoVerified.current = true;
      setArtworkId(idFromUrl);
    }
  }, [location.search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerification(artworkId);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsQrLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setIsQrLoading(false);
                return;
            };
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const code = (window as any).jsQR?.(imageData.data, imageData.width, imageData.height);

            setIsQrLoading(false);
            if (code) {
                let scannedData = code.data;
                try {
                    const url = new URL(scannedData);
                    const idParam = url.searchParams.get('id');
                    if (idParam) scannedData = idParam;
                } catch {
                    /* raw id */
                }
                setArtworkId(scannedData);
                handleVerification(scannedData);
            } else {
                alert('No QR code found in the uploaded image.');
            }
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center space-y-6 mb-16">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-sm uppercase tracking-widest">
          <ShieldCheck size={14} />
          <span>Certificate of Authenticity</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-serif text-deep-red">Art Verification</h1>
        <p className="text-ink/70 text-lg max-w-2xl mx-auto">
          Enter an artwork&apos;s unique ID or upload its QR code to verify authenticity.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gold/50 group-focus-within:text-gold transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={artworkId}
                onChange={(e) => {
                  setArtworkId(e.target.value);
                  setResult(null);
                  setVerifyError(null);
                }}
                placeholder="Enter Artwork ID (e.g., LYS-03052026-01)"
                className="w-full bg-white border border-ink/10 rounded-xl py-4 pl-12 pr-4 text-ink placeholder:text-ink/20 focus:outline-none focus:border-gold/50 transition-all font-mono"
              />
            </div>

            <TurnstileWidget ref={turnstileRef} onExpire={() => setVerifyError('Security check expired. Please verify again.')} />

            {verifyError && <p className="text-sm text-deep-red text-center">{verifyError}</p>}
            
            <button
              type="submit"
              disabled={isLoading || isQrLoading || !artworkId}
              className="w-full bg-deep-red text-white font-bold py-4 rounded-xl hover:bg-ink transition-all duration-300 gold-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              <span>{isLoading ? 'Verifying Authenticity...' : 'Verify Artwork'}</span>
            </button>
          </form>

          <div className="flex items-center gap-6">
            <div className="flex-grow h-px bg-ink/10"></div>
            <span className="text-ink/20 text-xs font-bold tracking-widest uppercase">Alternative Method</span>
            <div className="flex-grow h-px bg-ink/10"></div>
          </div>

          <div className="text-center">
            <input type="file" accept="image/*" ref={qrInputRef} onChange={handleQrUpload} className="hidden" />
            <button
                onClick={() => qrInputRef.current?.click()}
                disabled={isLoading || isQrLoading}
                className="w-full md:w-auto px-12 py-4 bg-white border border-ink/20 text-ink font-semibold rounded-xl hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
            >
                {isQrLoading ? <Loader2 className="animate-spin" size={20} /> : <QrCode size={20} />}
                <span>{isQrLoading ? 'Scanning QR Code...' : 'Scan QR Code'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 min-h-[100px]">
        {result === 'not_found' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 border-deep-red/30 bg-deep-red/5 text-center space-y-4">
            <div className="flex justify-center text-deep-red"><AlertCircle size={48} /></div>
            <h3 className="text-2xl font-serif text-ink">Artwork Not Found</h3>
            <p className="text-ink/60">
              The ID &quot;<span className="font-mono text-gold">{artworkId}</span>&quot; does not match any verified artwork in our archives.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
