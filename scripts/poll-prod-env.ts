
import fetch from 'node-fetch';

const URL = 'https://www.jamagents.com/api/health/env';

async function poll() {
    console.log(`Polling ${URL}...`);
    for (let i = 0; i < 20; i++) {
        try {
            const res = await fetch(URL);
            if (res.status === 200) {
                const json = await res.json();
                console.log("SUCCESS:", JSON.stringify(json, null, 2));
                return;
            } else {
                console.log(`Attempt ${i + 1}: Status ${res.status}`);
            }
        } catch (e) {
            console.log(`Attempt ${i + 1}: Error ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 5000));
    }
    console.log("Timeout waiting for deployment.");
}

poll();
