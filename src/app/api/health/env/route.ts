
import { NextResponse } from 'next/server';

// Opt out of caching entirely
export const dynamic = 'force-dynamic';

export async function GET() {
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
