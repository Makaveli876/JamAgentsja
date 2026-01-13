"use server";

import { supabaseServer as supabase } from "@/lib/supabase-server";

// Generic Event Logger
export async function logEvent(
    eventType: 'flyer_created' | 'share_attempt' | 'qr_scan' | 'contact_click',
    listingId?: string,
    slug?: string,
    metadata: any = {}
) {
    try {
        await supabase.from('events').insert({
            event_type: eventType,
            listing_id: listingId || null,
            slug: slug || null,
            metadata: metadata,
        });
        return { success: true };
    } catch (error) {
        console.error(`Event Log Error (${eventType}):`, error);
        return { success: false };
    }
}

// Specific Visitor Tracking (Kept for compatibility)
export async function trackVisit(listingId: string, slug: string) {
    try {
        await Promise.all([
            // 1. Log QR Scan
            logEvent('qr_scan', listingId, slug, { source: 'web_visit' }),

            // 2. Increment View Count (Best Effort)
            (async () => {
                const { data } = await supabase.from('listings').select('views').eq('id', listingId).single();
                if (data) {
                    await supabase.from('listings').update({ views: (data.views || 0) + 1 }).eq('id', listingId);
                }
            })()
        ]);
        return { success: true };
    } catch (error) {
        console.error("Tracking Error:", error);
        return { success: false };
    }
}
