import React, { useState, useEffect, useRef } from 'react';
import { auth, loginWithGoogle, logout, db, storage } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, setDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Plus, Trash2, ShieldCheck, Image as ImageIcon, Loader2, Film, FileText, Edit, X, ExternalLink, Settings, AlertTriangle, ChevronDown } from 'lucide-react';
import { ArtworkCategory } from '../types';
import { getDirectMediaUrl, isVideoUrl, isYoutubeUrl, getYoutubeEmbedUrl, getYoutubeThumbnail } from '../mediaUtils';

const ADMIN_EMAILS = ['pechonloise36@gmail.com', 'darlene.quinagon@gmail.com'];

const MediaPreview: React.FC<{ url: string }> = ({ url }) => {
  return (
    <div className="p-4 bg-ink/5 rounded-lg border border-gold/10 overflow-hidden">
        <p className="text-[10px] uppercase tracking-widest text-gold font-bold mb-2 flex items-center gap-2">
            Asset Preview
            {url && <a href={getDirectMediaUrl(url)} target="_blank" rel="noopener noreferrer" className="ml-auto text-ink/30 hover:text-gold"><ExternalLink size={10} /></a>}
        </p>
        {url ? (
            isYoutubeUrl(url) ? (
                <div className="aspect-video bg-void flex flex-col items-center justify-center rounded overflow-hidden">
                    <iframe 
                      src={getYoutubeEmbedUrl(url)!}
                      title="YouTube Preview"
                      className="w-full h-full border-0"
                    />
                </div>
            ) : isVideoUrl(url) ? (
                <div className="aspect-video bg-void flex items-center justify-center rounded overflow-hidden">
                    <video key={getDirectMediaUrl(url)} src={getDirectMediaUrl(url)} controls className="max-h-full" />
                </div>
            ) : (
                <div className="aspect-video bg-void/5 flex items-center justify-center rounded overflow-hidden border border-gold/5">
                    <img 
                      key={getDirectMediaUrl(url)} 
                      src={getDirectMediaUrl(url)} 
                      alt="Preview" 
                      className="max-h-full object-contain" 
                      onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/1a1a1a/D4AF37?text=Invalid+Link')} 
                    />
                </div>
            )
        ) : (
            <div className="aspect-video bg-void/5 flex items-center justify-center rounded border border-dashed border-ink/10">
                <p className="text-[10px] text-ink/20">Enter URL to preview</p>
            </div>
        )}
    </div>
  );
};

const AdminPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gallery' | 'verified'>('gallery');
  
  // Gallery Form State
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: ArtworkCategory.PORTRAIT,
    imageUrl: ''
  });

  // Verified Art Form State
  const [verifiedForm, setVerifiedForm] = useState({
    artworkId: '',
    title: '',
    artist: 'Loys',
    creationDate: new Date().toISOString().split('T')[0],
    commissioner: '',
    status: 'Commissioned' as 'Commissioned' | 'Personal Work',
    characterName: '',
    commissionType: 'Illustration',
    medium: 'Digital Illustration',
    resolution: '300 DPI',
    aspectRatio: 'N/A',
    uniqueCommission: 'Yes',
    oneOfOne: 'Yes',
    commercialRights: 'No',
    reproductionLimit: '0',
    originalOwner: '',
    transferable: 'No',
    processImages: '',
    imageUrl: '',
    timelapseUrl: '',
    referenceUrl: ''
  });

  const [items, setItems] = useState<any[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupStatus, setCleanupStatus] = useState<string>('');
  const [showCleanup, setShowCleanup] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
      fetchItems();
    }
  }, [user, activeTab]);

  const fetchItems = async () => {
    setIsActionLoading(true);
    try {
      const colName = activeTab === 'gallery' ? 'gallery' : 'verified_artworks';
      const q = query(collection(db, colName));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const cleanupStorage = async () => {
    const isAdmin = user?.email === 'pechonloise36@gmail.com';
    if (!isAdmin) {
      alert("Only the primary administrator (pechonloise36@gmail.com) has permission to wipe storage assets based on security rules.");
      return;
    }

    if (!window.confirm("WARNING: This will scan and delete ALL files in your Firebase Storage bucket root and common folders. This cannot be undone. Proceed only if you have replaced all storage URLs with external links.")) return;
    
    setIsCleaning(true);
    setCleanupStatus('Scanning storage...');
    try {
      // List of common paths to check
      const paths = ['', 'gallery', 'verified_artworks', 'artworks'];
      let deletedCount = 0;

      for (const path of paths) {
        setCleanupStatus(`Scanning: /${path}...`);
        const storageRef = ref(storage, path);
        const list = await listAll(storageRef);
        
        for (const itemRef of list.items) {
          // Skip known public resources if any (usually they stay in /public/ but just in case)
          if (itemRef.name === 'Profile Pic.png' || itemRef.name === 'Signature.png' || itemRef.name === 'Cover.webm') continue;
          
          setCleanupStatus(`Deleting: ${itemRef.name}...`);
          try {
            await deleteObject(itemRef);
            deletedCount++;
          } catch (err) {
            console.error(`Failed to delete ${itemRef.name}:`, err);
          }
        }
      }
      
      alert(`Cleanup complete. Deleted ${deletedCount} files.`);
      setCleanupStatus('');
    } catch (e: any) {
      console.error(e);
      alert(`Error during cleanup: ${e.message}`);
    } finally {
      setIsCleaning(false);
      setCleanupStatus('');
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.imageUrl && !editingId) {
      alert("Please provide an image URL for the gallery.");
      return;
    }
    setIsActionLoading(true);
    try {
      if (editingId) {
        await setDoc(doc(db, 'gallery', editingId), {
          ...galleryForm,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        await addDoc(collection(db, 'gallery'), {
          ...galleryForm,
          order: items.length,
          createdAt: new Date().toISOString()
        });
      }

      setGalleryForm({
        title: '',
        category: ArtworkCategory.PORTRAIT,
        imageUrl: ''
      });
      setEditingId(null);
      fetchItems();
    } catch (e) { alert(e); }
    finally { 
      setIsActionLoading(false); 
    }
  };

  const handleAddVerified = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedForm.imageUrl && !editingId) {
      alert("Please provide the main artwork image URL.");
      return;
    }
    setIsActionLoading(true);
    try {
      const { artworkId, ...data } = verifiedForm;
      
      const docId = editingId || artworkId;
      await setDoc(doc(db, 'verified_artworks', docId), {
        artworkId: editingId ? items.find(i => i.id === editingId).artworkId : artworkId,
        ...data,
        originalOwner: data.originalOwner || data.commissioner,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setVerifiedForm({
        ...verifiedForm,
        artworkId: '',
        title: '',
        commissioner: '',
        characterName: '',
        originalOwner: '',
        processImages: '',
        imageUrl: '',
        timelapseUrl: '',
        referenceUrl: ''
      });
      setEditingId(null);
      fetchItems();
    } catch (e) { alert(e); }
    finally { 
      setIsActionLoading(false); 
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === 'gallery') {
      setGalleryForm({
        title: item.title,
        category: item.category,
        imageUrl: item.imageUrl || ''
      });
    } else {
      setVerifiedForm({
        artworkId: item.artworkId,
        title: item.title,
        artist: item.artist || 'Loys',
        creationDate: item.creationDate,
        commissioner: item.commissioner,
        status: item.status,
        characterName: item.characterName || '',
        commissionType: item.commissionType || '',
        medium: item.medium || '',
        resolution: item.resolution || '',
        aspectRatio: item.aspectRatio || '',
        uniqueCommission: item.uniqueCommission || 'Yes',
        oneOfOne: item.oneOfOne || 'Yes',
        commercialRights: item.commercialRights || 'No',
        reproductionLimit: item.reproductionLimit || '0',
        originalOwner: item.originalOwner || '',
        transferable: item.transferable || 'No',
        processImages: item.processImages || '',
        imageUrl: item.imageUrl || '',
        timelapseUrl: item.timelapseUrl || '',
        referenceUrl: item.referenceUrl || ''
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setGalleryForm({ title: '', category: ArtworkCategory.PORTRAIT, imageUrl: '' });
    setVerifiedForm({
      artworkId: '',
      title: '',
      artist: 'Loys',
      creationDate: new Date().toISOString().split('T')[0],
      commissioner: '',
      status: 'Commissioned',
      characterName: '',
      commissionType: 'Illustration',
      medium: 'Digital Illustration',
      resolution: '300 DPI',
      aspectRatio: 'N/A',
      uniqueCommission: 'Yes',
      oneOfOne: 'Yes',
      commercialRights: 'No',
      reproductionLimit: '0',
      originalOwner: '',
      transferable: 'No',
      processImages: '',
      imageUrl: '',
      timelapseUrl: '',
      referenceUrl: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    setIsActionLoading(true);
    try {
      const colName = activeTab === 'gallery' ? 'gallery' : 'verified_artworks';
      await deleteDoc(doc(db, colName, id));
      fetchItems();
    } catch (e) { alert(e); }
    finally { setIsActionLoading(false); }
  };

  if (isAuthLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-gold" size={48} /></div>;

  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 glass-panel text-center space-y-6">
        <ShieldCheck className="mx-auto text-gold" size={64} />
        <h1 className="text-3xl font-serif text-deep-red">Admin Access</h1>
        <p className="text-ink/60">This area is restricted to the archive administrator.</p>
        <button onClick={loginWithGoogle} className="w-full btn-celestial flex items-center justify-center gap-2">
          <LogIn size={18} /> Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif text-deep-red">Archive Management</h1>
        <button onClick={logout} className="text-ink/40 hover:text-deep-red flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="flex gap-4 border-b border-gold/20">
        <button 
          onClick={() => { setActiveTab('gallery'); handleCancelEdit(); }}
          className={`pb-4 px-6 font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'gallery' ? 'text-gold border-b-2 border-gold' : 'text-ink/40'}`}
        >
          Gallery
        </button>
        <button 
          onClick={() => { setActiveTab('verified'); handleCancelEdit(); }}
          className={`pb-4 px-6 font-bold uppercase tracking-widest text-sm transition-all ${activeTab === 'verified' ? 'text-gold border-b-2 border-gold' : 'text-ink/40'}`}
        >
          Verified Artworks
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-panel p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-gold flex items-center gap-2">
                {editingId ? <Edit size={20} /> : <Plus size={20} />}
                {editingId ? 'Edit Entry' : 'Add New Entry'}
              </h2>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-ink/40 hover:text-deep-red">
                  <X size={20} />
                </button>
              )}
            </div>
            
            {activeTab === 'gallery' ? (
              <form onSubmit={handleAddGallery} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink/40">Basic Info</label>
                  <input type="text" placeholder="Title" required className="w-full p-3 border rounded-lg" value={galleryForm.title} onChange={e => setGalleryForm({...galleryForm, title: e.target.value})} />
                  <select className="w-full p-3 border rounded-lg" value={galleryForm.category} onChange={e => setGalleryForm({...galleryForm, category: e.target.value as ArtworkCategory})}>
                    {Object.values(ArtworkCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink/40">Artwork Asset</label>
                  <input 
                    type="url" 
                    placeholder="Image or Video URL" 
                    required 
                    className="w-full p-3 border rounded-lg" 
                    value={galleryForm.imageUrl} 
                    onChange={e => setGalleryForm({...galleryForm, imageUrl: e.target.value})} 
                  />
                  <MediaPreview url={galleryForm.imageUrl} />
                  <p className="text-[10px] text-ink/40">Provide a direct link to the image or MP4/WebM video file. Support for Imgur, Google Drive, and Dropbox included.</p>
                </div>

                <button type="submit" disabled={isActionLoading} className="w-full btn-celestial flex items-center justify-center gap-2">
                  {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Edit size={18} /> : <Plus size={18} />)}
                  {isActionLoading ? 'Processing...' : (editingId ? 'Update Entry' : 'Add to Gallery')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddVerified} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-gold">1. Core Identity</label>
                  <input 
                    type="text" 
                    placeholder="Artwork ID (e.g. LYS-2026-001)" 
                    required 
                    disabled={!!editingId}
                    className={`w-full p-3 border rounded-lg ${editingId ? 'bg-gray-50 text-ink/40' : ''}`} 
                    value={verifiedForm.artworkId} 
                    onChange={e => setVerifiedForm({...verifiedForm, artworkId: e.target.value})} 
                  />
                  <input type="text" placeholder="Artwork Title" required className="w-full p-3 border rounded-lg" value={verifiedForm.title} onChange={e => setVerifiedForm({...verifiedForm, title: e.target.value})} />
                  <input type="text" placeholder="Character Name" className="w-full p-3 border rounded-lg" value={verifiedForm.characterName} onChange={e => setVerifiedForm({...verifiedForm, characterName: e.target.value})} />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-gold">2. Visual Assets (Embed URLs)</label>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">Main Artwork Image URL</p>
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      required 
                      className="w-full p-3 border rounded-lg" 
                      value={verifiedForm.imageUrl} 
                      onChange={e => setVerifiedForm({...verifiedForm, imageUrl: e.target.value})} 
                    />
                    <MediaPreview url={verifiedForm.imageUrl} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">Timelapse Video URL</p>
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      className="w-full p-3 border rounded-lg" 
                      value={verifiedForm.timelapseUrl} 
                      onChange={e => setVerifiedForm({...verifiedForm, timelapseUrl: e.target.value})} 
                    />
                    <MediaPreview url={verifiedForm.timelapseUrl} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-ink/40 font-bold">Reference Image URL</p>
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      className="w-full p-3 border rounded-lg" 
                      value={verifiedForm.referenceUrl} 
                      onChange={e => setVerifiedForm({...verifiedForm, referenceUrl: e.target.value})} 
                    />
                    <MediaPreview url={verifiedForm.referenceUrl} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-gold">3. Artwork Specs</label>
                  <input type="text" placeholder="Commission Type (e.g. Full Body)" className="w-full p-3 border rounded-lg" value={verifiedForm.commissionType} onChange={e => setVerifiedForm({...verifiedForm, commissionType: e.target.value})} />
                  <input type="text" placeholder="Medium" className="w-full p-3 border rounded-lg" value={verifiedForm.medium} onChange={e => setVerifiedForm({...verifiedForm, medium: e.target.value})} />
                  <input type="text" placeholder="Resolution" className="w-full p-3 border rounded-lg" value={verifiedForm.resolution} onChange={e => setVerifiedForm({...verifiedForm, resolution: e.target.value})} />
                  <input type="text" placeholder="Aspect Ratio" className="w-full p-3 border rounded-lg" value={verifiedForm.aspectRatio} onChange={e => setVerifiedForm({...verifiedForm, aspectRatio: e.target.value})} />
                  <input type="date" className="w-full p-3 border rounded-lg" value={verifiedForm.creationDate} onChange={e => setVerifiedForm({...verifiedForm, creationDate: e.target.value})} />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-gold">4. Rarity & Rights</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="p-3 border rounded-lg" value={verifiedForm.uniqueCommission} onChange={e => setVerifiedForm({...verifiedForm, uniqueCommission: e.target.value})}>
                      <option value="Yes">Unique: Yes</option>
                      <option value="No">Unique: No</option>
                    </select>
                    <select className="p-3 border rounded-lg" value={verifiedForm.oneOfOne} onChange={e => setVerifiedForm({...verifiedForm, oneOfOne: e.target.value})}>
                      <option value="Yes">1-of-1: Yes</option>
                      <option value="No">1-of-1: No</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="p-3 border rounded-lg" value={verifiedForm.commercialRights} onChange={e => setVerifiedForm({...verifiedForm, commercialRights: e.target.value})}>
                      <option value="No">Commercial: No</option>
                      <option value="Yes">Commercial: Yes</option>
                    </select>
                    <input type="text" placeholder="Reproduction Limit" className="w-full p-3 border rounded-lg" value={verifiedForm.reproductionLimit} onChange={e => setVerifiedForm({...verifiedForm, reproductionLimit: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-gold">5. Ownership</label>
                  <input type="text" placeholder="Commissioned By" required className="w-full p-3 border rounded-lg" value={verifiedForm.commissioner} onChange={e => setVerifiedForm({...verifiedForm, commissioner: e.target.value})} />
                  <input type="text" placeholder="Original Owner (leave blank if same)" className="w-full p-3 border rounded-lg" value={verifiedForm.originalOwner} onChange={e => setVerifiedForm({...verifiedForm, originalOwner: e.target.value})} />
                  <select className="w-full p-3 border rounded-lg" value={verifiedForm.transferable} onChange={e => setVerifiedForm({...verifiedForm, transferable: e.target.value})}>
                    <option value="No">Transferable: No</option>
                    <option value="Yes">Transferable: Yes</option>
                  </select>
                </div>

                <button type="submit" disabled={isActionLoading} className="w-full btn-celestial sticky bottom-0 flex items-center justify-center gap-2">
                  {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Edit size={18} /> : <ShieldCheck size={18} />)}
                  {isActionLoading ? 'Securing...' : (editingId ? 'Update Certificate' : 'Issue Certificate')}
                </button>
              </form>
            )}
          </div>

          {/* Maintenance Section */}
          <div className="glass-panel p-6 space-y-4 bg-void/5 border-dashed border-gold/20">
            <button 
              onClick={() => setShowCleanup(!showCleanup)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/40 hover:text-gold transition-colors w-full justify-between"
            >
              <span className="flex items-center gap-2"><Settings size={14} /> Maintenance Tools</span>
              <ChevronDown size={14} className={`transition-transform ${showCleanup ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showCleanup && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden pt-2"
                >
                  <div className="p-4 bg-deep-red/5 border border-deep-red/20 rounded-lg space-y-2">
                    <p className="text-xs font-bold text-deep-red flex items-center gap-2">
                      <AlertTriangle size={14} /> Cleanup Media Storage
                    </p>
                    <p className="text-[10px] text-ink/60 leading-relaxed">
                      This will permanently delete all uploaded images and videos from Firebase Storage. 
                      Since you are now using direct URLs, these old files are no longer needed.
                    </p>
                    <button 
                      onClick={cleanupStorage}
                      disabled={isCleaning}
                      className="w-full py-2 bg-deep-red text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-ink transition-colors disabled:opacity-50"
                    >
                      {isCleaning ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin" size={12} /> {cleanupStatus}
                        </span>
                      ) : 'Wipe Storage Assets'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif text-ink">Current Entries ({items.length})</h2>
            {isActionLoading && <Loader2 className="animate-spin text-gold" size={20} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(item => (
              <div key={item.id} className="glass-panel p-4 flex gap-4 items-center group">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  {isYoutubeUrl(item.imageUrl) ? (
                    <img src={getYoutubeThumbnail(item.imageUrl) || ''} alt="" className="w-full h-full object-cover" />
                  ) : isVideoUrl(item.imageUrl) ? (
                    <div className="w-full h-full bg-void flex items-center justify-center">
                        <Film className="text-gold/20" size={24} />
                    </div>
                  ) : (
                    <img src={getDirectMediaUrl(item.imageUrl)} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold truncate">{item.title}</h4>
                  <p className="text-xs text-ink/40 truncate">{activeTab === 'gallery' ? item.category : item.artworkId}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-2 text-ink/20 hover:text-gold transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-ink/20 hover:text-deep-red transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
