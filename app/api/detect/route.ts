import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Set max duration to 60 seconds (or more if needed)

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = buffer.toString("base64");

        const apiKey = process.env.ROBOFLOW_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Configuration Error: ROBOFLOW_API_KEY is missing" }, { status: 500 });
        }

        const MODEL_ID = "floorplans-r7e9l-vjwg9";
        const VERSION = "2";
        const CONFIDENCE = 40; // 0.4 * 100

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

            // Check for specific RoboFlow errors
            if (response.status === 401) {
                return NextResponse.json({ error: "Invalid API Key. Please check ROBOFLOW_API_KEY." }, { status: 401 });
            }
            if (response.status === 403) {
                return NextResponse.json({ error: "Access Denied. Check your plan limits." }, { status: 403 });
            }

            return NextResponse.json({ error: "Roboflow API Failed", details: errorText }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
