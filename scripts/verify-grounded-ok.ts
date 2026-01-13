
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const LOG_PREFIX = '[GATE-VERIFY-OK]';

async function verifyGroundedOK() {
    console.log(`${LOG_PREFIX} Checking /api/ai/grounded Happy Path...`);

    try {
        const res = await fetch(`${BASE_URL}/api/ai/grounded`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-forwarded-for': '1.2.3.4', // Valid IP
                'x-device-id': 'valid-device-1'
            },
            body: JSON.stringify({
                sellerId: "test-seller-id",
                question: "What are your hours?",
                context: "health_check"
            })
        });

        console.log(`[Req #1] Status: ${res.status}`);

        let json;
        try {
            json = await res.json();
            console.log(`[Req #1] Body:`, JSON.stringify(json, null, 2));
        } catch (e) {
            const text = await res.text();
            console.log(`[Req #1] Raw Body (Not JSON):`, text);
        }

        if (res.status === 200 && json && json.answer) {
            console.log(`✅ Happy Path Verified: 200 OK + Valid JSON`);
        } else {
            console.log(`❌ Happy Path FAILED: Expected 200 OK, got ${res.status}`);
            process.exit(1);
        }

    } catch (e) {
        console.error(`❌ Exception:`, e);
        process.exit(1);
    }
}

verifyGroundedOK();
