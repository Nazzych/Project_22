import { useState } from 'react';

export function useClipboard() {
    const [copied, setCopied] = useState(false);

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('❌ Clipboard copy failed:', error);
            setCopied(false);
        }
    };

    return { copied, copy };
}
