import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useForm, ValidationError } from '@formspree/react';
import { 
    Send, User, Mail, Palette, Sparkles, CheckCircle2, 
    Image as ImageIcon, MessageSquare, Info, ChevronDown,
    Zap, RefreshCw, Award, Video, Shield, ShieldCheck,
    Calendar, PlusCircle, Users, Infinity, Briefcase, FileText,
    CreditCard, Pencil, PenLine
} from 'lucide-react';
import { commissionTiers } from '../constants';
import { getDirectMediaUrl, isVideoUrl, isYoutubeUrl, getYoutubeThumbnail } from '../mediaUtils';

const detailedPackages: Record<string, { icon: React.ReactNode, text: string }[]> = {
    'Head Portraits': [
        { icon: <Palette size={14} />, text: 'Cinematic Head Portrait Drawing' },
        { icon: <ImageIcon size={14} />, text: 'Background Included(Likely Blurred)' },
        { icon: <Sparkles size={14} />, text: 'Effects and Props' },
        { icon: <RefreshCw size={14} />, text: 'Free Minor Revisions' },
        { icon: <Award size={14} />, text: 'Certificate of Authenticity' },
        { icon: <Video size={14} />, text: 'Timelapse' },
    ],
    'Full Illustration': [
        { icon: <User size={14} />, text: 'Full Body Character' },
        { icon: <Shield size={14} />, text: 'Armor and Weapons' },
        { icon: <ImageIcon size={14} />, text: 'Detailed Background' },
        { icon: <Zap size={14} />, text: 'Power Effects' },
        { icon: <RefreshCw size={14} />, text: 'Free Minor Revisions' },
        { icon: <Award size={14} />, text: 'Certificate of Authenticity' },
        { icon: <Video size={14} />, text: 'Timelapse' },
    ],
    '30 Day Illustration': [
        { icon: <Calendar size={14} />, text: 'Hire me to draw for 1month(Sundays not Included)' },
        { icon: <PlusCircle size={14} />, text: 'All Perks on Full Illustration' },
        { icon: <Users size={14} />, text: 'Around 4 Full Illustrations (w/Multi Characters)' },
        { icon: <Infinity size={14} />, text: 'Unlimited Revisions' },
        { icon: <Briefcase size={14} />, text: 'Commercial License' },
    ],
};

