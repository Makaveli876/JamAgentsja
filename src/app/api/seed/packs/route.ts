import { NextResponse } from "next/server";
import { seedPackTemplates } from "@/app/actions/packs";

// Enforce Node.js runtime to ensure process.env access to Service Role Key
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Feature Flag Check
    if (process.env.DISABLE_SEED_ROUTES === 'true') {
        return new NextResponse("Not Found", { status: 404 });
    }

    // 2. Auth Check
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret') || request.headers.get('x-seed-secret');
    const envSecret = process.env.SEED_SECRET;

    if (!envSecret || secret !== envSecret) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 3. Execute
    try {
        const result = await seedPackTemplates();

        if (!result.success) {
            console.error("Seed Action Failed:", result.errors);
            return NextResponse.json({
                success: false,
                error: "Seed Failed",
                details: result.errors
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Packs Seeded",
            stats: {
                inserted: result.inserted,
                before: result.beforeCount,
                after: result.afterCount,
                idempotent: result.idempotent
            }
        });

    } catch (e: any) {
        console.error("Seed Error:", e);
        return NextResponse.json({ success: false, error: e.message || "Failed to seed" }, { status: 500 });
    }
}
