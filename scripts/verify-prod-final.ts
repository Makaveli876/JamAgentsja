
import fetch from 'node-fetch';

// Secrets (User Provided)
const SEED_SECRET = '9f3c7a1b6d48e2f0c5a917d4b8e06c1f7a2d9c4e0b6f1d8a3c5e7b2f9a4d6c1e';
const HEALTH_SECRET = 'jam_agents_health_2026';
const RUN_ID = '701';
const MOCK_IP = `10.0.0.${RUN_ID}`;
const BASE = 'https://jamagents.com';

async function run() {
    console.log(`\n=== PROD VERIFICATION RUN ${RUN_ID} ===`);

    // 1. Env/Health Lock Check
    console.log("1. Checking /api/health/env Lock...");
    const h1 = await fetch(`${BASE}/api/health/env`);
    console.log(`- No Header: ${h1.status} (Expect 404)`);

    const h3 = await fetch(`${BASE}/api/health/env`, { headers: { 'x-health-secret': HEALTH_SECRET } });
    console.log(`- Correct Header: ${h3.status} (Expect 200)`);
    if (h3.status === 200) console.log("  env data:", await h3.json());

    // 2. Rate Limit Flood
    console.log("\n2. Rate Limit Flood...");
    const payload = { sellerId: `verify-${RUN_ID}`, question: 'flood', context: 'prod' };
    let blocked = false;
    for (let i = 1; i <= 65; i++) {
        const res = await fetch(`${BASE}/api/ai/grounded`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': MOCK_IP },
            body: JSON.stringify(payload)
        });
        if (res.status === 429) {
            console.log(`✅ Blocked at Req #${i} (429)`);
            blocked = true;
            break;
        }
    }
    if (!blocked) console.log("❌ Failed to trigger Rate Limit");

    // 3. DB Proof (Hard Evidence)
    console.log("\n3. DB Proof (via /api/health/db-proof)...");
    const dbRes = await fetch(`${BASE}/api/health/db-proof`, {
        headers: { 'x-health-secret': HEALTH_SECRET }
    });
    if (dbRes.status === 200) {
        console.log("DB Proof:", await dbRes.json());
    } else {
        console.log(`DB Proof Failed: ${dbRes.status} - ` + await dbRes.text());
    }

    // 4. Seed Proof (Dual Path)
    console.log("\n4. Seed Route Proof...");

    // Path A: Header
    const s1 = await fetch(`${BASE}/api/seed/packs`, { headers: { 'x-seed-secret': SEED_SECRET } });
    console.log(`Path A (Header): ${s1.status}`);
    if (s1.status === 200) {
        console.log("  Body:", await s1.json());
    } else {
        // Only print if not 200 (to debug)
        const txt = await s1.text();
        console.log("  Body:", txt.substring(0, 50));
    }

    // Path B: Query Param
    const s2 = await fetch(`${BASE}/api/seed/packs?secret=${SEED_SECRET}`);
    console.log(`Path B (Query): ${s2.status}`);
    if (s2.status === 200) {
        console.log("  Body:", await s2.json());
    } else {
        const txt = await s2.text();
        console.log("  Body:", txt.substring(0, 50));
    }
}

run();
