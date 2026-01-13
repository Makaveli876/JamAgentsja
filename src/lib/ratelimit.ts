
import { supabaseServer } from '@/lib/supabase-server';

export type ActionType =
    | 'create_listing'
    | 'generate_asset'
    | 'ai_creative'
    | 'ai_grounded'
    | 'upload_image'
    | 'add_doc';

interface LimitConfig {
    limit: number;
    windowSeconds: number;
}

const LIMITS: Record<ActionType, LimitConfig> = {
    create_listing: { limit: 20, windowSeconds: 86400 }, // 20 per day
    generate_asset: { limit: 50, windowSeconds: 86400 }, // 50 per day
    ai_creative: { limit: 30, windowSeconds: 86400 },    // 30 per day
    ai_grounded: { limit: 60, windowSeconds: 86400 },    // 60 per day
    upload_image: { limit: 80, windowSeconds: 86400 },   // 80 per day
    add_doc: { limit: 50, windowSeconds: 86400 }         // 50 per day
};

// Helper to reliably extract IP
export async function getIP(): Promise<string> {
    const { headers } = await import('next/headers');
    const headersList = await headers();

    // Vercel / Standard Proxy Headers
    // Vercel / Standard Proxy Headers
    const xForwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');

    // Get first IP if comma separated
    const ip = xForwardedFor?.split(',')[0] || realIp || '127.0.0.1';

    // Hash IP for privacy (GDPR compliance) using Salt
    // Simple hash for speed (in prod use crypto)
    const salt = process.env.IP_SALT || 'default_salt';

    // DEBUG:
    // console.log(`[RateLimit] IP=${ip} Salt=${salt} XFF=${xForwardedFor}`);

    return Buffer.from(`${ip}-${salt}`).toString('base64');
}

/**
 * Checks if the action is allowed for the given key (IP/Device).
 * Returns success: true if allowed, false if blocked.
 */
export async function checkRateLimit(
    keyType: 'ip' | 'device' | 'session',
    keyValue: string,
    action: ActionType
): Promise<{ allowed: boolean; remaining: number; resetTime?: Date }> {
    const config = LIMITS[action];
    const now = new Date();

    // TEST OVERRIDE: Low limit for verification
    // Only applies if explicit ENABLE_TEST_ROUTES flag is on (safety)
    let effectiveLimit = config.limit;
    if (process.env.ENABLE_TEST_ROUTES === 'true' && action === 'ai_grounded' && process.env.AI_LIMIT_TEST) {
        effectiveLimit = parseInt(process.env.AI_LIMIT_TEST);
    }
    // Let's use "Floored Time Windows" (e.g. per day) for simplicity and DB performance.

    console.log(`[RateLimit] Checking: Key=${keyValue} Type=${keyType} Action=${action} Limit=${effectiveLimit} ServiceRole=${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);

    // Window Start = Floor(Now / WindowSeconds) * WindowSeconds
    const windowStartMs = Math.floor(now.getTime() / (config.windowSeconds * 1000)) * (config.windowSeconds * 1000);
    const windowStart = new Date(windowStartMs).toISOString();

    // Check existing usage
    const { data: usage, error } = await supabaseServer
        .from('usage_limits')
        .select('*')
        .eq('key_type', keyType)
        .eq('key_value', keyValue)
        .eq('action_type', action)
        .eq('window_start', windowStart)
        .single();

    // FAIL CLOSED: If DB is unreachable, we must BLOCK to prevent abuse.
    if (error && error.code !== 'PGRST116') {
        console.error('Rate Limit Check Error (Fail Closed):', error);
        return { allowed: false, remaining: 0 };
    }

    const currentCount = usage?.count || 0;

    if (currentCount >= effectiveLimit) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: new Date(windowStartMs + (config.windowSeconds * 1000))
        };
    }

    // Increment (Upsert)
    // Increment (Upsert)
    // We add .select() to verify the write actually happened (guard against silent RLS failures)
    const { data: written, error: upsertError } = await supabaseServer
        .from('usage_limits')
        .upsert({
            window_start: windowStart,
            key_type: keyType,
            key_value: keyValue,
            action_type: action,
            count: currentCount + 1,
            limit: effectiveLimit
        }, { onConflict: 'window_start,key_type,key_value,action_type' })
        .select()
        .single();

    if (upsertError || !written) {
        console.error('Rate Limit Update Error (Fail Closed):', upsertError || 'No data returned (Silent Policy Failure?)');
        return { allowed: false, remaining: 0 };
    }

    return {
        allowed: true,
        remaining: effectiveLimit - (currentCount + 1),
        resetTime: new Date(windowStartMs + (config.windowSeconds * 1000))
    };
}
