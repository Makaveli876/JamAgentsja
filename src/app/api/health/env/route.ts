
import { NextResponse } from 'next/server';

// Opt out of caching entirely
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // LOCK DOWN: Require Secret
    const secret = request.headers.get('x-health-secret');
    const validSecret = process.env.SEED_SECRET; // Reuse Seed Secret for Admin Access

    if (!validSecret || secret !== validSecret) {
        // Return 404 in production to hide existence, 401 in dev
        return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json({
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasIpSalt: !!process.env.IP_SALT,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'MISSING',
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
}
