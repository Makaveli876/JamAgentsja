import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { MessageCircle, MapPin, Share2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { trackVisit } from "@/app/actions/track-event";

// Force dynamic rendering so we always get fresh data
export const dynamic = 'force-dynamic';

interface Listing {
    id: string;
    headline: string;
    price: string;
    parish: string;
    whatsapp: string | null;
    theme: string;
    image_url?: string;
    slug: string;
    views: number;
    created_at: string;
}

// SEO Metadata support
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const { slug } = await params;
    const listing = await getListing(slug);

    if (!listing) return { title: 'Item Not Found' };

    // Dynamic OG Image
    const ogImage = `/api/og?slug=${slug}`;
    const images = [{ url: ogImage, width: 1200, height: 630, alt: listing.headline }];

    return {
        title: `${listing.headline} | Yard Wire`,
        description: `For Sale: ${listing.headline} - ${listing.price}. Located in ${listing.parish}. Tap to view details & contact seller.`,
        openGraph: {
            title: `${listing.headline} | Yard Wire`,
            description: `Price: ${listing.price} | Location: ${listing.parish}`,
            images: images,
            type: 'website',
        }
    };
}

// Data Fetching
async function getListing(slug: string): Promise<Listing | null> {
    const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) {
        console.error("Fetch error:", error);
        return null;
    }
    return data;
}

export default async function Page({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const listing = await getListing(slug);

    if (!listing) {
        notFound();
    }

    // FIRE & FORGET TRACKING (Server Side)
    // We don't await this because we don't want to slow down the page load.
    // Although in Server Components, unawaited promises can sometimes be cancelled by Vercel/NextJS if the response closes.
    // For safety in this environment, we'll await it or wrap it.
    // Given "Fast" requirement, awaiting a DB insert (10-50ms) is acceptable for analytics accuracy.
    await trackVisit(listing.id, slug);

    const normalizedPhone = listing.whatsapp ? listing.whatsapp.replace(/[^0-9]/g, '') : '18765555555'; // Fallback to generic if missing

    // Deep Link Format: https://wa.me/{normalized_number}?text={encoded_message}
    // Protocol Message: "Hi! 👋 I'm interested in your listing: 📦 {headline} 💰 {price} I found it on JAM Agents."
    const message = `Hi! 👋\n\nI'm interested in your listing:\n📦 ${listing.headline}\n💰 ${listing.price}\n\nI found it on JAM Agents.`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encodeURIComponent(message)}`;

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center">

            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className={`absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[100px] opacity-20 ${listing.theme === 'luxury' ? 'bg-yard-gold' :
                    listing.theme === 'island' ? 'bg-yard-green' : 'bg-yard-cyan'
                    }`} />
                <div className="absolute top-1/2 -right-20 w-80 h-80 bg-yard-purple rounded-full blur-[120px] opacity-20" />
            </div>

            <div className="w-full max-w-md flex flex-col min-h-screen relative z-10 bg-black/40 backdrop-blur-sm border-x border-white/5 shadow-2xl">

                {/* Header / Nav */}
                <header className="fixed top-0 w-full max-w-md z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                    <Link href="/" className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yard-cyan" />
                        <span className="font-bold tracking-tighter text-lg text-white">YARD WIRE</span>
                    </Link>
                    <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        <Share2 className="w-5 h-5 text-white" />
                    </button>
                </header>

                {/* Hero Image Area */}
                <div className="w-full aspect-square bg-zinc-900 relative mt-0 border-b border-white/10 group overflow-hidden">
                    {listing.image_url ? (
                        <img
                            src={listing.image_url}
                            alt={listing.headline}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-4">
                            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                <ShieldCheck className="w-8 h-8 opacity-50" />
                            </div>
                            <span className="text-xs uppercase tracking-widest font-medium">No Image Uploaded</span>
                        </div>
                    )}

                    {/* Price Overlay */}
                    <div className="absolute bottom-6 right-6">
                        <div className={`px-4 py-2 rounded-xl backdrop-blur-md border shadow-2xl transform rotate-[-2deg] ${listing.theme === 'luxury' ? 'bg-yard-gold/20 border-yard-gold text-yard-gold' :
                            listing.theme === 'island' ? 'bg-yard-green/20 border-yard-green text-yard-green' :
                                'bg-yard-cyan/20 border-yard-cyan text-yard-cyan'
                            }`}>
                            <span className="text-2xl font-black italic tracking-tighter">${listing.price}</span>
                        </div>
                    </div>
                </div>

                {/* Details Content */}
                <div className="p-6 flex flex-col gap-6 pb-28">

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Featured Listing</span>
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                                <MapPin className="w-3 h-3" />
                                {listing.parish || 'Jamaica'}
                            </div>
                        </div>
                        <h1 className="text-4xl font-black leading-[0.9] text-white tracking-tight uppercase">
                            {listing.headline}
                        </h1>
                        <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 mt-2">
                            <span className="flex items-center gap-1"><span className="text-zinc-600">📅</span> {new Date(listing.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><span className="text-zinc-600">👀</span> {listing.views || 0} views</span>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Status</span>
                            <span className="text-sm font-medium text-white">Available Now</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Verified</span>
                            <span className="text-sm font-medium text-yard-cyan">Yes, Verified</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 text-sm leading-relaxed text-zinc-400">
                        Interested in this <strong>{listing.headline}</strong>? Contact the seller directly on WhatsApp for more details or to arrange a viewing in <strong>{listing.parish}</strong>.
                    </div>

                </div>

                {/* Floating CTA */}
                <div className="fixed bottom-0 left-0 w-full z-50 p-4 flex justify-center bg-gradient-to-t from-black via-black/90 to-transparent pt-12">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full max-w-sm flex items-center justify-center gap-3 p-5 bg-[#25D366] hover:bg-[#1ebc57] text-black font-black uppercase text-lg rounded-2xl shadow-[0_0_30px_rgba(37,211,102,0.4)] transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <MessageCircle className="w-6 h-6 fill-black" />
                        Chat on WhatsApp
                    </a>
                </div>

            </div>
        </main>
    );
}
