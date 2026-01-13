
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BASE = 'https://jamagents.com';
const SEED_SECRET = process.env.SEED_SECRET || 'jam_agents_seed_2026'; // Fallback if local env missing

async function run() {
    console.log(`\n=== STEP 2: VERIFY SEED CONTRACT ===`);
    console.log(`Target: ${BASE}/api/seed/packs (GET)`);
    console.log(`Using Secret: ${SEED_SECRET.substring(0, 4)}...`);

    // Case 1: No Secret
    const r1 = await fetch(`${BASE}/api/seed/packs`);
    console.log(`[Case 1] No Secret: Status ${r1.status}`);

    // Case 2: Wrong Secret
    const r2 = await fetch(`${BASE}/api/seed/packs`, { headers: { 'x-seed-secret': 'wrong' } });
    console.log(`[Case 2] Wrong Secret: Status ${r2.status}`);

    // Case 3: Correct Secret
    const r3 = await fetch(`${BASE}/api/seed/packs`, { headers: { 'x-seed-secret': SEED_SECRET } });
    console.log(`[Case 3] Correct Secret: Status ${r3.status}`);

    if (r3.status === 200) {
        const json = await r3.json();
        console.log(`SUCCESS Body: ${JSON.stringify(json)}`);
    } else {
        const text = await r3.text();
        console.log(`FAILURE Body: ${text.substring(0, 100)}`);
        // Diagnosis
        if (r3.status === 401) console.log("DIAGNOSIS: Secret Mismatch. Check Vercel Env Vars.");
        if (r3.status === 404) console.log("DIAGNOSIS: DISABLE_SEED_ROUTES=true in Prod.");
    }
}

run();
