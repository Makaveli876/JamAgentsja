
import { createClient } from '@supabase/supabase-js';

// Ensure these use the exact env variable names from .env.local
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
