import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Loader2, X } from 'lucide-react';
import { VerifiedArtwork } from '../types';
import { fetchVerifiedById } from '../lib/api';
import { getDirectMediaUrl, isVideoUrl, isYoutubeUrl, getYoutubeEmbedUrl } from '../mediaUtils';

const CertificatePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<VerifiedArtwork | null>(location.state?.artwork || null);
  const [isLoading, setIsLoading] = useState(!location.state?.artwork);
  const [error, setError] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      const params = new URLSearchParams(location.search);
      const idFromUrl = params.get('id');

      if (!artwork && idFromUrl) {
        setIsLoading(true);
        try {
          const found = await fetchVerifiedById(idFromUrl);
          if (found) {
            setArtwork(found);
          } else {
            setError(true);
          }
        } catch (err) {
          console.error('Error fetching certificate:', err);
          setError(true);
        } finally {
          setIsLoading(false);
        }
      } else if (!artwork && !idFromUrl) {
        setError(true);
        setIsLoading(false);
      }
    };

    fetchArtwork();
  }, [location.search, artwork]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-gold" size={48} />
        <p className="text-gold font-serif text-xl tracking-widest uppercase">Retrieving Authentication Report...</p>
      </div>
    );
  }

  if (error || !artwork) {
    return <Navigate to="/verify" replace />;
  }

  return (
    <div className="max-w-4xl lg:max-w-[1400px] mx-auto px-4 py-12 transition-all duration-500">
      <button onClick={() => navigate('/verify')} className="flex items-center gap-2 text-ink/40 hover:text-gold transition-colors mb-8 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="uppercase tracking-widest text-xs font-bold">Back to Archives</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gia-report hologram-effect relative overflow-hidden bg-white p-6 md:p-10 lg:p-12 border-2 border-gray-100">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="border-b-2 border-deep-red pb-6 mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gold flex-shrink-0">
              <img src="https://ik.imagekit.io/pcd7jjipb/Home%20Files/Profile%20Pic.png" alt="Loys" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-serif text-deep-red font-bold tracking-tighter">Loys</h1>
              <p className="text-ink/60 uppercase tracking-[0.2em] text-[8px] md:text-[10px] font-bold">Digital Artwork Authentication Report</p>
              <div className="md:hidden pt-2">
                <p className="gia-label text-[8px]">Art Piece ID :</p>
                <p className="text-xs font-mono text-ink font-bold break-all">{artwork.artworkId}</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="gia-label text-[10px]">Art Piece ID</p>
            <p className="text-xl font-mono text-ink font-bold">{artwork.artworkId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="space-y-10 lg:pr-6 lg:border-r lg:border-gray-100 relative">
            <div className="absolute inset-0 gia-cross-hatch pointer-events-none" />
            <div className="relative space-y-10">
              <section>
                <h2 className="gia-section-title">Artwork Details</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div><p className="gia-label">Artwork Title</p><p className="gia-value">{artwork.title}</p></div>
                  <div><p className="gia-label">Character Name</p><p className="gia-value">{artwork.characterName || 'N/A'}</p></div>
                  <div><p className="gia-label">Commission Type</p><p className="gia-value">{artwork.commissionType || artwork.status}</p></div>
                  <div><p className="gia-label">Artist</p><p className="gia-value">Loys</p></div>
                  <div><p className="gia-label">Creation Date</p><p className="gia-value">{artwork.creationDate}</p></div>
                  <div><p className="gia-label">Medium</p><p className="gia-value">{artwork.medium || 'Digital Illustration'}</p></div>
                </div>
              </section>
              <section>
                <h2 className="gia-section-title">Rarity Grading</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div><p className="gia-label">Unique Commission</p><p className="gia-value">{artwork.uniqueCommission || 'Yes'}</p></div>
                  <div><p className="gia-label">One-of-One</p><p className="gia-value">{artwork.oneOfOne || 'Yes'}</p></div>
                  <div><p className="gia-label">Commercial Rights</p><p className="gia-value">{artwork.commercialRights || 'No'}</p></div>
                  <div><p className="gia-label">Reproduction Limit</p><p className="gia-value">{artwork.reproductionLimit || '0'}</p></div>
                </div>
              </section>
              <section>
                <h2 className="gia-section-title">Ownership</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className="col-span-2"><p className="gia-label">Commissioned By</p><p className="gia-value">{artwork.commissioner}</p></div>
                  <div className="col-span-2"><p className="gia-label">Original Owner</p><p className="gia-value">{artwork.originalOwner || artwork.commissioner}</p></div>
                </div>
              </section>
            </div>
          </div>

          <div className="space-y-10 lg:px-6 lg:border-r lg:border-gray-100">
            <section>
              <h2 className="gia-section-title">Artwork Image</h2>
              <div className="border border-gray-100 p-1 bg-white shadow-inner cursor-zoom-in" onClick={() => setZoomedImage(getDirectMediaUrl(artwork.imageUrl))}>
                <img src={getDirectMediaUrl(artwork.imageUrl)} alt={artwork.title} className="w-full h-auto object-contain" />
              </div>
            </section>
            <section>
              <h2 className="gia-section-title">Process Timelapse</h2>
              {artwork.timelapseUrl ? (
                <div className="border border-gray-100 rounded-lg overflow-hidden bg-black aspect-video">
                  {isYoutubeUrl(artwork.timelapseUrl) ? (
                    <iframe src={getYoutubeEmbedUrl(artwork.timelapseUrl)!} title="Timelapse" className="w-full h-full border-0" allowFullScreen />
                  ) : (
                    <video src={getDirectMediaUrl(artwork.timelapseUrl)} controls className="w-full h-full object-contain" />
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-ink/30 text-xs italic">Timelapse data not archived.</div>
              )}
            </section>
          </div>

          <div className="space-y-10 lg:pl-6 flex flex-col">
            <section>
              <h2 className="gia-section-title">Reference Material</h2>
              {artwork.referenceUrl ? (
                <div className="border border-gray-100 rounded-lg overflow-hidden bg-white cursor-zoom-in" onClick={() => setZoomedImage(getDirectMediaUrl(artwork.referenceUrl!))}>
                  <img src={getDirectMediaUrl(artwork.referenceUrl)} alt="Reference" className="w-full h-auto object-contain" />
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-ink/30 text-xs italic">Reference material restricted.</div>
              )}
            </section>
            <div className="mt-auto pt-10 flex items-center justify-center">
              <div className="flex flex-col items-center min-w-[140px] md:min-w-[200px]">
                <div className="border-b border-ink w-full flex justify-center pb-1 mb-1">
                  <img src="https://ik.imagekit.io/pcd7jjipb/Home%20Files/Signature.png" alt="Signature" className="h-10 md:h-14 object-contain" />
                </div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-ink/60">Artist</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 text-center space-y-4">
          <p className="text-[10px] text-ink/40 max-w-md mx-auto leading-relaxed">
            This certificate verifies that the artwork described above is an original commissioned illustration created by Loys.
          </p>
          <button
            onClick={() => {
              const shareUrl = `${window.location.origin}/certificate?id=${artwork.artworkId}`;
              if (navigator.share) {
                navigator.share({ title: `Loys Authentication Report - ${artwork.title}`, url: shareUrl }).catch(() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied to clipboard!');
                });
              } else {
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
              }
            }}
            className="border border-gray-200 text-ink text-xs font-bold py-2 px-12 rounded hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto"
          >
            <Share2 size={14} /> Share Report
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {zoomedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomedImage(null)} className="absolute inset-0 bg-void/95 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative max-w-full max-h-full">
              <button onClick={() => setZoomedImage(null)} className="absolute -top-12 right-0 text-white hover:text-gold transition-colors"><X size={32} /></button>
              <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-[85vh] object-contain shadow-2xl border border-white/10" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificatePage;
