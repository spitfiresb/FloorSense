import { AnalysisResult } from "../types";

// RoboFlow Prediction Type
interface RoboFlowPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
  // other fields like detection_id etc might be present but unused
}

interface RoboFlowResponse {
  predictions: RoboFlowPrediction[];
  image?: { width: number; height: number };
}

export async function analyzeFloorPlan(base64Image: string): Promise<AnalysisResult> {
  // 1. Convert Base64 to Blob/File for FormData
  const fetchRes = await fetch(base64Image);
  const blob = await fetchRes.blob();
  const file = new File([blob], "image.png", { type: "image/png" });

  // 2. Send to our API Route (which calls RoboFlow)
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/detect", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Analysis failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.details || errorMessage;
    } catch (e) {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }

  const data: RoboFlowResponse = await response.json();

  // 3. Map RoboFlow Response to AnalysisResult
  // RoboFlow Returns center (x,y) and width/height.
  // Our Viewer expects normalized [ymin, xmin, ymax, xmax] on a 1000x1000 scale.
  // However, RoboFlow coordinates are usually absolute pixel values if image dimensions are known,
  // or we need to normalize them.

  // We need the original image dimensions to normalize.
  // If RoboFlow response doesn't include image dims, we might need to get them from the blob.
  let imgWidth = data.image?.width || 0;
  let imgHeight = data.image?.height || 0;

  if (imgWidth === 0 || imgHeight === 0) {
    // Fallback: get dimensions from the loaded image blob
    // This is async and requires creating an image element
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        imgWidth = img.width;
        imgHeight = img.height;
        resolve();
      };
      img.src = base64Image;
    });
  }

  const elements = data.predictions.map((pred, index) => {
    // RoboFlow: x, y are center coordinates
    const x_center = pred.x;
    const y_center = pred.y;
    const width = pred.width;
    const height = pred.height;

    const x_min = x_center - width / 2;
    const y_min = y_center - height / 2;
    const x_max = x_center + width / 2;
    const y_max = y_center + height / 2;

    // Normalize to 0-1000 scale expected by Viewer
    // If width/height are 0 (shouldn't happen), avoid divide by zero
    const safeWidth = imgWidth || 1000;
    const safeHeight = imgHeight || 1000;

    const norm_x_min = Math.round((x_min / safeWidth) * 1000);
    const norm_y_min = Math.round((y_min / safeHeight) * 1000);
    const norm_x_max = Math.round((x_max / safeWidth) * 1000);
    const norm_y_max = Math.round((y_max / safeHeight) * 1000);

    return {
      id: `pred-${index}`,
      type: pred.class, // Map class name directly
      label: `${pred.class} (${Math.round(pred.confidence * 100)}%)`,
      box_2d: [norm_y_min, norm_x_min, norm_y_max, norm_x_max] // [ymin, xmin, ymax, xmax]
    };
  });

  // Calculate summary counts
  const summary: Record<string, number> = {};
  elements.forEach(el => {
    summary[el.type] = (summary[el.type] || 0) + 1;
  });

  // Ensure we have standard keys even if 0
  // Viewer expects keys: perimeter, bathroom, window, door, stairs, furniture
  const standardKeys = ['perimeter', 'bathroom', 'window', 'door', 'stairs', 'furniture'];
  standardKeys.forEach(key => {
    if (!summary[key]) summary[key] = 0;
  });

  return {
    summary: summary as any,
    elements
  };
}
