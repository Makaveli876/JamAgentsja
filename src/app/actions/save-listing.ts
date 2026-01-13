"use server";

import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getIP } from '@/lib/ratelimit';
import { upsertSeller } from '@/app/actions/seller';
import { getSiteUrl } from '@/lib/url';

export async function saveListing(formData: {
    headline: string; // Changed from title to match Form State
    subtext?: string; // Added subtext
    price: string;
    phone: string;
    location: string;
    style: string;
    photo_url?: string;
    slug?: string;
    status?: string;
    whatsapp?: string;
    deviceId?: string; // Added for Seller Identity
}) {
    console.log('=== SAVE LISTING DEBUG ===');
    console.log('ENV CHECK:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    console.log('=== SAVE LISTING DEBUG ===');
    console.log('Received image_url:', formData.photo_url);
    console.log('image_url type:', typeof formData.photo_url);
    if (formData.photo_url) {
        console.log('image_url starts with:', formData.photo_url.substring(0, 50));
    }
    console.log('INPUT:', JSON.stringify(formData, null, 2));


    // Initialize Supabase with Service Role Key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("CRITICAL: Missing Supabase Environment Variables");
        return { success: false, error: "Server Configuration Error: Missing Database Keys" };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        }
    });

    // 1. Rate Limiting (Multi-Signal: Device + IP)
    const ip = await getIP();

    // Check IP Limit first (Universal)
    const ipLimit = await checkRateLimit('ip', ip, 'create_listing');
    if (!ipLimit.allowed) {
        console.warn(`Rate Limit Exceeded for IP ${ip}`);
        return {
            success: false,
            error: `Rate limit exceeded. Try again in ${Math.ceil(((ipLimit.resetTime?.getTime() || 0) - Date.now()) / 60000)} minutes.`
        };
    }

    // Check Device Limit (if provided)
    if (formData.deviceId) {
        const deviceLimit = await checkRateLimit('device', formData.deviceId, 'create_listing');
        if (!deviceLimit.allowed) {
            console.warn(`Rate Limit Exceeded for Device ${formData.deviceId}`);
            return {
                success: false,
                error: `Rate limit exceeded. Try again in ${Math.ceil(((deviceLimit.resetTime?.getTime() || 0) - Date.now()) / 60000)} minutes.`
            };
        }
    }

    // 2. Identity Linking (Upsert Seller)
    let sellerId = null;
    if (formData.deviceId) {
        sellerId = await upsertSeller({
            deviceId: formData.deviceId,
            whatsapp: formData.whatsapp || formData.phone,
            parish: formData.location
        });
    }

    // Slug Generation
    let slug = formData.slug;
    if (!slug) {
        const sanitizedTitle = formData.headline.toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomNum = Math.floor(Math.random() * 10000);
        slug = `${sanitizedTitle}-${randomNum}`;
    }

    // Payload: Mapped to "Forensic Audit" Schema
    const payload: any = {
        slug: slug,
        title: formData.headline,
        subtext: formData.subtext || '',
        price: formData.price,
        phone: formData.whatsapp || formData.phone,
        location: formData.location,
        visual_style: formData.style,
        image_url: formData.photo_url || null,
        status: formData.status || 'published', // Default to published for now
        seller_id: sellerId, // Link to seller if available
        // Default/derived fields
        views: 0,
        shares: 0,
        qr_target_url: `${getSiteUrl()}/item/${slug}`, // Canonical URL from logic
        trust_flags: {},
        stats: {}
    };

    console.log('PAYLOAD TO INSERT:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase
        .from('listings')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('=== SUPABASE ERROR ===', error);
        return { success: false, error: error.message, code: error.code };
    }

    console.log('SUCCESS: Listing saved', data);
    return { success: true, slug: data.slug };
}
