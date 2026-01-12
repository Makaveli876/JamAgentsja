const fs = require('fs');
const path = '.env.local';

try {
    const buffer = fs.readFileSync(path);
    console.log('File size:', buffer.length);
    console.log('First 4 bytes:', buffer.subarray(0, 4).toString('hex'));

    const content = buffer.toString('utf8');
    console.log('UTF-8 Preview:', content.substring(0, 50).replace(/\n/g, '\\n'));

    if (content.indexOf('\0') !== -1) {
        console.log("⚠️  NULL BYTES DETECTED! Likely UTF-16.");
    }

    const content16 = buffer.toString('utf16le');
    if (content16.includes('GEMINI_API_KEY')) {
        console.log("✅ Found key when decoded as UTF-16LE.");
    }
} catch (e) {
    console.error(e);
}
