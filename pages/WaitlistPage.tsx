import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Star, Sparkles, Loader2, AlertCircle, ShieldCheck, Info, Zap, HelpCircle, Palette, PenTool, Layout, Hourglass } from 'lucide-react';
import { WaitlistStatus, WaitlistEntry } from '../types';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgz4TZ_8CGC_94LDm3UCxs8FW4CYzn87sdu7hLSeGxvxbB3Of_p6kXawVPKGt_MBTWApkEU5XlAy19/pub?output=csv';

const getStatusStyle = (status: string, type?: 'rush' | 'normal') => {
    if (type === 'rush') return { text: 'text-deep-red', dot: 'bg-deep-red' };
    if (!status) return { text: 'text-ink/40', dot: 'bg-ink/40' }; 
    const s = status.toLowerCase();
    if (s.includes('finished') || s.includes('completed')) return { text: 'text-gold', dot: 'bg-gold' };
    if (s.includes('coloring')) return { 
        text: 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent font-black hologram-text', 
        dot: 'bg-blue-500' 
    };
    if (s.includes('sketch') || s.includes('lineart')) return { text: 'text-gold', dot: 'bg-gold' };
    if (s.includes('thumbnail')) return { text: 'text-gold/60', dot: 'bg-gold/60' };
    return { text: 'text-ink/40', dot: 'bg-ink/40' };
};

