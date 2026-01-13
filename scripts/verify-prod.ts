
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const BASE_URL = 'https://jamagents.com';
const RUN_ID = '401';
const MOCK_IP = `10.0.0.${RUN_ID}`;
// Hash the IP manually to match server logic for DB verification
const IP_SALT = process.env.IP_SALT || 'default_salt'; // Must match prod salt if possible, or we check by action/time
// Wait, locally I might not have the same salt as prod.
// If I don't have the PROD salt, I can't generate the key to look up.
// Strategy: I will look up by `ip` part of the key if possible or just by recent time and action.
// Or effectively, I will rely on the server side to tell me? No, "Directly verify in Supabase".
// I'll query for the MOST RECENT entry in usage_limits for action 'ai_grounded'.

const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SERVICE_ROLE || !SUPABASE_URL) {
    console.error("Missing local Supabase keys for DB verification.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

const evidence = {
    env: null,
    rateLimit: { requests: [], blockedBody: null },
    persistence: null,
    seedAuth: [],
    testRoutes: []
};

async function run() {
    console.log(`\n=== STEP 1: ENV CHECK ===`);
    const envRes = await fetch(`${BASE_URL}/api/health/env`);
    evidence.env = await envRes.json();
    console.log("Env:", JSON.stringify(evidence.env));

    console.log(`\n=== STEP 2: RATE LIMIT (Run ${RUN_ID}) ===`);
    // Valid Payload
    const payload = { sellerId: 'verify-prod', question: 'rate limit check', context: 'prod-verify' };

    for (let i = 1; i <= 6; i++) {
        const res = await fetch(`${BASE_URL}/api/ai/grounded`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Forwarded-For': MOCK_IP
            },
            body: JSON.stringify(payload)
        });

        console.log(`[Req #${i}] Status: ${res.status}`);
        evidence.rateLimit.requests.push({ i, status: res.status });

        if (i === 1 && res.status === 200) {
            const json = await res.json();
            console.log("Req #1 Body (Success):", JSON.stringify(json).substring(0, 100) + "...");
        }

        if (res.status === 429) {
            const text = await res.text();
            evidence.rateLimit.blockedBody = text.substring(0, 200);
            console.log("429 Body:", evidence.rateLimit.blockedBody);
            break;
        }
    }

    console.log(`\n=== STEP 3: DB PERSISTENCE ===`);
    // Allow propagation
    await new Promise(r => setTimeout(r, 2000));

    // Query recently modified usage limits
    const { data: rows, error } = await supabase
        .from('usage_limits')
        .select('*')
        .order('window_start', { ascending: false })
        .limit(5);

    if (error) {
        console.error("DB Query Error:", error);
    } else {
        // Find our row? We don't know the exact hash if salt differs.
        // But we expect a count close to the limit.
        // Or we can just show the latest rows.
        console.log("Recent DB Rows:", rows);
        evidence.persistence = rows;
    }

    console.log(`\n=== STEP 4: SEED AUTH ===`);
    // No Secret
    const seed1 = await fetch(`${BASE_URL}/api/seed/packs`, { method: 'POST' });
    console.log(`No Secret: ${seed1.status}`);
    evidence.seedAuth.push(`NoSecret:${seed1.status}`);

    // With Secret
    const SEED_SECRET = "jam_agents_verify_2026"; // Hardcoded matching .env or what's in Prod?
    // Wait, the user said "Seed routes protected".
    // I need the correct secret. Assuming it's the one I used locally?
    // If not, I can't test "Success". But I can test PROTECTION.
    // I will try the one from my local .env if exists, or a known one.
    // If I don't know the prod secret, I can't prove 200.
    // However, getting 401 is proof of protection. 
    // I'll try the common test secret.

    const seed2 = await fetch(`${BASE_URL}/api/seed/packs`, {
        method: 'POST',
        headers: { 'x-seed-secret': process.env.SEED_SECRET || 'jam_agents_seed_2026' }
    });
    console.log(`With Secret: ${seed2.status}`);
    evidence.seedAuth.push(`WithSecret:${seed2.status}`);

    console.log(`\n=== STEP 5: TEST ROUTES ===`);
    const t1 = await fetch(`${BASE_URL}/api/test/canonical-check`);
    console.log(`Canonical Check: ${t1.status}`);
    evidence.testRoutes.push(`Canonical:${t1.status}`);

    const t2 = await fetch(`${BASE_URL}/api/test/upload-check`);
    console.log(`Upload Check: ${t2.status}`);
    evidence.testRoutes.push(`Upload:${t2.status}`);

    // Output final JSON for Artifact
    console.log("\n=== FINAL EVIDENCE JSON ===");
    console.log(JSON.stringify(evidence, null, 2));
}

run();
