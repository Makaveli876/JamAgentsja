
import { NextResponse } from "next/server";
import { seedPackTemplates } from "@/app/actions/packs";

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
        await seedPackTemplates();
        return NextResponse.json({ success: true, message: "Packs Seeded (Idempotent)" });
    } catch (e) {
        console.error("Seed Error:", e);
        return NextResponse.json({ success: false, error: "Failed to seed" }, { status: 500 });
    }
}
