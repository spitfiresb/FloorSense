#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <ROBOFLOW_API_KEY>"
    exit 1
fi

API_KEY=$1



# Create a temporary directory for samples
SAMPLE_DIR="symbol_detection/demo_samples"
rm -rf "$SAMPLE_DIR"
mkdir -p "$SAMPLE_DIR"

echo "Selecting 10 random images from data/high_quality..."

# Find all F1_original.png files, shuffle, take 10
find data/high_quality -name "F1_original.png" | sort -R | head -n 10 | while read img_path; do
    # Get parent folder name (e.g., 1234) to make filename unique
    parent_dir=$(basename $(dirname "$img_path"))
    cp "$img_path" "$SAMPLE_DIR/${parent_dir}_F1.png"
done

SOURCE_IMG="$SAMPLE_DIR"
echo "Running inference on 10 random images..."
python symbol_detection/predict.py \
    --api-key "$API_KEY" \
    --source "$SOURCE_IMG" \
    --output-dir symbol_detection/outputs \
    --project "floorplans-r7e9l-vjwg9" \
    --version 2 \
    --conf 0.1

echo "Demo complete! Check symbol_detection/outputs for results."
