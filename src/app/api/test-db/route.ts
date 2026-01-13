import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
    try {
        const { data, error, count } = await supabaseServer
            .from('listings')
            .select('*', { count: 'exact', head: true });

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Connected to Supabase successfully',
            projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            listingCount: count
        });
    } catch (err) {
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
