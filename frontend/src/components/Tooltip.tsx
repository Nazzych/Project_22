import React, { useState, useRef } from "react";

export function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const ref = useRef<HTMLSpanElement>(null);

    return (
        <div className="relative inline-block">
            <span
                ref={ref}
                onMouseEnter={() => {
                    if (ref.current) {
                        const rect = ref.current.getBoundingClientRect();
                        setPos({ top: rect.top - 10, left: rect.left + rect.width / 2 });
                    }
                }}
                onMouseLeave={() => setPos(null)}
            >
                {children}
            </span>
            {pos && (
                <div
                    className="fixed nz-background-accent border rounded-md shadow-lg p-2 text-xs nz-text-foreground z-50"
                    style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -100%)" }}
                >
                    {text}
                </div>
            )}
        </div>
    );
}
