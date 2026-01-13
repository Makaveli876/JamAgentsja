
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    console.log("Checking 'usage_limits' table...");

    // Try to select
    const { data, error } = await supabase.from('usage_limits').select('*').limit(5);

    if (error) {
        console.error("Error accessing table:", error);
    } else {
        console.log("Table exists. Rows found:", data?.length);
        console.log("Sample:", data);
    }

    // Check if we can insert
    const start = new Date().toISOString();
    const { error: insertError } = await supabase.from('usage_limits').insert({
        key_type: 'debug',
        key_value: 'test',
        action_type: 'ai_grounded', // Ensure this matches enum
        count: 1,
        limit: 100,
        window_start: start
    });

    if (insertError) {
        console.error("Insert Check Failed:", insertError);
    } else {
        console.log("Insert Check Passed.");
    }
}

check();
