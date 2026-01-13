"use server";

import { supabase } from "@/lib/supabase";

export async function saveListing(formData: {
    title: string;
    price: string;
    phone: string;
    location: string;
    style: string; // mapped from visual_style
    photo_url?: string;
    slug?: string;
    status?: string;
}) {
    // Slug Generation: Use provided slug or generate one
    let slug = formData.slug;
    if (!slug) {
        // Example: "Honda Civic" -> "hondacivic-482"
        const sanitizedTitle = formData.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomNum = Math.floor(Math.random() * 10000);
        slug = `${sanitizedTitle}-${randomNum}`;
    }

    // Payload: Map to exact Supabase columns
    const payload = {
        title: formData.title,
        price: formData.price,
        phone: formData.phone, // Mapping phone -> phone
        location: formData.location,
        visual_style: formData.style, // Mapping style -> visual_style
        slug: slug,
        photo_url: formData.photo_url || null,
        // status property removed to match current schema
    };

    const { data, error } = await supabase
        .from('listings')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Supabase Save Error:", error);
        return { success: false, error: error.message };
    }

    return { success: true, slug: data.slug };
}
