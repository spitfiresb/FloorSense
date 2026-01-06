import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, PlanElement } from '../types';
import { Button } from './Button';
import { Save, Edit2, Check, Plus, Minus } from 'lucide-react';

interface ViewerProps {
  image: string;
  data: AnalysisResult;
}

// Color mapping for different element types
const COLORS = {
  perimeter: '#4a90e2', // sketch-blue
  bathroom: '#e24a8d',  // sketch-pink
  window: '#50e3c2',    // sketch-green
  door: '#f5a623',      // sketch-orange
  stairs: '#9b59b6',
  furniture: '#95a5a6'
};

export const Viewer: React.FC<ViewerProps> = ({ image, data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    perimeter: true,
    bathroom: true,
    window: true,
    door: true,
    stairs: true
  });
  
  // For simplicity in this demo, we scale boxes to image natural size or container size.
  // We'll use a container with relative positioning.
  const containerRef = useRef<HTMLDivElement>(null);
  
  const toggleLayer = (key: string) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getStyleForBox = (box: number[]) => {
    // box is [ymin, xmin, ymax, xmax] normalized 0-1000
    // CSS top/left/width/height in %
    const [ymin, xmin, ymax, xmax] = box;
    return {
      top: `${ymin / 10}%`,
      left: `${xmin / 10}%`,
      height: `${(ymax - ymin) / 10}%`,
      width: `${(xmax - xmin) / 10}%`,
    };
  };

  const downloadImage = () => {
      const link = document.createElement('a');
      link.href = image;
      link.download = 'floorplan_analyzed.png';
      link.click();
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-8 p-6 max-w-[1600px] mx-auto">
      {/* Left Sidebar: Stats (View Mode) or Legend */}
      <div className={`w-full lg:w-64 flex-shrink-0 transition-all duration-300 ${isEditing ? 'opacity-50 pointer-events-none hidden lg:block' : ''}`}>
        <div className="border-2 border-ink p-6 bg-white shadow-sketch relative">
            {/* Decorative paper lines */}
            <div className="absolute top-0 left-4 bottom-0 w-[1px] bg-red-100/50"></div>
            <div className="absolute top-0 left-5 bottom-0 w-[1px] bg-red-100/50"></div>

          <h3 className="font-hand text-2xl font-bold mb-6 border-b-2 border-gray-200 pb-2">Analysis Display</h3>
          
          <div className="space-y-6">
            {(Object.keys(COLORS) as Array<keyof typeof COLORS>).map(type => {
              const count = data.summary[type] || data.elements.filter(e => e.type === type).length || 0;
              if (count === 0 && !activeLayers[type]) return null;
              
              return (
                <div key={type} className="flex items-center justify-between group cursor-pointer" onClick={() => toggleLayer(type)}>
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-8 h-8 border-2 border-ink rounded-sm shadow-sm transition-opacity ${!activeLayers[type] ? 'opacity-30' : ''}`} 
                      style={{ backgroundColor: COLORS[type] }}
                    />
                    <span className="font-hand text-xl uppercase tracking-wide">{type}</span>
                  </div>
                  <span className="font-hand text-2xl font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content: Image Viewer */}
      <div className="flex-grow flex flex-col relative min-h-[500px] bg-[#f0f0f0] border-2 border-ink rounded-sm overflow-hidden shadow-inner">
        <div ref={containerRef} className="relative m-auto max-h-[80vh] w-auto inline-block">
            <img 
                src={image} 
                alt="Floor Plan" 
                className="max-h-[80vh] w-auto object-contain block" 
            />
            {/* Overlay Layers */}
            {data.elements.map((el, idx) => (
                activeLayers[el.type] && (
                    <div
                        key={idx}
                        className="absolute border-[3px] opacity-70 hover:opacity-100 transition-opacity cursor-pointer z-10"
                        style={{
                            ...getStyleForBox(el.box_2d),
                            borderColor: COLORS[el.type as keyof typeof COLORS] || 'black',
                            boxShadow: '0 0 0 1px rgba(255,255,255,0.3)'
                        }}
                        title={`${el.label} (${el.type})`}
                    >
                        {/* Label on hover */}
                        <div className="opacity-0 hover:opacity-100 absolute -top-8 left-0 bg-ink text-white text-xs px-2 py-1 rounded font-sans whitespace-nowrap z-20 pointer-events-none">
                            {el.label}
                        </div>
                    </div>
                )
            ))}
        </div>

        {/* Floating Controls for View Mode */}
        {!isEditing && (
             <div className="absolute bottom-6 right-6 flex gap-4">
                 <Button onClick={() => setIsEditing(true)}>
                     Edit <Edit2 className="w-4 h-4 ml-2" />
                 </Button>
             </div>
        )}
      </div>

      {/* Right Sidebar: Edit Controls */}
      {isEditing && (
        <div className="w-full lg:w-72 flex-shrink-0 animate-fade-in-right">
             <div className="border-2 border-ink p-6 bg-white shadow-sketch h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-hand text-2xl font-bold">EDIT MODE</h3>
                </div>

                <div className="flex gap-4 mb-8">
                    <Button variant="secondary" className="flex-1 text-sm py-1 px-2">
                        ADD <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" className="flex-1 text-sm py-1 px-2">
                        REMOVE <Minus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-4 flex-grow">
                    {(Object.keys(COLORS) as Array<keyof typeof COLORS>).map(type => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer select-none">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="peer appearance-none w-6 h-6 border-2 border-ink rounded-sm checked:bg-ink transition-colors"
                                    checked={activeLayers[type]}
                                    onChange={() => toggleLayer(type)}
                                />
                                <Check className="w-4 h-4 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="font-hand text-xl capitalize">{type}</span>
                        </label>
                    ))}
                </div>

                <div className="mt-8 space-y-4 pt-6 border-t-2 border-dashed border-gray-300">
                    <Button className="w-full bg-blue-100 hover:bg-blue-200" onClick={downloadImage}>
                        SAVE IMAGE <Save className="w-4 h-4" />
                    </Button>
                    <Button className="w-full" onClick={() => setIsEditing(false)}>
                        DONE
                    </Button>
                </div>
             </div>
        </div>
      )}

      {/* Save Button for View Mode (Top Right usually) */}
      {!isEditing && (
        <div className="absolute top-24 right-8 lg:static lg:block hidden">
            {/* Placeholder to balance layout if needed */}
        </div>
      )}
    </div>
  );
};
