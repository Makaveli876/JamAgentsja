"use server";

import { supabaseServer } from "@/lib/supabase-server";

// Schema from db_schema.md:
// pack_templates ( id, title, description, vertical, template_data (jsonb), is_active )

export async function seedPackTemplates() {
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

    // Safe Seed: Check if exists by title, then insert if not.
    for (const t of templates) {
        const { data: existing } = await supabaseServer
            .from('pack_templates')
            .select('id')
            .eq('title', t.title)
            .single();

        if (!existing) {
            await supabaseServer.from('pack_templates').insert({
                title: t.title,
                description: t.description,
                vertical: t.vertical,
                template_data: t.template_data,
                is_active: true
            });
        }
    }

    return { success: true };
}

export async function getPackTemplates() {
    const { data } = await supabaseServer
        .from('pack_templates')
        .select('*')
        .eq('is_active', true);
    return data || [];
}
