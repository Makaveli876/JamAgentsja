import fetch from 'node-fetch';
import FormData from 'form-data';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load Env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const LOG_PREFIX = '[GATE-VERIFY]';
const TEST_SECRET = process.env.TEST_SECRET || 'jam_agents_verify_2026'; // Env or Fallback
const SEED_SECRET = process.env.SEED_SECRET || 'test_seed_secret'; // Needed for checks

// Setup Supabase Admin for Persistence Proof
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
);

async function runGates() {
    console.log(`${LOG_PREFIX} Starting Verification against ${BASE_URL}\n`);

    const evidence = {
        build: 'PENDING',
        rateLimit: 'FAIL',
        uploadLimit: 'FAIL',
        canonical: 'FAIL',
        seedAuth: 'FAIL',
        details: {
            rateLimitBody: '',
            uploadBody: '',
            seedBodies: [] as string[],
            canonicalUrl: '',
            persistenceProof: ''
        }
    };

    // 1. CANONICAL OUTPUT PROOF
    console.log(`${LOG_PREFIX} Checking Canonical Output (/api/test/canonical-check)...`);
    try {
        const canonicalRes = await fetch(`${BASE_URL}/api/test/canonical-check`, {
            headers: { 'x-test-secret': TEST_SECRET }
        });

        if (canonicalRes.ok) {
            const data = await canonicalRes.json();
            console.log(`✅ Canonical Response: ${JSON.stringify(data)}`);
            evidence.details.canonicalUrl = data.url;
            if (data.url === 'https://jamagents.com' && !data.isLocalhost) {
                evidence.canonical = `PASS (Verified Output: ${data.url})`;
            } else {
                evidence.canonical = `FAIL (Got: ${data.url})`;
            }
        } else {
            console.log(`❌ Canonical Check Failed: Status ${canonicalRes.status}`);
            evidence.canonical = `FAIL (Status ${canonicalRes.status})`;
        }
    } catch (e) {
        console.log(`❌ Canonical Exception: ${e}`);
    }

    // 2. RATE LIMIT PROOF (Sequential + Persistence Check)
    console.log(`\n${LOG_PREFIX} Probing Rate Limits (Flooding /api/ai/grounded)...`);

    // Deterministic Run ID to ensure fresh keys
    const RUN_ID = process.env.RUN_ID || Math.floor(Math.random() * 900) + 100;
    console.log(`[INFO] RUN_ID: ${RUN_ID}`);

    // Construct Unique IP: 10.0.0.{RUN_ID}
    const TEST_IP = `10.0.0.${RUN_ID}`;
    const TEST_SALT = process.env.IP_SALT || 'default_salt';
    const EXPECTED_KEY_VALUE = Buffer.from(`${TEST_IP}-${TEST_SALT}`).toString('base64');

    console.log(`[INFO] Sending Stable Headers: x-forwarded-for=${TEST_IP}`);
    console.log(`[INFO] Expected DB Key: ${EXPECTED_KEY_VALUE}`);

    let rateLimitHit = false;
    let rateLimitBody = '';
    const FLOOD_COUNT = 20; // Should hit limit of 5 quickly

    for (let i = 0; i < FLOOD_COUNT; i++) {
        try {
            const res = await fetch(`${BASE_URL}/api/ai/grounded`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': TEST_IP,
                    'x-device-id': `test-device-${RUN_ID}`
                },
                body: JSON.stringify({
                    sellerId: "verify-gates-test",
                    question: "rate limit check",
                    context: "verify"
                })
            });

            // Log first 7 requests
            if (i < 7) {
                console.log(`[Req #${i + 1}] Status: ${res.status}`);
            }

            if (res.status === 429) {
                rateLimitHit = true;
                rateLimitBody = await res.text();
                // Ensure it's JSON
                try {
                    const json = JSON.parse(rateLimitBody);
                    evidence.details.rateLimitBody = JSON.stringify(json);
                } catch {
                    evidence.details.rateLimitBody = rateLimitBody;
                }

                console.log(`✅ Rate Limit Triggered at req #${i + 1} (Status 429)`);
                evidence.rateLimit = `PASS (Hit 429 at req #${i + 1})`;
                break;
            }

            // Wait 50ms
            await new Promise(r => setTimeout(r, 50));

        } catch (e) {
            // ignore fetch errors
        }
    }

    if (!rateLimitHit) {
        console.log(`\n❌ Rate Limit NOT hit after ${FLOOD_COUNT} requests.`);
        evidence.rateLimit = 'FAIL (No 429)';
    } else {
        console.log(`\n✅ 429 Body: ${evidence.details.rateLimitBody}`);

        // PERSISTENCE PROOF
        console.log(`\n${LOG_PREFIX} Verifying Persistence in DB...`);
        const { data, error } = await supabase
            .from('usage_limits')
            .select('*')
            .eq('key_value', EXPECTED_KEY_VALUE)
            .eq('action_type', 'ai_grounded')
            .order('window_start', { ascending: false })
            .limit(1)
            .single();

        if (data) {
            console.log(`✅ DB Persistence Confirmed: Count=${data.count}, Limit=${data.limit}`);
            console.log(`Row Snapshot: ${JSON.stringify({
                key_value: data.key_value,
                count: data.count,
                limit: data.limit,
                action_type: data.action_type
            })}`);
            evidence.details.persistenceProof = `Row found: Count=${data.count}`;
        } else {
            console.log(`❌ DB Persistence FAILED: Row not found for key ${EXPECTED_KEY_VALUE}`);
            evidence.rateLimit = 'FAIL (No DB Persistence)'; // Downgrade pass if no db proof
        }
    }

    // 3. UPLOAD LIMIT PROOF
    console.log(`\n${LOG_PREFIX} Probing Upload Limits (/api/test/upload-check)...`);

    const hugeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const form = new FormData();
    form.append('file', hugeBuffer, { filename: 'huge.png', contentType: 'image/png' });
    form.append('slug', 'test-slug');

    try {
        const uploadRes = await fetch(`${BASE_URL}/api/test/upload-check`, {
            method: 'POST',
            body: form,
            headers: { 'x-test-secret': TEST_SECRET, ...form.getHeaders() }
        });

        const status = uploadRes.status;
        const text = await uploadRes.text();
        evidence.details.uploadBody = text;

        if (status === 413) {
            console.log(`✅ Upload Limit Triggered (Status 413)`);
            evidence.uploadLimit = 'PASS (413)';
        } else if (status === 400 && text.includes("too large")) {
            console.log(`✅ Upload Limit Triggered (Status 400: ${text})`);
            evidence.uploadLimit = 'PASS (400 "File too large")';
        } else {
            console.log(`❌ Upload NOT blocked. Status: ${status}`);
            evidence.uploadLimit = `FAIL (Status ${status})`;
        }
    } catch (e) {
        console.log(`❌ Upload Exception: ${e}`);
    }

    // 4. SEED AUTH CHECK
    console.log(`\n${LOG_PREFIX} Probing Seed Route Auth...`);

    // Test 1: No Secret
    const resNoSecret = await fetch(`${BASE_URL}/api/seed/packs`);
    evidence.details.seedBodies.push(`NoSecret:${resNoSecret.status}`);

    // Test 2: With Secret
    const resAuth = await fetch(`${BASE_URL}/api/seed/packs`, {
        headers: { 'x-seed-secret': SEED_SECRET }
    });
    evidence.details.seedBodies.push(`WithSecret:${resAuth.status}`); // Don't log full body if huge

    // Test 3: Idempotent
    const resIdem = await fetch(`${BASE_URL}/api/seed/packs`, {
        headers: { 'x-seed-secret': SEED_SECRET }
    });
    evidence.details.seedBodies.push(`Idempotent:${resIdem.status}`);

    if ((resNoSecret.status === 401 || resNoSecret.status === 403) && resAuth.status === 200 && resIdem.status === 200) {
        console.log(`✅ Seed Route Logic Verified`);
        evidence.seedAuth = 'PASS (401 -> 200 -> 200)';
    } else {
        console.log(`❌ Seed Logic Failed: ${resNoSecret.status} -> ${resAuth.status} -> ${resIdem.status}`);
        evidence.seedAuth = `FAIL (${resNoSecret.status}/${resAuth.status}/${resIdem.status})`;
    }

    console.log('\n=== EVIDENCE BLOCK ===');
    console.table(evidence);
    console.log(`JSON_EVIDENCE:${JSON.stringify(evidence)}`);
    console.log('======================');
}

runGates().catch(e => console.error(e));
