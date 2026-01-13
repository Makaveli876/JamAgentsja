
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // 1. Security Gate
    const isTestEnabled = process.env.ENABLE_TEST_ROUTES === 'true';
    if (process.env.NODE_ENV === 'production' && !isTestEnabled) {
        return new NextResponse("Not Found", { status: 404 });
    }
    if (process.env.DISABLE_TEST_ROUTES === 'true') {
        return new NextResponse("Not Found", { status: 404 });
    }

    const secret = req.headers.get('x-test-secret');
    if (secret !== process.env.TEST_SECRET && secret !== 'jam_agents_verify_2026') { // Allow hardcoded secret for script
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Logic (Mirroring upload-asset.ts)
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
        return NextResponse.json({ error: "Invalid Content-Type" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const MAX_BYTES = parseInt(process.env.MAX_UPLOAD_BYTES || '5242880'); // 5MB default

    if (file.size > MAX_BYTES) {
        return NextResponse.json(
            { error: "File too large", maxBytes: MAX_BYTES, receivedBytes: file.size },
            { status: 413 }
        );
    }

    return NextResponse.json({ success: true, size: file.size });
}
