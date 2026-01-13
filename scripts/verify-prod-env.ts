
import fetch from 'node-fetch';
import fs from 'fs';

const PROD_URL = 'https://jamagents.com';
const ENV_ENDPOINT = `${PROD_URL}/api/health/env`;

async function checkEnv() {
    console.log(`Checking ${ENV_ENDPOINT}...`);
    try {
        const res = await fetch(ENV_ENDPOINT);
        if (res.status !== 200) {
            console.error(`FAILED: Status ${res.status}`);
            process.exit(1);
        }
        const json = await res.json();
        console.log("ENV_JSON:", JSON.stringify(json, null, 2));

        const missing = [];
        if (!json.hasServiceRole) missing.push('SUPABASE_SERVICE_ROLE_KEY');
        if (!json.hasIpSalt) missing.push('IP_SALT');
        if (json.siteUrl === 'MISSING' || !json.siteUrl?.includes('jamagents.com')) missing.push('NEXT_PUBLIC_SITE_URL');

        if (missing.length > 0) {
            console.error(`\nSTOP. Missing Critical Env Vars in Production:\n- ${missing.join('\n- ')}`);
            process.exit(1);
        } else {
            console.log("\n✅ Environment Check PASSED.");
        }
    } catch (e) {
        console.error(`Error: ${e.message}`);
        process.exit(1);
    }
}

checkEnv();
