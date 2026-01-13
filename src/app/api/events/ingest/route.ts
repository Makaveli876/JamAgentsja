
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getIpHash } from "@/lib/security";

/**
 * POST /api/events/ingest
 * Secure ingestion of client-side events.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { event_name, listing_id, seller_id, device_id, session_id, properties, slug } = body;

        // enrich
        const ipHash = await getIpHash();
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const referrer = req.headers.get('referrer') || 'unknown';

        const { error } = await supabaseServer
            .from('events')
            .insert({
                event_name,
                listing_id: listing_id || null,
                seller_id: seller_id || null,
                device_id: device_id || null,
                session_id: session_id || null,
                slug: slug || null,
                ip_hash: ipHash,
                user_agent: userAgent,
                referrer: referrer,
                metadata: properties || {}
            });

        if (error) {
            console.error("Event Ingest Error:", error);
            return NextResponse.json({ success: false, error: "Failed to log event" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Event Endpoint Error:", e);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
