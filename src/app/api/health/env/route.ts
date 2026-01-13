
import { NextResponse } from 'next/server';

// Opt out of caching entirely
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // LOCK DOWN: Require HEALTH_SECRET
    const secret = request.headers.get('x-health-secret');
    const validSecret = process.env.HEALTH_SECRET;

    // Case A: Missing Header -> 404 (Hidden)
    if (!secret) return new NextResponse("Not Found", { status: 404 });

    // Case B: Wrong Header -> 401 (Unauthorized)
    if (!validSecret || secret !== validSecret) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
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
