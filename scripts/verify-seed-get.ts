
import fetch from 'node-fetch';

const BASE = 'https://jamagents.com';

async function verifySeed() {
    console.log("Checking Seed Route (GET)...");

    // 1. No Secret
    const r1 = await fetch(`${BASE}/api/seed/packs`);
    console.log(`No Secret: ${r1.status}`); // Expect 401

    // 2. With Secret
    // Note: Code checks query param 'secret' or header 'x-seed-secret'
    const secret = "jam_agents_verify_2026"; // Assuming I know the prod secret?
    // Actually, I don't know if "jam_agents_verify_2026" is the PROD secret.
    // I only know if it matches the *env var* in Vercel. 
    // If user provided the env vars, they probably used the same ones or I don't know them.
    // If I get 401 with this secret, it means "Protected". 
    // If I get 200, it means "Success".
    // "idempotent" means it won't break anything.

    const r2 = await fetch(`${BASE}/api/seed/packs`, {
        headers: { 'x-seed-secret': secret }
    });
    console.log(`With Secret: ${r2.status}`);

    if (r2.status === 200) {
        console.log("Body:", await r2.json());
    } else {
        console.log("Body:", await r2.text());
    }
}

verifySeed();
