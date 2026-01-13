import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Generates a URL-safe random ID (similar to nanoid).
 * Length defaults to 21.
 */
export function generateId(length = 21): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let result = '';
    const randomValues = new Uint32Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            result += chars[randomValues[i] % chars.length];
        }
    } else {
        // Fallback for server-side or older envs
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    return result;
}

/**
 * Retrieves or creates a persistent Device ID for soft identity.
 */
export function getDeviceId(): string {
    if (typeof window === 'undefined') return ''; // Server-safe

    const STORAGE_KEY = 'jam_agents_device_id';
    let deviceId = localStorage.getItem(STORAGE_KEY);

    if (!deviceId) {
        deviceId = generateId(32); // Long ID for security
        localStorage.setItem(STORAGE_KEY, deviceId);
    }

    return deviceId;
}
