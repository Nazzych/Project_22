import React, { forwardRef, useRef } from "react";
import { cn } from "../../lib/cn";
import { File, Folder, Plus } from "lucide-react";
import { InputProps } from "../../types/componentsUI";

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = "text", icon, buttonLabel = "Select", ...props }, ref) => {
        const fileInputRef = useRef<HTMLInputElement>(null);
        //? const [selectedFileName, setSelectedFileName] = useState<string>("");

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
                    {...props}
                    {...(props.webkitdirectory ? { webkitdirectory: "" } : {})}
                    //? onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || "")}
                />
            </div>
            );
        }

        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
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
