
import dotenv from 'dotenv';
import path from 'path';
import { checkRateLimit } from '../src/lib/ratelimit';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// FORCE TEST ENV
process.env.ENABLE_TEST_ROUTES = 'true';
process.env.AI_LIMIT_TEST = '5';
// Mock Service Key if missing (but it should be in .env.local)
// process.env.SUPABASE_SERVICE_ROLE_KEY = ... 

async function run() {
    console.log("--- DIRECT RATE LIMIT TEST ---");
    console.log("IP_SALT:", process.env.IP_SALT);
    console.log("Service Key Preset:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const KEY = "direct-test-key-1";
    const TYPE = "ip";

    for (let i = 1; i <= 10; i++) {
        const result = await checkRateLimit(TYPE, KEY, 'ai_grounded');
        console.log(`Req ${i}: Allowed=${result.allowed} Rem=${result.remaining}`);

        if (!result.allowed) {
            console.log("✅ Blocked correctly.");
            break;
        }
        // Artificial delay if needed
        await new Promise(r => setTimeout(r, 100));
    }
}

run().catch(console.error);
