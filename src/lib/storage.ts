import { supabase } from "@/lib/supabase";

/**
 * Uploads a flyer image (Hero Image) to Supabase Storage.
 * Follows the naming convention: flyer-images/{slug}/hero.{ext}
 */
export async function uploadFlyerImage(file: File | Blob, slug: string): Promise<string | null> {
    try {
        // Determine extension (default to png if blob)
        let fileExt = 'png';
        if (file instanceof File) {
            fileExt = file.name.split('.').pop() || 'png';
        } else if (file.type) {
            fileExt = file.type.split('/')[1] || 'png';
        }

        const fileName = `${slug}/hero.${fileExt}`;

        // Upload to Supabase
        const { error: uploadError } = await supabase.storage
            .from('flyer-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('[Storage] Upload failed:', uploadError.message);
            return null;
        }

        // Get Public URL
        const { data } = supabase.storage
            .from('flyer-images')
            .getPublicUrl(fileName);

        console.log('[Storage] Upload success:', data.publicUrl);
        return data.publicUrl;

    } catch (err) {
        console.error('[Storage] Unexpected error:', err);
        return null;
    }
}
