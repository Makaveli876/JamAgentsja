
import fetch from 'node-fetch';

const BASE = 'https://www.jamagents.com';

async function probe(method, path, body = null) {
    try {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);

        console.log(`\n--- PROBE: ${method} ${path} ---`);
        const res = await fetch(`${BASE}${path}`, opts);
        console.log(`Status: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log(`Body: ${text.substring(0, 300)}...`);
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

async function run() {
    // Check AI (Creative) - Requires GEMINI_API_KEY but maybe not DB?
    // Wait, limit check runs BEFORE controller logic. So rate limiter runs first.
    // If Rate Limiter fails closed, then AI Creative will ALSO return 429.
    await probe('POST', '/api/ai/creative', { topic: "test" });

    // Check DB Direct (Item Slug) - Should return 404 if DB works (and slug missing), or 500 if DB unreachable.
    await probe('GET', '/item/non-existent-slug-12345');
}

run();
