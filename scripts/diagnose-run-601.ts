
import fetch from 'node-fetch';

const SEED_SECRET = 'seed_9f3c7a1b6d48e2f0c5a917d4b8e06c1f7a2d9c4e0b6f1d8a3c5e7b2f9a4d6c1e';
const HEALTH_SECRET = 'jam_agents_health_2026';
const BASE = 'https://jamagents.com';

async function diagnose() {
    console.log("DIAGNOSING SECRETS...");

    // 1. Check Health with HEALTH_SECRET (New Code)
    const h1 = await fetch(`${BASE}/api/health/env`, { headers: { 'x-health-secret': HEALTH_SECRET } });
    console.log(`Health + HEALTH_SECRET: ${h1.status}`);

    // 2. Check Health with SEED_SECRET (Old Code fallback?)
    const h2 = await fetch(`${BASE}/api/health/env`, { headers: { 'x-health-secret': SEED_SECRET } });
    console.log(`Health + SEED_SECRET: ${h2.status}`);

    // 3. Check Seed with SEED_SECRET
    const s1 = await fetch(`${BASE}/api/seed/packs`, { headers: { 'x-seed-secret': SEED_SECRET } });
    console.log(`Seed + SEED_SECRET: ${s1.status}`);

    // 4. Check Seed using Query Param (Backup)
    const s2 = await fetch(`${BASE}/api/seed/packs?secret=${SEED_SECRET}`);
    console.log(`Seed + Query Param: ${s2.status}`);
}

diagnose();
