
import { createClient } from '@supabase/supabase-js';

// For Server Actions, we should prefer the Service Role Key if available (for bypassing RLS), 
// but standard Anon Key works if RLS allows INSERTs (which it does).
// However, 'use server' files run in a Node environment where process.env is populated differently than client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase Environment Variables Missing in Server Action!");
}

export const supabase = createClient(supabaseUrl!, supabaseKey!);
