import React, { forwardRef, useState, useRef, MouseEvent } from "react";
import { MapPin, Phone, Tag } from "lucide-react";

type AssetPreviewProps = {
    data: {
        title: string;
        price: string;
        location: string;
        phone: string;
        style: 'cyber' | 'luxury' | 'island';
        layout: 'center' | 'bottom' | 'minimal';
        slogan?: string;
        promoLabel?: string;
    };
    previewImage: string | null;
    zoom?: number;
    qrCodeUrl?: string | null; // Added QR Code Prop
};

export const AssetPreview = forwardRef<HTMLDivElement, AssetPreviewProps>(({ data, previewImage, zoom = 1, qrCodeUrl }, ref) => {
    const { layout, title, price, location, phone, style, slogan, promoLabel } = data;

    // -- PAN & SCAN LOGIC --
    const [imagePos, setImagePos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: MouseEvent) => {
        if (!previewImage) return;
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX - imagePos.x,
            y: e.clientY - imagePos.y
        };
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        setImagePos({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Global Theme Mapping
    // FIX: Using Standard HEX codes for html2canvas compatibility
    // Especially for the 'luxury' theme which was causing crashes with modern CSS vars
    const themeClasses = {
        cyber: {
            border: 'border-cyan-400',
            shadow: 'shadow-cyan-500/50',
            text: 'text-cyan-400',
            tagline: 'text-cyan-400',
            icon: 'text-violet-500',
            phone: 'text-green-400',
            phoneRing: 'border-green-400/30 bg-green-400/10',
            promo: 'text-cyan-400'
        },
        luxury: {
            // Replaced 'amber-400' with hardcoded hex valid for html2canvas
            border: 'border-[#fbbf24]', // amber-400 equivalent
            shadow: 'shadow-[#f59e0b]', // amber-500 equivalent
            text: 'text-[#fbbf24]',
            tagline: 'text-[#fbbf24]',
            icon: 'text-[#fbbf24]',
            phone: 'text-[#fbbf24]',
            phoneRing: 'border-[#fbbf24]/30 bg-[#fbbf24]/10',
            promo: 'text-[#fbbf24]'
        },
        island: {
            border: 'border-green-400',
            shadow: 'shadow-green-500/50',
            text: 'text-yellow-400',
            tagline: 'text-green-400',
            icon: 'text-green-400',
            phone: 'text-green-400',
            phoneRing: 'border-green-400/30 bg-green-400/10',
            promo: 'text-yellow-400'
        }
    };

    const theme = themeClasses[style] || themeClasses.cyber;
    const activePromo = promoLabel || "SPECIAL OFFER";

    return (
        <div
            ref={ref}
            className={`relative h-[640px] w-full max-w-[360px] overflow-hidden rounded-[2.5rem] border ${theme.border} shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] ${theme.shadow} flex flex-col group bg-black transition-all duration-500 cursor-move select-none`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* === LAYER 1: BACKGROUND (Image + Drag) (Z-0 to Z-10) === */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {previewImage ? (
                    <>
                        {/* Ambient Layer (Background Glow) - Z-0 */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <img
                                src={previewImage}
                                className="w-full h-full object-cover blur-3xl opacity-60 scale-125 saturate-150"
                                alt="Ambient Background"
                                draggable={false}
                            />
                        </div>

                        {/* Focus Layer (Interactive Image) - Z-10 */}
                        {/* Note: This layer captures mouse events for dragging via the parent container's handlers */}
                        <div className="absolute inset-0 z-10">
                            <img
                                src={previewImage}
                                className="h-full w-full object-contain transition-transform duration-100 ease-out will-change-transform"
                                style={{
                                    transform: `translate(${imagePos.x}px, ${imagePos.y}px) scale(${zoom})`,
                                    cursor: isDragging ? 'grabbing' : 'grab'
                                }}
                                alt="Product Preview"
                                draggable={false}
                            />
                        </div>
                    </>
                ) : (
                    <div className="h-full w-full bg-zinc-900 flex items-center justify-center relative z-10">
                        <Tag className="w-24 h-24 text-white/5 rotate-12" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-yard-cyan/10 via-transparent to-yard-purple/10" />
                    </div>
                )}
                {/* Standard Global Overlay - Z-20 */}
                <div className="absolute inset-0 z-20 bg-black/20 pointer-events-none" />

                {/* Floor Gradient (Conditional) - Z-30 */}
                {(layout === 'bottom' || layout === 'minimal' || layout === 'center') && (
                    <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-black via-black/80 to-transparent z-30 pointer-events-none" />
                )}
            </div>

            {/* === LAYER 2: DYNAMIC CONTENT (Title, Price, Tag) (Z-40) === */}
            <div className="absolute inset-0 z-40 pointer-events-none p-6">

                {/* CENTER MODE */}
                {layout === 'center' && (
                    <div className="h-full flex flex-col items-center justify-center pb-24">
                        {/* Glass Box with mb-24 to clear footer */}
                        <div className="bg-black/60 backdrop-blur-sm p-8 rounded-xl border border-white/10 flex flex-col items-center text-center max-w-full">
                            <div className="flex mb-4">
                                <span
                                    className="px-3 py-1 text-black text-[10px] font-black rounded uppercase tracking-widest italic"
                                    style={{ backgroundColor: style === 'luxury' ? '#fbbf24' : 'var(--yard-gold)' }}
                                >
                                    {activePromo}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-white leading-[0.9] tracking-tighter italic uppercase drop-shadow-2xl mb-2">
                                {title}
                            </h2>
                            {slogan && (
                                <span className={`text-[10px] font-black tracking-[0.3em] uppercase italic drop-shadow-md transition-colors duration-500 mb-6 ${theme.tagline}`}>
                                    {slogan}
                                </span>
                            )}
                            <div className="flex flex-col items-center">
                                <span className="text-zinc-400 text-[10px] font-bold tracking-[0.5em] uppercase mb-1">ASKING PRICE</span>
                                <div className="flex items-start">
                                    <span className={`text-2xl font-black mt-1 mr-1 drop-shadow-lg ${theme.text}`}>$</span>
                                    <span className="text-5xl font-black text-white leading-none tracking-tighter drop-shadow-2xl">{price}</span>
                                </div>
                                <span className={`text-xs font-black tracking-widest mt-1 ${theme.text}`}>JMD</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOTTOM MODE */}
                {layout === 'bottom' && (
                    <div className="flex flex-col justify-between h-full pb-20">
                        <div className="mt-4">
                            <div className="flex mb-2">
                                <span
                                    className="px-3 py-1 text-black text-[10px] font-black rounded uppercase tracking-widest italic"
                                    style={{ backgroundColor: style === 'luxury' ? '#fbbf24' : 'var(--yard-gold)' }}
                                >
                                    OFFICIAL LISTING
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-white leading-[0.9] tracking-tighter italic uppercase drop-shadow-2xl line-clamp-2 overflow-hidden">
                                {title}
                            </h2>
                            {slogan && (
                                <span className={`text-[10px] font-black tracking-[0.3em] uppercase italic drop-shadow-md transition-colors duration-500 ${theme.tagline}`}>
                                    {slogan}
                                </span>
                            )}
                        </div>

                        <div className="mb-4">
                            <span className={`block text-sm font-bold tracking-widest uppercase mb-1 drop-shadow-md ${theme.promo}`}>
                                {activePromo}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-5xl font-black italic tracking-tighter drop-shadow-2xl ${theme.text}`}>${price}</span>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">JMD</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* MINIMAL MODE */}
                {layout === 'minimal' && (
                    <>
                        <div className="absolute top-8 right-6">
                            <div className="glass-card px-4 py-2 border-white/20 flex flex-col items-center">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.promo}`}>
                                    {activePromo}
                                </span>
                                <span className={`text-xl font-black italic ${theme.text}`}>${price}</span>
                            </div>
                        </div>
                        <div className="absolute bottom-32 left-6 max-w-[80%]">
                            <h2 className="text-3xl font-black text-white leading-tight uppercase italic tracking-tighter">
                                {title}
                            </h2>
                            {slogan && (
                                <span className={`block mt-2 text-[10px] font-black tracking-[0.3em] uppercase italic drop-shadow-md transition-colors duration-500 ${theme.tagline}`}>
                                    {slogan}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Light Sweep Animation (Z-45) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer z-45" />

            {/* === LAYER 3: THE UNBREAKABLE FRAME (Footer) (Z-50) === */}
            <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-end p-6">
                {/* Footer Content - Visible in ALL modes */}
                <div className="flex items-end justify-between gap-2 overflow-hidden">
                    <div className="flex flex-col gap-3 shrink-0">
                        {/* Location */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <MapPin className={`w-4 h-4 transition-colors duration-500 ${theme.icon}`} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">Location</span>
                                <span className="text-[11px] font-bold text-white uppercase tracking-tight truncate max-w-[100px]">{location}</span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 shrink-0 ${theme.phoneRing}`}>
                                <Phone className={`w-4 h-4 transition-colors duration-500 ${theme.phone}`} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">WhatsApp</span>
                                <span className="text-sm font-black text-white italic tracking-tighter whitespace-nowrap">{phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Container (Always Visible if URL exists) */}
                    {qrCodeUrl && (
                        <div className="bg-white p-1 rounded-lg shadow-lg animate-in fade-in zoom-in duration-300">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qrCodeUrl} alt="Scan to Chat" className="w-16 h-16" />
                            <div className="text-[8px] font-bold text-center text-black tracking-widest uppercase mt-0.5">SCAN ME</div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-4 opacity-30 text-[8px] font-black text-white tracking-[0.6em] uppercase">
                    JAMAGENTS.COM
                </div>
            </div>
        </div>
    );
});

AssetPreview.displayName = "AssetPreview";
