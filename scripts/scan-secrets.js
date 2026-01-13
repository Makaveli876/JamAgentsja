const fs = require('fs');
const path = require('path');

const FORBIDDEN_KEYS = ['SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY', 'SEED_SECRET'];
const SCAN_DIRS = ['src/app', 'src/components', 'src/hooks', 'src/lib'];

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if file is client-side
    const isClient = content.includes("'use client'") || content.includes('"use client"');

    for (const key of FORBIDDEN_KEYS) {
        if (content.includes(key)) {
            // It's technically okay in server components, but we want to be strict.
            // If it's a client file, it's a FAIL.
            // If it's a lib/util, we need to check if it's imported by client code (hard to do strictly via regex).
            // For now, allow in 'actions' and 'api' and 'lib/supabase-server.ts', 'lib/ai/gemini.ts'

            const relativePath = filePath.replace(/\\/g, '/');

            if (relativePath.includes('src/app/actions/') ||
                relativePath.includes('src/app/api/') ||
                relativePath.includes('src/lib/supabase-server.ts') ||
                relativePath.includes('src/app/api/seed/packs/route.ts')) {
                continue; // Allowed Server-Side Only paths
            }

            if (isClient) {
                console.error(`[CRITICAL] Secret ${key} found in Client Component: ${filePath}`);
                process.exit(1);
            } else {
                console.warn(`[WARNING] Secret ${key} found in potentially shared file: ${filePath}`);
            }
        }
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            scanFile(filePath);
        }
    }
}

console.log("🔒 Scanning for secrets leakage...");
SCAN_DIRS.forEach(d => {
    if (fs.existsSync(d)) {
        walkDir(d);
    } else {
        console.log(`Changes: Skipping missing directory: ${d}`);
    }
});
console.log("✅ Scan complete.");
