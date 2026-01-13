import React from 'react';
import { Pencil, FileText, Layers, Eye, Download } from 'lucide-react';
import { Button } from './Button';

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16 space-y-6">
        <h1 className="text-6xl md:text-7xl font-hand font-bold text-ink mb-4 drop-shadow-sm">
          Intelligent Floor Plan Analysis
        </h1>
        <p className="font-hand text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Upload any architectural drawing and let our model instantly identify
          doors, windows, and rooms
        </p>

        <div className="flex gap-6 justify-center mt-8">
          <Button onClick={onStart}>
            Try It Now <Pencil className="w-5 h-5" />
          </Button>
          <Button variant="secondary">
            Read the Docs <FileText className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
        {[
          {
            icon: <Eye className="w-12 h-12 mb-4 text-ink" />,
            title: "INSTANT DETECTION",
            desc: "Model inference runs in seconds. Upload and get results immediately."
          },
          {
            icon: <Layers className="w-12 h-12 mb-4 text-ink" />,
            title: "INTERACTIVE VIEWER",
            desc: "Toggle layers, zoom, and pan through the detected architecture."
          },
          {
            icon: <Download className="w-12 h-12 mb-4 text-ink" />,
            title: "EXPORT READY",
            desc: "Get your data in standardized JSON formats for downstream tasks."
          }
        ].map((feature, idx) => (
          <div key={idx} className="bg-white border-2 border-ink p-8 shadow-sketch flex flex-col items-center text-center transition-transform hover:-translate-y-1">
            <div className="p-4 border-2 border-ink mb-4 shadow-sketch-sm bg-paper rounded-sm">
              {feature.icon}
            </div>
            <h3 className="font-hand text-2xl font-bold mb-3">{feature.title}</h3>
            <p className="font-hand text-xl text-gray-600 leading-tight">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
