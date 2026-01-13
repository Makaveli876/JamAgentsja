"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/ratelimit";
import { getSeller } from "./seller";

/**
 * Adds a document to the seller's vault.
 */
export async function addVaultDoc(deviceId: string, content: string, title?: string) {
    // 1. Validate
    if (!deviceId || !content) return { success: false, error: "Missing data" };

    // 2. Identity Check
    const seller = await getSeller(deviceId);
    if (!seller) return { success: false, error: "Seller profile not found. Complete onboarding first." };

    // 3. Rate Limit
    const { allowed } = await checkRateLimit('device', deviceId, 'add_doc');
    // Using loose limit for now, maybe 'create_listing' quota or separate?
    // Let's assume high limit for docs (e.g. 50/day).
    if (!allowed) return { success: false, error: "Rate limit exceeded" };

    // 4. Insert
    const { data, error } = await supabaseServer
        .from('seller_docs')
        .insert({
            seller_id: seller.id,
            content: content,
            title: title || 'Quick Note',
            source_type: 'manual_entry',
            status: 'active' // Ready for RAG
        })
        .select()
        .single();

    if (error) {
        console.error("Add Doc Error:", error);
        return { success: false, error: "Failed to save document" };
    }

    return { success: true, doc: data };
}

/**
 * Deletes a document.
 */
export async function deleteVaultDoc(deviceId: string, docId: string) {
    const seller = await getSeller(deviceId);
    if (!seller) return { success: false, error: "Unauthorized" };

    const { error } = await supabaseServer
        .from('seller_docs')
        .delete()
        .eq('id', docId)
        .eq('seller_id', seller.id); // Strict ownership check

    if (error) return { success: false, error: "Failed to delete" };
    return { success: true };
}

/**
 * Gets all docs for a seller.
 */
export async function getVaultDocs(deviceId: string) {
    const seller = await getSeller(deviceId);
    if (!seller) return [];

    const { data } = await supabaseServer
        .from('seller_docs')
        .select('*')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

    return data || [];
}
