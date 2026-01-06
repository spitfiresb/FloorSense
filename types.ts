export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export type ElementType = 'perimeter' | 'bathroom' | 'window' | 'door' | 'stairs' | 'furniture';

export interface PlanElement {
  id: string;
  type: ElementType;
  label: string;
  box_2d: number[]; // [ymin, xmin, ymax, xmax] normalized 0-1000
}

export interface AnalysisResult {
  summary: Record<string, number>;
  elements: PlanElement[];
}

export type AppState = 'landing' | 'uploading' | 'analyzing' | 'viewing' | 'editing';
