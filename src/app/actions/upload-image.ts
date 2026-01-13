"use server";

import { createClient } from "@supabase/supabase-js";

// Initialize Admin Client (Service Role)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function uploadImageServer(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    const file = formData.get("file") as File;
    const slug = formData.get("slug") as string;

    if (!file || !slug) {
        return { success: false, error: "Missing file or slug" };
    }

    try {
        // 1. Auto-Create Bucket (Fail-Safe)
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("flyer-images");

        if (bucketError && bucketError.message.includes("not found")) {
            console.log("[Ghost Upload] Creating bucket 'flyer-images'...");
            await supabase.storage.createBucket("flyer-images", { public: true });
        }

        // 2. Prepare Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Determine extension
        const ext = file.name.split('.').pop() || 'png';
        const filePath = `${slug}/hero.${ext}`;

        // 3. Upload with Admin Privileges (Bypasses RLS)
        const { error: uploadError } = await supabase.storage
            .from("flyer-images")
            .upload(filePath, buffer, {
                contentType: file.type || 'image/png',
                upsert: true
            });

        if (uploadError) {
            console.error("[Ghost Upload] Upload failed:", uploadError);
            return { success: false, error: uploadError.message };
        }

        // 4. Get Public URL
        const { data: urlData } = supabase.storage
            .from("flyer-images")
            .getPublicUrl(filePath);

        return { success: true, url: urlData.publicUrl };

    } catch (error: any) {
        console.error("[Ghost Upload] Critical error:", error);
        return { success: false, error: error.message };
    }
}
