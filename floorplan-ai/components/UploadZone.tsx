import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './Button';

interface UploadZoneProps {
  onImageSelected: (base64: string) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = (src: string) => {
    // Fetch the image and convert to blob then base64 to simulate a real file load
    fetch(src)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) onImageSelected(e.target.result as string);
        };
        reader.readAsDataURL(blob);
      });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div 
        className={`
          border-4 border-dashed rounded-3xl p-16
          flex flex-col items-center justify-center text-center
          transition-all cursor-pointer bg-paper
          ${isDragging ? 'border-sketch-blue bg-blue-50 scale-102' : 'border-ink hover:border-gray-500'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className={`w-20 h-20 mb-6 ${isDragging ? 'text-sketch-blue' : 'text-ink'}`} />
        <h2 className="font-hand text-4xl mb-2">Drop your floor plan here</h2>
        <p className="font-hand text-xl text-gray-500">or click to browse</p>
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/png, image/jpeg, image/jpg"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
      
      <p className="text-center font-hand text-lg mt-4 text-gray-500">Supported formats: PNG, JPG</p>

      <div className="mt-12">
        <p className="text-center font-hand text-2xl mb-6">Or try one of these examples:</p>
        <div className="grid grid-cols-3 gap-6">
            {/* Sample Images - using reliable placeholder services but styling them to look like plans */}
            {[
              "https://images.unsplash.com/photo-1599809275671-b5942cabc7ad?q=80&w=2574&auto=format&fit=crop", // Architectural drawing
              "https://images.unsplash.com/photo-1580820267682-426da823b514?q=80&w=2574&auto=format&fit=crop", // Blueprint
              "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2670&auto=format&fit=crop"  // Modern house plan
            ].map((src, idx) => (
              <div 
                key={idx}
                className="relative aspect-square border-2 border-ink shadow-sketch cursor-pointer hover:scale-105 transition-transform overflow-hidden bg-white"
                onClick={() => handleSampleClick(src)}
              >
                <img src={src} alt="Sample floor plan" className="w-full h-full object-cover opacity-80 hover:opacity-100 grayscale hover:grayscale-0 transition-all" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
