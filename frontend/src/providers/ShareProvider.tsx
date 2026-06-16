import React, { createContext, useContext, useCallback } from 'react';
import { useToast } from '../providers/MessageProvider';
import { encodePath } from '../lib/encoder';

type ShareableType = 'post' | 'channel' | 'challenge' | 'course' | 'project';

interface ShareContextType {
    generateShareLink: (type: ShareableType, id: number | string, slug?: string) => Promise<string>;
    copyShareLink: (type: ShareableType, id: number | string, slug?: string, title?: string) => Promise<void>;
}

const ShareContext = createContext<ShareContextType | null>(null);

export const ShareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();

    const generateShareLink = useCallback(async (
        type: ShareableType, 
        id: number | string, 
        slug?: string
    ): Promise<string> => {
        const baseUrl = window.location.origin;
        const encoded = await encodePath(id, type, slug || 'share');
        return `${baseUrl}/s/${encoded}`;
    }, []);

    const copyShareLink = useCallback(async (
        type: ShareableType, 
        id: number | string, 
        slug?: string,
        title?: string
    ) => {
        try {
            const link = await generateShareLink(type, id, slug);
            await navigator.clipboard.writeText(link);
            showToast("info", "CLIPBOARD", `Link for - ${title || "None"} (${type}) copied to clipboard!`);
        } catch (err) {
            showToast("error", "Error generating share link", "Can't copy link into clipboard. Please try again later.");
        }
    }, [generateShareLink, showToast]);

    return (
        <ShareContext.Provider value={{ generateShareLink, copyShareLink }}>
            {children}
        </ShareContext.Provider>
    );
};

export const useShare = () => {
    const context = useContext(ShareContext);
    if (!context) throw new Error('useShare must be used within ShareProvider');
    return context;
};