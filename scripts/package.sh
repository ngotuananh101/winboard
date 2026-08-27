#!/bin/bash
set -e

# Change to project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "========================================="
echo "   Winboard Extension Packaging Tool    "
echo "========================================="

# 1. Run full verification suite
echo "[1/4] Running test suite & verifying schemas..."
bash tests/verify_all.sh

# 2. Extract UUID and Version from metadata.json
UUID=$(grep -o '"uuid": *"[^"]*"' metadata.json | cut -d'"' -f4)
VERSION=$(grep -o '"version": *[0-9]*' metadata.json | grep -o '[0-9]*' || echo "1")
if [ -z "$UUID" ]; then
    UUID="winboard@ponta.dev"
fi

BUILD_DIR="$ROOT_DIR/build"
ZIP_NAME="${UUID}.shell-extension.zip"
OUTPUT_ZIP="$BUILD_DIR/$ZIP_NAME"

echo "[2/4] Preparing build directory: $BUILD_DIR"
mkdir -p "$BUILD_DIR"
rm -f "$OUTPUT_ZIP"

# 3. Create extension package
echo "[3/4] Packaging extension bundle..."
if command -v gnome-extensions >/dev/null 2>&1; then
    gnome-extensions pack \
        --extra-source=src \
        --extra-source=stylesheet.css \
        --schema=schemas/org.gnome.shell.extensions.winboard.gschema.xml \
        --out-dir="$BUILD_DIR" \
        --force \
        .
else
    echo "gnome-extensions CLI not found, using zip fallback..."
    zip -r "$OUTPUT_ZIP" \
        metadata.json \
        extension.js \
        prefs.js \
        stylesheet.css \
        schemas/ \
        src/ \
        -x "*.git*" "*/.*"
fi

# 4. Verify output and report
if [ -f "$OUTPUT_ZIP" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_ZIP" | cut -f1)
    echo "[4/4] Package created successfully!"
    echo "-----------------------------------------"
    echo "Bundle Name : $ZIP_NAME"
    echo "Output File : $OUTPUT_ZIP"
    echo "UUID        : $UUID"
    echo "Version     : $VERSION"
    echo "Size        : $FILE_SIZE"
    echo "-----------------------------------------"
    echo "Ready for submission to GNOME Extensions!"
    echo "Upload URL: https://extensions.gnome.org/upload/"
    echo "========================================="
else
    echo "Error: Failed to create package bundle."
    exit 1
fi
