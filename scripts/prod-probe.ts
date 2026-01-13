
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
        console.log(`Body: ${text.substring(0, 200)}...`); // Truncate
        console.log(`Headers:`, res.headers.raw());
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

async function run() {
    await probe('GET', '/');                         // Public Page
    await probe('POST', '/api/ai/grounded', { question: "test" }); // Target
    await probe('GET', '/api/ai/grounded');          // Method Check
    await probe('POST', '/api/ai/creative', { topic: "test" }); // Peer Route
    await probe('GET', '/api/health'); // Non-existent
}

run();
