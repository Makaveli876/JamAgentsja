
import fetch from 'node-fetch';

const SEED_SECRET = '9f3c7a1b6d48e2f0c5a917d4b8e06c1f7a2d9c4e0b6f1d8a3c5e7b2f9a4d6c1e';
const HEALTH_SECRET = 'jam_agents_health_2026';
const BASE = 'https://jamagents.com';

async function verify() {
    console.log("=== RUN 702: SEED DATA VERIFICATION ===");

    // 1. Trigger Seed
    console.log("1. Triggering Seed...");
    const s = await fetch(`${BASE}/api/seed/packs`, { headers: { 'x-seed-secret': SEED_SECRET } });
    console.log(`   Status: ${s.status}`);
    if (s.status === 200) {
        console.log(`   Response:`, await s.json());
    } else {
        console.log(`   Error:`, await s.text());
    }

    // 2. Check Count
    console.log("\n2. Checking DB Count...");
    const db = await fetch(`${BASE}/api/health/db-proof`, {
        headers: { 'x-health-secret': HEALTH_SECRET }
    });

    if (db.status === 200) {
        const body = await db.json();
        console.log("   DB Proof:", JSON.stringify(body, null, 2));
        if (body.packs_count > 0) {
            console.log("\n✅ SUCCESS: Packs Seeded!");
        } else {
            console.log("\n❌ FAILURE: Count is still 0.");
        }
    } else {
        console.log(`   DB Proof Failed: ${db.status}`);
    }
}

verify();
