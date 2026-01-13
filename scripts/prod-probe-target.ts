
import fetch from 'node-fetch';

const BASE = 'https://www.jamagents.com';

async function probe() {
    try {
        console.log(`--- PROBE: POST /api/ai/grounded ---`);
        const res = await fetch(`${BASE}/api/ai/grounded`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: "test" })
        });
        console.log(`Status: ${res.status} ${res.statusText}`);
        console.log(`Headers:`, res.headers.raw());
        // Print body if error
        if (res.status !== 200) {
            const text = await res.text();
            console.log(`Body:`, text.substring(0, 500));
        }
    } catch (e) {
        console.error(e);
    }
}
probe();
