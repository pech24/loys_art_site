import React, { useState, useEffect } from 'react';
import {
  getAuthUser,
  loginWithGooglePopup,
  logout,
  fetchGalleryAdmin,
  fetchVerifiedAdmin,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  createVerifiedItem,
  updateVerifiedItem,
  deleteVerifiedItem,
  type AuthUser,
} from '../lib/api';
import { motion } from 'motion/react';
import { LogIn, LogOut, Plus, Trash2, ShieldCheck, Loader2, Film, Edit, X, ExternalLink } from 'lucide-react';
import { ArtworkCategory } from '../types';
import { getDirectMediaUrl, isVideoUrl, isYoutubeUrl, getYoutubeEmbedUrl, getYoutubeThumbnail } from '../mediaUtils';

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gallery' | 'verified'>('gallery');
  
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: ArtworkCategory.PORTRAIT,
    imageUrl: ''
  });

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
  const [editingId, setEditingId] = useState<string | null>(null);

  const refreshAuth = async () => {
    const authUser = await getAuthUser();
    setUser(authUser);
    setIsAuthLoading(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchItems();
    }
  }, [user, activeTab]);

  const fetchItems = async () => {
    setIsActionLoading(true);
    try {
      if (activeTab === 'gallery') {
        const gallery = await fetchGalleryAdmin();
        setItems(gallery.map((g) => ({ id: g.id, ...g })));
      } else {
        const verified = await fetchVerifiedAdmin();
        setItems(verified.map((v) => ({ id: v.artworkId, ...v })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await loginWithGooglePopup();
      await refreshAuth();
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : 'Login failed');
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
        await updateGalleryItem(editingId, galleryForm);
      } else {
        await createGalleryItem(galleryForm);
      }
      setGalleryForm({ title: '', category: ArtworkCategory.PORTRAIT, imageUrl: '' });
      setEditingId(null);
      fetchItems();
    } catch (e) { alert(e); }
    finally { setIsActionLoading(false); }
  };

  const handleAddVerified = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedForm.imageUrl && !editingId) {
      alert("Please provide the main artwork image URL.");
      return;
    }
    setIsActionLoading(true);
    try {
      const payload = {
        ...verifiedForm,
        originalOwner: verifiedForm.originalOwner || verifiedForm.commissioner,
      };
      if (editingId) {
        await updateVerifiedItem(editingId, payload as any);
      } else {
        await createVerifiedItem(payload as any);
      }
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
    finally { setIsActionLoading(false); }
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
      if (activeTab === 'gallery') {
        await deleteGalleryItem(id);
      } else {
        await deleteVerifiedItem(id);
      }
      fetchItems();
    } catch (e) { alert(e); }
    finally { setIsActionLoading(false); }
  };

  if (isAuthLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-gold" size={48} /></div>;

  if (!user?.isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 glass-panel text-center space-y-6">
        <ShieldCheck className="mx-auto text-gold" size={64} />
        <h1 className="text-3xl font-serif text-deep-red">Admin Access</h1>
        <p className="text-ink/60">This area is restricted to the archive administrator.</p>
        {loginError && <p className="text-sm text-deep-red">{loginError}</p>}
        <button onClick={handleLogin} className="w-full btn-celestial flex items-center justify-center gap-2">
          <LogIn size={18} /> Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif text-deep-red">Archive Management</h1>
        <button onClick={async () => { await logout(); setUser(null); }} className="text-ink/40 hover:text-deep-red flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
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
                  <input type="url" placeholder="Image or Video URL" required={!editingId} className="w-full p-3 border rounded-lg" value={galleryForm.imageUrl} onChange={e => setGalleryForm({...galleryForm, imageUrl: e.target.value})} />
                  <MediaPreview url={galleryForm.imageUrl} />
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
                  <input type="text" placeholder="Artwork ID (e.g. LYS-2026-001)" required disabled={!!editingId} className={`w-full p-3 border rounded-lg ${editingId ? 'bg-gray-50 text-ink/40' : ''}`} value={verifiedForm.artworkId} onChange={e => setVerifiedForm({...verifiedForm, artworkId: e.target.value})} />
                  <input type="text" placeholder="Artwork Title" required className="w-full p-3 border rounded-lg" value={verifiedForm.title} onChange={e => setVerifiedForm({...verifiedForm, title: e.target.value})} />
                  <input type="text" placeholder="Character Name" className="w-full p-3 border rounded-lg" value={verifiedForm.characterName} onChange={e => setVerifiedForm({...verifiedForm, characterName: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-gold">2. Visual Assets</label>
                  <input type="url" placeholder="Main Artwork Image URL" required={!editingId} className="w-full p-3 border rounded-lg" value={verifiedForm.imageUrl} onChange={e => setVerifiedForm({...verifiedForm, imageUrl: e.target.value})} />
                  <MediaPreview url={verifiedForm.imageUrl} />
                  <input type="url" placeholder="Timelapse URL" className="w-full p-3 border rounded-lg" value={verifiedForm.timelapseUrl} onChange={e => setVerifiedForm({...verifiedForm, timelapseUrl: e.target.value})} />
                  <MediaPreview url={verifiedForm.timelapseUrl} />
                  <input type="url" placeholder="Reference URL" className="w-full p-3 border rounded-lg" value={verifiedForm.referenceUrl} onChange={e => setVerifiedForm({...verifiedForm, referenceUrl: e.target.value})} />
                  <MediaPreview url={verifiedForm.referenceUrl} />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-gold">3. Artwork Specs</label>
                  <input type="text" placeholder="Commission Type" className="w-full p-3 border rounded-lg" value={verifiedForm.commissionType} onChange={e => setVerifiedForm({...verifiedForm, commissionType: e.target.value})} />
                  <input type="text" placeholder="Medium" className="w-full p-3 border rounded-lg" value={verifiedForm.medium} onChange={e => setVerifiedForm({...verifiedForm, medium: e.target.value})} />
                  <input type="date" className="w-full p-3 border rounded-lg" value={verifiedForm.creationDate} onChange={e => setVerifiedForm({...verifiedForm, creationDate: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-gold">4. Ownership</label>
                  <input type="text" placeholder="Commissioned By" required className="w-full p-3 border rounded-lg" value={verifiedForm.commissioner} onChange={e => setVerifiedForm({...verifiedForm, commissioner: e.target.value})} />
                </div>
                <button type="submit" disabled={isActionLoading} className="w-full btn-celestial sticky bottom-0 flex items-center justify-center gap-2">
                  {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Edit size={18} /> : <ShieldCheck size={18} />)}
                  {isActionLoading ? 'Securing...' : (editingId ? 'Update Certificate' : 'Issue Certificate')}
                </button>
              </form>
            )}
          </div>
        </div>

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
                  <button onClick={() => handleEdit(item)} className="p-2 text-ink/20 hover:text-gold transition-colors" title="Edit"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-ink/20 hover:text-deep-red transition-colors" title="Delete"><Trash2 size={18} /></button>
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
