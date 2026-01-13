import React, { useEffect, useState } from "react";
import { Download, Share2, RefreshCw, CheckCircle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface StageSuccessProps {
    imageBlob: Blob | null;
    slug: string;
    onReset: () => void;
}

export function StageSuccess({ imageBlob, slug, onReset }: StageSuccessProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (imageBlob) {
            const url = URL.createObjectURL(imageBlob);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [imageBlob]);

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement("a");
        link.download = `yard-wire-${slug}.png`;
        link.href = imageUrl;
        link.click();
    };

    const handleShare = async () => {
        if (imageBlob && typeof navigator !== 'undefined' && (navigator as any).share) {
            try {
                const file = new File([imageBlob], `jamagents-${slug}.png`, { type: 'image/png' });
                await navigator.share({
                    files: [file],
                    title: 'Jam Agents Status',
                    text: `Check this out! View details here: jamagents.com/item/${slug}`
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            // Fallback to copy link
            handleCopyLink();
        }
    };

    const handleCopyLink = () => {
        const link = `https://jamagents.com/item/${slug}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!imageUrl) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-deep text-white">
            <div className="w-full max-w-md flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">

                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-black uppercase tracking-widest mb-4">
                        <CheckCircle className="w-4 h-4" /> Flyer Ready
                    </div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                        It's a <span className="text-yard-cyan">Banger!</span>
                    </h2>
                    <p className="text-zinc-400 text-sm">Your viral asset is ready to ship.</p>
                </div>

                {/* Preview Container */}
                <div className="relative p-2 bg-white/5 rounded-2xl border border-white/10 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-300">
                    <img src={imageUrl} alt="Generated Flyer" className="w-full h-auto max-h-[50vh] rounded-xl object-contain" />
                </div>

                {/* Actions */}
                <div className="w-full grid grid-cols-2 gap-3">
                    <button
                        onClick={handleDownload}
                        className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-colors gap-2 group"
                    >
                        <Download className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Download</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex flex-col items-center justify-center p-4 bg-yard-green hover:bg-yard-green/80 rounded-xl border border-white/10 transition-colors gap-2 shadow-lg shadow-yard-green/20 group"
                    >
                        <Share2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Share Now</span>
                    </button>
                </div>

                {/* Copy Link Fallback */}
                <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                >
                    {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Link Copied" : "Copy Link"}
                </button>

                <div className="w-full h-px bg-white/10" />

                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Create Another
                </button>

            </div>
        </div>
    );
}
