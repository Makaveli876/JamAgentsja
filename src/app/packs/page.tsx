"use client";

import { useEffect, useState } from 'react';
import { getPackTemplates } from '@/app/actions/packs';
import { Loader2, Zap, Utensils, Briefcase, Calendar, ChevronLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ICONS: any = { Utensils, Briefcase, Calendar, Zap };

export default function PacksPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPackTemplates().then(data => {
            setTemplates(data || []);
            setLoading(false);
        });
    }, []);

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-yard-cyan/30 pb-20">
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80 backdrop-blur sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold tracking-wide">BACK</span>
                </Link>
                <div className="text-right">
                    <h1 className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yard-cyan to-yard-green">
                        POWER PACKS
                    </h1>
                    <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">Instant Marketing Campaigns</p>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-md mx-auto p-6 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-yard-cyan" />
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {templates.map((t) => {
                            const Icon = ICONS[t.template_data?.icon] || Zap;
                            return (
                                <Link key={t.id} href={`/packs/${t.id}`}>
                                    <div className="group relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl p-6 transition-all hover:border-yard-cyan/50 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)] active:scale-[0.98]">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:bg-yard-cyan/20 group-hover:text-yard-cyan transition-colors">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-neutral-400">
                                                {t.template_data?.prompts?.length || 3} Assets
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold mb-1 text-white group-hover:text-yard-cyan transition-colors">{t.title}</h3>
                                        <p className="text-sm text-neutral-500 leading-relaxed mb-4">{t.description}</p>

                                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 group-hover:text-white transition-colors">
                                            <span>LAUNCH PACK</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>

                                        {/* Background Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-yard-cyan/0 via-yard-cyan/0 to-yard-cyan/0 group-hover:to-yard-cyan/5 transition-all duration-500" />
                                    </div>
                                </Link>
                            )
                        })}

                        {templates.length === 0 && (
                            <div className="text-center py-12 text-neutral-600">
                                <p>No packs available yet.</p>
                                <p className="text-xs mt-2">Check the seed route.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
