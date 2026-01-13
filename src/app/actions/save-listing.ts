"use server";

import { createClient } from '@supabase/supabase-js';

export async function saveListing(formData: {
    title: string;
    price: string;
    phone: string;
    location: string;
    style: string;
    photo_url?: string;
    slug?: string;
    status?: string;
    whatsapp?: string;
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

    // Slug Generation
    let slug = formData.slug;
    if (!slug) {
        const sanitizedTitle = formData.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomNum = Math.floor(Math.random() * 10000);
        slug = `${sanitizedTitle}-${randomNum}`;
    }

    // Payload: Mapped to "Forensic Audit" Schema
    // mismatch fixes: title->headline, phone->whatsapp, location->parish, style->theme
    const payload = {
        slug: slug,
        headline: formData.title,
        price: formData.price,
        whatsapp: formData.whatsapp || formData.phone, // Prioritize explicit whatsapp, fallback to phone
        parish: formData.location,
        theme: formData.style,
        image_url: formData.photo_url || null,
        status: formData.status || 'active',
        // Default/derived fields
        views: 0,
        shares: 0,
        subtext: '' // Required by schema but not in form?
    };

    console.log('PAYLOAD TO INSERT:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase
        .from('listings')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('=== SUPABASE ERROR ===');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
        return { success: false, error: error.message, code: error.code };
    }

    console.log('SUCCESS: Listing saved', data);
    return { success: true, slug: data.slug };
}
