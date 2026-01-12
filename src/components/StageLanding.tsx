import React from "react";
import { Zap, Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { AssetPreview } from "@/components/AssetPreview";

interface StageLandingProps {
    onStart: () => void;
}

const DEMO_DATA = {
    title: "Jerk Center",
    price: "1,500",
    location: "Kingston, JA",
    phone: "876-555-0199",
    style: "island" as const,
    layout: "center" as const,
    mode: "status" as const,
    slogan: "Authentic & Spicy",
    promoLabel: "LUNCH SPECIAL"
};

export function StageLanding({ onStart }: StageLandingProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-bg-deep z-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-yard-green/5 via-transparent to-yard-cyan/5 z-0" />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-sm md:max-w-4xl grid md:grid-cols-2 gap-12 items-center">

                {/* Left: Copy */}
                <div className="text-center md:text-left space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <Zap className="w-8 h-8 text-yard-cyan animate-pulse" />
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                                JamAgents
                            </h1>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500 tracking-tighter leading-[0.9]">
                            Create Viral<br />
                            <span className="text-yard-green">Flyers Fast.</span>
                        </h2>

                        <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                            Zero design skills needed. Just enter details, upload a photo, and get professional marketing assets in seconds.
                        </p>
                    </div>

                    <button
                        onClick={onStart}
                        className="group relative w-full md:w-auto px-8 py-4 bg-white text-black font-black text-lg uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3"
                    >
                        Start Creating
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-zinc-600">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-yard-green" />
                            <span>3,247 Created Today</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yard-gold" />
                            <span>Free to use</span>
                        </div>
                    </div>
                </div>

                {/* Right: Demo (Hidden on small mobile if needed, but good for hook) */}
                <div className="relative hidden md:flex justify-center animate-in fade-in zoom-in duration-1000 delay-300">
                    <div className="relative w-[300px] h-[533px] rotate-[-6deg] hover:rotate-0 transition-transform duration-500 ease-out">
                        {/* Glow */}
                        <div className="absolute inset-0 bg-yard-green opacity-20 blur-[100px] rounded-full" />

                        <div className="relative shadow-2xl rounded-[2rem] overflow-hidden border-4 border-white/10 bg-black">
                            <AssetPreview
                                data={DEMO_DATA}
                                previewImage="https://images.unsplash.com/photo-1594221708779-9e801c0d238d?w=800&q=80"
                                zoom={1.2}
                            />
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -top-6 -right-6 bg-white text-black px-4 py-2 rounded-xl font-black uppercase tracking-widest shadow-xl rotate-12 text-xs">
                            Generated in 3s ⚡
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
