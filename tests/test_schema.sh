#!/bin/bash
set -e
echo "Testing Schema Compilation..."
glib-compile-schemas schemas/
echo "Schemas compiled successfully."
echo "Testing JSON validity..."
gjs -c '
const GLib = imports.gi.GLib;
function testJson(path) {
    let [ok, contents] = GLib.file_get_contents(path);
    if (!ok) throw new Error("Could not read " + path);
    let decoder = new TextDecoder("utf-8");
    let json = JSON.parse(decoder.decode(contents));
    print(path + " is valid JSON with " + json.length + " categories.");
}
testJson("src/data/emojis.json");
testJson("src/data/kaomoji.json");
testJson("src/data/symbols.json");
'
echo "All static assets verified!"
