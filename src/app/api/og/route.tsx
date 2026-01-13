// ============================================================
// JAM AGENTS - DYNAMIC OPEN GRAPH IMAGE GENERATOR
// 
// This generates preview images for WhatsApp/Facebook/Twitter
// when someone shares a listing link.
//
// Save as: src/app/api/og/route.tsx
// ============================================================

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Edge runtime for faster response
export const runtime = 'edge';

// Image dimensions (optimized for WhatsApp/Facebook)
const WIDTH = 1200;
const HEIGHT = 630;

// Theme colors (matches page.tsx COLOR_THEMES exactly)
const THEMES: Record<string, { accent: string; gradient: string; textShadow: string; fontClassName: string; tagBg: string; borderColor?: string }> = {
    cyber: {
        accent: '#00FFE0',
        gradient: 'linear-gradient(to top, rgba(0,40,50,0.95) 0%, rgba(0,25,35,0.7) 40%, transparent 100%)',
        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        fontClassName: 'font-black',
        tagBg: 'rgba(0, 255, 224, 0.12)'
    },
    emerald: {
        accent: '#10B981',
        gradient: 'linear-gradient(to top, rgba(5,46,22,0.95) 0%, rgba(2,30,14,0.7) 40%, transparent 100%)',
        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        fontClassName: 'font-bold',
        tagBg: 'rgba(16, 185, 129, 0.12)'
    },
    gold: {
        accent: '#F59E0B',
        gradient: 'linear-gradient(to top, rgba(50,30,0,0.95) 0%, rgba(35,20,0,0.7) 40%, transparent 100%)',
        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        fontClassName: 'font-light',
        tagBg: 'rgba(245, 158, 11, 0.12)',
        borderColor: '#F59E0B'
    },
    sunset: {
        accent: '#F472B6',
        gradient: 'linear-gradient(to top, rgba(50,10,30,0.95) 0%, rgba(35,5,20,0.7) 40%, transparent 100%)',
        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        fontClassName: 'font-medium',
        tagBg: 'rgba(244, 114, 182, 0.12)'
    },
    royal: {
        accent: '#8B5CF6',
        gradient: 'linear-gradient(to top, rgba(30,10,50,0.95) 0%, rgba(20,5,35,0.7) 40%, transparent 100%)',
        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        fontClassName: 'font-bold',
        tagBg: 'rgba(139, 92, 246, 0.12)'
    },
    clean: {
        accent: '#FFFFFF',
        gradient: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)',
        textShadow: 'none',
        fontClassName: 'font-medium',
        tagBg: 'rgba(255, 255, 255, 0.08)'
    }
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return generateFallbackImage('JAM Agents', 'Create Professional Listings', '');
        }

        // Initialize Supabase Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch Listing Data
        const { data: listing, error } = await supabase
            .from('listings')
            .select('title, price, location, visual_style, image_url')
            .eq('slug', slug)
            .single();

        if (error || !listing) {
            console.error('OG Fetch Error:', error);
            return generateFallbackImage('Listing Not Found', 'Check Jam Agents', '');
        }

        const theme = THEMES[listing.visual_style] || THEMES.cyber;

        return new ImageResponse(
            (
                <div
                    style={{
                        width: WIDTH,
                        height: HEIGHT,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        backgroundColor: '#000000',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                >
                    {/* Background Layer */}
                    {listing.image_url ? (
                        <img
                            src={listing.image_url}
                            alt=""
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, rgba(22, 78, 99, 0.5), rgba(88, 28, 135, 0.5), rgba(120, 53, 15, 0.5))'
                            }}
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: theme.gradient,
                        }}
                    />

                    {/* Content Container */}
                    <div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                            padding: '40px',
                            justifyContent: 'space-between'
                        }}
                    >
                        {/* Header: Brand Tag */}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    backgroundColor: theme.tagBg,
                                    border: `1px solid ${theme.accent}30`,
                                    backdropFilter: 'blur(4px)'
                                }}
                            >
                                <span style={{ color: theme.accent, fontSize: '24px' }}>⚡</span>
                                <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, letterSpacing: '0.1em' }} className={theme.fontClassName}>JAM AGENTS</span>
                            </div>
                        </div>

                        {/* Footer Content */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {/* Title */}
                            <div
                                style={{
                                    color: '#ffffff',
                                    fontSize: '60px',
                                    fontWeight: 900,
                                    lineHeight: 1.1,
                                    textShadow: theme.textShadow,
                                    marginBottom: '10px'
                                }}
                                className={theme.fontClassName}
                            >
                                {listing.title || 'Untitled Listing'}
                            </div>

                            {/* Location */}
                            <div
                                style={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontSize: '24px',
                                    fontWeight: 500,
                                    letterSpacing: '0.05em',
                                    marginBottom: '20px'
                                }}
                            >
                                {listing.location || 'Jamaica'}
                            </div>

                            {/* Price & Price Tag */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div
                                    style={{
                                        color: theme.accent,
                                        fontSize: '80px',
                                        fontWeight: 900,
                                        textShadow: `0 2px 20px ${theme.accent}40`,
                                        lineHeight: 1
                                    }}
                                    className={theme.fontClassName}
                                >
                                    {listing.price}
                                </div>

                                {/* Virtual QR Visualization */}
                                <div
                                    style={{
                                        width: 80,
                                        height: 80,
                                        backgroundColor: 'white',
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                                    }}
                                >
                                    <div style={{ fontSize: 10, color: '#000' }}>SCAN ME</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: WIDTH,
                height: HEIGHT,
                headers: {
                    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
                },
            }
        );

    } catch (e: any) {
        console.error('OG Generation Error:', e);
        return generateFallbackImage('JAM Agents', 'Create Professional Listings', '');
    }
}

// Fallback image when listing not found or error occurs
function generateFallbackImage(headline: string, subtext: string, price: string) {
    return new ImageResponse(
        (
            <div
                style={{
                    width: WIDTH,
                    height: HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0a1525 0%, #0d1f35 50%, #061018 100%)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '40px',
                    }}
                >
                    <span style={{ fontSize: '64px' }}>⚡</span>
                    <span
                        style={{
                            color: '#FBBF24',
                            fontSize: '48px',
                            fontWeight: 900,
                            letterSpacing: '2px',
                        }}
                    >
                        JAM AGENTS
                    </span>
                </div>

                {/* Headline */}
                <h1
                    style={{
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 800,
                        margin: 0,
                        textAlign: 'center',
                    }}
                >
                    {headline}
                </h1>

                {/* Subtext */}
                <p
                    style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '28px',
                        margin: '16px 0 0 0',
                    }}
                >
                    {subtext}
                </p>

                {/* Tagline */}
                <p
                    style={{
                        color: '#00FFE0',
                        fontSize: '24px',
                        marginTop: '48px',
                    }}
                >
                    🇯🇲 Jamaica's WhatsApp Commerce Platform
                </p>
            </div>
        ),
        {
            width: WIDTH,
            height: HEIGHT,
            headers: {
                'Cache-Control': 'public, max-age=86400',
            },
        }
    );
}