const OrdersPage: React.FC = () => {
    const [state, handleFormspreeSubmit] = useForm("meoprqzw");
    
    const [selectedTierImage, setSelectedTierImage] = useState<string | null>(
        commissionTiers.length > 0 ? commissionTiers[0].imageUrl : null
    );

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        commissionType: commissionTiers.length > 0 ? commissionTiers[0].title : '',
        characterRef: '',
        commissionDescription: '',
        extraNotes: '',
        addons: {
            props: false,
            flatBg: false,
            fullBg: false,
            other: false,
        },
        otherText: '',
        tos: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked, name } = e.target as HTMLInputElement;
            if (name in formData.addons) {
                setFormData(prev => ({
                    ...prev,
                    addons: { ...prev.addons, [name]: checked }
                }));
            } else {
                setFormData(prev => ({ ...prev, [name]: checked as boolean }));
            }
        } else if (name === 'commissionType') {
            setFormData(prev => ({ ...prev, [name]: value }));
            const selectedTier = commissionTiers.find(t => t.title === value);
            setSelectedTierImage(selectedTier ? selectedTier.imageUrl : null);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addonsList = [];
    if (formData.addons.props) addonsList.push('Props/Weapons/Effects');
    if (formData.addons.flatBg) addonsList.push('Flat Background');
    if (formData.addons.fullBg) addonsList.push('Full Background');
    if (formData.addons.other && formData.otherText) {
        addonsList.push(`Other: ${formData.otherText}`);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        if (!formData.tos) {
            e.preventDefault();
            alert('You must accept the Terms of Service to proceed.');
            return;
        }
        await handleFormspreeSubmit(e);
    };

    if (state.succeeded) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-12 space-y-6"
                >
                    <div className="flex justify-center text-gold">
                        <motion.div
                            animate={{ 
                                x: [0, 5, 0],
                                y: [0, -5, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <Pencil size={80} />
                        </motion.div>
                    </div>
                    <h1 className="text-5xl font-serif text-deep-red">Sent!</h1>
                    <p className="text-ink/70 text-lg">
                        Thank you. Your request has been submitted. I will contact you at your email <span className="text-gold">{formData.email}</span> with the price quotation within 24 hrs. Pls check your spam if no emails is received.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center space-y-6 mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-sm uppercase tracking-widest"
                >
                    <FileText size={14} />
                    <span>Commission Form</span>
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-serif text-deep-red">Request a Quote</h1>
                <p className="text-ink/70 text-lg max-w-2xl mx-auto">
                    Select your desired artwork type and provide the details of your request to begin the commission process.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Type Selection & Preview */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="glass-panel p-8 space-y-8">
                        <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
                            <Palette size={24} />
                            1. Select Type
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="relative">
                                <select 
                                    name="commissionType" 
                                    value={formData.commissionType} 
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-ink/10 rounded-xl py-4 px-4 text-ink focus:outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer pr-12"
                                >
                                    {commissionTiers.map(tier => (
                                        <option key={tier.title} value={tier.title} className="bg-white text-ink">
                                            {tier.title} — {tier.price}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                            <div className="p-5 bg-gold/5 rounded-xl border border-gold/10 space-y-4">
                                <p className="text-xs text-gold font-bold uppercase tracking-widest">Package Includes:</p>
                                <div className="space-y-2">
                                    {detailedPackages[formData.commissionType]?.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-ink/80">
                                            <span className="text-gold shrink-0">{item.icon}</span>
                                            <span className="text-sm leading-tight">{item.text}</span>
                                        </div>
                                    )) || (
                                        <p className="text-sm text-ink/70 italic leading-relaxed">
                                            {commissionTiers.find(t => t.title === formData.commissionType)?.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {selectedTierImage && (
                            <motion.div 
                                key={formData.commissionType}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="aspect-[4/3] rounded-xl overflow-hidden border border-gold/20"
                            >
                        {isYoutubeUrl(selectedTierImage) ? (
                          <div className="w-full h-full relative">
                            <img 
                              src={getYoutubeThumbnail(selectedTierImage) || ''} 
                              alt={formData.commissionType} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-void/10">
                              <Video size={48} className="text-gold/50" fill="currentColor" />
                            </div>
                          </div>
                        ) : isVideoUrl(selectedTierImage) ? (
                          <video 
                            autoPlay 
                            muted 
                            loop 
                            playsInline 
                            className="w-full h-full object-cover"
                          >
                            <source src={getDirectMediaUrl(selectedTierImage)} type={selectedTierImage.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                          </video>
                        ) : (
                          <img 
                            src={getDirectMediaUrl(selectedTierImage)} 
                            alt={formData.commissionType} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                            </motion.div>
                        )}
                    </div>

                    <div className="glass-panel p-6 bg-deep-red/5 border-deep-red/20 space-y-4">
                        <h3 className="text-gold font-serif text-lg flex items-center gap-2">
                            <Info size={18} />
                            Notes
                        </h3>
                        <div className="text-xs text-ink/70 leading-relaxed space-y-3">
                            <div className="flex items-start gap-3">
                                <Mail size={14} className="text-gold mt-0.5 shrink-0" />
                                <p>Please ensure you're using an active email for quick responses. <span className="font-bold text-ink">Check your SPAM folder incase.</span></p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CreditCard size={14} className="text-gold mt-0.5 shrink-0" />
                                <p>Payment must be made in <span className="font-bold text-ink">full upon reservation.</span></p>
                            </div>
                            <div className="flex items-start gap-3">
                                <ImageIcon size={14} className="text-gold mt-0.5 shrink-0" />
                                <p>Image reference can follow later if you’re in a rush to reserve.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck size={14} className="text-gold mt-0.5 shrink-0" />
                                <p>Payments are only made through Paypal.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Form Details */}
                <div className="lg:col-span-7">
                    <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 space-y-10">
                        <input type="hidden" name="_subject" value={`New Commission Request: ${formData.commissionType}`} />
                        <input type="hidden" name="commissionType" value={formData.commissionType} />
                        <input type="hidden" name="addOns" value={addonsList.length > 0 ? addonsList.join(', ') : 'None'} />
                        
                        <h2 className="text-2xl font-serif text-gold flex items-center gap-3">
                            <MessageSquare size={24} />
                            2. Commission Details
                        </h2>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-ink/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2" htmlFor="email">
                                    <Mail size={14} /> Email
                                </label>
                                <input 
                                    required
                                    id="email"
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-ink/10 rounded-xl py-3 px-4 text-ink focus:outline-none focus:border-gold/50 transition-all"
                                    placeholder="Your email address"
                                />
                                <ValidationError prefix="Email" field="email" errors={state.errors} className="text-deep-red text-xs mt-1" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-ink/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2" htmlFor="characterRef">
                                <ImageIcon size={14} /> Reference
                            </label>
                            <textarea 
                                required
                                id="characterRef"
                                name="characterRef"
                                rows={3}
                                value={formData.characterRef}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-ink/10 rounded-xl py-3 px-4 text-ink focus:outline-none focus:border-gold/50 transition-all resize-none"
                                placeholder="Links to references, moodboards, or character sheets..."
                            />
                            <ValidationError prefix="Reference" field="characterRef" errors={state.errors} className="text-deep-red text-xs mt-1" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-ink/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2" htmlFor="commissionDescription">
                                <MessageSquare size={14} /> Description
                            </label>
                            <textarea 
                                required
                                id="commissionDescription"
                                name="commissionDescription"
                                rows={4}
                                value={formData.commissionDescription}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-ink/10 rounded-xl py-3 px-4 text-ink focus:outline-none focus:border-gold/50 transition-all resize-none"
                                placeholder="Describe the desired pose, expression, or overall mood..."
                            />
                            <ValidationError prefix="Description" field="commissionDescription" errors={state.errors} className="text-deep-red text-xs mt-1" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-ink/50 text-xs font-bold uppercase tracking-widest flex items-center gap-2" htmlFor="extraNotes">
                                <Info size={14} /> Extra Notes
                            </label>
                            <textarea 
                                id="extraNotes"
                                name="extraNotes"
                                rows={2}
                                value={formData.extraNotes}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-ink/10 rounded-xl py-3 px-4 text-ink focus:outline-none focus:border-gold/50 transition-all resize-none"
                                placeholder="Anything else I should know?"
                            />
                        </div>

                        <div className="flex items-start gap-3 pt-4">
                            <div className="relative flex items-center justify-center mt-1">
                                <input 
                                    required
                                    type="checkbox" 
                                    name="tos"
                                    checked={formData.tos}
                                    onChange={handleInputChange}
                                    className="peer appearance-none w-5 h-5 border border-ink/20 rounded bg-white checked:bg-gold checked:border-gold transition-all"
                                />
                                <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                                    <CheckCircle2 size={14} />
                                </div>
                            </div>
                            <label className="text-xs text-ink/50 leading-relaxed">
                                I have read and agree to the <a href="/#terms" className="text-gold hover:underline">(Terms of Service)</a>. *
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={state.submitting}
                            className="w-full bg-deep-red text-white font-bold py-4 rounded-xl hover:bg-ink transition-all duration-300 gold-glow flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {state.submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            <span>{state.submitting ? 'Sending...' : 'Submit Form'}</span>
                        </button>
                        {state.errors && <p className="text-deep-red text-xs text-center">There was an error with your submission. Please try again.</p>}
                    </form>
                </div>
            </div>
        </div>
    );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <motion.div
        animate={{ 
            x: [0, 8, 0],
            y: [0, -3, 0],
            rotate: [0, 15, 0]
        }}
        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        className={className}
    >
        <PenLine size={size} />
    </motion.div>
);

export default OrdersPage;
