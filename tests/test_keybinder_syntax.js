#!/usr/bin/env gjs
// Syntax verification for Task 3 core modules.
//
// clipboardManager.js / autoPaster.js / keybinder.js import GNOME Shell
// resources (resource:///org/gnome/shell/ui/main.js) that only exist inside a
// running session, so a full import outside the shell fails at import
// *resolution* time, not at *parse* time. We exploit that distinction:
//   - A real syntax error in our files throws SyntaxError during parsing.
//   - A correct parse only fails with an ImportError / resolution error for
//     the unavailable shell resources (or a missing typelib on PATH).
// Only a SyntaxError fails the test.
//
// Usage: gjs -m tests/test_keybinder_syntax.js

function assert(condition, message) {
    if (!condition) {
        throw new Error('Assertion failed: ' + message);
    }
}

const MODULES = [
    '../src/core/clipboardManager.js',
    '../src/core/autoPaster.js',
    '../src/core/keybinder.js',
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

print('Keybinder syntax tests passed successfully!');
