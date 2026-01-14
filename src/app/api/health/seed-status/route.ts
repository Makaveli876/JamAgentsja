
import { NextResponse } from "next/server";
import { supabaseServer, usingServiceRole } from "@/lib/supabase-server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const secret = request.headers.get('x-health-secret');
    const validSecret = process.env.HEALTH_SECRET;

    if (!secret || secret !== validSecret) {
        return new NextResponse("Not Found", { status: 404 });
    }

    const { count, error } = await supabaseServer
        .from('pack_templates')
        .select('*', { count: 'exact', head: true });

    // Optional: Get last slug for extra proof
    const { data: last } = await supabaseServer
        .from('pack_templates')
        .select('title')
        .order('id', { ascending: false })
        .limit(1)
        .single();

    return NextResponse.json({
        packTemplatesCount: count,
        lastTemplateTitle: last?.title || null,
        usingServiceRole,
        dbError: error ? error.message : null
    });
}
