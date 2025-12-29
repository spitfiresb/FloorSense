"use client";

import { useState } from "react";
import UploadZone from "@/components/floorplan/UploadZone";
import ResultViewer, { Prediction } from "@/components/floorplan/ResultViewer";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface DetectionResult {
    predictions: Prediction[];
    image: {
        width: number;
        height: number;
    }
}

export default function DashboardPage() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (file: File) => {
        setIsProcessing(true);
        setError(null);
        setImageSrc(null); // Clear previous image
        setResult(null);

        // Create local preview
        const objectUrl = URL.createObjectURL(file);
        setImageSrc(objectUrl);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append("file", file);

            // Call API
            const response = await fetch("/api/detect", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to process image");
            }

            const data = await response.json();
            setResult(data);

        } catch (err) {
            console.error(err);
            setError("Failed to analyze image. Please check your API key and try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setImageSrc(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="space-y-6">

            {/* Header / Breadcrumbs */}


            {/* Main Content Area */}
            <div className={`transition-all duration-500
                ${(imageSrc || result)
                    ? "fixed inset-0 z-50 bg-slate-950"
                    : "h-screen flex flex-col items-center justify-center"
                }
            `}>
                {(imageSrc || result) && (
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={reset}
                            className="flex items-center px-4 py-2 text-sm text-slate-300 bg-slate-900/80 backdrop-blur-md rounded-lg hover:bg-slate-800 transition-colors border border-slate-800 shadow-lg"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            New Analysis
                        </button>
                    </div>
                )}

                {!imageSrc ? (
                    <div className="h-full min-h-[500px] flex flex-col p-8">
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-full max-w-xl">
                                <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full w-full">
                        {isProcessing && !result && (
                            <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center flex-col space-y-4">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-blue-400 font-medium animate-pulse">Running Computer Vision Models...</p>
                            </div>
                        )}

                        {result ? (
                            <ResultViewer
                                imageSrc={imageSrc}
                                predictions={result.predictions}
                                imageWidth={result.image.width}
                                imageHeight={result.image.height}
                            />
                        ) : (
                            // Show just image if result not ready yet (before processing or strictly loading)
                            <div className="flex items-center justify-center h-full">
                                <img src={imageSrc} className="max-h-[80vh] w-auto opacity-50 blur-sm transition-all duration-500" />
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 text-red-500 px-6 py-3 rounded-lg shadow-xl backdrop-blur-md">
                        {error}
                    </div>
                )}

            </div>
        </div>
    );
}
