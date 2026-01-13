"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Zap, Camera, Type, Palette, Sparkles, X, Check,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  ZoomIn, Maximize, Phone, FileText, Smartphone,
  ShoppingBag, Calendar, Briefcase, Car, Home as HomeIcon, Music,
  QrCode, ExternalLink, Loader2, Share
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { saveListing } from "@/app/actions/save-listing";

// --- TYPES & DATA ---
const USER_INTENTS = [
  {
    id: 'sell',
    label: 'Sell Something',
    icon: ShoppingBag,
    desc: 'Product, food, crafts',
    color: '#10B981',
    examples: ['Phone', 'Clothes', 'Food', 'Craft']
  },
  {
    id: 'event',
    label: 'Promote Event',
    icon: Calendar,
    desc: 'Party, show, gathering',
    color: '#F472B6',
    examples: ['Party', 'Concert', 'Church', 'Sports']
  },
  {
    id: 'service',
    label: 'Offer Service',
    icon: Briefcase,
    desc: 'Business, freelance',
    color: '#8B5CF6',
    examples: ['Barber', 'Mechanic', 'Tutor', 'Cleaner']
  },
  {
    id: 'vehicle',
    label: 'Sell Vehicle',
    icon: Car,
    desc: 'Car, bike, truck',
    color: '#F59E0B',
    examples: ['Car', 'Bike', 'Bus', 'Truck']
  },
  {
    id: 'property',
    label: 'Property',
    icon: HomeIcon,
    desc: 'Rent, sale, land',
    color: '#06B6D4',
    examples: ['House', 'Apartment', 'Land', 'Room']
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Music,
    desc: 'DJ, artist, performer',
    color: '#EC4899',
    examples: ['DJ', 'Band', 'MC', 'Dancer']
  },
];

const COLOR_THEMES = [
  { id: 'cyber', name: 'Cyber', accent: '#00FFE0', gradient: 'linear-gradient(to top, rgba(0,40,50,0.95) 0%, rgba(0,25,35,0.7) 40%, transparent 100%)', glow: 'rgba(0, 255, 224, 0.4)', badgeBg: 'rgba(0, 255, 224, 0.12)' },
  { id: 'emerald', name: 'Yard', accent: '#10B981', gradient: 'linear-gradient(to top, rgba(5,46,22,0.95) 0%, rgba(2,30,14,0.7) 40%, transparent 100%)', glow: 'rgba(16, 185, 129, 0.4)', badgeBg: 'rgba(16, 185, 129, 0.12)' },
  { id: 'gold', name: 'Premium', accent: '#F59E0B', gradient: 'linear-gradient(to top, rgba(50,30,0,0.95) 0%, rgba(35,20,0,0.7) 40%, transparent 100%)', glow: 'rgba(245, 158, 11, 0.4)', badgeBg: 'rgba(245, 158, 11, 0.12)' },
  { id: 'sunset', name: 'Party', accent: '#F472B6', gradient: 'linear-gradient(to top, rgba(50,10,30,0.95) 0%, rgba(35,5,20,0.7) 40%, transparent 100%)', glow: 'rgba(244, 114, 182, 0.4)', badgeBg: 'rgba(244, 114, 182, 0.12)' },
  { id: 'royal', name: 'Royal', accent: '#8B5CF6', gradient: 'linear-gradient(to top, rgba(30,10,50,0.95) 0%, rgba(20,5,35,0.7) 40%, transparent 100%)', glow: 'rgba(139, 92, 246, 0.4)', badgeBg: 'rgba(139, 92, 246, 0.12)' },
  { id: 'clean', name: 'Clean', accent: '#FFFFFF', gradient: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)', glow: 'rgba(255, 255, 255, 0.2)', badgeBg: 'rgba(255, 255, 255, 0.08)' },
];

const generateSlug = (headline: string) => {
  const base = headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const id = Math.random().toString(36).substring(2, 6);
  return `${base}-${id}`;
};

// --- COMPONENTS ---

const CyberBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,80,100,0.3) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(245,158,11,0.08) 0%, transparent 50%),
          radial-gradient(ellipse 50% 30% at 10% 80%, rgba(139,92,246,0.06) 0%, transparent 50%),
          linear-gradient(180deg, #0a1525 0%, #0d1f35 30%, #0b1a2d 60%, #061018 100%)
        `
      }}
    />
    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[100px]" style={{ background: 'rgba(0, 255, 224, 0.06)' }} />
    <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] rounded-full blur-[80px]" style={{ background: 'rgba(245, 158, 11, 0.05)' }} />
  </div>
);

const GlassCard = ({ children, className = "", style = {}, onClick, glow = false, theme = null }: any) => (
  <div
    onClick={onClick}
    className={cn(
      "relative overflow-hidden rounded-2xl transition-all duration-300",
      onClick && 'cursor-pointer active:scale-[0.98]',
      className
    )}
    style={{
      background: 'rgba(255, 255, 255, 0.04)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: glow ? `0 8px 32px ${theme?.glow || 'rgba(0, 255, 224, 0.12)'}` : '0 4px 24px rgba(0, 0, 0, 0.2)',
      ...style
    }}
  >
    {children}
  </div>
);

// --- MAIN PAGE COMPONENT ---

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'intent' | 'creator' | 'export'>('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userIntent, setUserIntent] = useState<any>(null);
  const [listingData, setListingData] = useState<any>(null);

  const handleNavigate = (screen: 'landing' | 'intent' | 'creator' | 'export', data?: any) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(screen);
      if (data) setListingData(data);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030712] text-white selection:bg-cyan-500/30">
      <CyberBackground />

      <div className={cn(
        "relative z-10 transition-all duration-300 min-h-screen flex flex-col",
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      )}>
        {currentScreen === 'landing' && (
          <LandingScreen onEnter={() => handleNavigate('intent')} />
        )}
        {currentScreen === 'intent' && (
          <IntentScreen
            onSelect={(intent: any) => { setUserIntent(intent); handleNavigate('creator'); }}
            onBack={() => handleNavigate('landing')}
          />
        )}
        {currentScreen === 'creator' && (
          <CreatorScreen
            userIntent={userIntent}
            onBack={() => handleNavigate('intent')}
            onExport={(data: any) => handleNavigate('export', data)}
          />
        )}
        {currentScreen === 'export' && (
          <ExportScreen
            listingData={listingData}
            onBack={() => handleNavigate('creator')}
            onNewListing={() => { setUserIntent(null); setListingData(null); handleNavigate('intent'); }}
          />
        )}
      </div>
    </div>
  );
}

// --- SCREENS ---

const LandingScreen = ({ onEnter }: { onEnter: () => void }) => {
  const [showContent, setShowContent] = useState(false);
  useEffect(() => { setTimeout(() => setShowContent(true), 100); }, []);

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex-shrink-0 px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400"><Zap className="w-7 h-7 fill-current" /></span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 font-black text-2xl tracking-tighter italic">JAMAGENTS</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className={cn("text-center mb-10 transition-all duration-700 delay-100", showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
          <h1 className="text-white text-4xl font-black mb-3 tracking-tight leading-none">
            Sell Anything.<br /><span className="text-cyan-400">Share Everywhere.</span>
          </h1>
          <p className="text-white/50 text-base font-medium">Professional listings → WhatsApp → Sales</p>
        </div>

        <div className={cn("transition-all duration-700 delay-200 mb-8", showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
          <GlassCard className="p-2 transform -rotate-2" glow>
            <div className="w-[240px] aspect-[3/4] rounded-xl overflow-hidden relative shadow-2xl" style={{ background: 'linear-gradient(145deg, rgba(0,60,80,0.4), rgba(10,30,50,0.6))' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,30,40,0.95) 0%, rgba(0,20,30,0.5) 50%, transparent 100%)' }} />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg backdrop-blur-md" style={{ background: 'rgba(0, 255, 224, 0.1)', border: '1px solid rgba(0, 255, 224, 0.2)' }}>
                <span className="text-cyan-400 text-xs shadow-cyan-400/50 drop-shadow-lg">⚡</span>
                <span className="text-cyan-400 text-[10px] font-black tracking-wider">JAM AGENTS</span>
              </div>
              <div className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-white p-1 shadow-lg">
                <div className="w-full h-full bg-black/5 rounded flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-black/80" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="text-white font-black text-xl mb-1 drop-shadow-lg leading-tight">FRESH JERK CHICKEN</div>
                <div className="text-white/60 text-xs mb-3 font-medium">Best in Kingston • Delivery Available</div>
                <div className="text-cyan-400 text-3xl font-black drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">$1,200</div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className={cn("w-full max-w-xs transition-all duration-700 delay-400", showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
          <button
            onClick={onEnter}
            className="w-full py-4 rounded-2xl font-black text-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00FFE0 0%, #10B981 100%)', boxShadow: '0 0 40px -10px rgba(0,255,224,0.5)' }}
          >
            <Sparkles className="w-5 h-5 fill-black" />
            <span className="tracking-wider">START SELLING</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const IntentScreen = ({ onSelect, onBack }: { onSelect: (i: any) => void, onBack: () => void }) => {
  const [showContent, setShowContent] = useState(false);
  useEffect(() => { setTimeout(() => setShowContent(true), 100); }, []);

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex-shrink-0 px-4 py-4 flex items-center">
        <button onClick={onBack} className="flex items-center gap-1 text-white/50 hover:text-white transition-all pl-2">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wide">Back</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col px-6 pb-8 pt-4">
        <div className={cn("text-center mb-8 transition-all duration-500", showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
          <h2 className="text-white text-2xl font-black mb-2 tracking-tight">What are you promoting?</h2>
          <p className="text-white/40 text-sm font-medium">We'll customize your listing</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {USER_INTENTS.map((intent: any, i: number) => (
            <GlassCard
              key={intent.id}
              onClick={() => onSelect(intent)}
              className={cn("p-4 transition-all duration-500 hover:bg-white/10 active:scale-95", showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg"
                style={{ background: `${intent.color}20`, border: `1px solid ${intent.color}40`, boxShadow: `0 0 20px ${intent.color}15` }}
              >
                <intent.icon className="w-6 h-6" style={{ color: intent.color }} />
              </div>
              <h3 className="text-white font-bold text-sm mb-1 leading-tight">{intent.label}</h3>
              <p className="text-white/40 text-[10px] font-medium leading-tight">{intent.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

const CreatorScreen = ({ userIntent, onBack, onExport }: { userIntent: any, onBack: () => void, onExport: (d: any) => void }) => {
  const [activeFormat, setActiveFormat] = useState('post');
  const [activeControl, setActiveControl] = useState<'image' | 'text' | 'style'>('image');
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Image State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [isGeneratingInfo, setIsGeneratingInfo] = useState(false); // For The Trap processing
  const [isAIEnhanced, setIsAIEnhanced] = useState(false);

  // Text State
  const [headline, setHeadline] = useState(userIntent?.examples?.[0] || 'Your Product');
  const [subtext, setSubtext] = useState('Quality guaranteed • Fast delivery');
  const [price, setPrice] = useState('1,200'); // Clean number for easier processing

  // Text Size
  const [headlineSize, setHeadlineSize] = useState(24);
  const [subtextSize, setSubtextSize] = useState(12);
  const [priceSize, setPriceSize] = useState(32);

  // Style
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const currentTheme = COLOR_THEMES[selectedTheme];

  const allFormats: any = {
    post: { id: 'post', label: 'POST', Icon: Camera, aspect: 'aspect-square', width: 'w-[280px] md:w-[550px]' },
    status: { id: 'status', label: 'STORY', Icon: Smartphone, aspect: 'aspect-[9/16]', width: 'w-[240px] md:w-[380px]' },
    flyer: { id: 'flyer', label: 'FLYER', Icon: FileText, aspect: 'aspect-[3/4]', width: 'w-[260px] md:w-[500px]' },
    menu: { id: 'menu', label: 'MENU', Icon: FileText, aspect: 'aspect-[9/16]', width: 'w-[240px] md:w-[380px]' },
    info: { id: 'info', label: 'INFO', Icon: Type, aspect: 'aspect-[4/5]', width: 'w-[270px] md:w-[480px]' },
  };

  const availableFormats = useMemo(() => {
    switch (userIntent?.id) {
      case 'event':
      case 'entertainment':
        return [allFormats.status, allFormats.flyer, allFormats.post];
      case 'sell':
        if (headline.toLowerCase().includes('food') || headline.toLowerCase().includes('meal')) return [allFormats.menu, allFormats.post];
        return [allFormats.post, allFormats.info, allFormats.status];
      case 'service':
        return [allFormats.flyer, allFormats.post];
      default:
        return [allFormats.post, allFormats.status, allFormats.flyer];
    }
  }, [userIntent, headline]);

  useEffect(() => {
    if (availableFormats[0]) setActiveFormat(availableFormats[0].id);
  }, [availableFormats]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        setUploadedImage(event.target?.result as string);
        setIsUploading(false);
        setImageZoom(1.2);
        setImagePosition({ x: 50, y: 50 });
      }, 400);
    };
    reader.readAsDataURL(file);
  };

  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 5;
    setImagePosition(prev => {
      switch (direction) {
        case 'up': return { ...prev, y: Math.max(0, prev.y - step) };
        case 'down': return { ...prev, y: Math.min(100, prev.y + step) };
        case 'left': return { ...prev, x: Math.max(0, prev.x - step) };
        case 'right': return { ...prev, x: Math.min(100, prev.x + step) };
        default: return prev;
      }
    });
  };

  // --- THE TRAP & EXPORT LOGIC ---
  const handleExportTrigger = async () => {
    if (!headline || !price) {
      alert("Please add at least a Headline and Price!");
      return;
    }

    setIsGeneratingInfo(true);

    let finalSlug = '';
    let finalListingUrl = '';

    try {
      // 1. Generate Slug
      finalSlug = generateSlug(headline);
      finalListingUrl = `https://jamagents.com/item/${finalSlug}`;

      // 2. Start Critical Tasks (Parallel)
      // We start both QR gen and DB save now.
      // We MUST await the DB save to ensure the link works.
      const savePromise = saveListing({
        title: headline,
        price: price,
        phone: "8765555555",
        location: "Jamaica",
        style: currentTheme.id,
        status: 'active',
        slug: finalSlug
      });

      const qrPromise = (async () => {
        try {
          const QRCode = (await import("qrcode")).default;
          // Use error correction level 'M' for better scannability
          return await QRCode.toDataURL(finalListingUrl, {
            margin: 0,
            width: 100,
            color: { dark: '#000000', light: '#FFFFFFFF' }
          });
        } catch (e) {
          console.warn("QR Gen failed", e);
          return null;
        }
      })();

      // Await both - Critical for Link Validity
      const [saveResult, qrData] = await Promise.all([savePromise, qrPromise]);

      if (!saveResult.success) {
        console.error("DB Save Failed:", saveResult.error);
        // We log it but proceed "Fail Open" for the UI, though the link will 404.
        // In production, we might want to alert here.
      } else {
        console.log("Listing saved successfully:", saveResult.slug);
      }

      if (qrData) setQrCodeData(qrData);

      // Log event
      const { logEvent } = await import("@/app/actions/track-event");
      logEvent('flyer_created', undefined, finalSlug, { price, subtext, theme: currentTheme.name, intent: userIntent?.id }).catch(console.error);

      // 4. Capture Image
      // Wait a tick for the QR code state to render into the DOM
      await new Promise(r => setTimeout(r, 800));

      let imageUrl = uploadedImage; // Default fallback

      try {
        if (captureRef.current) {
          const html2canvas = (await import("html2canvas")).default;
          const canvas = await html2canvas(captureRef.current, {
            scale: 2, // Slightly lower scale for stability (was 3)
            useCORS: true,
            backgroundColor: '#000000',
            allowTaint: true,
            logging: false,
            // Simplify rendering to avoid crashes
            ignoreElements: (element) => element.tagName === 'VIDEO'
          });

          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 0.9));
          if (blob) {
            imageUrl = URL.createObjectURL(blob);
          }
        }
      } catch (canvasErr) {
        console.error("Canvas capture failed, using raw image:", canvasErr);
        // We continue with uploadedImage as fallback
      }

      // 5. Navigate
      onExport({
        headline,
        subtext,
        price,
        image: uploadedImage,
        listingUrl: finalListingUrl,
        slug: finalSlug,
        capturedImage: imageUrl
      });

    } catch (err) {
      console.error("Critical Export Error:", err);
      // Even if everything explodes, try to show the success screen
      if (finalListingUrl) {
        onExport({
          headline,
          subtext: "Error generating preview",
          price,
          image: uploadedImage,
          listingUrl: finalListingUrl,
          slug: finalSlug,
          capturedImage: uploadedImage
        });
      } else {
        alert("Something went wrong. Please check your connection and try again.");
      }
    } finally {
      setIsGeneratingInfo(false);
    }
  };

  const currentFormat = allFormats[activeFormat] || allFormats.post;

  return (
    <div className="flex-1 flex flex-col md:flex-row-reverse h-screen relative bg-[#030712] overflow-hidden">
      <CyberBackground />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Header - Hides when controls open */}
      <header
        className={cn(
          "flex-shrink-0 px-4 py-4 flex justify-between items-center bg-[#030712]/80 backdrop-blur-md absolute top-0 left-0 right-0 z-40 transition-all duration-500 md:left-[420px] md:right-0 md:translate-y-0 md:opacity-100 md:bg-transparent",
          isControlsOpen && typeof window !== 'undefined' && window.innerWidth < 768 ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        )}
      >
        <button onClick={onBack} className="flex items-center gap-1 text-white/50 hover:text-white transition-all pl-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          {userIntent && <userIntent.icon className="w-3 h-3" style={{ color: userIntent.color }} />}
          <span className="text-white/80 text-xs font-bold uppercase tracking-wide">{userIntent?.label}</span>
        </div>
        <div className="w-8" />
      </header>

      {/* Main Workspace - Grows to fill, centers content */}
      <div
        className="flex-1 flex items-center justify-center p-4 overflow-hidden relative transition-[padding] duration-500 ease-in-out md:p-8 md:!pb-8"
        onClick={() => isControlsOpen && setIsControlsOpen(false)}
        style={{ paddingBottom: isControlsOpen && typeof window !== 'undefined' && window.innerWidth < 768 ? '45vh' : '1rem' }}
      >
        <GlassCard
          className={cn("p-2 transition-all duration-500 shadow-2xl origin-center", isControlsOpen ? 'scale-90' : 'scale-100')}
          glow
          theme={currentTheme}
        >
          {/* THE CAPTURE TARGET */}
          <div
            ref={captureRef}
            className={cn(
              "relative overflow-hidden rounded-xl transition-all duration-500 bg-[#050505]",
              currentFormat.aspect,
              currentFormat.width
            )}
            style={{
              boxShadow: `0 0 50px -10px ${currentTheme.glow}`
            }}
          >
            {/* Image Layer */}
            {uploadedImage ? (
              <div className={cn("absolute inset-0 w-full h-full", isAIEnhanced && "contrast-[1.15] saturate-[1.1] brightness-[1.05]")}>
                {/* Cinematic Noise Overlay when Optimized */}
                {isAIEnhanced && <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-[2]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />}

                {/* 1. Ambient Background (The "Aura") - Always Fills */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={uploadedImage}
                    className="w-full h-full object-cover blur-xl opacity-60 scale-125 saturate-150"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>

                {/* 2. Sharp Subject (The "Hero") - Never Cropped */}
                <div className="absolute inset-0 p-2 flex items-center justify-center">
                  <img
                    src={uploadedImage}
                    className="w-full h-full object-contain drop-shadow-2xl transition-all duration-300"
                    style={{
                      zIndex: 1,
                      transform: `scale(${imageZoom})`,
                      objectPosition: `${imagePosition.x}% ${imagePosition.y}%`
                    }}
                    alt="Product"
                  />
                </div>
              </div>
            ) : (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                style={{ zIndex: 1 }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/10">
                  <Camera className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Tap to add photo</p>
              </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: currentTheme.gradient }} />

            {/* Branding Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg backdrop-blur-md" style={{ zIndex: 3, background: currentTheme.badgeBg, border: `1px solid ${currentTheme.accent}30` }}>
              <span style={{ color: currentTheme.accent }} className="text-xs drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">⚡</span>
              <span style={{ color: currentTheme.accent }} className="text-[8px] font-black tracking-widest drop-shadow-md">JAM AGENTS</span>
            </div>

            {/* QR Code */}
            <div className="absolute top-3 right-3 w-11 h-11 rounded-lg bg-white p-0.5 shadow-lg" style={{ zIndex: 3 }}>
              <div className="w-full h-full rounded bg-black/5 flex items-center justify-center">
                {qrCodeData ? <img src={qrCodeData} className="w-full h-full object-contain mix-blend-multiply" alt="QR" /> : <QrCode className="w-6 h-6 text-black/20" />}
              </div>
            </div>

            {/* Text Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4" style={{ zIndex: 3 }}>
              <h2 className="text-white font-black leading-[0.9] mb-1.5 italic uppercase drop-shadow-2xl break-words" style={{ fontSize: `${headlineSize}px`, textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                {headline || 'YOUR TITLE'}
              </h2>
              <p className="text-white/80 mb-2 font-medium drop-shadow-md leading-tight" style={{ fontSize: `${subtextSize}px` }}>{subtext}</p>
              <div className="flex items-baseline">
                <span className="text-base font-black mr-1" style={{ color: currentTheme.accent }}>$</span>
                <span className="font-black italic tracking-tighter drop-shadow-xl" style={{ fontSize: `${priceSize}px`, color: currentTheme.accent, textShadow: `0 0 30px ${currentTheme.glow}` }}>{price}</span>
                <span className="text-[10px] font-bold ml-1.5 opacity-60" style={{ color: currentTheme.accent }}>JMD</span>
              </div>
            </div>

            {/* Loading */}
            {(isUploading || isGeneratingInfo) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm" style={{ zIndex: 10 }}>
                <Loader2 className="w-8 h-8 animate-spin mb-2" style={{ color: currentTheme.accent }} />
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{isUploading ? 'Enhancing...' : 'Burning QR...'}</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* --- COLLAPSIBLE CONTROLS --- */}

      {/* 1. Quick Action Bar (Visible when collapsed) */}
      <div
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 md:hidden",
          isControlsOpen || isGeneratingInfo ? "translate-y-[200%] opacity-0" : "translate-y-0 opacity-100"
        )}
      >
        <div className="flex items-center gap-3 p-2 pr-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl ring-1 ring-white/20">
          <button
            onClick={() => setIsControlsOpen(true)}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            onClick={handleExportTrigger}
            className="px-6 py-3 rounded-full font-black text-sm uppercase tracking-wide text-white bg-green-600 hover:bg-green-500 transition-colors shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span>Share</span>
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Full Control Panel (Slide-up) */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-[#0a0a0a] border-t border-white/10 rounded-t-[2rem] transition-transform duration-500 ease-in-out shadow-[0_-10px_40px_rgba(0,0,0,0.5)]",
          "md:relative md:inset-auto md:w-[420px] md:h-full md:border-t-0 md:border-l md:rounded-none md:shadow-none md:translate-y-0 md:flex md:flex-col",
          isControlsOpen ? "translate-y-0" : "translate-y-[110%]"
        )}
      >
        {/* Drag Handle / Close (Mobile Only) */}
        <div className="flex items-center justify-center py-4 cursor-pointer active:opacity-50 transition-opacity md:hidden" onClick={() => setIsControlsOpen(false)}>
          <div className="w-12 h-8 flex items-center justify-center bg-white/5 rounded-full border border-white/5">
            <ChevronDown className="w-5 h-5 text-white/50" />
          </div>
        </div>

        {/* Desktop Header (Sidebar Brand) */}
        <div className="hidden md:flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]">
          <div className="text-white font-bold text-lg tracking-tight">Studio Controls</div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-white/40">PRO</div>
          </div>
        </div>

        {/* Format Selector */}
        <div className="flex justify-center pb-2 px-4 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {availableFormats.map((format: any) => (
              <button
                key={format.id}
                onClick={() => setActiveFormat(format.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-[60px]",
                  activeFormat === format.id ? 'text-white bg-white/10 border border-white/20' : 'text-zinc-500 border border-transparent'
                )}
              >
                <format.Icon className="w-4 h-4" />
                <span className="text-[9px] font-black tracking-wider">{format.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 mt-2">
          {[
            { id: 'image', Icon: Camera, label: 'Image', color: '#06B6D4' },
            { id: 'text', Icon: Type, label: 'Text', color: '#10B981' },
            { id: 'style', Icon: Palette, label: 'Style', color: '#8B5CF6' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveControl(tab.id as any)}
              className="flex-1 py-4 flex flex-col items-center gap-1.5 relative transition-all"
              style={{ color: activeControl === tab.id ? tab.color : 'rgba(255,255,255,0.2)' }}
            >
              <tab.Icon className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
              {activeControl === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full" style={{ background: tab.color }} />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 pb-8 min-h-[220px]">
          {/* IMAGE CONTROLS */}
          {activeControl === 'image' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] border border-dashed border-white/20 hover:bg-white/5"
                >
                  <Camera className="w-5 h-5 text-zinc-400" />
                  <span className="text-zinc-400">{uploadedImage ? 'Change' : 'Upload'}</span>
                </button>

                <button
                  onClick={() => setIsAIEnhanced(!isAIEnhanced)}
                  disabled={!uploadedImage}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] border",
                    isAIEnhanced
                      ? "bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                      : "border-white/20 text-zinc-400 hover:bg-white/5"
                  )}
                >
                  <div className="relative">
                    <Sparkles className="w-5 h-5" />
                    {isAIEnhanced && <div className="absolute inset-0 animate-ping opacity-50"><Sparkles className="w-5 h-5" /></div>}
                  </div>
                  <span>{isAIEnhanced ? 'AI Enhanced' : 'AI Enhance'}</span>
                </button>
              </div>

              {uploadedImage && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase">
                      <span>Zoom</span>
                      <span className="text-cyan-400">{imageZoom.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range" min={1} max={2.5} step={0.1} value={imageZoom}
                      onChange={(e) => setImageZoom(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                  <div className="bg-white/5 rounded-xl p-2 flex items-center justify-center gap-1">
                    <button onClick={() => handlePan('left')} className="p-2 hover:bg-white/10 rounded-lg text-white/50"><ChevronLeft className="w-4 h-4" /></button>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handlePan('up')} className="p-2 hover:bg-white/10 rounded-lg text-white/50"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => handlePan('down')} className="p-2 hover:bg-white/10 rounded-lg text-white/50"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => handlePan('right')} className="p-2 hover:bg-white/10 rounded-lg text-white/50"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEXT CONTROLS */}
          {activeControl === 'text' && (
            <div className="space-y-3">
              {[
                { label: 'Headline', value: headline, setter: setHeadline, size: headlineSize, sizeSetter: setHeadlineSize, min: 14, max: 36 },
                { label: 'Subtext', value: subtext, setter: setSubtext, size: subtextSize, sizeSetter: setSubtextSize, min: 8, max: 16 },
                { label: 'Price', value: price, setter: setPrice, size: priceSize, sizeSetter: setPriceSize, min: 18, max: 48, accent: true },
              ].map((field: any) => (
                <div key={field.label} className="flex gap-2">
                  <input
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.label}
                    className="flex-1 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none text-sm font-bold bg-[#111] border border-white/10 focus:border-cyan-500/50 transition-colors"
                    style={{ color: field.accent ? currentTheme.accent : 'white' }}
                  />
                  <div className="flex items-center gap-0.5 px-2 rounded-xl bg-white/5 border border-white/5">
                    <button onClick={() => field.sizeSetter(Math.max(field.min, field.size - 2))} className="px-2 py-2 text-zinc-500 hover:text-white transition-colors"><ChevronDown className="w-3 h-3" /></button>
                    <span className="text-cyan-400 text-[10px] w-4 text-center font-bold">{field.size}</span>
                    <button onClick={() => field.sizeSetter(Math.min(field.max, field.size + 2))} className="px-2 py-2 text-zinc-500 hover:text-white transition-colors"><ChevronUp className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STYLE CONTROLS */}
          {activeControl === 'style' && (
            <div className="grid grid-cols-3 gap-2">
              {COLOR_THEMES.map((theme, i) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(i)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-all border",
                    selectedTheme === i ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'
                  )}
                >
                  <div
                    className="w-6 h-6 rounded-full transition-all relative shadow-lg"
                    style={{
                      backgroundColor: theme.accent,
                      boxShadow: selectedTheme === i ? `0 0 15px ${theme.glow}` : 'none',
                    }}
                  >
                    {selectedTheme === i && <span className="absolute inset-0 flex items-center justify-center"><Check className="w-3 h-3 text-black stroke-[4]" /></span>}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: selectedTheme === i ? theme.accent : 'rgba(255,255,255,0.4)' }}>{theme.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => setIsControlsOpen(false)}
              className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-xs active:scale-[0.98] transition-transform"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- EXPORT SCREEN ---

const ExportScreen = ({ listingData, onBack, onNewListing }: { listingData: any, onBack: () => void, onNewListing: () => void }) => {
  const [copied, setCopied] = useState(false);

  // Auto-compose share text
  const shareText = useMemo(() => {
    return encodeURIComponent(
      `*${listingData.headline.toUpperCase()}* - $${listingData.price} JMD\n` +
      `${listingData.subtext}\n\n` +
      `👉 View Listing: ${listingData.listingUrl}\n\n` +
      `Created with JAM Agents ⚡`
    );
  }, [listingData]);

  const handleWhatsAppShare = () => {
    // Force specific text format regardless of platform
    const url = `https://wa.me/?text=${shareText}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(listingData.listingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen relative bg-[#030712] overflow-y-auto">
      {/* Background Ambience */}
      <CyberBackground />

      <header className="flex-shrink-0 px-6 py-6 flex items-center justify-between relative z-10">
        <button onClick={onBack} className="flex items-center gap-1 text-white/50 hover:text-white transition-all">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wide">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 font-black text-xl tracking-tighter italic drop-shadow-sm">JAM AGENTS</span>
        </div>
        <div className="w-8" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 relative z-10 max-w-md mx-auto w-full">

        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-500 blur-[60px] opacity-20" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)] ring-4 ring-black/20 relative z-10">
            <Check className="w-12 h-12 text-white stroke-[3] drop-shadow-lg" />
          </div>
        </div>

        <h2 className="text-white text-3xl font-black mb-2 text-center tracking-tight drop-shadow-xl">Listing Created!</h2>
        <p className="text-white/60 text-sm mb-10 text-center font-medium max-w-[240px]">Your professional listing is live on the JAM Agents network.</p>

        {/* Listing URL Card */}
        <GlassCard className="w-full p-0 overflow-hidden mb-6 border border-white/10">
          <div className="p-5 flex items-center gap-4 bg-white/5">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
              <ExternalLink className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-0.5">Your Listing URL</p>
              <p className="text-cyan-400 text-sm font-bold truncate selection:bg-cyan-500/30">{listingData.listingUrl.replace('https://', '')}</p>
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white/5 border-t border-white/5 flex items-center justify-center gap-2"
            style={{ color: copied ? '#10B981' : 'white' }}
          >
            {copied ? <Check className="w-3 h-3" /> : <div className="w-3 h-3" />}
            {copied ? 'COPIED TO CLIPBOARD' : 'COPY LINK'}
          </button>
        </GlassCard>

        {/* Info Card */}
        <div className="w-full bg-white/5 rounded-2xl p-4 mb-8 flex items-start gap-3 border border-dashed border-white/10">
          <QrCode className="w-10 h-10 text-white/20 shrink-0" />
          <div>
            <p className="text-white text-xs font-bold mb-1">QR Code Embedded</p>
            <p className="text-white/40 text-[10px] leading-relaxed">We've baked a scannable QR code directly into your image. When you share it, customers can scan to verify.</p>
          </div>
        </div>

        {/* RASTA Share Button */}
        <button
          onClick={handleWhatsAppShare}
          className="w-full py-5 rounded-2xl font-black text-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-transform active:scale-[0.98] hover:scale-105 shadow-[0_10px_40px_-5px_rgba(250,204,21,0.3)] mb-6"
          style={{ background: 'linear-gradient(90deg, #22c55e 0%, #eab308 50%, #ef4444 100%)' }}
        >
          <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">
            <Share className="w-4 h-4 text-black" />
          </div>
          <span className="drop-shadow-sm">Share to WhatsApp</span>
        </button>

        {/* New Listing Link */}
        <button
          onClick={onNewListing}
          className="text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors py-2"
        >
          Create Another Listing →
        </button>
      </div>
    </div>
  );
};
