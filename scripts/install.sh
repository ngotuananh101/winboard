#!/bin/bash
set -e

UUID="winboard@anhnt.tools"
TARGET_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"

echo "=== Building Winboard ==="
glib-compile-schemas schemas/

echo "=== Installing to $TARGET_DIR ==="
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

cp -r metadata.json extension.js prefs.js stylesheet.css schemas src "$TARGET_DIR/"

echo "=== Installation Completed ==="
echo "To enable:"
echo "gnome-extensions enable $UUID"