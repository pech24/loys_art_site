import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Clock, Palette, Maximize2, PenLine, ShoppingCart, Loader2, Video, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { galleryArtworks as staticGalleryArtworks } from '../constants';
import { getDirectMediaUrl, isVideoUrl, isYoutubeUrl, getYoutubeThumbnail, getYoutubeEmbedUrl } from '../mediaUtils';
import { Artwork, ArtworkCategory } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData, where } from 'firebase/firestore';

const categories = ['All', ...Object.values(ArtworkCategory)];
const PAGE_SIZE = 12;

const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = useCallback(async (isInitial = true) => {
    if (isInitial) {
      setIsLoading(true);
      setArtworks([]);
      setLastVisible(null);
    } else {
      setIsFetchingMore(true);
    }

    try {
      let q = query(
        collection(db, 'gallery'),
        orderBy('order', 'asc'),
        limit(PAGE_SIZE)
      );

      if (activeCategory !== 'All') {
        q = query(
          collection(db, 'gallery'),
          where('category', '==', activeCategory),
          orderBy('order', 'asc'),
          limit(PAGE_SIZE)
        );
      }

      if (!isInitial && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const fetchedArtworks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as unknown as Artwork));

      if (isInitial) {
        if (fetchedArtworks.length === 0) {
          // If Firestore is empty and we are looking at 'All', fallback to static
          if (activeCategory === 'All') {
            setArtworks(staticGalleryArtworks);
            setHasMore(false);
          } else {
            setArtworks([]);
            setHasMore(false);
          }
        } else {
          setArtworks(fetchedArtworks);
          setHasMore(fetchedArtworks.length === PAGE_SIZE);
        }
      } else {
        setArtworks(prev => [...prev, ...fetchedArtworks]);
        setHasMore(fetchedArtworks.length === PAGE_SIZE);
      }

      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (error: any) {
      console.error("Error fetching gallery:", error);
      // Fallback to static data only if it is the initial fetch and Firestore is genuinely unreachable
      if (isInitial && activeCategory === 'All') {
        setArtworks(staticGalleryArtworks);
      }
      
      // If it's a specific index error, let's at least log it clearly
      if (error.message?.includes('index')) {
        console.warn("Firestore index required for this category. falling back to All.");
        setActiveCategory('All');
      }
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [activeCategory, lastVisible]);

  useEffect(() => {
    fetchItems(true);
  }, [activeCategory]);

  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    // Reset info visibility when artwork changes
    setShowInfo(true);
  }, [selectedArtwork]);

  return (
    <div className="pt-12 pb-20 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-sm uppercase tracking-widest"
        >
          <PenLine size={14} />
          <span>Portfolio</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-serif text-deep-red">Gallery</h1>
        <p className="text-ink/70 text-lg">A curated collection of professional illustrations. Each piece is carefully crafted to capture your vision, resulting in high-quality artwork that reflects your unique ideas.</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center flex-wrap gap-3 mb-16">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 rounded-full transition-all duration-300 border ${
              activeCategory === category
                ? 'bg-gold text-void border-gold gold-glow'
                : 'text-ink/60 border-ink/10 hover:border-gold/50 hover:text-gold'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Bento Box Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-gold" size={48} />
          <p className="text-gold font-serif text-xl">Unveiling the Archives...</p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px]">
            {artworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                layoutId={`art-${artwork.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index % PAGE_SIZE) * 0.05 }}
                onClick={() => setSelectedArtwork(artwork)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer glass-panel ${
                  index % 5 === 0 ? 'md:col-span-2 md:row-span-2' : 
                  index % 7 === 0 ? 'md:row-span-2' : ''
                }`}
              >
                {isYoutubeUrl(artwork.imageUrl) ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={getYoutubeThumbnail(artwork.imageUrl) || ''}
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 select-none pointer-events-none"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-void/20">
                       <div className="w-12 h-12 rounded-full bg-gold/80 flex items-center justify-center text-void shadow-lg">
                          <Video size={24} fill="currentColor" />
                       </div>
                    </div>
                  </div>
                ) : isVideoUrl(artwork.imageUrl) ? (
                  <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 select-none pointer-events-none"
                  >
                    <source src={getDirectMediaUrl(artwork.imageUrl)} type={artwork.imageUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                  </video>
                ) : (
                  <img 
                    src={getDirectMediaUrl(artwork.imageUrl)}
                    alt={artwork.title}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-gold text-sm font-medium tracking-widest uppercase mb-2">{artwork.category}</p>
                    <h3 className="text-white text-2xl font-serif mb-4">{artwork.title}</h3>
                    <div className="flex items-center gap-2 text-gold/80 text-sm">
                      <Maximize2 size={14} />
                      <span>View Details</span>
                    </div>
                  </div>
                </div>
                
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 border-0 group-hover:border-[12px] border-gold/10 transition-all duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => fetchItems(false)}
                disabled={isFetchingMore}
                className="group flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105"
              >
                <div className="px-8 py-3 rounded-full bg-gold text-void font-bold shadow-lg shadow-gold/20 flex items-center gap-2 group-hover:gold-glow">
                  {isFetchingMore ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ChevronDown size={20} className="transition-transform duration-300 group-hover:translate-y-1" />
                  )}
                  <span>{isFetchingMore ? 'Loading More...' : 'Show More Artworks'}</span>
                </div>
                <p className="text-ink/40 text-xs uppercase tracking-[0.3em]">Expand Archives</p>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArtwork(null)}
              className="absolute inset-0 bg-void/90 backdrop-blur-xl"
            />
            
            <motion.div
              layoutId={`art-${selectedArtwork.id}`}
              className="relative glass-panel overflow-hidden flex flex-col max-h-[90vh] max-w-[95vw] shadow-2xl border-white/10"
            >
              <button 
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-void/50 text-white rounded-full hover:bg-gold hover:text-void transition-colors backdrop-blur-md"
              >
                <X size={24} />
              </button>

              <div 
                className="relative flex items-center justify-center bg-void overflow-hidden group cursor-pointer"
                onClick={() => setShowInfo(!showInfo)}
              >
                {isYoutubeUrl(selectedArtwork.imageUrl) ? (
                  <div className="aspect-video w-full max-w-4xl bg-void">
                    <iframe 
                      src={getYoutubeEmbedUrl(selectedArtwork.imageUrl) + "?autoplay=1"}
                      title={selectedArtwork.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : isVideoUrl(selectedArtwork.imageUrl) ? (
                  <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    onContextMenu={(e) => e.preventDefault()}
                    className="max-h-[90vh] w-auto object-contain select-none"
                  >
                    <source src={getDirectMediaUrl(selectedArtwork.imageUrl)} type={selectedArtwork.imageUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                  </video>
                ) : (
                  <img 
                    src={getDirectMediaUrl(selectedArtwork.imageUrl)} 
                    alt={selectedArtwork.title}
                    onContextMenu={(e) => e.preventDefault()}
                    className="max-h-[90vh] w-auto object-contain select-none"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* Floating Info Card */}
                <div className={`absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 p-4 md:p-8 rounded-2xl border border-white/10 bg-void/60 backdrop-blur-xl text-white md:max-w-md shadow-2xl transition-all duration-500 pointer-events-none ${showInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <p className="text-gold tracking-[0.3em] uppercase text-[10px] md:text-xs mb-1 md:mb-2 font-bold">{selectedArtwork.category}</p>
                  <h2 className="text-xl md:text-4xl font-serif leading-tight text-white">{selectedArtwork.title}</h2>
                  <div className="mt-2 md:mt-4 w-12 h-px bg-gold/50" />
                  <p className="mt-2 text-[10px] text-white/40 uppercase tracking-widest md:hidden">Tap image to hide info</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
