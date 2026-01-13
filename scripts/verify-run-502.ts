
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE_URL = 'https://jamagents.com';
const RUN_ID = '502';
const MOCK_IP = `10.0.0.${RUN_ID}`;
const SEED_SECRET = process.env.SEED_SECRET || 'jam_agents_seed_2026';

const evidence = {
    healthLock: null,
    rateLimit: { total: 0, blockedAt: null, finalStatus: null },
    seedAuth: [],
    testRoutes: []
};

async function run() {
    console.log(`\n=== STEP 1: VERIFY HEALTH LOCK ===`);
    // Poll until 404 (Max 10 attempts)
    for (let i = 0; i < 10; i++) {
        const h1 = await fetch(`${BASE_URL}/api/health/env`);
        if (h1.status === 404) {
            console.log(`Health Locked (404) confirmed at attempt ${i + 1}`);
            evidence.healthLock = `NoHeader:404`;
            break;
        }
        console.log(`Waiting for deploy... Status: ${h1.status}`);
        await new Promise(r => setTimeout(r, 5000));
    }

    if (!evidence.healthLock) {
        console.log("Health Lock check failed (Deployment lag?). Proceeding anyway.");
        evidence.healthLock = "NoHeader:200(Failed)";
    } else {
        // Double check authorized access
        const h2 = await fetch(`${BASE_URL}/api/health/env`, { headers: { 'x-health-secret': SEED_SECRET } });
        evidence.healthLock += ` WithHeader:${h2.status}`;
    }

    console.log(`\n=== STEP 2: RATE LIMIT FLOOD (Run ${RUN_ID}) ===`);
    const payload = { sellerId: 'verify-prod-502', question: 'flood check', context: 'prod-verify' };

    // Default limit is 60. We send 70.
    for (let i = 1; i <= 70; i++) {
        const res = await fetch(`${BASE_URL}/api/ai/grounded`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Forwarded-For': MOCK_IP
            },
            body: JSON.stringify(payload)
        });

        evidence.rateLimit.total++;
        if (evidence.rateLimit.total % 10 === 0) console.log(`Sent ${i} requests...`);

        if (res.status === 429) {
            console.log(`✅ Rate Limit Triggered at Req #${i}`);
            evidence.rateLimit.blockedAt = i;
            evidence.rateLimit.finalStatus = 429;
            const text = await res.text();
            console.log("429 Body:", text.substring(0, 100));
            break;
        }
    }

    console.log(`\n=== STEP 3: SEED AUTH ===`);
    const s1 = await fetch(`${BASE_URL}/api/seed/packs`);
    evidence.seedAuth.push(`NoSecret:${s1.status}`);

    const s2 = await fetch(`${BASE_URL}/api/seed/packs`, { headers: { 'x-seed-secret': SEED_SECRET } });
    evidence.seedAuth.push(`WithSecret:${s2.status}`);

    console.log(`\n=== STEP 4: TEST ROUTES ===`);
    const t1 = await fetch(`${BASE_URL}/api/test/canonical-check`);
    evidence.testRoutes.push(`Canonical:${t1.status}`);

    console.log("\n=== FINAL VERDICT ===");
    console.log(JSON.stringify(evidence, null, 2));
}

run();
