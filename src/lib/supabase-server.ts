import { createClient } from '@supabase/supabase-js';

// This client is for Server Components and Server Actions
// It can use the Service Role Key if available for admin tasks,
// otherwise it falls back to the Anon Key for standard operations.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Strict Check: Do we have the Service Role Key?
export const usingServiceRole = !!supabaseServiceKey;

if (!supabaseUrl) {
    console.warn("Supabase URL Missing!");
}

// Fallback to Anon if Service Role missing (but log warning)
const apiKey = supabaseServiceKey || supabaseAnonKey;

if (!apiKey) {
    console.warn("No Supabase API Key found!");
}

export const supabaseServer = createClient(supabaseUrl!, apiKey!);
