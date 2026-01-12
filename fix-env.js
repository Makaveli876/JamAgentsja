const fs = require('fs');
const path = '.env.local';

try {
    const buffer = fs.readFileSync(path);
    // detected UTF-16LE from debug script
    const content = buffer.toString('utf16le');

    // Basic cleanup: trim and ensure no weird characters if possible, but toString('utf16le') usually handles the BOM 'fffe' by treating it as BOM.
    // Actually, node's utf16le might include the BOM as a character if not careful, or maybe not.
    // Let's just write securely.

    console.log("Read content length:", content.length);
    const cleanContent = content.trim();

    fs.writeFileSync(path, cleanContent, 'utf8');
    console.log("✅ Converted .env.local to UTF-8 successfully.");
} catch (e) {
    console.error("Failed to fix env:", e);
}
