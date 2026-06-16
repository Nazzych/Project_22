// src/lib/encoder.ts
const generateKey = async (typeValue: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.digest(
        'SHA-256',
        encoder.encode(typeValue)
    );

    return crypto.subtle.importKey(
        'raw',
        keyMaterial,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
};

// URL-safe Base64 helper (no slashes so it can be used in path segments)
const uint8ArrayToBase64Url = (arr: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
        binary += String.fromCharCode(arr[i]);
    }
    // standard base64
    const b64 = btoa(binary);
    // make URL-safe and remove padding
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64UrlToUint8Array = (b64Url: string): Uint8Array => {
    // restore standard base64 padding
    let b64 = b64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) {
        b64 += '='.repeat(4 - pad);
    }
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
};

export const encodePath = async (
    id: string | number,
    typeValue: string,
    slug: string
): Promise<string> => {
    const key = await generateKey(typeValue);
    const encoder = new TextEncoder();

    const encrypt = async (data: string): Promise<string> => {
        const iv = crypto.getRandomValues(new Uint8Array(3));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(data)
        );

        const combined = new Uint8Array(3 + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), 3);

        return uint8ArrayToBase64Url(combined);
    };

    const codedId = await encrypt(String(id));
    const codedType = await encrypt(typeValue);
    const codedSlug = await encrypt(slug || "share");

    return `${codedType}/${codedId}/${codedSlug}`;
};

export const decodePath = async (
    codedId: string,
    codedType: string,
    codedSlug: string,
    typeValue: string
): Promise<{ id: string; type: string; slug: string }> => {
    const key = await generateKey(typeValue);
    const decoder = new TextDecoder();

    const decrypt = async (coded: string): Promise<string> => {
        const data = base64UrlToUint8Array(coded);
        const iv = data.slice(0, 3);
        const encrypted = data.slice(3);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encrypted
        );

        return decoder.decode(decrypted);
    };

    const [id, type, slug] = await Promise.all([
        decrypt(codedId),
        decrypt(codedType),
        decrypt(codedSlug)
    ]);

    return { type, id, slug };
};