
import { createHash } from 'crypto';
import { headers } from 'next/headers';

/**
 * Generates a stable, privacy-preserving hash of the user's IP address.
 * Uses a salt from environment variables to prevent rainbow table attacks.
 */
export async function getIpHash(): Promise<string> {
    const headersList = await headers();
    let ip = headersList.get('x-forwarded-for') || '127.0.0.1';

    // Handle multiple IPs (x-forwarded-for: client, proxy1, proxy2)
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    const salt = process.env.IP_SALT || 'default-salt-do-not-use-in-prod';
    return createHash('sha256').update(`${ip}-${salt}`).digest('hex');
}
