import React, { useState } from "react";
import { ImageOff } from "lucide-react";

interface ImageProps {
    src: string;
    alt?: string;
}

export function Image({ src, alt = "Image" }: ImageProps) {
    const [error, setError] = useState(false);

    return (
        <div className="w-full h-full flex items-center justify-center">
            {!error ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center nz-bg-muted rounded">
                    <ImageOff />
                </div>
            )}
        </div>
    );
}