const WaitlistPage: React.FC = () => {
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([
        { id: 0, username: 'Aetherious 2', commissionType: '', status: 'Coloring' as WaitlistStatus, type: 'rush' },
        { id: 1, username: 'Aaron Commission', commissionType: '', status: 'Sketch' as WaitlistStatus, type: 'normal' },
        { id: 2, username: 'Bobbie Commission', commissionType: '', status: 'Waiting' as WaitlistStatus, type: 'normal' },
        { id: 3, username: 'Alex Commission', commissionType: '', status: 'Waiting' as WaitlistStatus, type: 'normal' },
        { id: 4, username: 'Beeps Commission', commissionType: '', status: 'Waiting' as WaitlistStatus, type: 'normal' },
        { id: 5, username: 'FRU Commission', commissionType: '', status: 'Waiting' as WaitlistStatus, type: 'normal' },
        { id: 6, username: 'Cameron Commission', commissionType: '', status: 'Waiting' as WaitlistStatus, type: 'normal' },
        { id: 7, username: 'Star Commission', commissionType: '', status: 'Waiting' as WaitlistStatus, type: 'normal' },
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(GOOGLE_SHEET_CSV_URL);
                if (!response.ok) {
                    throw new Error(`The waitlist is currently unreachable.`);
                }
                const csvText = await response.text();
                
                const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
                
                let headerRowIndex = -1;
                for (let i = 0; i < Math.min(lines.length, 5); i++) {
                    const potentialHeaderLine = lines[i].toLowerCase();
                    if ((potentialHeaderLine.includes('commission name') || potentialHeaderLine.includes('username')) && potentialHeaderLine.includes('status')) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    throw new Error("Waitlist structure mismatch.");
                }

                const headers = lines[headerRowIndex].split(',').map(h => h.trim().toLowerCase());
                
                let nameIndex = headers.indexOf('commission name');
                if (nameIndex === -1) {
                    nameIndex = headers.indexOf('username');
                }

                const statusIndex = headers.indexOf('status');
                const typeIndex = headers.indexOf('type');

                const data = lines.slice(headerRowIndex + 1).map((line, index) => {
                    const values = line.split(',').map(v => v.trim());
                    const entryType: 'rush' | 'normal' = (typeIndex !== -1 ? values[typeIndex]?.toLowerCase() : 'normal') === 'rush' ? 'rush' : 'normal';
                    return {
                        id: index,
                        username: values[nameIndex],
                        commissionType: '',
                        status: values[statusIndex] as WaitlistStatus,
                        type: entryType,
                    };
                }).filter(entry => entry.username && entry.status);

                setWaitlist(data);

            } catch (e: any) {
                setError(e.message);
                console.error("Failed to fetch waitlist:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="text-center space-y-6 mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-sm uppercase tracking-widest"
                >
                    <Clock size={14} />
                    <span>Commission Waitlist</span>
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-serif text-deep-red">Loys Waitlist</h1>
                <p className="text-ink/70 text-lg max-w-2xl mx-auto">
                    Track your position and progress in the commission queue.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Waitlist */}
                <div className="lg:col-span-8">
                    <div className="glass-panel overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gold/10 bg-gold/5">
                                        <th className="px-6 py-4 text-xs font-bold text-deep-red uppercase tracking-widest">Current Slot</th>
                                        <th className="px-6 py-4 text-xs font-bold text-deep-red uppercase tracking-widest">Commission Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-deep-red uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gold/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 text-gold/40">
                                                    <Loader2 className="animate-spin" size={40} />
                                                    <span className="text-sm uppercase tracking-widest">Loading waitlist...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 text-crimson">
                                                    <AlertCircle size={40} />
                                                    <span className="text-sm uppercase tracking-widest">{error}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : waitlist.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center text-white/20 uppercase tracking-widest text-sm">
                                                The queue is currently empty.
                                            </td>
                                        </tr>
                                    ) : (
                                        waitlist.map((item, index) => {
                                            return (
                                                <tr key={item.id} className="hover:bg-gold/5 transition-colors group relative">
                                                    <td className="px-6 py-6 text-ink/40 font-mono text-sm">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-3">
                                                            {item.type === 'rush' && <Zap size={14} className="text-deep-red animate-pulse" />}
                                                            <span className={`font-serif text-lg ${item.type === 'rush' ? 'text-deep-red' : 'text-ink'}`}>
                                                                {item.username}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-2">
                                                            {(() => {
                                                                const style = getStatusStyle(item.status, item.type);
                                                                return (
                                                                    <>
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                                                        <span className={`text-xs font-bold uppercase tracking-widest ${style.text}`}>
                                                                            {item.status}
                                                                        </span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-panel p-6 space-y-6">
                        <h3 className="text-gold font-serif text-xl flex items-center gap-2">
                            <Info size={18} />
                            Status Meanings
                        </h3>
                        <div className="space-y-4">
                            {[
                                { phase: 'Waiting', time: '----', style: getStatusStyle('Waiting'), icon: <Hourglass size={12} /> },
                                { phase: 'Thumbnail', time: 'Takes 1 Day', style: getStatusStyle('Thumbnail'), icon: <Layout size={12} /> },
                                { phase: 'Sketch & Lineart', time: 'Takes 1-3 Days', style: getStatusStyle('Sketch'), icon: <PenTool size={12} /> },
                                { phase: 'Coloring', time: 'Takes 1-3 Days', style: getStatusStyle('Coloring'), icon: <Palette size={12} /> },
                            ].map((p, i) => (
                                <div key={i} className="grid grid-cols-2 items-center text-sm border-b border-ink/5 pb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={p.style.text}>{p.icon}</span>
                                        <span className={`font-bold uppercase tracking-widest ${p.style.text}`}>{p.phase}</span>
                                    </div>
                                    <span className="text-ink/40 italic pl-4">{p.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6 space-y-6">
                        <h3 className="text-gold font-serif text-xl flex items-center gap-2">
                            <HelpCircle size={18} />
                            Text Meanings
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 items-center text-sm border-b border-ink/5 pb-2">
                                <span className="font-bold uppercase tracking-widest text-ink/40">Gray</span>
                                <span className="text-ink/40 italic pl-4">Normal Waiting</span>
                            </div>
                            <div className="grid grid-cols-2 items-center text-sm border-b border-ink/5 pb-2">
                                <span className="font-bold uppercase tracking-widest text-deep-red">Red</span>
                                <span className="text-ink/40 italic pl-4">Rush Commission</span>
                            </div>
                            <p className="text-xs text-deep-red font-bold text-center">Inquire for RUSH Comms</p>
                        </div>
                    </div>

                    <div className="glass-panel p-6 space-y-4">
                        <h3 className="text-gold font-serif text-xl flex items-center gap-2">
                            <ShieldCheck size={18} />
                            Notes
                        </h3>
                        <div className="space-y-4 text-sm text-ink/70">
                            <p>
                                <span className="text-deep-red font-bold">Waiting Time:</span> Waiting time is equal to your position on the waitlist.
                            </p>
                            <p className="italic text-xs">
                                Example: 1st slot = 1 week, 2nd slot = 2 weeks, 3rd slot = 3 weeks and so on...
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                                <Zap size={14} className="text-deep-red" />
                                <span className="text-deep-red font-bold uppercase tracking-widest text-xs">Rush Commission</span>
                            </div>
                            <p className="text-xs">Pushes you to no.2 immediately.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaitlistPage;
