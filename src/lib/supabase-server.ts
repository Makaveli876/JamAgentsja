import { createClient } from '@supabase/supabase-js';

// This client is for Server Components and Server Actions
// It can use the Service Role Key if available for admin tasks,
// otherwise it falls back to the Anon Key for standard operations.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    // We don't throw here to avoid breaking build time static generation if envs are missing
    console.warn("Supabase Environment Variables Missing in Server Client!");
}

export const supabaseServer = createClient(supabaseUrl!, supabaseKey!);
