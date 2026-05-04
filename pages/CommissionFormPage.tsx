import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, User, Mail, MessageSquare, Palette, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

const CommissionFormPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'Character Illustration',
    description: '',
    references: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to a backend
    console.log('Commission Request:', formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 space-y-6"
        >
          <div className="flex justify-center text-gold">
            <CheckCircle2 size={80} />
          </div>
          <h2 className="text-4xl font-serif text-gold">Petition Received</h2>
          <p className="text-white/60 text-lg">
            Your request has been woven into the celestial archives. I shall reach out to you via the provided coordinates soon.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-gold hover:text-void transition-all"
          >
            Send Another Petition
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center space-y-6 mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-sm uppercase tracking-widest"
        >
          <Sparkles size={14} />
          <span>Open for Manifestation</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-serif text-gold">Celestial Petition</h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Submit your vision to the archives. Each commission is a unique artifact crafted with celestial precision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-6 space-y-6">
            <h3 className="text-gold font-serif text-xl flex items-center gap-2">
              <ShieldCheck size={20} />
              The Covenant
            </h3>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                <span>Personal use only unless commercial license is acquired.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                <span>50% upfront payment required to begin manifestation.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                <span>Timeline varies based on complexity (usually 2-4 weeks).</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel p-6 bg-crimson/5 border-crimson/20">
            <p className="text-gold text-xs font-bold uppercase tracking-widest mb-2">Current Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-white font-serif text-lg">Accepting 3 New Petitions</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Your Name
                </label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold/50 transition-all"
                  placeholder="How shall I address you?"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Astral Coordinates
                </label>
                <input 
                  required
                  type="email" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold/50 transition-all"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Palette size={14} /> Manifestation Type
              </label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold/50 transition-all appearance-none"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option className="bg-void">Character Illustration</option>
                <option className="bg-void">Celestial Portrait</option>
                <option className="bg-void">Full Scene Manifestation</option>
                <option className="bg-void">Artifact Design</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} /> Vision Description
              </label>
              <textarea 
                required
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold/50 transition-all resize-none"
                placeholder="Describe the vision you wish to manifest..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-white/40 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} /> Reference Fragments
              </label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-gold/50 transition-all"
                placeholder="Links to references or moodboards"
                value={formData.references}
                onChange={e => setFormData({...formData, references: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gold text-void font-bold py-4 rounded-xl hover:bg-white transition-all duration-300 gold-glow flex items-center justify-center gap-3"
            >
              <Send size={20} />
              <span>Submit Petition</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommissionFormPage;
