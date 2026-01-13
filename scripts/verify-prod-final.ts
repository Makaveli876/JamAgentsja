
import fetch from 'node-fetch';

// Secrets (User must set these in Vercel to match)
const SEED_SECRET = 'jam_agents_seed_2026';
const HEALTH_SECRET = 'jam_agents_health_2026';
const RUN_ID = '601';
const MOCK_IP = `10.0.0.${RUN_ID}`;
const BASE = 'https://jamagents.com';

async function run() {
    console.log(`\n=== PROD VERIFICATION RUN ${RUN_ID} ===`);

    // 1. Env/Health Lock Check
    console.log("1. Checking /api/health/env Lock...");
    const h1 = await fetch(`${BASE}/api/health/env`);
    console.log(`- No Header: ${h1.status} (Expect 404)`);

    const h2 = await fetch(`${BASE}/api/health/env`, { headers: { 'x-health-secret': 'wrong' } });
    console.log(`- Wrong Header: ${h2.status} (Expect 401)`);

    const h3 = await fetch(`${BASE}/api/health/env`, { headers: { 'x-health-secret': HEALTH_SECRET } });
    console.log(`- Correct Header: ${h3.status} (Expect 200)`);
    if (h3.status === 200) console.log("  env data:", await h3.json());


    // 2. Rate Limit Flood
    // Limit is default 60. We hit 65.
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
        if (i % 10 === 0) process.stdout.write(`${i}..`);
    }
    if (!blocked) console.log("❌ Failed to trigger Rate Limit (check DB connection or limit settings)");

    // 3. DB Proof (Hard Evidence)
    console.log("\n3. DB Proof (via /api/health/db-proof)...");
    const dbRes = await fetch(`${BASE}/api/health/db-proof?runKey=${MOCK_IP}`, {
        headers: { 'x-health-secret': HEALTH_SECRET }
    });
    if (dbRes.status === 200) {
        console.log("DB Proof:", await dbRes.json());
    } else {
        console.log(`DB Proof Failed: ${dbRes.status}`);
    }

    // 4. Seed Proof
    console.log("\n4. Seed Route Proof...");
    const s1 = await fetch(`${BASE}/api/seed/packs`, { headers: { 'x-seed-secret': SEED_SECRET } });
    // Should be 200 (Success) or 200 (Already Seeded)
    console.log(`Seed Status: ${s1.status}`);
    if (s1.status === 200) {
        console.log("Seed Body:", await s1.json());
    } else {
        console.log("Seed Failed:", await s1.text());
    }
}

run();
