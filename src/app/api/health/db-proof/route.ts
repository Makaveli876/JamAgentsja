
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Opt out of caching
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Auth Gate (Same as /api/health/env)
    const secret = request.headers.get('x-health-secret');
    const validSecret = process.env.HEALTH_SECRET;

    if (!secret) return new NextResponse("Not Found", { status: 404 });
    if (!validSecret || secret !== validSecret) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 2. Query Params
    const { searchParams } = new URL(request.url);
    const runKey = searchParams.get('runKey'); // e.g. "10.0.0.601"

    // 3. Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        return new NextResponse(JSON.stringify({ error: "DB Config Missing" }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Execute Queries
    try {
        // A. Pack Templates Count
        const { count: packsCount, error: packsError } = await supabase
            .from('pack_templates')
            .select('*', { count: 'exact', head: true });

        // B. Usage Limits (if key provided)
        let usageData = null;
        if (runKey) {
            const { data, error: usageError } = await supabase
                .from('usage_limits')
                .select('count, limit, blocked_until')
                .eq('key_value', `${runKey}-default_salt`) // Assuming default_salt from rate limit logic
                .eq('action_type', 'ai_grounded')
                .single();

            if (!usageError) usageData = data;
        }

        return NextResponse.json({
            ok: true,
            packs_count: packsCount,
            usage_data: usageData,
            env: process.env.NODE_ENV
        });

    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
