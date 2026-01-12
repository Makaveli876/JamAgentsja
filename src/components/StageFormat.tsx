import React from "react";
import { Smartphone, Instagram, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ModeType = 'status' | 'post' | 'flyer';

interface StageFormatProps {
    onSelect: (mode: ModeType) => void;
}

export function StageFormat({ onSelect }: StageFormatProps) {
    const formats = [
        {
            id: 'status',
            label: 'Status',
            sub: 'WhatsApp / TikTok',
            icon: Smartphone,
            ratio: '9:16',
            desc: 'Full screen vertical format. Perfect for daily updates and stories.'
        },
        {
            id: 'post',
            label: 'Post',
            sub: 'Instagram / FB',
            icon: Instagram,
            ratio: '1:1',
            desc: 'Classic square format. Best for timeline feeds and profile grids.'
        },
        {
            id: 'flyer',
            label: 'Flyer',
            sub: 'Print / PDF',
            icon: FileText,
            ratio: '4:5',
            desc: 'Tall portrait format. Ideal for digital distribution or printing.'
        }
    ] as const;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-deep text-white">
            <div className="w-full max-w-4xl space-y-12">

                <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-5 duration-500">
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                        What are you <span className="text-yard-cyan">creating?</span>
                    </h2>
                    <p className="text-zinc-400 font-medium">Choose the format that fits your goal.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {formats.map((f, i) => (
                        <button
                            key={f.id}
                            onClick={() => onSelect(f.id as ModeType)}
                            className="group relative flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:border-yard-cyan/50 transition-all duration-300 hover:-translate-y-2 text-center animate-in fade-in zoom-in"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-yard-cyan group-hover:text-black transition-colors duration-300">
                                <f.icon className="w-8 h-8" />
                            </div>

                            <h3 className="text-2xl font-black uppercase tracking-wide mb-1">{f.label}</h3>
                            <p className="text-xs font-bold text-yard-cyan uppercase tracking-widest mb-4">{f.sub}</p>

                            <div className="w-full h-px bg-white/10 my-4" />

                            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                                {f.desc}
                            </p>

                            <div className="mt-auto px-4 py-1.5 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-colors">
                                Select {f.ratio}
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}
