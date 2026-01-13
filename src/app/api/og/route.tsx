import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundImage: 'linear-gradient(to bottom right, #000000, #111111)',
                            color: 'white',
                            fontFamily: 'sans-serif',
                        }}
                    >
                        <div style={{ fontSize: 60, fontWeight: 900, letterSpacing: '-0.05em' }}>YARD WIRE</div>
                        <div style={{ fontSize: 30, opacity: 0.5 }}>Invalid Listing ID</div>
                    </div>
                ),
                { width: 1200, height: 630 }
            );
        }

        // Fetch listing
        const { data: listing, error } = await supabase
            .from('listings')
            .select('headline, price, image_url, parish')
            .eq('slug', slug)
            .single();

        if (error || !listing) {
            // Fallback 404 image
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundImage: 'linear-gradient(to bottom right, #000000, #111111)',
                            color: 'white',
                            fontFamily: 'sans-serif',
                        }}
                    >
                        <div style={{ fontSize: 60, fontWeight: 900, letterSpacing: '-0.05em' }}>YARD WIRE</div>
                        <div style={{ fontSize: 30, opacity: 0.5 }}>Item Not Found</div>
                    </div>
                ),
                { width: 1200, height: 630 }
            );
        }

        const { headline, price, image_url, parish } = listing;

        // Resolve Image via ArrayBuffer for Satori stability
        let imageData: ArrayBuffer | null = null;
        if (image_url) {
            try {
                const imgRes = await fetch(image_url);
                if (imgRes.ok) {
                    imageData = await imgRes.arrayBuffer();
                }
            } catch (ignore) { }
        }

        // Use raw image data if available, otherwise gradient
        const bgStyle: any = imageData
            ? { backgroundImage: `url(data:image/png;base64,${Buffer.from(imageData).toString('base64')})` }
            : { backgroundImage: 'linear-gradient(to bottom right, #111827, #000000)' };

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        ...bgStyle,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'white',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                    }}
                >
                    {/* Gradient Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0))',
                        }}
                    />

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 40, zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontSize: 24 }}>⚡</div>
                            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '0.1em' }}>JAM AGENTS</div>
                        </div>
                        <div style={{ fontSize: 20, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Yard Wire</div>
                    </div>

                    {/* Footer content */}
                    <div style={{ display: 'flex', flexDirection: 'column', padding: 60, zIndex: 10, gap: 10 }}>
                        {/* Price Tag */}
                        <div
                            style={{
                                display: 'flex',
                                backgroundColor: '#22d3ee', // Cyan-400
                                color: 'black',
                                padding: '10px 30px',
                                borderRadius: 999,
                                fontSize: 40,
                                fontWeight: 900,
                                alignSelf: 'flex-start',
                                boxShadow: '0 10px 30px rgba(34, 211, 238, 0.4)',
                                marginBottom: 20,
                                transform: 'rotate(-2deg)'
                            }}
                        >
                            {price}
                        </div>

                        <div style={{ fontSize: 70, fontWeight: 900, lineHeight: 0.9, textTransform: 'uppercase', textShadow: '0 5px 20px rgba(0,0,0,0.8)' }}>
                            {headline}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, opacity: 0.9 }}>
                            <div style={{ fontSize: 24 }}>📍</div>
                            <div style={{ fontSize: 24, fontWeight: 500 }}>{parish || 'Jamaica'}</div>
                        </div>
                    </div>

                    {/* "Message Seller" Button Simulation (Visual Cue) */}
                    <div style={{
                        position: 'absolute',
                        bottom: 60,
                        right: 60,
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#25D366',
                        color: 'black',
                        padding: '15px 30px',
                        borderRadius: 20,
                        fontWeight: 900,
                        fontSize: 24,
                        boxShadow: '0 10px 40px rgba(37, 211, 102, 0.3)',
                        textTransform: 'uppercase',
                        zIndex: 20
                    }}>
                        💬 Message Seller
                    </div>

                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate image`, {
            status: 500,
        });
    }
}
