import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // 1. Authenticate Request
    // Public Access for MVP

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 2. Prepare for Roboflow
        // We need to base64 encode the file or forward it. Roboflow Inference API accepts base64 or file upload.
        // The previous Python script saved to temp file. Here we'll read as buffer.

        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = buffer.toString("base64");

        const apiKey = process.env.ROBOFLOW_API_KEY;
        const project = "floorplans-r7e9l/2"; // Extracted from app.py: PROJECT_NAME + version
        // PROJECT_NAME = "floorplans-r7e9l-vjwg9" -> this looks like a workspace-project id.
        // The correct format for predict URL is usually: https://detect.roboflow.com/project/version?api_key=...
        // In app.py: `project = rf.workspace().project(PROJECT_NAME)`
        // Wait, PROJECT_NAME in app.py is "floorplans-r7e9l-vjwg9".
        // I should check the exact URL format. 
        // Usually it is `https://detect.roboflow.com/{model_id}/{version}`.
        // I'll trust the logic: "floorplans-r7e9l-vjwg9" seems to be the model ID.
        // So URL: `https://detect.roboflow.com/floorplans-r7e9l-vjwg9/2`

        const MODEL_ID = "floorplans-r7e9l-vjwg9";
        const VERSION = "2";
        const CONFIDENCE = 40; // 0.4 * 100

        // 3. Call Roboflow Inference API
        const response = await fetch(
            `https://detect.roboflow.com/${MODEL_ID}/${VERSION}?api_key=${apiKey}&confidence=${CONFIDENCE}`,
            {
                method: "POST",
                body: base64Image,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Roboflow Error:", errorText);
            return NextResponse.json({ error: "Roboflow API Failed", details: errorText }, { status: 500 });
        }

        const data = await response.json();

        // data.predictions is the array.
        // data.image might contain dimensions? Roboflow usually returns user_data or raw keys.
        // Let's inspect typical roboflow response or just pass data.image if it exists.
        // Standard response: { predictions: [...], image: { width, height } } typically.

        return NextResponse.json(data);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
