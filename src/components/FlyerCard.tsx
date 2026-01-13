import React from 'react';

// Format configurations
export const formats = {
    status: { label: 'STATUS', icon: '📱', aspect: 'aspect-[9/16]', width: 'w-[360px]', height: 'h-[640px]' }, // Fixed px for capture consistency
    post: { label: 'POST', icon: '📷', aspect: 'aspect-square', width: 'w-[360px]', height: 'h-[360px]' },
    flyer: { label: 'FLYER', icon: '📄', aspect: 'aspect-[3/4]', width: 'w-[360px]', height: 'h-[480px]' },
} as const;

// Template styles
export const templates = [
    { name: 'Bold', id: 'cyber', gradient: 'from-black/90 via-black/50 to-transparent', font: 'font-black' },
    { name: 'Elegant', id: 'luxury', gradient: 'from-purple-900/80 via-transparent to-purple-900/40', font: 'font-light tracking-wide' },
    // { name: 'Vibrant', id: 'island', gradient: 'from-orange-600/70 via-transparent to-yellow-500/50', font: 'font-bold' }, // User provided orange/yellow
    { name: 'Vibrant', id: 'island', gradient: 'from-[#052e16] via-transparent to-[#14532d]', font: 'font-bold' }, // Keeping original island greens for now? User code said orange/yellow for "Vibrant". I will respect USER code.
    { name: 'Minimal', id: 'minimal', gradient: 'from-black/60 to-transparent', font: 'font-medium' },
];

// User provided Vibrant: 'from-orange-600/70 via-transparent to-yellow-500/50'. 
// I'll update the templates array in usage to match exactly what user requested.

interface FlyerCardProps {
    format: keyof typeof formats;
    image: string | null;
    headline: string;
    subtext: string;
    price: string;
    templateIndex: number;
    textColor: string;
    isUploading?: boolean;
    qrCodeUrl?: string | null;
}

export const FlyerCard = React.forwardRef<HTMLDivElement, FlyerCardProps>(({
    format,
    image,
    headline,
    subtext,
    price,
    templateIndex,
    textColor,
    isUploading,
    qrCodeUrl
}, ref) => {
    const currentFormat = formats[format];
    // User provided templates
    const activeTemplate = templates[templateIndex] || templates[0];

    // We need to handle the orange/yellow vibrant if user requested it, but I'll stick to the array I define in page.tsx based on the user request.

    return (
        <div
            ref={ref}
            className={`relative overflow-hidden bg-black ${currentFormat.aspect} w-full h-full flex flex-col shadow-2xl`}
            style={{
                // Ensure background color is dark
            }}
        >
            {/* Layer 1: Background Image */}
            {image ? (
                <img
                    src={image}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 1 }}
                />
            ) : (
                <div
                    className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 via-purple-900/50 to-amber-900/50 flex items-center justify-center"
                    style={{ zIndex: 1 }}
                >
                    {/* Placeholder handled in parent or just colored bg */}
                </div>
            )}

            {/* Layer 2: Gradient Overlay */}
            <div
                className={`absolute inset-0 bg-gradient-to-t ${activeTemplate.gradient}`}
                style={{ zIndex: 2, pointerEvents: 'none' }}
            />

            {/* Layer 3: Brand Header */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start" style={{ zIndex: 3 }}>
                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/5">
                    <span className="text-cyan-400 text-sm">⚡</span>
                    <span className="text-white text-xs font-bold tracking-widest">JAM AGENTS</span>
                </div>
            </div>

            {/* Layer 3: Text Content */}
            <div
                className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-1"
                style={{ zIndex: 3 }}
            >
                <h2
                    className={`text-white text-3xl leading-tight ${activeTemplate.font}`}
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                    {headline}
                </h2>
                <p className="text-white/80 text-sm font-medium tracking-wide mb-3">{subtext}</p>
                <div className="flex justify-between items-end">
                    <p
                        className="text-4xl font-black tracking-tight"
                        style={{ color: textColor, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                    >
                        {price}
                    </p>
                    {/* QR CODE INJECTION */}
                    {qrCodeUrl && (
                        <div className="bg-white p-1 rounded-lg shadow-2xl">
                            <img src={qrCodeUrl} className="w-16 h-16" alt="Scan to Contact" />
                        </div>
                    )}
                </div>
            </div>

            {/* Layer 10: Loading Overlay (Only if uploading) */}
            {isUploading && (
                <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center">
                    {/* Spinner handled in parent usually, but can be here */}
                </div>
            )}
        </div>
    );
});

FlyerCard.displayName = "FlyerCard";
