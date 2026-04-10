import React, { forwardRef, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { File, Folder, Plus, Minus } from "lucide-react";
import { InputProps } from "../../types/componentsUI";


export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = "text", icon, buttonLabel = "Select", value, onChange, ...props }, ref) => {
        const fileInputRef = useRef<HTMLInputElement>(null);

        // Локальний стан тільки для number
        const [localNumberValue, setLocalNumberValue] = useState<number>(
            value !== undefined ? Number(value) : 0
        );

        // Синхронізація зі зовнішнім value
        React.useEffect(() => {
            if (type === "number" && value !== undefined) {
                setLocalNumberValue(Number(value));
            }
        }, [type, value]);

        // ===== NUMBER INPUT =====
        if (type === "number") {
            const handleIncrement = () => {
                const newValue = localNumberValue + 1;
                setLocalNumberValue(newValue);
                onChange?.({ target: { value: newValue.toString() } } as any);
            };

            const handleDecrement = () => {
                const newValue = Math.max(0, localNumberValue - 1);
                setLocalNumberValue(newValue);
                onChange?.({ target: { value: newValue.toString() } } as any);
            };

            return (
                <div className="relative w-full">
                    <div className="flex items-center nz-bg-input rounded-xl overflow-hidden focus-within:nz-ring transition-all border border-zinc-700">
                        <button
                            type="button"
                            onClick={handleDecrement}
                            className="px-4 py-3 hover:nz-background-primary transition text-zinc-400 hover:text-white disabled:opacity-50 rounded-r-full"
                            disabled={localNumberValue <= 0}
                        >
                            <Minus className="w-4 h-4" />
                        </button>

                        <input
                            ref={ref}
                            type="number"
                            value={localNumberValue}
                            onChange={(e) => {
                                const num = Number(e.target.value);
                                const newValue = isNaN(num) ? 0 : num;
                                setLocalNumberValue(newValue);
                                onChange?.(e);
                            }}
                            className={cn(
                                "flex-1 bg-transparent text-center text-sm focus:outline-none font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                className
                            )}
                            {...props}
                        />

                        <button
                            type="button"
                            onClick={handleIncrement}
                            className="px-4 py-3 hover:nz-background-primary transition text-zinc-400 hover:text-white rounded-l-full"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            );
        }

        // ===== FILE INPUT =====
        if (type === "file") {
            return (
                <div className="relative w-full">
                    <input
                        type="text"
                        readOnly
                        value={buttonLabel}
                        className="flex h-10 w-full rounded-xl nz-bg-input nz-text-input pl-[5.8rem] py-2 text-sm focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute flex justify-between items-center w-20 left-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg nz-background-primary text-white text-sm font-medium shadow hover:nz-background-secondary transition"
                    >
                        {props.webkitdirectory ? <Folder className="w-6 h-6" /> : <File className="w-6 h-6" />}
                        <Plus className="w-4 h-4" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={onChange}
                        {...props}
                    />
                </div>
            );
        }

        // ===== ЗВИЧАЙНИЙ INPUT =====
        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    value={value}
                    onChange={onChange}
                    className={cn(
                        "flex h-10 w-full rounded-xl nz-bg-input nz-text-input focus:nz-ring px-3 py-2 text-sm transition duration-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                        icon && "pl-10",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = "Input";