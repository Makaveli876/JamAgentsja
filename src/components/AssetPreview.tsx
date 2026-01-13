import React, { forwardRef, useState, useRef, MouseEvent, useMemo } from "react";
import { MapPin, Phone, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

type AssetPreviewProps = {
    data: {
        title: string;
        price: string;
        location: string;
        phone: string;
        style: 'cyber' | 'luxury' | 'island';
        layout: 'center' | 'bottom' | 'minimal';
        mode: 'status' | 'post' | 'flyer'; // NEW: Architecture Mode
        slogan?: string;
        promoLabel?: string;
    };
    previewImage: string | null;
    zoom?: number;
    qrCodeUrl?: string | null;
};

export const AssetPreview = forwardRef<HTMLDivElement, AssetPreviewProps>(({ data, previewImage, zoom = 1, qrCodeUrl }, ref) => {
    const { layout, title, price, location, phone, style, mode, slogan, promoLabel } = data;

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

    // -- LAYOUT ENGINE --
    const layoutConfig = useMemo(() => {
        switch (mode) {
            case 'post': // 1:1 Square (360x360)
                return {
                    height: 'h-[360px]',
                    titleSize: 'text-2xl',
                    priceSize: 'text-3xl',
                    padding: 'p-4',
                    footerGap: 'gap-1',
                    hideSlogan: true, // Too cramped for slogan
                    qrSize: 'w-12 h-12'
                };
            case 'flyer': // 4:5 Portrait (360x450)
                return {
                    height: 'h-[450px]',
                    titleSize: 'text-3xl',
                    priceSize: 'text-4xl',
                    padding: 'p-5',
                    footerGap: 'gap-2',
                    hideSlogan: false,
                    qrSize: 'w-14 h-14'
                };
            case 'status': // 9:16 Vertical (360x640) - DEFAULT
            default:
                return {
                    height: 'h-[640px]',
                    titleSize: 'text-4xl',
                    priceSize: 'text-5xl',
                    padding: 'p-6',
                    footerGap: 'gap-3',
                    hideSlogan: false,
                    qrSize: 'w-16 h-16'
                };
        }
    }, [mode]);

    // Global Theme Mapping
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
            border: 'border-[#fbbf24]',
            shadow: 'shadow-[#f59e0b]',
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
            // Dynamic Height from layoutConfig
            className={cn(
                "relative w-full max-w-[360px] overflow-hidden rounded-[2rem] border flex flex-col group bg-black transition-all duration-500 cursor-move select-none",
                theme.border,
                theme.shadow,
                "shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]",
                layoutConfig.height
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* === LAYER 1: BACKGROUND (Image + Drag) (Z-0 to Z-10) === */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {previewImage ? (
                    <>
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <img
                                src={previewImage}
                                className="w-full h-full object-cover blur-2xl opacity-50 scale-125 saturate-150"
                                alt="Ambient"
                                draggable={false}
                            />
                        </div>
                        <div className="absolute inset-0 z-10">
                            <img
                                src={previewImage}
                                className="h-full w-full object-contain relative z-10 opacity-100 mix-blend-normal transition-transform duration-100 ease-out will-change-transform"
                                style={{
                                    transform: `translate(${imagePos.x}px, ${imagePos.y}px) scale(${zoom})`,
                                    cursor: isDragging ? 'grabbing' : 'grab'
                                }}
                                alt="Preview"
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
                {/* REMOVED: bg-black/20 overlay that was darkening the image */}
                {(layout === 'bottom' || layout === 'minimal' || layout === 'center') && (
                    <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-black/90 to-transparent z-30 pointer-events-none" />
                )}
            </div>

            {/* === LAYER 2: DYNAMIC CONTENT (Title, Price, Tag) (Z-40) === */}
            <div className={cn("absolute inset-0 z-40 pointer-events-none", layoutConfig.padding)}>

                {/* CENTER MODE */}
                {layout === 'center' && (
                    <div className={cn("h-full flex flex-col items-center justify-center", mode !== 'post' && "pb-24")}>
                        <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-white/10 flex flex-col items-center text-center max-w-full">
                            <div className="flex mb-2">
                                <span
                                    className="px-3 py-1 text-black text-[10px] font-black rounded uppercase tracking-widest italic"
                                    style={{ backgroundColor: style === 'luxury' ? '#fbbf24' : 'var(--yard-gold)' }}
                                >
                                    {activePromo}
                                </span>
                            </div>
                            <h2 className={cn("font-black text-white leading-[0.9] tracking-tighter italic uppercase drop-shadow-2xl mb-1", layoutConfig.titleSize)}>
                                {title}
                            </h2>
                            {slogan && !layoutConfig.hideSlogan && (
                                <span className={`text-[10px] font-black tracking-[0.3em] uppercase italic drop-shadow-md transition-colors duration-500 mb-4 ${theme.tagline}`}>
                                    {slogan}
                                </span>
                            )}
                            <div className="flex flex-col items-center mt-2">
                                <span className="text-zinc-400 text-[9px] font-bold tracking-[0.5em] uppercase mb-0.5">ASKING PRICE</span>
                                <div className="flex items-start">
                                    <span className={`text-xl font-black mt-1 mr-1 drop-shadow-lg ${theme.text}`}>$</span>
                                    <span className={cn("font-black text-white leading-none tracking-tighter drop-shadow-2xl", layoutConfig.priceSize)}>{price}</span>
                                </div>
                                <span className={`text-[10px] font-black tracking-widest mt-0.5 ${theme.text}`}>JMD</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOTTOM MODE */}
                {layout === 'bottom' && (
                    <div className={cn("flex flex-col justify-between h-full", mode === 'post' ? "pb-16" : "pb-20")}>
                        <div className="mt-4">
                            <div className="flex mb-2">
                                <span
                                    className="px-3 py-1 text-black text-[10px] font-black rounded uppercase tracking-widest italic"
                                    style={{ backgroundColor: style === 'luxury' ? '#fbbf24' : 'var(--yard-gold)' }}
                                >
                                    OFFICIAL LISTING
                                </span>
                            </div>
                            <h2 className={cn("font-black text-white leading-[0.9] tracking-tighter italic uppercase drop-shadow-2xl line-clamp-2 overflow-hidden", layoutConfig.titleSize)}>
                                {title}
                            </h2>
                            {slogan && !layoutConfig.hideSlogan && (
                                <span className={`text-[10px] font-black tracking-[0.3em] uppercase italic drop-shadow-md transition-colors duration-500 ${theme.tagline}`}>
                                    {slogan}
                                </span>
                            )}
                        </div>

                        <div className="mb-2">
                            <span className={`block text-xs font-bold tracking-widest uppercase mb-0.5 drop-shadow-md ${theme.promo}`}>
                                {activePromo}
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className={cn("font-black italic tracking-tighter drop-shadow-2xl", layoutConfig.priceSize, theme.text)}>${price}</span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">JMD</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* MINIMAL MODE */}
                {layout === 'minimal' && (
                    <>
                        <div className="absolute top-6 right-6">
                            <div className="glass-card px-3 py-1.5 border-white/20 flex flex-col items-center">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${theme.promo}`}>
                                    {activePromo}
                                </span>
                                <span className={cn("font-black italic leading-none", theme.text, mode === 'post' ? "text-lg" : "text-xl")}>${price}</span>
                            </div>
                        </div>
                        <div className={cn("absolute left-6 max-w-[85%]", mode === 'post' ? "bottom-24" : "bottom-32")}>
                            <h2 className={cn("font-black text-white leading-tight uppercase italic tracking-tighter", layoutConfig.titleSize)}>
                                {title}
                            </h2>
                            {slogan && !layoutConfig.hideSlogan && (
                                <span className={`block mt-1 text-[10px] font-black tracking-[0.3em] uppercase italic drop-shadow-md transition-colors duration-500 ${theme.tagline}`}>
                                    {slogan}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Light Sweep Animation (Z-45) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer z-45" />

            {/* === LAYER 3: UNBREAKABLE FOOTER (Z-50) === */}
            <div className={cn("absolute inset-0 z-50 pointer-events-none flex flex-col justify-end", layoutConfig.padding)}>
                <div className="flex items-end justify-between gap-1 overflow-hidden">
                    <div className={cn("flex flex-col shrink-0", layoutConfig.footerGap)}>
                        {/* Location */}
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <MapPin className={`w-3.5 h-3.5 transition-colors duration-500 ${theme.icon}`} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">Location</span>
                                <span className="text-[10px] font-bold text-white uppercase tracking-tight truncate max-w-[90px]">{location}</span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 shrink-0 ${theme.phoneRing}`}>
                                <Phone className={`w-3.5 h-3.5 transition-colors duration-500 ${theme.phone}`} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">WhatsApp</span>
                                <span className="text-xs font-black text-white italic tracking-tighter whitespace-nowrap">{phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    {qrCodeUrl && (
                        <div className="bg-white p-1 rounded-md shadow-lg animate-in fade-in zoom-in duration-300">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={qrCodeUrl} alt="Scan" className={cn("object-contain", layoutConfig.qrSize)} />
                            <div className="text-[7px] font-bold text-center text-black tracking-widest uppercase mt-0.5">SCAN ME</div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-3 opacity-30 text-[7px] font-black text-white tracking-[0.6em] uppercase">
                    JAMAGENTS.COM
                </div>
            </div>
        </div>
    );
});

AssetPreview.displayName = "AssetPreview";
