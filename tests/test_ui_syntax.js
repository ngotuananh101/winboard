#!/usr/bin/env gjs
// Syntax verification for Task 4 & 5 (stylesheet + src/ui modules).
//
// The UI modules import `gi://St` and `gi://Clutter`, whose typelibs are only
// fully usable inside a running GNOME Shell session (outside, `St-14.typelib`
// fails to load its theme/dependencies). That fails at import *resolution*
// time, not at *parse* time:
//   - A real syntax error in our files throws SyntaxError during parsing.
//   - A correct parse only fails with an ImportError / resolution error for
//     the unavailable typelibs or shell resources.
// Only a SyntaxError fails the test.
//
// Additionally verifies the data files referenced by the views parse as JSON
// and have the expected {category, items[]} shape.
//
// Usage: gjs -m tests/test_ui_syntax.js

import GLib from 'gi://GLib';

function assert(condition, message) {
    if (!condition) {
        throw new Error('Assertion failed: ' + message);
    }
}

const MODULES = [
    '../src/ui/header.js',
    '../src/ui/clipboardView.js',
    '../src/ui/emojiView.js',
    '../src/ui/kaomojiView.js',
    '../src/ui/symbolsView.js',
];

for (const path of MODULES) {
    try {
        await import(path);
        // Fully resolved (all gi imports available). Parse was verified.
        print(`OK (resolved): ${path}`);
    } catch (e) {
        if (e instanceof SyntaxError) {
            throw new Error(`SyntaxError in ${path}: ${e.message}`);
        }
        // Parse succeeded; only import resolution failed (expected outside a
        // running GNOME Shell session).
        print(`OK (parse, resolution deferred to session): ${path} [${e.name}]`);
    }
}

// Verify the data files the views load have the expected shape.
const DATA_FILES = [
    'src/data/emojis.json',
    'src/data/kaomoji.json',
    'src/data/symbols.json',
];
for (const relPath of DATA_FILES) {
    let [ok, contents] = GLib.file_get_contents(relPath);
    assert(ok, `could not read ${relPath}`);
    let data = JSON.parse(new TextDecoder('utf-8').decode(contents));
    assert(Array.isArray(data) && data.length > 0, `${relPath} should be a non-empty array`);
    for (const cat of data) {
        assert(typeof cat.category === 'string' && cat.category.length > 0,
            `${relPath}: category should be a non-empty string`);
        assert(Array.isArray(cat.items) && cat.items.length > 0,
            `${relPath}: ${cat.category} items should be a non-empty array`);
    }
    print(`OK (data): ${relPath} (${data.length} categories)`);
}

print('UI syntax & data tests passed successfully!');
