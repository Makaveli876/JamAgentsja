
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = 'https://jamagents.com';
const RUN_ID = '501';
const MOCK_IP = `10.0.0.${RUN_ID}`;
// Use local seed secret or default
const SEED_SECRET = process.env.SEED_SECRET || 'jam_agents_seed_2026';

const evidence = {
    healthLock: null,
    rateLimit: [],
    seedAuth: [],
    testRoutes: []
};

async function run() {
    console.log(`\n=== STEP 1: VERIFY HEALTH LOCK ===`);
    // 1. Without Header
    const h1 = await fetch(`${BASE_URL}/api/health/env`);
    console.log(`Health (No Header): ${h1.status}`); // Expect 404
    evidence.healthLock = `NoHeader:${h1.status}`;

    // 2. With Header (Should Work)
    const h2 = await fetch(`${BASE_URL}/api/health/env`, { headers: { 'x-health-secret': SEED_SECRET } });
    console.log(`Health (With Header): ${h2.status}`); // Expect 200
    if (h2.status === 200) evidence.healthLock += ` WithHeader:200`;
    else evidence.healthLock += ` WithHeader:${h2.status}`;

    console.log(`\n=== STEP 2: RATE LIMIT (Run ${RUN_ID}) ===`);
    const payload = { sellerId: 'verify-prod-501', question: 'final gate check', context: 'prod-verify' };

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
        evidence.rateLimit.push(res.status);
        if (res.status === 429) {
            const text = await res.text();
            console.log("429 Body:", text.substring(0, 100));
        }
    }

    console.log(`\n=== STEP 3: SEED AUTH ===`);
    const s1 = await fetch(`${BASE_URL}/api/seed/packs`);
    console.log(`Seed (No Secret): ${s1.status}`);
    evidence.seedAuth.push(`NoSecret:${s1.status}`);

    const s2 = await fetch(`${BASE_URL}/api/seed/packs`, { headers: { 'x-seed-secret': SEED_SECRET } });
    console.log(`Seed (With Secret): ${s2.status}`);
    evidence.seedAuth.push(`WithSecret:${s2.status}`);

    console.log(`\n=== STEP 4: TEST ROUTES ===`);
    const t1 = await fetch(`${BASE_URL}/api/test/canonical-check`);
    console.log(`Canonical Check: ${t1.status}`);
    evidence.testRoutes.push(`Canonical:${t1.status}`);

    console.log("\n=== FINAL VERDICT ===");
    console.log(JSON.stringify(evidence, null, 2));
}

run();
