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

// Допоміжна функція для перетворення Uint8Array в base64
const uint8ArrayToBase64 = (arr: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
        binary += String.fromCharCode(arr[i]);
    }
    return btoa(binary);
};

export const encodePath = async (
    id: string | number,
    typeValue: string,
    slug: string
): Promise<string> => {
    const key = await generateKey(typeValue);
    const encoder = new TextEncoder();

    const encrypt = async (data: string): Promise<string> => {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(data)
        );

        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        return uint8ArrayToBase64(combined);
    };

    const codedId = await encrypt(String(id));
    const codedType = await encrypt(typeValue);
    const codedSlug = await encrypt(slug || "share");

    return `${codedId}/${codedType}/${codedSlug}`;
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
        const data = Uint8Array.from(atob(coded), c => c.charCodeAt(0));
        const iv = data.slice(0, 12);
        const encrypted = data.slice(12);

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

    return { id, type, slug };
};