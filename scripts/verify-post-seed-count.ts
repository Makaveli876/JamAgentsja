
import fetch from 'node-fetch';

const HEALTH_SECRET = 'jam_agents_health_2026';
const BASE = 'https://jamagents.com';

async function verifyCount() {
    console.log("Checking DB Count (Post-Seed)...");
    const res = await fetch(`${BASE}/api/health/db-proof`, {
        headers: { 'x-health-secret': HEALTH_SECRET }
    });

    if (res.status === 200) {
        const body = await res.json();
        console.log("DB Proof:", JSON.stringify(body, null, 2));
    } else {
        console.log(`Failed: ${res.status}`);
    }
}

verifyCount();
