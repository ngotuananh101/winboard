#!/bin/bash
# Winboard full verification suite.
# Runs every test in tests/ and fails on any real failure.
# Syntax tests distinguish a genuine SyntaxError (fails) from an expected
# import-resolution failure outside a running GNOME Shell session (passes).
set -e

echo "1. Checking Schema Compilation..."
glib-compile-schemas schemas/
echo "   OK"

echo "2. Checking Schema & Data Assets (test_schema.sh)..."
bash tests/test_schema.sh

echo "3. Checking Storage Unit Tests (test_storage.js)..."
gjs -m tests/test_storage.js

echo "4. Checking Core Module Syntax (test_keybinder_syntax.js)..."
gjs -m tests/test_keybinder_syntax.js

echo "5. Checking UI Module Syntax (test_ui_syntax.js)..."
gjs -m tests/test_ui_syntax.js

echo "6. Checking Image Filter Tests (test_image_filter.js)..."
gjs -m tests/test_image_filter.js

echo "7. Checking Entrypoint Syntax (test_entrypoint_syntax.js)..."
gjs -m tests/test_entrypoint_syntax.js

echo "=== All checks passed! ==="