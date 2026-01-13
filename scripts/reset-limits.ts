
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Resetting usage_limits...");
    const { error } = await supabase.from('usage_limits').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (error) {
        console.error("Error resetting:", error);
    } else {
        console.log("✅ usage_limits cleared.");
    }
}

run();
