"use server";

import { supabaseServer } from "@/lib/supabase-server";

// Schema from db_schema.md:
// pack_templates ( id, title, description, vertical, template_data (jsonb), is_active )

export async function seedPackTemplates() {
    let insertedCount = 0;
    const errors: string[] = [];

    // 1. Get Before Count
    const { count: beforeCount, error: countError } = await supabaseServer
        .from('pack_templates')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        return { success: false, error: `Pre-flight count failed: ${countError.message}` };
    }

    const templates = [
        {
            title: 'Restaurant Launch Pack',
            description: 'Menu, Dish Highlight, and "Open Now" Status.',
            vertical: 'food',
            template_data: {
                icon: 'Utensils',
                prompts: [
                    { type: 'menu', day: 'Today', instructions: 'Generate a daily special menu' },
                    { type: 'dish', instructions: 'Highlight grid of 4 top items' },
                    { type: 'status', instructions: 'We are Open / Delivery Available' }
                ]
            }
        },
        {
            title: 'Service Pro Pack',
            description: 'Price List, Before/After, and Booking Info.',
            vertical: 'service',
            template_data: {
                icon: 'Briefcase',
                prompts: [
                    { type: 'list', title: 'Services', instructions: 'Bulleted list of services & prices' },
                    { type: 'status', instructions: 'Slots available for tomorrow' }
                ]
            }
        }
    ];

    // Safe Seed
    for (const t of templates) {
        const { data: existing } = await supabaseServer
            .from('pack_templates')
            .select('id')
            .eq('title', t.title)
            .single();

        if (!existing) {
            const { error } = await supabaseServer.from('pack_templates').insert({
                title: t.title,
                description: t.description,
                vertical: t.vertical,
                template_data: t.template_data,
                is_active: true
            });

            if (error) {
                console.error("Seed Insert Error:", error);
                errors.push(`${t.title}: ${error.message}`);
            } else {
                insertedCount++;
            }
        }
    }

    // 2. Get After Count
    const { count: afterCount } = await supabaseServer
        .from('pack_templates')
        .select('*', { count: 'exact', head: true });

    return {
        success: errors.length === 0,
        inserted: insertedCount,
        beforeCount: beforeCount || 0,
        afterCount: afterCount || 0,
        idempotent: insertedCount === 0 && afterCount === beforeCount,
        errors: errors.length > 0 ? errors : undefined
    };
}

export async function getPackTemplates() {
    const { data } = await supabaseServer
        .from('pack_templates')
        .select('*')
        .eq('is_active', true);
    return data || [];
}
