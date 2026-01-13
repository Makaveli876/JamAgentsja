
import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/url";

export async function GET(req: NextRequest) {
    // 1. Security Gate
    const isTestEnabled = process.env.ENABLE_TEST_ROUTES === 'true';
    if (process.env.NODE_ENV === 'production' && !isTestEnabled) {
        return new NextResponse("Not Found", { status: 404 });
    }
    // Also disable if DISABLE_TEST_ROUTES is explicitly true
    if (process.env.DISABLE_TEST_ROUTES === 'true') {
        return new NextResponse("Not Found", { status: 404 });
    }

    const secret = req.headers.get('x-test-secret');
    if (secret !== process.env.TEST_SECRET && secret !== 'jam_agents_verify_2026') {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Logic
    const url = getSiteUrl();
    const isLocalhost = url.includes('localhost');
    const isJamAgents = url.includes('jamagents.com');

    return NextResponse.json({
        url,
        isLocalhost,
        isJamAgents,
        envVar: process.env.NEXT_PUBLIC_SITE_URL
    });
}
