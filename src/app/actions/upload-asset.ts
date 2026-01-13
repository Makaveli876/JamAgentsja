"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { checkRateLimit, getIP } from "@/lib/ratelimit";
import { headers } from 'next/headers';

/**
 * Server Action to upload flyer assets.
 * Securely handles storage writes and enforces rate limits.
 */
export async function uploadFlyerAsset(formData: FormData) {
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string;
    const deviceId = formData.get('deviceId') as string;

    if (!file || !slug) {
        return { success: false, error: "Missing file or slug" };
    }

    // 0. Validation (Security)
    const MAX_BYTES = parseInt(process.env.MAX_UPLOAD_BYTES || '5242880');
    if (file.size > MAX_BYTES) {
        return { success: false, error: `File too large (Max ${Math.floor(MAX_BYTES / 1024 / 1024)}MB)` };
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        return { success: false, error: "Invalid file type (PNG/JPG/WEBP only)" };
    }

    // 1. Rate Limit Check (Dual Signal)
    const ip = await getIP();

    // IP Limit
    const ipLimit = await checkRateLimit('ip', ip, 'upload_image');
    if (!ipLimit.allowed) {
        return {
            success: false,
            error: `Upload limit exceeded. Reset in ${Math.ceil(((ipLimit.resetTime?.getTime() || 0) - Date.now()) / 60000)} mins.`
        };
    }

    // Device Limit (if provided)
    if (deviceId) {
        const deviceLimit = await checkRateLimit('device', deviceId, 'upload_image');
        if (!deviceLimit.allowed) {
            return {
                success: false,
                error: `Upload limit exceeded. Reset in ${Math.ceil(((deviceLimit.resetTime?.getTime() || 0) - Date.now()) / 60000)} mins.`
            };
        }
    }

    try {
        const fileName = `${slug}.png`; // Simple naming for now: slug defines functionality

        const path = `${slug}-${Date.now()}.png`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabaseServer
            .storage
            .from('flyer-images')
            .upload(path, buffer, {
                contentType: 'image/png',
                upsert: false // Prevent overwrite of same timestamp (unlikely)
            });

        if (error) {
            console.error("Storage Upload Error:", error);
            return { success: false, error: "Storage upload failed" };
        }

        // Get Public URL
        const { data: { publicUrl } } = supabaseServer
            .storage
            .from('flyer-images')
            .getPublicUrl(path);

        return { success: true, publicUrl };

    } catch (e) {
        console.error("Upload Action Error:", e);
        return { success: false, error: "Server upload error" };
    }
}
