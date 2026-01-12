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
  Zap,
  Layout,
  Type,
  Maximize,
  Smartphone,
  Instagram,
  FileText,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { AssetPreview } from "@/components/AssetPreview";
import { StageLanding } from "@/components/StageLanding";
import { StageFormat } from "@/components/StageFormat";
import { StageSuccess } from "@/components/StageSuccess";

import { generateSalesHook } from "@/app/actions/generate-hook";
import { saveListing } from "@/app/actions/save-listing";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- TYPES ---
type StyleType = 'cyber' | 'luxury' | 'island';
type LayoutType = 'center' | 'bottom' | 'minimal';
type ModeType = 'status' | 'post' | 'flyer';
type StageType = 'landing' | 'format' | 'editor' | 'success';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Stages
  const [stage, setStage] = useState<StageType>('landing');
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState<string>("");

  // Editor State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isSharing, setIsSharing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<'details' | 'design'>('details');
  const [isFormOpen, setIsFormOpen] = useState(false); // Mobile Bottom Sheet

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "Yard Wire Premium",
    price: "7,500",
    location: "Kingston, JA",
    phone: "876-123-4567",
    style: "cyber" as StyleType,
    layout: "center" as LayoutType,
    mode: "status" as ModeType,
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
      setSelectedFile(file);
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

  // MASTER HANDLER: The Trap & Generate Logic
  const handleGenerate = async () => {
    if (!cardRef.current) return;
    if (!formData.title || !formData.price || !formData.phone) {
      alert("Please fill in Title, Price, and Phone!");
      return;
    }

    setIsSharing(true);
    setIsExporting(true);

    try {
      // Step 0: Upload Image
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
        }
      }

      // Step 1: Save Listing (The Trap)
      let slug = "unknown";
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
          console.log("🔒 Data Trap Captured. Slug:", slug);
          const { logEvent } = await import("@/app/actions/track-event");
          await logEvent('flyer_created', undefined, slug, { price: formData.price, style: formData.style, mode: formData.mode });
        }
      } catch (dbError) {
        console.error("Data Trap Warning (Continuing anyway):", dbError);
      }

      setGeneratedSlug(slug);

      // Step 2: QR Code
      try {
        const deepLink = `https://jamagents.com/item/${slug}`;
        const qrData = await QRCode.toDataURL(deepLink, { margin: 1, color: { dark: '#000000', light: '#FFFFFFFF' } });
        setQrCodeUrl(qrData);
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (qrError) {
        console.error("QR Generation failed:", qrError);
      }

      // Step 3: Generate Image at 4x
      const canvas = await html2canvas(cardRef.current, {
        scale: 4,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        allowTaint: true,
        width: 360,
        height: formData.mode === 'post' ? 360 : formData.mode === 'flyer' ? 450 : 640
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Image generation failed");

      setGeneratedBlob(blob);
      setStage('success');

    } catch (error) {
      console.error("Generation Failed:", error);
      alert("Something went wrong generating the flyer.");
    } finally {
      setIsExporting(false);
      setIsSharing(false);
    }
  };

  // --- SUB COMPONENTS FOR EDITOR ---

  const Header = () => (
    <div className="flex items-center gap-3 py-2 cursor-pointer" onClick={() => setStage('landing')}>
      <Zap className="text-yard-cyan w-6 h-6 md:w-8 md:h-8 animate-pulse shrink-0" />
      <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-gradient-yard italic uppercase">
        JAMAGENTS
      </h1>
    </div>
  );

  const ModeToggle = () => (
    <div className="flex gap-1 bg-black/60 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-2xl">
      {[
        { id: 'status', icon: Smartphone, label: 'Status' },
        { id: 'post', icon: Instagram, label: 'Post' },
        { id: 'flyer', icon: FileText, label: 'Flyer' },
      ].map((m) => (
        <button
          key={m.id}
          onClick={() => setFormData(prev => ({ ...prev, mode: m.id as ModeType }))}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all",
            formData.mode === m.id
              ? "bg-white text-black shadow-lg scale-105"
              : "text-zinc-400 hover:text-white"
          )}
        >
          <m.icon className="w-3 h-3" />
          {m.label}
        </button>
      ))}
    </div>
  );

  const CreateButton = ({ className, label }: { className?: string, label?: string }) => (
    <button
      onClick={handleGenerate}
      disabled={isSharing || (previewImage ? false : true)}
      className={cn(
        "w-full flex items-center justify-center gap-3 h-14 bg-gradient-to-r from-yard-green to-emerald-600 text-white rounded-xl transition-all shadow-lg font-black uppercase tracking-widest text-sm disabled:opacity-50 disabled:grayscale",
        !previewImage && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isSharing ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Send className="w-5 h-5" />
          {label || "Generate Flyer"}
        </>
      )}
    </button>
  );

  const UploadZone = ({ className }: { className?: string }) => (
    <div
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "upload-zone flex flex-col items-center justify-center cursor-pointer p-8 rounded-2xl gap-4 group",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-yard-cyan/20 group-hover:scale-110 transition-all duration-300">
        {previewImage ? (
          <ImagePlus className="w-8 h-8 text-yard-cyan" />
        ) : (
          <Camera className="w-8 h-8 text-zinc-500 group-hover:text-yard-cyan" />
        )}
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-white uppercase tracking-widest group-hover:text-yard-cyan transition-colors">
          {previewImage ? "Change Photo" : "Tap to Upload Photo"}
        </p>
        <p className="text-[10px] text-zinc-500 font-medium">Auto-enhancement enabled</p>
      </div>
    </div>
  );

  const FormFields = ({ isMobile = false }) => (
    <div className={cn("space-y-6", isMobile && "pb-32 px-1")}>

      {/* MOBILE INLINE PREVIEW (Cleaned) */}
      {isMobile && (
        <div className="mb-6 space-y-4">
          {previewImage && (
            <div className="flex flex-col items-center gap-2 bg-white/5 rounded-2xl border border-white/10 p-2 overflow-hidden shadow-2xl">
              {/* Removed 'Live Studio View' text as requested */}
              <div className="relative w-full flex justify-center scale-[0.65] origin-top h-[420px] -mb-[140px]">
                <AssetPreview
                  data={formData}
                  previewImage={previewImage}
                  zoom={zoom}
                  qrCodeUrl={qrCodeUrl}
                />
              </div>
            </div>
          )}

          {/* Mobile Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all active:scale-95",
                previewImage
                  ? "bg-white/5 border-white/10 hover:bg-white/10"
                  : "bg-yard-cyan/10 border-yard-cyan text-yard-cyan shadow-[0_0_15px_rgba(0,242,255,0.2)] animate-pulse"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                {previewImage ? <ImagePlus className="w-4 h-4 text-white" /> : <Camera className="w-4 h-4 text-yard-cyan" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                  {previewImage ? "Change" : "Upload"}
                </span>
              </div>
            </div>

            {/* Mobile Zoom Trigger (Visual only, maybe moves to Design tab? keeping here for quick access) */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-center gap-1">
              <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
                <span className="text-zinc-400">Scale</span>
                <span className="text-yard-cyan">{Math.round(zoom * 100)}%</span>
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
          </div>
        </div>
      )}

      {/* TABS (World Class Neat Controls) */}
      <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
        <button
          onClick={() => setEditorTab('details')}
          className={cn(
            "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
            editorTab === 'details' ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
          )}
        >
          Details
        </button>
        <button
          onClick={() => setEditorTab('design')}
          className={cn(
            "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
            editorTab === 'design' ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
          )}
        >
          Visuals
        </button>
      </div>

      {/* DETAILS TAB */}
      {editorTab === 'details' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <Type className="w-3 h-3" /> Item Title
              </span>
              <button
                onClick={handleAIOptimize}
                disabled={isOptimizing}
                className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-yard-cyan hover:text-yard-green transition-colors disabled:opacity-50 h-7 md:h-9"
              >
                {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI HOOK
              </button>
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-base font-medium text-white focus:outline-none focus:border-yard-gold focus:ring-1 focus:ring-yard-gold/50 transition-all placeholder:text-zinc-700"
              placeholder="What are you selling?"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Price (JMD)</span>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-base font-bold text-white focus:outline-none focus:border-yard-gold focus:ring-1 focus:ring-yard-gold/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <Phone className="w-3 h-3" /> WhatsApp
            </span>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-base font-bold text-white focus:outline-none focus:border-yard-gold focus:ring-1 focus:ring-yard-gold/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </span>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-base font-bold text-white focus:outline-none focus:border-yard-gold focus:ring-1 focus:ring-yard-gold/50 transition-all"
              placeholder="e.g. Montego Bay"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <Tag className="w-3 h-3" /> Promo Tag
              </span>
              <input
                type="text"
                value={formData.promoLabel}
                onChange={(e) => setFormData({ ...formData, promoLabel: e.target.value })}
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-base font-bold text-white focus:outline-none focus:border-yard-gold focus:ring-1 focus:ring-yard-gold/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Slogan</span>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-base font-medium text-white focus:outline-none focus:border-yard-gold focus:ring-1 focus:ring-yard-gold/50 transition-all placeholder:text-zinc-700"
                placeholder="Optional..."
              />
            </div>
          </div>
        </div>
      )}

      {/* DESIGN TAB */}
      {editorTab === 'design' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Visual Theme</span>
            <div className="grid grid-cols-3 gap-2">
              {(['cyber', 'luxury', 'island'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFormData({ ...formData, style: s })}
                  className={cn(
                    "style-pill h-10 md:h-12 text-[10px] font-black rounded-lg border uppercase tracking-widest transition-all",
                    formData.style === s
                      ? s === 'cyber' ? 'active bg-yard-cyan/20 border-yard-cyan text-yard-cyan shadow-[0_0_15px_rgba(0,242,255,0.3)]' :
                        s === 'luxury' ? 'active bg-yard-gold/20 border-yard-gold text-yard-gold shadow-[0_0_15px_rgba(255,215,0,0.3)]' :
                          'active bg-yard-green/20 border-yard-green text-yard-green shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                      : 'text-zinc-500 border-white/5 hover:border-white/20'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <Layout className="w-3 h-3" /> Layout
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['center', 'bottom', 'minimal'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setFormData({ ...formData, layout: l })}
                  className={cn(
                    "style-pill h-10 text-[10px] font-bold rounded-lg border uppercase tracking-widest transition-all",
                    formData.layout === l
                      ? "bg-white/10 border-white/30 text-white shadow-lg"
                      : "text-zinc-600 border-white/5 hover:bg-white/5"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Zoom (Mobile has it top) */}
          {!isMobile && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-zinc-400 flex items-center gap-1"><Maximize className="w-3 h-3" /> Zoom</span>
                <span className="text-yard-cyan">{Math.round(zoom * 100)}%</span>
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
          )}
        </div>
      )}

    </div>
  );

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-bg-deep text-text-primary overflow-x-hidden selection:bg-yard-gold/30 relative">
      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="image/*"
        onChange={handleImageUpload}
      />

      {/* --- STAGE 1: LANDING --- */}
      {stage === 'landing' && (
        <StageLanding onStart={() => setStage('format')} />
      )}

      {/* --- STAGE 2: FORMAT SELECTION --- */}
      {stage === 'format' && (
        <StageFormat onSelect={(m) => {
          setFormData(prev => ({ ...prev, mode: m }));
          setStage('editor');
        }} />
      )}

      {/* --- STAGE 3: EDITOR (EXISTING UI) --- */}
      {stage === 'editor' && (
        <>
          {/* MOBILE EDITOR */}
          <div className="md:hidden fixed inset-0 z-0 flex flex-col">
            {previewImage ? (
              <div className="absolute inset-0 z-0 bg-black">
                <img
                  src={previewImage}
                  alt="Back"
                  className="w-full h-full object-cover blur-[80px] opacity-40 scale-150"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
                <div className="absolute inset-0 flex items-center justify-center pt-20 pb-40 px-6 overflow-hidden pointer-events-none">
                  <div className={cn(
                    "shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 will-change-transform origin-center w-full max-w-[360px] pointer-events-auto shrink-0",
                    isFormOpen ? "opacity-0 scale-50 blur-xl translate-y-20" : "opacity-100 scale-[0.65] md:scale-100"
                  )}>
                    <AssetPreview
                      data={formData}
                      previewImage={previewImage}
                      zoom={zoom}
                      qrCodeUrl={qrCodeUrl}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-bg-deep to-[#0f172a]">
                <Header />
                <div className="flex-1 flex flex-col justify-center w-full max-w-sm">
                  <UploadZone className="h-[240px] shadow-2xl bg-white/5 border-white/10" />
                  <p className="text-center text-zinc-500 text-xs mt-6 px-8 leading-relaxed">
                    Upload a photo to enter the studio.
                  </p>
                </div>
              </div>
            )}

            {previewImage && (
              <div className="absolute top-0 inset-x-0 z-40 p-4 pt-safe-top flex flex-col items-center gap-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
                <div className="w-full flex justify-between items-center">
                  <Header />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/10 p-2 rounded-full backdrop-blur-md border border-white/5"
                  >
                    <ImagePlus className="w-5 h-5 text-white" />
                  </button>
                </div>
                <ModeToggle />
              </div>
            )}

            {previewImage && (
              <div className={cn(
                "absolute bottom-0 inset-x-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col",
                isFormOpen ? "h-[85vh] bg-[#020617]" : "h-auto bg-transparent pointer-events-none"
              )}>
                <div
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className={cn(
                    "w-full p-4 flex flex-col items-center justify-center gap-2 cursor-pointer pointer-events-auto",
                    isFormOpen ? "bg-[#020617] border-t border-white/5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" : "bg-transparent pb-8"
                  )}
                >
                  {!isFormOpen && (
                    <div className="flex gap-2 w-full max-w-xs pointer-events-auto">
                      <CreateButton
                        className="flex-1 h-16 text-lg shadow-[0_10px_40px_rgba(0,255,100,0.3)]"
                        label={formData.mode === 'status' ? "GENERATE" : undefined}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsFormOpen(true); }}
                        className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center text-white"
                      >
                        <ChevronUp className="w-6 h-6 animate-bounce text-yard-cyan" />
                      </button>
                    </div>
                  )}
                  {isFormOpen && <div className="w-12 h-1 bg-white/20 rounded-full mb-2" />}
                </div>

                {isFormOpen && (
                  <div className="flex-1 overflow-y-auto px-6 pb-24 animate-in fade-in slide-in-from-bottom-10 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Editor Studio</h2>
                      <button
                        onClick={() => setIsFormOpen(false)}
                        className="p-2 -mr-2 text-zinc-500 hover:text-white"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                    <FormFields />
                    <div className="h-8" />
                    <CreateButton className="mb-8" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DESKTOP EDITOR */}
          <div className="hidden md:block max-w-[1400px] mx-auto px-8 py-12 relative z-10">
            <div className="grid grid-cols-12 gap-12 items-start">
              <div className="col-span-5 flex flex-col gap-8">
                <Header />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8 border-gradient relative overflow-hidden"
                >
                  <div className="flex justify-center mb-8">
                    <ModeToggle />
                  </div>
                  <UploadZone className="mb-8" />
                  <FormFields />
                  <div className="mt-8">
                    <CreateButton className="h-16 text-lg" />
                  </div>
                </motion.div>
              </div>

              <div className="col-span-7 sticky top-8 flex flex-col items-center justify-center min-h-[80vh]">
                <div className="relative">
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-tr opacity-20 blur-[100px] rounded-full transition-colors duration-700",
                    formData.style === 'cyber' ? "from-cyan-500 via-blue-600 to-purple-600" :
                      formData.style === 'luxury' ? "from-yellow-500 via-orange-500 to-red-600" :
                        "from-green-500 via-emerald-600 to-teal-600"
                  )} />
                  <motion.div layout className="relative z-10">
                    <AssetPreview
                      data={formData}
                      previewImage={previewImage}
                      zoom={zoom}
                      qrCodeUrl={qrCodeUrl}
                    />
                    {!previewImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-[2.5rem] border border-white/10">
                        <div className="text-center space-y-2">
                          <Camera className="w-12 h-12 text-white/20 mx-auto" />
                          <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Preview Awaits Photo</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* STEALTH CAPTURE STAGE - ALWAYS RENDERED IN EDITOR */}
          <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden" style={{ transform: 'translateX(-9999px)' }}>
            <div
              style={{
                width: 360,
                height: formData.mode === 'post' ? 360 : formData.mode === 'flyer' ? 450 : 640
              }}
            >
              <AssetPreview
                ref={cardRef}
                data={formData}
                previewImage={previewImage}
                zoom={zoom}
                qrCodeUrl={qrCodeUrl}
              />
            </div>
          </div>
        </>
      )}

      {/* --- STAGE 4: SUCCESS --- */}
      {stage === 'success' && (
        <StageSuccess
          imageBlob={generatedBlob}
          slug={generatedSlug}
          onReset={() => {
            setGeneratedBlob(null);
            setGeneratedSlug("");
            setFormData(prev => ({ ...prev, title: "", price: "", phone: "" })); // Soft reset
            setStage('editor'); // Or landing? Editor is better for rapid creation
          }}
        />
      )}

    </main>
  );
}
