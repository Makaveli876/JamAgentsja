"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  MapPin,
  Phone,
  Tag,
  Send,
  Sparkles,
  Loader2,
  ImagePlus,
  Share2,
  Zap,
} from "lucide-react";
import { AssetPreview } from "@/components/AssetPreview";
import { generateSalesHook } from "@/app/actions/generate-hook";
import { saveListing } from "@/app/actions/save-listing";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isSharing, setIsSharing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "Yard Wire Premium",
    price: "7,500",
    location: "Montego Bay, JA",
    phone: "876-123-4567",
    style: "cyber" as 'cyber' | 'luxury' | 'island',
    layout: "center" as 'center' | 'bottom' | 'minimal',
    slogan: "",
    promoLabel: "SPECIAL OFFER",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fix Hydration & Cleanup
  useEffect(() => {
    setMounted(true);
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Store file for upload
      if (previewImage) URL.revokeObjectURL(previewImage);
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleAIOptimize = async () => {
    if (!formData.title) {
      alert("Please enter an Item Title first!");
      return;
    }

    setIsOptimizing(true);
    try {
      const hook = await generateSalesHook(formData.title, formData.price, formData.location, formData.style);
      if (hook) {
        setFormData(prev => ({ ...prev, slogan: hook.trim() }));
      }
    } catch (error) {
      console.error("Hook generation failed", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // MASTER HANDLER: The Trap & Share Logic
  const handleShare = async () => {
    if (!cardRef.current) return;
    if (!formData.title || !formData.price || !formData.phone) {
      alert("Please fill in Title, Price, and Phone to share!");
      return;
    }

    setIsSharing(true);
    setIsExporting(true); // Hide buttons for screenshot capture

    try {
      // Step 0: Upload Image to Supabase (if exists)
      let photoUrl = null;
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await (await import('@/lib/supabase')).supabase.storage
            .from('flyer-images')
            .upload(fileName, selectedFile);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = (await import('@/lib/supabase')).supabase.storage
            .from('flyer-images')
            .getPublicUrl(fileName);

          photoUrl = publicUrl;
        } catch (uploadErr) {
          console.error("Image Upload Failed:", uploadErr);
          // Fail open: continue without image if upload fails
        }
      }

      // Step 1 (The Trap): Save to Supabase
      // Fail open policy: If save fails, we log it but still let the user share/download
      let slug = "unknown";
      let listingId = undefined;

      try {
        const result = await saveListing({
          title: formData.title,
          price: formData.price,
          phone: formData.phone,
          location: formData.location,
          style: formData.style,
          photo_url: photoUrl || undefined
        });

        if (result?.success && result.slug) {
          slug = result.slug;
          // @ts-ignore - Assuming saveListing returns id if we modified it, checking definition...
          // If saveListing doesn't return ID, we can't link it perfectly, but we have slug.
          // Let's assume result might need update if we want ID tracking.
          console.log("🔒 Data Trap Captured. Slug:", slug);

          // EVENT: Flyer Created
          const { logEvent } = await import("@/app/actions/track-event");
          await logEvent('flyer_created', undefined, slug, { price: formData.price, style: formData.style });
        }
      } catch (dbError) {
        console.error("Data Trap Warning (Continuing anyway):", dbError);
      }

      // EVENT: Share Attempt
      const { logEvent } = await import("@/app/actions/track-event");
      await logEvent('share_attempt', undefined, slug, { platform: navigator.share ? 'mobile' : 'desktop' });

      // Step 2 (QR Generation): Generate QR code for the deep link
      try {
        // Use the REAL slug to burn the REAL trap
        const deepLink = `https://jamagents.com/item/${slug}`;
        // Note: In local dev, this points to prod. For testing scan locally, user might want localhost.
        // But requested "production grade", so using the real domain is correct.

        const qrData = await QRCode.toDataURL(deepLink, { margin: 1, color: { dark: '#000000', light: '#FFFFFFFF' } });
        setQrCodeUrl(qrData);
        // Wait for React to render the QR code on the canvas
        await new Promise(resolve => setTimeout(resolve, 300)); // Bumble wait time slightly for safety
      } catch (qrError) {
        console.error("QR Generation failed:", qrError);
      }

      // Step 3 (The Canvas): Generate Image
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High resolution
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      // Convert canvas to blob for sharing
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Image generation failed");

      const file = new File([blob], `jamagents-${slug}.png`, { type: 'image/png' });

      // Step 4 (The Fork): Mobile vs Desktop
      // Check if Web Share API is available and can share files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // Mobile Path
        await navigator.share({
          files: [file],
          title: 'Yard Wire Status',
          text: `Check this out! View details here: jamagents.com/item/${slug}`
        });
      } else {
        // Desktop Path
        const link = document.createElement("a");
        link.download = `yard-wire-${formData.title.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();

        alert(`Listing Saved & Image Downloaded!\nLink: jamagents.com/item/${slug}`);
      }

    } catch (error) {
      console.error("Share Logic Failed:", error);
      alert("Something went wrong generating the share image.");
    } finally {
      setIsExporting(false);
      setIsSharing(false);
      // Optional: Clear QR after a delay if you only want it for the screenshot
      // setQrCodeUrl(null); 
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-4 md:p-8 flex items-center justify-center relative">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-start relative z-10">

        {/* Left Side: The Control Deck (order-2 on mobile) */}
        <section className="flex flex-col gap-8 order-2 md:order-1">
          <div className="flex items-center gap-3">
            <Zap className="text-yard-cyan w-8 h-8 animate-pulse" />
            <h1 className="text-4xl font-black tracking-tighter text-gradient-yard italic uppercase">
              YARD WIRE STUDIO
            </h1>
          </div>

          <div className="glass-card p-6 md:p-8 flex flex-col gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Item Title</span>
                  <button
                    onClick={handleAIOptimize}
                    disabled={isOptimizing}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-yard-cyan hover:text-yard-green transition-colors disabled:opacity-50"
                  >
                    {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    AI OPTIMIZE
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-yard-cyan/50 focus:ring-1 focus:ring-yard-cyan/50 transition-all text-sm font-medium"
                  placeholder="What are you selling?"
                />
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Slogan / Subtitle (Optional)</span>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-yard-cyan/50 focus:ring-1 focus:ring-yard-cyan/50 transition-all text-sm font-medium"
                  placeholder="e.g., BUILD YOUR DREAM HOME TODAY"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Promo Tag</span>
                  <input
                    type="text"
                    value={formData.promoLabel}
                    onChange={(e) => setFormData({ ...formData, promoLabel: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-yard-cyan/50 focus:ring-1 focus:ring-yard-cyan/50 transition-all text-sm font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Price (JMD)</span>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-yard-cyan/50 focus:ring-1 focus:ring-yard-cyan/50 transition-all text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Location</span>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-yard-cyan/50 focus:ring-1 focus:ring-yard-cyan/50 transition-all text-sm font-bold"
                    placeholder="e.g. Montego Bay, JA"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">WhatsApp Number</span>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-yard-cyan/50 focus:ring-1 focus:ring-yard-cyan/50 transition-all text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Visual Style</span>
              <div className="grid grid-cols-3 gap-3">
                {(['cyber', 'luxury', 'island'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFormData({ ...formData, style: s })}
                    className={`p-3 text-[10px] font-bold rounded-lg border transition-all uppercase tracking-widest ${formData.style === s
                      ? s === 'cyber' ? 'bg-yard-cyan/20 border-yard-cyan text-yard-cyan shadow-[0_0_10px_rgba(0,242,255,0.2)]' :
                        s === 'luxury' ? 'bg-yard-gold/20 border-yard-gold text-yard-gold shadow-[0_0_10px_rgba(255,215,0,0.2)]' :
                          'bg-yard-green/20 border-yard-green text-yard-green shadow-[0_0_10px_rgba(0,255,65,0.2)]'
                      : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Text Position</span>
              <div className="grid grid-cols-3 gap-3">
                {(['center', 'bottom', 'minimal'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setFormData({ ...formData, layout: l })}
                    className={`p-3 text-[10px] font-bold rounded-lg border transition-all uppercase tracking-widest ${formData.layout === l
                      ? 'bg-white/10 border-white/30 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                      }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all group"
              >
                {previewImage ? (
                  <ImagePlus className="w-5 h-5 text-yard-green group-hover:scale-110 transition-transform" />
                ) : (
                  <Camera className="w-5 h-5 text-yard-purple group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs font-bold uppercase tracking-widest">
                  {previewImage ? "Change Photo" : "Upload Product Photo"}
                </span>
              </button>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Zoom / Fit</span>
                  <span className="text-[10px] font-bold text-yard-cyan">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yard-cyan"
                />
              </div>

              {/* MASTER SHARE BUTTON */}
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-3 p-4 bg-yard-green/20 border border-yard-green text-yard-green rounded-xl hover:bg-yard-green/30 transition-all shadow-[0_0_20px_rgba(0,255,65,0.2)] font-black uppercase tracking-widest text-sm"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    SEND TO WHATSAPP
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: The Preview Deck (order-1 on mobile) */}
        <section className="flex flex-col gap-6 order-1 md:order-2 sticky top-4 md:top-8 items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Live Preview</label>

          <AssetPreview
            ref={cardRef}
            data={formData}
            previewImage={previewImage}
            zoom={zoom}
            qrCodeUrl={qrCodeUrl}
          />
        </section>

      </div>
    </main>
  );
}
