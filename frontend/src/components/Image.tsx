import React, { useState, ReactNode } from "react";
import { ImageOff, User } from "lucide-react";

// ==================== AVATAR ====================
interface AvatarProps {
    src?: string | null;
    alt?: string;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    className?: string;
    rounded?: "full" | "2xl" | "3xl";
}

export function Avatar({ 
    src, 
    alt = "Avatar", 
    size = "md", 
    className = "",
    rounded = "full"
}: AvatarProps) {
    const [error, setError] = useState(false);

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24",
        "2xl": "w-32 h-32",
        "3xl": "w-48 h-48"
    };

    const roundedClass = rounded === "full" ? "rounded-full" : `rounded-${rounded}`;

    return (
        <div className={`relative flex-shrink-0 overflow-hidden bg-zinc-800 ${sizeClasses[size]} ${roundedClass} ${className}`}>
            {!error && src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <User className="w-1/2 h-1/2 text-zinc-400" />
                </div>
            )}
        </div>
    );
}

// ==================== IMAGE (простий) ====================
interface ImageProps {
    src?: string | null;
    alt?: string;
    className?: string;
}

export function Image({ src, alt = "Image", className = "" }: ImageProps) {
    const [error, setError] = useState(false);

    return (
        <div className={`w-full h-full ${className}`}>
            {!error && src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 rounded">
                    <ImageOff className="w-12 h-12 text-zinc-400" />
                </div>
            )}
        </div>
    );
}

// ==================== IMAGE FALLBACK (з ініціалами) ====================
interface ImageFallbackProps {
    src?: string | null;
    alt?: string;
    title: string;
    className?: string;
    titleSize?: string;
    iconSize?: string;
    fallbackIcon?: ReactNode;
    fallbackClassName?: string;
}

export function ImageFallback({
    src,
    alt = "Image",
    title,
    className = "",
    titleSize = "text-5xl",
    iconSize = "w-10 h-10",
    fallbackIcon,
    fallbackClassName = ""
}: ImageFallbackProps) {
    const [error, setError] = useState(false);

    const getInitials = (text: string): string => {
        if (!text) return "?";
        const words = text.trim().split(/\s+/);
        return words.length >= 2 
            ? (words[0][0] + words[1][0]).toUpperCase() 
            : text[0].toUpperCase();
    };

    const initials = getInitials(title);

    return (
        <div className={`relative w-full h-full overflow-hidden bg-zinc-900 ${className}`}>
            {src && !error ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-800 via-fuchsia-800 to-pink-800 ${fallbackClassName}`}>
                    {fallbackIcon ? (
                        <div className={`flex items-center justify-center ${iconSize}`}>
                            {fallbackIcon}
                        </div>
                    ) : (
                        <span className={`font-black text-white/90 select-none ${titleSize}`}>
                            {initials}
                        </span>
                    )}
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                    <ImageOff className="w-12 h-12 text-zinc-400" />
                </div>
            )}
        </div>
    );
}