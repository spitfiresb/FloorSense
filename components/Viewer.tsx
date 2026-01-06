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
  const [elements, setElements] = useState<PlanElement[]>(data.elements);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    perimeter: true,
    bathroom: true,
    window: true,
    door: true,
    stairs: true
  });

  // Edit Mode State
  const [editAction, setEditAction] = useState<'none' | 'add' | 'remove'>('none');
  const [selectedType, setSelectedType] = useState<string>('window');
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [currentDrag, setCurrentDrag] = useState<{ x: number, y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sync elements if data changes (e.g. new upload)
  useEffect(() => {
    setElements(data.elements);
  }, [data]);

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

  // Convert client coordinates to 0-1000 normalized coordinates
  const getNormalizedCoords = (e: React.MouseEvent) => {
    if (!containerRef.current || !imgRef.current) return null;
    const rect = imgRef.current.getBoundingClientRect();

    // Relative to image
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize
    const normX = Math.max(0, Math.min(1000, Math.round((x / rect.width) * 1000)));
    const normY = Math.max(0, Math.min(1000, Math.round((y / rect.height) * 1000)));

    return { x: normX, y: normY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editAction !== 'add') return;
    const coords = getNormalizedCoords(e);
    if (coords) {
      setDragStart(coords);
      setCurrentDrag(coords);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (editAction !== 'add' || !dragStart) return;
    const coords = getNormalizedCoords(e);
    if (coords) {
      setCurrentDrag(coords);
    }
  };

  const handleMouseUp = () => {
    if (editAction !== 'add' || !dragStart || !currentDrag) return;

    // Create new element
    // Box format: [ymin, xmin, ymax, xmax]
    const ymin = Math.min(dragStart.y, currentDrag.y);
    const xmin = Math.min(dragStart.x, currentDrag.x);
    const ymax = Math.max(dragStart.y, currentDrag.y);
    const xmax = Math.max(dragStart.x, currentDrag.x);

    // Min size check to avoid accidental clicks creating tiny boxes
    if (Math.abs(xmax - xmin) > 10 && Math.abs(ymax - ymin) > 10) {
      const newEl = {
        id: `custom-${Date.now()}`,
        type: selectedType,
        label: `${selectedType} (Manual)`,
        box_2d: [ymin, xmin, ymax, xmax]
      };
      setElements([...elements, newEl]);
    }

    setDragStart(null);
    setCurrentDrag(null);
  };

  const handleBoxClick = (id: string, e: React.MouseEvent) => {
    if (editAction === 'remove') {
      e.stopPropagation(); // Prevent potentially triggering other clicks
      setElements(elements.filter(el => el.id !== id));
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = image;
    link.download = 'floorplan_analyzed.png';
    link.click();
  };

  // Calculate summary dynamically from current elements state
  const currentSummary = elements.reduce((acc, el) => {
    acc[el.type] = (acc[el.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
              const count = currentSummary[type] || 0;
              // Hide if count is 0
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
      <div className="flex-grow flex flex-col relative min-h-[500px] bg-[#f0f0f0] border-2 border-ink rounded-sm overflow-hidden shadow-inner select-none">
        <div
          ref={containerRef}
          className={`relative m-auto max-h-[80vh] w-auto inline-block ${editAction === 'add' ? 'cursor-crosshair' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { setDragStart(null); setCurrentDrag(null); }}
        >
          <img
            ref={imgRef}
            src={image}
            alt="Floor Plan"
            className="max-h-[80vh] w-auto object-contain block pointer-events-none"
          />

          {/* Overlay Layers */}
          {elements.map((el, idx) => (
            activeLayers[el.type] && (
              <div
                key={idx}
                className={`absolute border-[3px] opacity-70 hover:opacity-100 transition-all z-10 animate-in zoom-in-50 duration-500 ease-out 
                            ${editAction === 'remove' ? 'cursor-no-drop hover:bg-red-500/20 hover:border-red-500' : 'cursor-pointer'}
                        `}
                style={{
                  ...getStyleForBox(el.box_2d),
                  borderColor: editAction === 'remove' ? undefined : (COLORS[el.type as keyof typeof COLORS] || 'black'),
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.3)'
                }}
                title={`${el.label} (${el.type})`}
                onClick={(e) => handleBoxClick(el.id, e)}
              >
                {/* Label on hover - only show if not removing */}
                {editAction !== 'remove' && (
                  <div className="opacity-0 hover:opacity-100 absolute -bottom-8 left-1/2 -translate-x-1/2 bg-ink text-white text-xs px-2 py-1 rounded font-sans whitespace-nowrap z-20 pointer-events-none transition-opacity">
                    {el.type}
                  </div>
                )}
                {/* Remove Icon overlay */}
                {editAction === 'remove' && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100">
                    <Minus className="w-6 h-6 text-red-600 bg-white rounded-full p-1 border border-red-600" />
                  </div>
                )}
              </div>
            )
          ))}

          {/* Drag Preview Box */}
          {dragStart && currentDrag && editAction === 'add' && (
            <div
              className="absolute border-[3px] border-dashed z-20 pointer-events-none"
              style={{
                ...getStyleForBox([
                  Math.min(dragStart.y, currentDrag.y),
                  Math.min(dragStart.x, currentDrag.x),
                  Math.max(dragStart.y, currentDrag.y),
                  Math.max(dragStart.x, currentDrag.x)
                ]),
                borderColor: COLORS[selectedType as keyof typeof COLORS] || 'black',
              }}
            />
          )}
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

            <div className="flex gap-4 mb-4">
              <Button
                variant={editAction === 'add' ? 'primary' : 'secondary'}
                className="flex-1 text-sm py-1 px-2"
                onClick={() => setEditAction(editAction === 'add' ? 'none' : 'add')}
              >
                ADD <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant={editAction === 'remove' ? 'primary' : 'secondary'}
                className="flex-1 text-sm py-1 px-2"
                onClick={() => setEditAction(editAction === 'remove' ? 'none' : 'remove')}
              >
                REMOVE <Minus className="w-4 h-4" />
              </Button>
            </div>

            {/* Type Selector for Adding */}
            {editAction === 'add' && (
              <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded animate-fade-in">
                <p className="font-hand text-lg mb-2">Item to Add:</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(COLORS) as Array<keyof typeof COLORS>)
                    .filter(type => type !== 'furniture')
                    .map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`
                                            px-2 py-1 text-sm rounded border-2 transition-all capitalize font-hand
                                            ${selectedType === type
                            ? 'bg-ink text-white border-ink'
                            : 'bg-white border-gray-300 hover:border-gray-500'
                          }
                                        `}
                      >
                        {type}
                      </button>
                    ))
                  }
                </div>
                <p className="text-xs text-gray-500 mt-2 font-sans italic">
                  Click and drag on the image to draw a new {selectedType}.
                </p>
              </div>
            )}

            {editAction === 'remove' && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded animate-fade-in">
                <p className="font-hand text-lg text-red-700">Select items to remove</p>
                <p className="text-xs text-red-500 mt-1 font-sans italic">
                  Click any box on the image to delete it.
                </p>
              </div>
            )}

            <div className="space-y-4 flex-grow overflow-y-auto">
              <p className="font-hand text-xl border-b pb-2 mb-2">Visibility</p>
              {/* Filter out furniture */}
              {(Object.keys(COLORS) as Array<keyof typeof COLORS>)
                .filter(type => type !== 'furniture')
                .map(type => (
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
              <Button className="w-full" onClick={() => { setIsEditing(false); setEditAction('none'); }}>
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
