"use client";

import { Upload, FileImage, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils"; // We might need to create this util or just inline it

// Simplified util since we didn't strictly set up @/lib/utils yet, I'll keep it inline if simpler, but let's assume raw className
function UploadZone({ onFileSelect, isProcessing }: { onFileSelect: (file: File) => void, isProcessing: boolean }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith("image/")) {
                onFileSelect(file);
            }
        }
    }, [onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    }, [onFileSelect]);

    return (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
            <div
                className={`
                    group relative overflow-hidden rounded-none border transition-all duration-200 ease-out cursor-pointer
                    w-64 h-16 flex items-center justify-center
                    ${isDragging
                        ? "border-blue-500 bg-blue-600 shadow-xl shadow-blue-500/20 translate-x-1 -translate-y-1"
                        : "border-slate-700 bg-slate-900/50 hover:bg-blue-600 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/20 hover:translate-x-1 hover:-translate-y-1"
                    }
                    ${isProcessing ? "opacity-50 pointer-events-none grayscale" : ""}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
            >

                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileInput}
                    accept="image/*"
                    disabled={isProcessing}
                />

                <div className="relative z-10 flex flex-col items-center gap-2">
                    {isProcessing ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                        <span className="font-bold text-sm uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">
                            Upload Image
                        </span>
                    )}
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 z-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <p className="text-sm text-slate-500 font-medium">
                Supported formats: PNG, JPG
            </p>
        </div>
    );
}

export default UploadZone;
