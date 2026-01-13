"use client";

import { useEffect, useState, use } from 'react';
import { getPackTemplates } from '@/app/actions/packs';
import { Loader2, Zap, ArrowRight, CheckCircle, Smartphone, Camera } from 'lucide-react';
import { getDeviceId } from '@/lib/utils';
import Link from 'next/link';

// NOTE: Ideally we'd fetch specific template by ID from DB, but for now we filter the list for speed
// Since we don't have a `getPackTemplate(id)` action yet, I'll add one or just use the list.
// I'll assume `getPackTemplates` is cached or fast enough.

export default function PackWizard({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params for Next.js 15+ (if applicable, but safe pattern)
    // Actually in 15 it's async, in 14 it's prop. Let's assume standard Next 14/15 safe unwrapping.
    const [templateId, setTemplateId] = useState<string>('');
    useEffect(() => {
        params.then(p => setTemplateId(p.id));
    }, [params]);

    const [template, setTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Inputs, 2: Generating, 3: Done

    // Form State
    const [inputs, setInputs] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!templateId) return;
        getPackTemplates().then(data => {
            const t = data?.find(x => x.id === templateId);
            setTemplate(t);
            setLoading(false);
        });
    }, [templateId]);

    const handleGenerate = async () => {
        setStep(2);
        // Simulate Generation for Phase 8 MVP
        // In Phase 9/10 we connect this to `api/ai/creative` loop
        setTimeout(() => {
            setStep(3);
        }, 2000);
    }

    if (loading || !templateId) return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-yard-cyan">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );

    if (!template) return <div className="p-10 text-white">Template not found</div>;

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-yard-cyan/30">
            {step === 1 && (
                <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-yard-cyan uppercase tracking-widest">Pack Wizard</div>
                        <h1 className="text-3xl font-black italic">{template.title}</h1>
                        <p className="text-neutral-400">{template.description}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 space-y-4">
                            <h3 className="font-bold text-sm text-neutral-300">Enter Details</h3>
                            {/* We dynamically generate inputs based on prompts? 
                                For now, simplified generalized inputs */}
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-neutral-500 font-bold ml-1">Focus Item / Dish / Service</label>
                                    <input
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-3 text-white focus:border-yard-cyan outline-none"
                                        placeholder="e.g. Oxtail Bundle"
                                        onChange={e => setInputs({ ...inputs, focus: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 font-bold ml-1">Price / Special Offer</label>
                                    <input
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-3 text-white focus:border-yard-cyan outline-none"
                                        placeholder="e.g. $1500 JMD"
                                        onChange={e => setInputs({ ...inputs, price: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            className="w-full py-4 bg-gradient-to-r from-yard-cyan to-yard-green text-black font-black italic tracking-wider rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span>GENERATE PACK</span>
                            <Zap className="w-5 h-5 fill-black" />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-yard-cyan/30 border-t-yard-cyan animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-yard-cyan animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic mb-2">COOKING...</h2>
                        <p className="text-neutral-500 text-sm">Generating {template.template_data?.prompts?.length || 3} assets for you.</p>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 text-green-500 mb-2">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black italic">PACK READY!</h1>
                        <p className="text-neutral-400 text-sm">3 New Assets added to your Vault</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Mock Results */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-[9/16] bg-neutral-900 rounded-xl border border-neutral-800 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                                    <span className="text-xs font-bold text-white">Asset #{i}</span>
                                    <span className="text-[10px] text-neutral-400">Ready to Share</span>
                                </div>
                                <div className="absolute top-2 right-2">
                                    <div className="w-6 h-6 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
                                        <Smartphone className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <Link href="/packs" className="flex-1 py-3 text-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold text-sm">
                            Back
                        </Link>
                        <button className="flex-1 py-3 rounded-xl bg-yard-cyan text-black font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                            Download All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
