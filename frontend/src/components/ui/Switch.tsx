import React, { forwardRef, useState, useCallback } from "react";
import { cn } from "../../lib/cn";
import { Check, X } from "lucide-react";

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    size?: "sm" | "md" | "lg";
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
    ({ checked = false, onChange, size = "md", className, ...props }, ref) => {
        const [isOn, setIsOn] = useState(checked);

        const toggle = useCallback(() => {
            const newState = !isOn;
            setIsOn(newState);
            onChange?.(newState);
        }, [isOn, onChange]);

        const sizes = {
            sm: "w-10 h-5",
            md: "w-14 h-7",
            lg: "w-20 h-10"
        };

        return (
            <button
                ref={ref}
                type="button"
                onClick={toggle}
                className={cn(
                    "group relative rounded-full transition-all duration-300",
                    isOn ? "nz-bg-info" : "nz-bg-destructive",
                    sizes[size],
                    className
                )}
                {...props}
            >
                <span
                    className={cn(
                        "absolute inset-y-0 left-1 m-1 flex items-center justify-center rounded-full nz-background-primary transition-transform duration-300 group-hover:nz-background-secondary",
                        isOn ? "translate-x-full" : "translate-x-0",
                        size === "sm" ? "w-3 h-3" : size === "md" ? "w-5 h-5" : "w-8 h-8"
                    )}
                >
                    {isOn ? <Check className="w-3 h-3 text-blue-600" /> : <X className="w-3 h-3 text-gray-400" />}
                </span>
            </button>
        );
    }
);

Switch.displayName = "Switch";
