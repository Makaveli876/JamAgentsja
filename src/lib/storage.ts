import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadFlyerImage(
    file: File | Blob,
    slug: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
    try {
        // Generate unique filename
        let fileExt = 'png';
        if (file instanceof File) {
            fileExt = file.name.split('.').pop() || 'png';
        } else if (file.type) {
            fileExt = file.type.split('/')[1] || 'png';
        }

        // Timestamp to prevent caching issues if re-uploaded
        const timestamp = Date.now();
        const fileName = `${slug}/hero-${timestamp}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('flyer-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type || 'image/png'
            });

        if (error) {
            console.error('Upload error:', error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('flyer-images')
            .getPublicUrl(fileName);

        return {
            success: true,
            publicUrl: urlData.publicUrl
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
