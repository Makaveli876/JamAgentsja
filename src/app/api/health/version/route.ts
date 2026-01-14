
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(request: Request) {
    const secret = request.headers.get('x-health-secret');
    const validSecret = process.env.HEALTH_SECRET;

    if (!secret || secret !== validSecret) {
        return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json({
        gitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
        nodeEnv: process.env.NODE_ENV,
        runtime: 'nodejs',
        timestamp: new Date().toISOString()
    });
}
