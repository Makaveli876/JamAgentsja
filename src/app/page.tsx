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
    phone: "876-555-0199",
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
    // No cleanup needed for FileReader result as it's a string base64
  }, []);

  // FIXED: Robust Image Upload using FileReader (from verified working code)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      console.error('❌ No file selected');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB');
      return;
    }

    setSelectedFile(file); // Keep for upload to Supabase if needed later

    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target?.result;
        if (result && typeof result === 'string') {
          setPreviewImage(result);
        }
      };

      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
        alert('Failed to read image');
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('❌ Upload error:', error);
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
      // Step 1: Save Listing (The Trap)
      // We generate slug first to get QR code, then save? Or save then get slug?
      // Logic requires saving to get the unique ID/Slug usually, but we can optimistically generate one if our backend allows, 
      // or just do the save call.

      let slug = "demo-" + Date.now(); // Fallback
      let finalPhotoUrl = null;

      // Upload if we have a file and want to persist it (Optional for now to speed up)
      /* 
      if (selectedFile) {
        ... upload logic ...
      }
      */

      // Save to DB
      try {
        const result = await saveListing({
          title: formData.title,
          price: formData.price,
          phone: formData.phone,
          location: formData.location,
          style: formData.style,
          photo_url: finalPhotoUrl || undefined
        });

        if (result?.success && result.slug) {
          slug = result.slug;
          // Log analytics
          const { logEvent } = await import("@/app/actions/track-event");
          await logEvent('flyer_created', undefined, slug, { price: formData.price, style: formData.style, mode: formData.mode });
        }
      } catch (dbError) {
        console.error("Data Trap Warning (Continuing anyway):", dbError);
      }

      setGeneratedSlug(slug);

      // Step 2: Generate QR Code
      try {
        const QRCode = (await import("qrcode")).default;
        const deepLink = `https://jamagents.com/item/${slug}`;
        const qrData = await QRCode.toDataURL(deepLink, { margin: 1, color: { dark: '#000000', light: '#FFFFFFFF' } });
        setQrCodeUrl(qrData);
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (qrError) {
        console.error("QR Generation failed:", qrError);
      }

      // Step 3: Generate Image at 4x
      const html2canvas = (await import("html2canvas")).default;

      // Ensure fonts loaded
      await document.fonts.ready;

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
        "w-full flex items-center justify-center gap-3 h-14 bg-gradient-to-r from-yard-green to-emerald-600 text-white rounded-xl transition-all shadow-lg font-black uppercase tracking-widest text-sm disabled:opacity-50 disabled:grayscale hover:shadow-green-500/20 active:scale-[0.98]",
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
        "upload-zone flex flex-col items-center justify-center cursor-pointer p-8 rounded-2xl gap-4 group hover:border-yard-cyan/50 active:scale-[0.98]",
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

  const FormInput = ({ label, value, onChange, placeholder, icon, action }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
          {icon} {label}
        </span>
        {action}
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-yard-gold focus:ring-1 focus:ring-yard-gold/50 transition-all placeholder:text-zinc-700"
        placeholder={placeholder}
      />
    </div>
  );

  const FormFields = ({ isMobile = false }) => (
    <div className={cn("space-y-6", isMobile && "pb-32 px-1")}>

      {/* MOBILE CONTROLS (Zoom + Upload) - No Inline Preview */}
      {isMobile && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98]",
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

          {/* Mobile Zoom Trigger */}
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
          <FormInput
            label="Title"
            value={formData.title}
            onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What are you selling?"
            icon={<Type className="w-3 h-3" />}
            action={
              <button onClick={handleAIOptimize} disabled={isOptimizing} className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-yard-cyan hover:text-yard-green transition-colors disabled:opacity-50 h-7 md:h-9 bg-white/5 px-2 rounded-lg border border-white/10 hover:bg-white/10">
                {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI HOOK
              </button>
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Price (JMD)"
              value={formData.price}
              onChange={(e: any) => setFormData({ ...formData, price: e.target.value })}
              icon={<Tag className="w-3 h-3" />}
            />
            <FormInput
              label="WhatsApp"
              value={formData.phone}
              onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
              icon={<Phone className="w-3 h-3" />}
            />
          </div>

          <FormInput
            label="Location"
            value={formData.location}
            onChange={(e: any) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Montego Bay"
            icon={<MapPin className="w-3 h-3" />}
          />


          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Promo Tag"
              value={formData.promoLabel}
              onChange={(e: any) => setFormData({ ...formData, promoLabel: e.target.value })}
              icon={<Tag className="w-3 h-3" />}
            />
            <FormInput
              label="Slogan"
              value={formData.slogan}
              onChange={(e: any) => setFormData({ ...formData, slogan: e.target.value })}
              placeholder="Optional..."
            />
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
          {/* MOBILE EDITOR - IMMERSIVE SCROLL (Safe Stack) */}
          <div className="md:hidden flex flex-col min-h-[100dvh] bg-[#0d0d0d] relative font-sans pb-40">

            {/* TOP HEADER (Fixed) */}
            <div className="sticky top-0 left-0 right-0 z-50 bg-[#0d0d0d]/80 backdrop-blur-md p-4 pt-safe-top border-b border-white/5 flex justify-between items-center">
              <Header />
              <div className="flex gap-2">
                {/* Mode Toggle Mini */}
                <div className="flex bg-black/50 rounded-full border border-white/10 p-1 mr-2">
                  {(['status', 'post', 'flyer'] as const).map((m) => (
                    <button key={m} onClick={() => setFormData(prev => ({ ...prev, mode: m as ModeType }))}
                      className={cn("px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                        formData.mode === m ? "bg-white text-black" : "text-zinc-500"
                      )}>
                      {m === 'status' ? 'S' : m === 'post' ? 'P' : 'F'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#222] border-2 border-[#333] w-9 h-9 flex items-center justify-center rounded-lg active:scale-[0.98] transition-all"
                >
                  <ImagePlus className="w-4 h-4 text-yard-cyan" />
                </button>
              </div>
            </div>

            {/* MAIN SCROLLABLE CONTENT */}
            <div className="flex-1 flex flex-col p-4 gap-6">

              {/* 1. MURAL (Preview) - Full Visibility */}
              <div className="w-full relative flex justify-center z-0">
                {/* Glow Underlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-yard-cyan/10 blur-[50px] rounded-full pointer-events-none" />

                {previewImage ? (
                  <div className="relative z-10 scale-[0.9] origin-top transform-gpu transition-all duration-300">
                    <AssetPreview
                      data={formData}
                      previewImage={previewImage}
                      zoom={zoom}
                      qrCodeUrl={qrCodeUrl}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[9/16] max-h-[60vh] bg-[#1a1a1a] border-2 border-dashed border-[#333] rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer active:bg-[#222] transition-colors"
                    onClick={() => fileInputRef.current?.click()}>
                    <div className="w-16 h-16 rounded-full bg-[#111] border border-[#333] flex items-center justify-center">
                      <Camera className="w-6 h-6 text-zinc-600" />
                    </div>
                    <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">Tap to Upload Photo</span>
                  </div>
                )}
              </div>

              {/* 2. CONTROLS FORM */}
              <div className="flex flex-col gap-6 z-10 relative">
                <FormFields isMobile={true} />
              </div>
            </div>

            {/* STICKY FOOTER */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pt-8 bg-gradient-to-t from-black via-black/90 to-transparent z-50">
              <CreateButton className="shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:shadow-[0_0_60px_rgba(34,197,94,0.5)] border-yard-green/50" />
            </div>

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
                <div className="relative min-h-[700px] w-full flex items-center justify-center">
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-tr opacity-20 blur-[100px] rounded-full transition-colors duration-700",
                    formData.style === 'cyber' ? "from-cyan-500 via-blue-600 to-purple-600" :
                      formData.style === 'luxury' ? "from-yellow-500 via-orange-500 to-red-600" :
                        "from-green-500 via-emerald-600 to-teal-600"
                  )} />
                  <div className="relative z-10">
                    <AssetPreview
                      data={formData}
                      previewImage={previewImage}
                      zoom={zoom}
                      qrCodeUrl={qrCodeUrl}
                    />
                  </div>
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
            setStage('landing');
            setPreviewImage(null);
            setGeneratedBlob(null);
            setQrCodeUrl(null);
            setFormData({ ...formData, title: "", price: "", slogan: "" });
          }}
        />
      )}
    </main>
  );
}
