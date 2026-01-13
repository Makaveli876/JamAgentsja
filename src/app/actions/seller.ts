"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { getIpHash } from "@/lib/security";

export interface SellerIdentity {
    deviceId: string;
    whatsapp?: string;
    displayName?: string;
    businessName?: string;
    parish?: string;
    category?: string;
}

/**
 * Upserts a seller based on Device ID.
 * This provides "Soft Identity" without requiring a login.
 */
export async function upsertSeller(identity: SellerIdentity): Promise<string | null> {
    if (!identity.deviceId) {
        console.error("UpsertSeller: No deviceId provided");
        return null;
    }

    const ipHash = await getIpHash();

    // Prepare payload
    // We only update fields if they are provided (merge strategy)
    // But for the initial "trap", we might just want to ensure the record exists.

    const payload: any = {
        device_id: identity.deviceId,
        updated_at: new Date().toISOString(),
        metadata: {
            last_ip_hash: ipHash,
            last_seen: new Date().toISOString()
        }
    };

    if (identity.whatsapp) payload.whatsapp_e164 = identity.whatsapp;
    if (identity.businessName) payload.business_name = identity.businessName;
    if (identity.parish) payload.parish = identity.parish;
    if (identity.category) payload.category_primary = identity.category;

    // We use onConflict on 'device_id'. 
    // Note: The `sellers` table usually needs a unique constraint on `device_id` for this to work perfectly 
    // or we query first.
    // Let's check schema: `device_id` is indexed, but did we make it UNIQUE?
    // Phase 1 SQL: `CREATE INDEX ...`. It did NOT say UNIQUE. 
    // We should probably check if it exists first to avoid duplicates if not unique. -> OR fix schema to be unique.
    // For now, I'll allow duplicates in theory but logic should try to find single.
    // Actually, "Soft Identity" implies one seller per device. I should enforce uniqueness or handled it.
    // Let's do a SELECT first, if exists UPDATE, else INSERT. Safe and simple.

    const { data: existing } = await supabaseServer
        .from('sellers')
        .select('id')
        .eq('device_id', identity.deviceId)
        .order('created_at', { ascending: false }) // Get most recent if dupes
        .limit(1)
        .single();

    if (existing) {
        // Update
        await supabaseServer
            .from('sellers')
            .update(payload)
            .eq('id', existing.id);

        return existing.id;
    } else {
        // Insert
        const { data: newSeller, error } = await supabaseServer
            .from('sellers')
            .insert([payload])
            .select('id')
            .single();

        if (error) {
            console.error("UpsertSeller Error:", error);
            return null;
        }
        return newSeller.id;
    }
}

/**
 * Retrieves seller profile by Device ID.
 */
export async function getSeller(deviceId: string) {
    if (!deviceId) return null;

    const { data: seller } = await supabaseServer
        .from('sellers')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false }) // Resilience against dups
        .limit(1)
        .single();

    return seller;
}
