
import { NextRequest, NextResponse } from "next/server";
import { creativeModel } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/ratelimit";
import { getIpHash } from "@/lib/security";

/**
 * POST /api/ai/creative
 * Generates viral marketing variations for a listing.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, intent, price, deviceId } = body;

        // 1. Rate Limit
        const key = deviceId || await getIpHash();
        const { allowed, resetTime } = await checkRateLimit(deviceId ? 'device' : 'ip', key, 'ai_creative');

        if (!allowed) {
            return NextResponse.json(
                { error: `Daily limit reached. Resets in ${Math.ceil(((resetTime?.getTime() || 0) - Date.now()) / 60000)} mins.` },
                { status: 429 }
            );
        }

        // 2. Prompt
        const prompt = `
        You are a top-tier viral marketing expert for the Jamaican informal economy.
        Generate 3 distinct "Status Flyer" variations for this item:
        Item: "${title}"
        Intent: "${intent}"
        Price: "${price}"

        Styles:
        1. HYPE (Exciting, emojis, urgent)
        2. LUXURY (Minimal, premium, professional)
        3. ROGUE (Street smart, direct, witty)

        Return JSON ONLY:
        {
            "variations": [
                { "style": "HYPE", "headline": "...", "subtext": "...", "cta": "..." },
                { "style": "LUXURY", "headline": "...", "subtext": "...", "cta": "..." },
                { "style": "ROGUE", "headline": "...", "subtext": "...", "cta": "..." }
            ]
        }
        `;

        const result = await creativeModel.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Safe parse
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleanedText);

        return NextResponse.json({ success: true, data: json });

    } catch (e: any) {
        console.error("AI Creative Error:", e);
        return NextResponse.json({ success: false, error: e.message || "AI Error" }, { status: 500 });
    }
}
