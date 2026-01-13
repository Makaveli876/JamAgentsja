/**
 * Validates and normalizes Jamaican phone numbers.
 * Supports: 876XXXXXXX, 1876XXXXXXX, +1 (876) ...
 * Returns normalized format: 1876XXXXXXX
 */
export function validateJamaicaPhone(phone: string): {
    valid: boolean;
    normalized: string | null;
    error?: string;
} {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Jamaica patterns:
    // - 8765551234 (10 digits, starts with 876)
    // - 18765551234 (11 digits, starts with 1876)
    // - 11 digits starting with 1 (US/JA standard)

    if (digits.length === 10 && digits.startsWith('876')) {
        return { valid: true, normalized: `1${digits}` };
    }

    if (digits.length === 11 && digits.startsWith('1876')) {
        return { valid: true, normalized: digits };
    }

    if (digits.length === 7) {
        // Local number without area code — reject
        return {
            valid: false,
            normalized: null,
            error: 'Please include the 876 area code'
        };
    }

    return {
        valid: false,
        normalized: null,
        error: 'Enter a valid Jamaica phone number (876-XXX-XXXX)'
    };
}
