
import fetch from 'node-fetch';

const SEED_SECRET = process.env.SEED_SECRET || '9f3c7a1b6d48e2f0c5a917d4b8e06c1f7a2d9c4e0b6f1d8a3c5e7b2f9a4d6c1e';
const HEALTH_SECRET = process.env.HEALTH_SECRET || 'jam_agents_health_2026';
const BASE_URL = process.env.BASE_URL || 'https://jamagents.com';

async function run() {
    console.log(`\n🔍 VERIFYING SEED LOOP (Target: ${BASE_URL})\n`);

    // 1. Version Check
    const vRes = await fetch(`${BASE_URL}/api/health/version`, {
        headers: { 'x-health-secret': HEALTH_SECRET }
    });
    if (vRes.status !== 200) {
        console.error("❌ Version check failed:", vRes.status);
        process.exit(1);
    }
    const version = await vRes.json();
    console.log("✅ Version Verified:", version.gitSha);

    // 2. Before Count
    const bRes = await fetch(`${BASE_URL}/api/health/seed-status`, {
        headers: { 'x-health-secret': HEALTH_SECRET }
    });
    const before = await bRes.json();
    console.log("📊 Before Count:", before.packTemplatesCount);

    // 3. Trigger Seed
    console.log("🌱 Triggering Seed...");
    const sRes = await fetch(`${BASE_URL}/api/seed/packs`, {
        headers: { 'x-seed-secret': SEED_SECRET }
    });
    const seedBody = await sRes.json();

    if (sRes.status === 200) {
        console.log("✅ Seed Success:", seedBody.message);
    } else {
        console.log("⚠️ Seed Step Returned Error (Possible RLS/Schema):");
        console.log(JSON.stringify(seedBody, null, 2));
    }

    // 4. After Count
    const aRes = await fetch(`${BASE_URL}/api/health/seed-status`, {
        headers: { 'x-health-secret': HEALTH_SECRET }
    });
    const after = await aRes.json();
    console.log("📊 After Count:", after.packTemplatesCount);

    // 5. Evidence Block
    console.log("\n================ EVIDENCE ==================");
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        version: version.gitSha,
        usingServiceRole: after.usingServiceRole,
        beforeCount: before.packTemplatesCount,
        afterCount: after.packTemplatesCount,
        seedInserted: seedBody.stats?.inserted || 0,
        seedIdempotent: seedBody.stats?.idempotent,
        seedError: seedBody.error || null
    }, null, 2));
    console.log("============================================");

    if (after.packTemplatesCount > before.packTemplatesCount) {
        console.log("\n✅ PASS: Data increased.");
    } else if (seedBody.stats?.idempotent && after.packTemplatesCount > 0) {
        console.log("\n✅ PASS: Already seeded (Idempotent) and data verified.");
    } else {
        console.log("\n❌ FAIL: No data increase and no valid idempotent state.");
    }
}

run();
