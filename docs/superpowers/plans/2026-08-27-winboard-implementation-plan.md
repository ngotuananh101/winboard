# Winboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows 11 style Clipboard Manager extension for GNOME Shell 46 with floating cursor-anchored popup, full history (text/images/pinned), Emoji/Kaomoji/Symbols tabs, and smart auto-paste.

**Architecture:** Native GNOME Shell 46 ESM extension integrating Clutter/St for UI, St.Clipboard for monitoring, Clutter.VirtualInputDevice for auto-pasting, and GSettings for user configuration.

**Tech Stack:** JavaScript (ESM / GJS for GNOME 46), Clutter / St / GLib / Gio / Meta, CSS (Fluent Design).

## Global Constraints

- Target GNOME Shell: `46.0` (ESM module imports).
- Extension UUID: `winboard@anhnt.tools`.
- Settings Schema ID: `org.gnome.shell.extensions.winboard`.
- Zero external daemon dependencies (uses native `Clutter.VirtualInputDevice`).
- Data directory: `~/.local/share/winboard/` for `history.json` and `~/.cache/winboard/images/` for image thumbnails.

---

### Task 1: Project Scaffolding, Data Assets, and GSettings Schema

**Files:**
- Create: `metadata.json`
- Create: `schemas/org.gnome.shell.extensions.winboard.gschema.xml`
- Create: `src/data/emojis.json`
- Create: `src/data/kaomoji.json`
- Create: `src/data/symbols.json`
- Test: `tests/test_schema.sh`

**Interfaces:**
- Produces: Compiled schema `schemas/gschemas.compiled` and static JSON datasets for Emojis, Kaomoji, and Symbols.

- [ ] **Step 1: Create metadata.json**

```json
{
  "name": "Winboard",
  "description": "Windows 11 style Clipboard Manager with Emoji, Kaomoji, Symbols & Auto-Paste",
  "uuid": "winboard@anhnt.tools",
  "shell-version": ["46"],
  "url": "https://github.com/anhnt/winboard",
  "settings-schema": "org.gnome.shell.extensions.winboard",
  "gettext-domain": "winboard",
  "version": 1
}
```

- [ ] **Step 2: Create GSettings Schema**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<schemalist gettext-domain="winboard">
  <schema id="org.gnome.shell.extensions.winboard" path="/org/gnome/shell/extensions/winboard/">
    <key name="shortcut" type="as">
      <default><![CDATA[['<Super>v']]]></default>
      <summary>Shortcut to open clipboard manager</summary>
      <description>Key combination to toggle Winboard popup</description>
    </key>
    <key name="history-size" type="i">
      <default>50</default>
      <summary>Maximum history size</summary>
      <description>Number of unpinned history items to retain</description>
    </key>
    <key name="auto-paste" type="b">
      <default>true</default>
      <summary>Enable Auto-Paste</summary>
      <description>Automatically send paste keypress on item selection</description>
    </key>
    <key name="store-images" type="b">
      <default>true</default>
      <summary>Store Images</summary>
      <description>Capture and store images/screenshots in clipboard history</description>
    </key>
    <key name="strip-whitespace" type="b">
      <default>false</default>
      <summary>Strip whitespace</summary>
      <description>Trim leading and trailing whitespace from copied text</description>
    </key>
  </schema>
</schemalist>
```

- [ ] **Step 3: Create Emoji, Kaomoji, and Symbols Datasets**

Create `src/data/emojis.json`:
```json
[
  {
    "category": "Smileys & Emotion",
    "items": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "🥹", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😮‍💨", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🫣", "🤗", "🫡", "🤔", "🫢", "🤫", "🤥", "😶", "😶‍🌫️", "😐", "😑", "😬", "🫨", "🫠", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "🫥", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"]
  },
  {
    "category": "Gestures & People",
    "items": ["👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "🫷", "🫸", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "🫵", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🫀", "🫁", "🧠", "🫲", "👀", "👁️", "👅", "👄", "🫦", "👶", "🧒", "👦", "👧", "🧑", "👱", "👨", "🧔", "👩", "🧓", "👴", "👵"]
  },
  {
    "category": "Animals & Nature",
    "items": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜", "🪰", "🪲", "🪳", "🪴", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🍄", "🌸", "💮", "🪷", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷"]
  },
  {
    "category": "Food & Drink",
    "items": ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "☕", "🫖", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🍾"]
  },
  {
    "category": "Symbols & Objects",
    "items": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🔥", "✨", "🌟", "💫", "💥", "💯", "💢", "💬", "💭", "💤", "💡", "⚡", "🎉", "🎊", "🏆", "🥇", "🥈", "🥉", "👑", "💎", "🔮", "🪄", "💻", "📱", "⌚", "🚀", "🛸", "🚨", "⚠️", "⛔", "🚫", "✅", "❌", "❓", "❗", "✔️", "➕", "➖", "✖️", "➗"]
  }
]
```

Create `src/data/kaomoji.json`:
```json
[
  {
    "category": "Classic / Happy",
    "items": [
      "(✿◠‿◠)",
      "(◕‿◕✿)",
      "(^‿^)",
      "(｡♥‿♥｡)",
      "( ﾟヮﾟ)",
      "(*^▽^*)",
      "(≧◡≦)",
      "(o^▽^o)",
      "(─‿‿─)",
      "(⌒‿⌒)",
      "＼(＾▽＾)／",
      "(◕ᴗ◕✿)"
    ]
  },
  {
    "category": "Shrug & Meh",
    "items": [
      "¯\\_(ツ)_/¯",
      "┐('～`;)┌",
      "┐(￣∀￣)┌",
      "╮(︶▽︶)╭",
      "╮(￣ω￣;)╭",
      "┐(︶▽︶)┌",
      "¯\\(°_o)/¯",
      "┐(￣ヘ￣)┌"
    ]
  },
  {
    "category": "Table Flip & Anger",
    "items": [
      "(╯°□°)╯︵ ┻━┻",
      "┬─┬ノ( º _ ºノ)",
      "(ノಠ益ಠ)ノ彡┻━┻",
      "(ノ°益°)ノ",
      "(ง'̀-'́)ง",
      "(ง •̀_•́)ง",
      "ಠ_ಠ",
      "(╬ Ò﹏Ó)",
      "(・`ω´・)"
    ]
  },
  {
    "category": "Sad & Crying",
    "items": [
      "(╥﹏╥)",
      "(；ω；)",
      "(T_T)",
      "(｡•́︿•̀｡)",
      "(╯︵╰,)",
      "(ノ_<。)",
      "(个_个)",
      "(っ˘̩╭╮˘̩)っ",
      "(ಥ﹏ಥ)"
    ]
  },
  {
    "category": "Surprised & Shocked",
    "items": [
      "(⊙_⊙)",
      "(o_O)",
      "(O_O)",
      "(°ロ°)",
      "(゜Д゜;)",
      "(⊙_☉)",
      "Σ(°ロ°)",
      "(・o・)"
    ]
  }
]
```

Create `src/data/symbols.json`:
```json
[
  {
    "category": "Math & Logic",
    "items": ["±", "×", "÷", "≠", "≈", "≤", "≥", "∞", "∑", "∏", "√", "∫", "∂", "∆", "∈", "∉", "⊂", "⊃", "⊆", "⊇", "∀", "∃", "∄", "∅", "∠", "∧", "∨", "¬", "⇒", "⇔", "π", "θ", "α", "β", "γ", "λ", "μ", "σ", "ω", "½", "⅓", "⅔", "¼", "¾", "‰"]
  },
  {
    "category": "Currency",
    "items": ["$", "€", "£", "¥", "₫", "₩", "₹", "₽", "฿", "₺", "₴", "₱", "¢", "₿", "Ξ"]
  },
  {
    "category": "Arrows",
    "items": ["←", "↑", "→", "↓", "↔", "↕", "↖", "↗", "↘", "↙", "⇐", "⇑", "⇒", "⇓", "⇔", "➔", "➜", "➤", "➥", "↺", "↻", "⇄", "⇅"]
  },
  {
    "category": "Punctuation & Typography",
    "items": ["•", "–", "—", "…", "“", "”", "‘", "’", "«", "»", "‹", "›", "§", "¶", "†", "‡", "©", "®", "™", "°", "№", "ª", "º", "·"]
  },
  {
    "category": "Shapes & Geometric",
    "items": ["★", "☆", "✦", "✧", "◆", "◇", "■", "□", "▲", "△", "▼", "▽", "●", "○", "◎", "✓", "✔", "✕", "✖", "♠", "♣", "♥", "♦"]
  }
]
```

- [ ] **Step 4: Create and run test script to verify schema compilation and JSON loading**

Create `tests/test_schema.sh`:
```bash
#!/bin/bash
set -e
echo "Testing Schema Compilation..."
glib-compile-schemas schemas/
echo "Schemas compiled successfully."
echo "Testing JSON validity..."
gjs -e '
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
```

- [ ] **Step 5: Run tests/test_schema.sh**

Run: `bash tests/test_schema.sh`
Expected: Output showing successful schema compilation and JSON verification.

---

### Task 2: Storage & History Persistence Layer

**Files:**
- Create: `src/core/storage.js`
- Test: `tests/test_storage.js`

**Interfaces:**
- Produces: `StorageManager` class with methods:
  - `loadHistory()`: Returns `{ items: Array }`
  - `addItem({ type, content, imagePath, pinned })`: Adds or bumps item, returns added item
  - `removeItem(id)`: Removes item by ID
  - `togglePin(id)`: Toggles pinned state
  - `clearUnpinned()`: Removes all unpinned items
  - `saveImageFromPixbuf(pixbuf)`: Saves pixbuf to cache directory and returns file path

- [ ] **Step 1: Write failing storage test**

Create `tests/test_storage.js`:
```javascript
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { StorageManager } from '../src/core/storage.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error('Assertion failed: ' + message);
    }
}

// Use test directory
const testDir = GLib.build_filenamev([GLib.get_tmp_dir(), 'winboard_test_' + Date.now()]);
const storage = new StorageManager(testDir);

// Test empty load
let history = storage.loadHistory();
assert(Array.isArray(history.items), 'history.items should be array');
assert(history.items.length === 0, 'initial history should be empty');

// Test adding text item
let item1 = storage.addItem({ type: 'text', content: 'Hello Winboard' });
assert(item1.id !== undefined, 'item should have uuid');
assert(item1.content === 'Hello Winboard', 'item content match');
assert(storage.loadHistory().items.length === 1, 'history count 1');

// Test deduplication / bumping
let item2 = storage.addItem({ type: 'text', content: 'Hello Winboard' });
assert(storage.loadHistory().items.length === 1, 'history count should remain 1 on duplicate');
assert(item2.id === item1.id, 'item id should match bumped item');

// Test adding second item
let item3 = storage.addItem({ type: 'text', content: 'Second Item' });
assert(storage.loadHistory().items.length === 2, 'history count should be 2');
assert(storage.loadHistory().items[0].content === 'Second Item', 'latest item should be at head');

// Test toggle pin
storage.togglePin(item1.id);
assert(storage.loadHistory().items.find(i => i.id === item1.id).pinned === true, 'item1 should be pinned');

// Test clear unpinned
storage.clearUnpinned();
let remaining = storage.loadHistory().items;
assert(remaining.length === 1, 'only pinned item should remain');
assert(remaining[0].id === item1.id, 'remaining item should be item1');

// Test remove item
storage.removeItem(item1.id);
assert(storage.loadHistory().items.length === 0, 'history should be empty after delete');

print('StorageManager tests passed successfully!');
```

- [ ] **Step 2: Implement StorageManager in src/core/storage.js**

```javascript
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export class StorageManager {
    constructor(customBaseDir = null) {
        this._baseDir = customBaseDir || GLib.build_filenamev([GLib.get_user_data_dir(), 'winboard']);
        this._cacheDir = GLib.build_filenamev([GLib.get_user_cache_dir(), 'winboard', 'images']);
        this._historyFile = GLib.build_filenamev([this._baseDir, 'history.json']);
        this._maxItems = 50;

        this._ensureDirectories();
    }

    setMaxItems(max) {
        this._maxItems = Math.max(5, max);
    }

    _ensureDirectories() {
        GLib.mkdir_with_parents(this._baseDir, 0o755);
        GLib.mkdir_with_parents(this._cacheDir, 0o755);
    }

    loadHistory() {
        try {
            if (!GLib.file_test(this._historyFile, GLib.FileTest.EXISTS)) {
                return { items: [] };
            }

            let [ok, contents] = GLib.file_get_contents(this._historyFile);
            if (!ok) return { items: [] };

            let decoder = new TextDecoder('utf-8');
            let data = JSON.parse(decoder.decode(contents));
            if (!data || !Array.isArray(data.items)) {
                return { items: [] };
            }
            return data;
        } catch (e) {
            logError(e, 'Failed to load Winboard history');
            return { items: [] };
        }
    }

    saveHistory(data) {
        try {
            this._ensureDirectories();
            let jsonString = JSON.stringify(data, null, 2);
            GLib.file_set_contents(this._historyFile, jsonString);
        } catch (e) {
            logError(e, 'Failed to save Winboard history');
        }
    }

    addItem({ type, content = '', imagePath = '', pinned = false }) {
        let history = this.loadHistory();
        let items = history.items;

        // Check if duplicate of existing item
        let existingIndex = -1;
        if (type === 'text') {
            existingIndex = items.findIndex(i => i.type === 'text' && i.content === content);
        } else if (type === 'image') {
            existingIndex = items.findIndex(i => i.type === 'image' && i.imagePath === imagePath);
        }

        let item;
        if (existingIndex !== -1) {
            // Bump to top and keep pinned status if it was already pinned
            item = items.splice(existingIndex, 1)[0];
            item.timestamp = Date.now();
            items.unshift(item);
        } else {
            item = {
                id: GLib.uuid_string_random(),
                type: type,
                content: content,
                imagePath: imagePath,
                timestamp: Date.now(),
                pinned: pinned
            };
            items.unshift(item);
        }

        this._prune(items);
        this.saveHistory({ items });
        return item;
    }

    _prune(items) {
        // Keep all pinned items, prune unpinned items beyond maxItems
        let unpinnedCount = 0;
        for (let i = 0; i < items.length; i++) {
            if (!items[i].pinned) {
                unpinnedCount++;
                if (unpinnedCount > this._maxItems) {
                    let removed = items.splice(i, 1)[0];
                    if (removed.type === 'image' && removed.imagePath) {
                        try {
                            let file = Gio.File.new_for_path(removed.imagePath);
                            file.delete(null);
                        } catch (_) {}
                    }
                    i--;
                }
            }
        }
    }

    removeItem(id) {
        let history = this.loadHistory();
        let index = history.items.findIndex(i => i.id === id);
        if (index !== -1) {
            let removed = history.items.splice(index, 1)[0];
            if (removed.type === 'image' && removed.imagePath) {
                try {
                    let file = Gio.File.new_for_path(removed.imagePath);
                    file.delete(null);
                } catch (_) {}
            }
            this.saveHistory(history);
            return true;
        }
        return false;
    }

    togglePin(id) {
        let history = this.loadHistory();
        let item = history.items.find(i => i.id === id);
        if (item) {
            item.pinned = !item.pinned;
            this.saveHistory(history);
            return item.pinned;
        }
        return false;
    }

    clearUnpinned() {
        let history = this.loadHistory();
        history.items = history.items.filter(item => {
            if (!item.pinned) {
                if (item.type === 'image' && item.imagePath) {
                    try {
                        let file = Gio.File.new_for_path(item.imagePath);
                        file.delete(null);
                    } catch (_) {}
                }
                return false;
            }
            return true;
        });
        this.saveHistory(history);
    }
}
```

- [ ] **Step 3: Run storage test**

Run: `gjs -m tests/test_storage.js`
Expected: PASS with "StorageManager tests passed successfully!"

---

### Task 3: Clipboard Listener & Auto-Paste Simulation

**Files:**
- Create: `src/core/clipboardManager.js`
- Create: `src/core/autoPaster.js`
- Create: `src/core/keybinder.js`

**Interfaces:**
- `ClipboardManager`:
  - `start()`: Hooks into `St.Clipboard` `owner-changed` signal
  - `stop()`: Disconnects signal
  - `copyText(text)`: Sets clipboard content and marks internal copy flag
  - `copyImage(filePath)`: Sets clipboard image content
- `AutoPaster`:
  - `paste({ isTerminal })`: Dispatches virtual key combination via `Clutter.VirtualInputDevice`
- `Keybinder`:
  - `bind(shortcutStr, callback)`: Registers keybinding with `Main.wm`
  - `unbind()`: Unregisters keybinding

- [ ] **Step 1: Implement src/core/clipboardManager.js**

```javascript
import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import GdkPixbuf from 'gi://GdkPixbuf';

export class ClipboardManager {
    constructor(storageManager, settings) {
        this._storage = storageManager;
        this._settings = settings;
        this._clipboard = St.Clipboard.get_default();
        this._ownerChangedId = 0;
        this._ignoreNextChange = false;
        this._lastCopiedText = null;
    }

    start() {
        if (this._ownerChangedId === 0) {
            this._ownerChangedId = this._clipboard.connect('owner-changed', () => {
                this._onClipboardChanged();
            });
        }
    }

    stop() {
        if (this._ownerChangedId !== 0) {
            this._clipboard.disconnect(this._ownerChangedId);
            this._ownerChangedId = 0;
        }
    }

    copyText(text) {
        if (!text) return;
        this._ignoreNextChange = true;
        this._lastCopiedText = text;
        this._clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
    }

    copyImage(filePath) {
        if (!filePath || !GLib.file_test(filePath, GLib.FileTest.EXISTS)) return;
        try {
            let [ok, bytes] = GLib.file_get_contents(filePath);
            if (ok) {
                this._ignoreNextChange = true;
                this._clipboard.set_content(St.ClipboardType.CLIPBOARD, 'image/png', bytes);
            }
        } catch (e) {
            logError(e, 'Failed to set clipboard image content');
        }
    }

    _onClipboardChanged() {
        if (this._ignoreNextChange) {
            this._ignoreNextChange = false;
            return;
        }

        // Fetch text
        this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clip, text) => {
            if (text && text.trim().length > 0) {
                if (this._settings.get_boolean('strip-whitespace')) {
                    text = text.trim();
                }
                if (text !== this._lastCopiedText) {
                    this._lastCopiedText = text;
                    this._storage.addItem({ type: 'text', content: text });
                }
                return;
            }

            // Fetch image if enabled
            if (this._settings.get_boolean('store-images')) {
                this._checkAndStoreImage();
            }
        });
    }

    _checkAndStoreImage() {
        // Image extraction via St.Clipboard content query
        try {
            this._clipboard.get_content(St.ClipboardType.CLIPBOARD, 'image/png', (_clip, bytes) => {
                if (bytes && bytes.get_size() > 0) {
                    let imagePath = GLib.build_filenamev([
                        GLib.get_user_cache_dir(),
                        'winboard',
                        'images',
                        `${GLib.uuid_string_random()}.png`
                    ]);
                    let file = Gio.File.new_for_path(imagePath);
                    file.replace_contents(bytes.get_data(), null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
                    this._storage.addItem({ type: 'image', imagePath });
                }
            });
        } catch (_) {}
    }
}
```

- [ ] **Step 2: Implement src/core/autoPaster.js**

```javascript
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class AutoPaster {
    constructor() {
        this._virtualKeyboard = null;
    }

    _getVirtualKeyboard() {
        if (!this._virtualKeyboard) {
            let seat = Clutter.get_default_backend().get_default_seat();
            this._virtualKeyboard = seat.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
        }
        return this._virtualKeyboard;
    }

    pasteForCurrentWindow() {
        let focusedWindow = global.display.focus_window;
        let isTerminal = false;

        if (focusedWindow) {
            let wmClass = (focusedWindow.get_wm_class() || '').toLowerCase();
            let terminalClasses = [
                'gnome-terminal', 'terminal', 'ptyxis', 'alacritty',
                'kitty', 'foot', 'tilix', 'wezterm', 'xterm', 'konsole'
            ];
            isTerminal = terminalClasses.some(cls => wmClass.includes(cls));
        }

        // Delay slightly for window to regain focus after popup close
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60, () => {
            this._sendPasteShortcut(isTerminal);
            return GLib.SOURCE_REMOVE;
        });
    }

    _sendPasteShortcut(isTerminal) {
        let vk = this._getVirtualKeyboard();
        let now = Clutter.get_current_event_time() * 1000;

        // Keysyms: Control = 0xffe3, Shift = 0xffe1, 'v' = 0x0076, 'V' = 0x0056
        const KEY_CTRL = 0xffe3;
        const KEY_SHIFT = 0xffe1;
        const KEY_V = 0x0076;

        if (isTerminal) {
            vk.notify_keyval(now, KEY_CTRL, Clutter.KeyState.PRESSED);
            vk.notify_keyval(now, KEY_SHIFT, Clutter.KeyState.PRESSED);
            vk.notify_keyval(now, KEY_V, Clutter.KeyState.PRESSED);
            vk.notify_keyval(now, KEY_V, Clutter.KeyState.RELEASED);
            vk.notify_keyval(now, KEY_SHIFT, Clutter.KeyState.RELEASED);
            vk.notify_keyval(now, KEY_CTRL, Clutter.KeyState.RELEASED);
        } else {
            vk.notify_keyval(now, KEY_CTRL, Clutter.KeyState.PRESSED);
            vk.notify_keyval(now, KEY_V, Clutter.KeyState.PRESSED);
            vk.notify_keyval(now, KEY_V, Clutter.KeyState.RELEASED);
            vk.notify_keyval(now, KEY_CTRL, Clutter.KeyState.RELEASED);
        }
    }
}
```

- [ ] **Step 3: Implement src/core/keybinder.js**

```javascript
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class Keybinder {
    constructor(settings) {
        this._settings = settings;
        this._boundAction = null;
    }

    bind(keyName, handler) {
        this.unbind(keyName);
        this._boundAction = keyName;

        Main.wm.addKeybinding(
            keyName,
            this._settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW | Shell.ActionMode.POPUP,
            handler
        );
    }

    unbind(keyName = null) {
        let name = keyName || this._boundAction;
        if (name) {
            Main.wm.removeKeybinding(name);
            if (name === this._boundAction) {
                this._boundAction = null;
            }
        }
    }
}
```

---

### Task 4: Windows 11 Fluent UI Stylesheet

**Files:**
- Create: `stylesheet.css`

**Interfaces:**
- Produces: CSS stylesheet with classes for popup container, tabs, search box, history cards, badges, and icon buttons.

- [ ] **Step 1: Create stylesheet.css**

```css
/* Winboard Windows 11 Fluent Design Stylesheet */

.winboard-popup {
    background-color: rgba(32, 32, 32, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55);
    padding: 12px;
    width: 380px;
    max-height: 520px;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
}

.winboard-header {
    spacing: 8px;
    margin-bottom: 8px;
}

/* Search Entry */
.winboard-search-entry {
    background-color: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 6px 10px;
    color: #ffffff;
    caret-color: #60cdff;
    font-size: 13px;
}

.winboard-search-entry:focus {
    background-color: rgba(255, 255, 255, 0.12);
    border: 1px solid #60cdff;
    box-shadow: 0 0 0 1px #60cdff;
}

/* Tabs Bar */
.winboard-tabs-bar {
    spacing: 4px;
    margin-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 6px;
}

.winboard-tab-button {
    background-color: transparent;
    border-radius: 6px;
    padding: 6px 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 500;
    transition-duration: 150ms;
}

.winboard-tab-button:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: #ffffff;
}

.winboard-tab-button:checked,
.winboard-tab-button.active {
    background-color: rgba(255, 255, 255, 0.15);
    color: #60cdff;
    font-weight: 600;
}

/* Section Titles */
.winboard-section-header {
    padding: 6px 4px 4px 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
}

.winboard-clear-button {
    background-color: transparent;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
}

.winboard-clear-button:hover {
    background-color: rgba(255, 80, 80, 0.2);
    color: #ff6b6b;
}

/* Scroll Area */
.winboard-scroll-view {
    max-height: 400px;
}

.winboard-items-list {
    spacing: 6px;
    padding: 2px;
}

/* Clipboard Item Card */
.winboard-item-card {
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 8px 10px;
    transition-duration: 120ms;
}

.winboard-item-card:hover,
.winboard-item-card:focus {
    background-color: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.18);
}

.winboard-item-text {
    font-size: 13px;
    color: #f0f0f0;
    line-height: 1.4;
}

.winboard-item-footer {
    spacing: 6px;
    margin-top: 4px;
}

.winboard-item-time {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
}

.winboard-icon-button {
    background-color: transparent;
    border-radius: 4px;
    padding: 3px 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

.winboard-icon-button:hover {
    background-color: rgba(255, 255, 255, 0.15);
    color: #ffffff;
}

.winboard-icon-button.pinned {
    color: #60cdff;
}

/* Emoji / Kaomoji / Symbol Grid */
.winboard-grid-category-title {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 8px;
    margin-bottom: 4px;
    text-transform: uppercase;
}

.winboard-emoji-grid {
    spacing: 4px;
}

.winboard-emoji-button {
    background-color: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    padding: 6px;
    font-size: 20px;
    transition-duration: 100ms;
}

.winboard-emoji-button:hover {
    background-color: rgba(255, 255, 255, 0.16);
}

.winboard-kaomoji-button {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 12px;
    color: #ffffff;
    margin: 2px;
}

.winboard-kaomoji-button:hover {
    background-color: rgba(255, 255, 255, 0.15);
    color: #60cdff;
}

.winboard-symbol-button {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 6px;
    font-size: 16px;
    min-width: 32px;
    text-align: center;
}

.winboard-symbol-button:hover {
    background-color: rgba(255, 255, 255, 0.15);
    color: #60cdff;
}

/* Empty State */
.winboard-empty-state {
    padding: 32px 16px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
    text-align: center;
}
```

---

### Task 5: UI Views (Clipboard, Emoji, Kaomoji, Symbols, Header)

**Files:**
- Create: `src/ui/header.js`
- Create: `src/ui/clipboardView.js`
- Create: `src/ui/emojiView.js`
- Create: `src/ui/kaomojiView.js`
- Create: `src/ui/symbolsView.js`

**Interfaces:**
- `Header(onSearchChanged, onTabSelected)`: Search box & Tab buttons
- `ClipboardView(storageManager, onItemSelected)`: Renders pinned and recent clipboard cards
- `EmojiView(onItemSelected)`: Loads `emojis.json` into categorized grid
- `KaomojiView(onItemSelected)`: Loads `kaomoji.json` into selectable flow layout
- `SymbolsView(onItemSelected)`: Loads `symbols.json` into selectable grid

- [ ] **Step 1: Implement src/ui/header.js**

```javascript
import St from 'gi://St';
import Clutter from 'gi://Clutter';

export class Header extends St.BoxLayout {
    constructor({ onSearchChanged, onTabSelected }) {
        super({
            vertical: true,
            style_class: 'winboard-header'
        });

        this._onSearchChanged = onSearchChanged;
        this._onTabSelected = onTabSelected;

        this._buildSearchEntry();
        this._buildTabsBar();
    }

    _buildSearchEntry() {
        this.searchEntry = new St.Entry({
            hint_text: 'Tìm kiếm trong lịch sử / emoji...',
            style_class: 'winboard-search-entry',
            can_focus: true
        });

        this.searchEntry.clutter_text.connect('text-changed', () => {
            this._onSearchChanged(this.searchEntry.get_text().toLowerCase().trim());
        });

        this.add_child(this.searchEntry);
    }

    _buildTabsBar() {
        this.tabsBar = new St.BoxLayout({
            style_class: 'winboard-tabs-bar',
            x_expand: true
        });

        this._tabButtons = [];
        const tabs = [
            { id: 'clipboard', label: '📋 Clipboard' },
            { id: 'emoji', label: '😀 Emoji' },
            { id: 'kaomoji', label: '¯\\_(ツ)' },
            { id: 'symbols', label: 'Ω Ký tự' }
        ];

        tabs.forEach((tab, index) => {
            let btn = new St.Button({
                label: tab.label,
                style_class: 'winboard-tab-button',
                can_focus: true
            });

            if (index === 0) btn.add_style_class_name('active');

            btn.connect('clicked', () => {
                this.setActiveTab(tab.id);
            });

            this._tabButtons.push({ id: tab.id, button: btn });
            this.tabsBar.add_child(btn);
        });

        this.add_child(this.tabsBar);
    }

    setActiveTab(tabId) {
        this._tabButtons.forEach(t => {
            if (t.id === tabId) {
                t.button.add_style_class_name('active');
            } else {
                t.button.remove_style_class_name('active');
            }
        });
        this._onTabSelected(tabId);
    }

    focusSearch() {
        this.searchEntry.grab_key_focus();
    }

    clearSearch() {
        this.searchEntry.set_text('');
    }
}
```

- [ ] **Step 2: Implement src/ui/clipboardView.js**

```javascript
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export class ClipboardView extends St.ScrollView {
    constructor({ storageManager, onItemSelected }) {
        super({
            style_class: 'winboard-scroll-view',
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            x_expand: true,
            y_expand: true
        });

        this._storage = storageManager;
        this._onItemSelected = onItemSelected;

        this._container = new St.BoxLayout({
            vertical: true,
            style_class: 'winboard-items-list',
            x_expand: true
        });
        this.set_child(this._container);

        this.refresh();
    }

    refresh(filterText = '') {
        this._container.destroy_all_children();

        let history = this._storage.loadHistory();
        let items = history.items || [];

        if (filterText) {
            items = items.filter(item => {
                if (item.type === 'text') {
                    return item.content.toLowerCase().includes(filterText);
                }
                return false;
            });
        }

        let pinnedItems = items.filter(i => i.pinned);
        let recentItems = items.filter(i => !i.pinned);

        if (pinnedItems.length === 0 && recentItems.length === 0) {
            let emptyLabel = new St.Label({
                text: filterText ? 'Không tìm thấy kết quả nào' : 'Lịch sử clipboard trống',
                style_class: 'winboard-empty-state'
            });
            this._container.add_child(emptyLabel);
            return;
        }

        // Pinned Section
        if (pinnedItems.length > 0) {
            let pinnedHeader = new St.Label({
                text: '📌 ĐÃ GHIM',
                style_class: 'winboard-section-header'
            });
            this._container.add_child(pinnedHeader);

            pinnedItems.forEach(item => {
                this._container.add_child(this._createItemCard(item));
            });
        }

        // Recent Section
        if (recentItems.length > 0) {
            let recentHeaderBox = new St.BoxLayout({
                x_expand: true,
                style_class: 'winboard-header'
            });

            let recentLabel = new St.Label({
                text: '🕒 GẦN ĐÂY',
                style_class: 'winboard-section-header',
                x_expand: true
            });
            recentHeaderBox.add_child(recentLabel);

            let clearBtn = new St.Button({
                label: '🗑️ Xóa hết',
                style_class: 'winboard-clear-button',
                can_focus: true
            });
            clearBtn.connect('clicked', () => {
                this._storage.clearUnpinned();
                this.refresh(filterText);
            });
            recentHeaderBox.add_child(clearBtn);

            this._container.add_child(recentHeaderBox);

            recentItems.forEach(item => {
                this._container.add_child(this._createItemCard(item));
            });
        }
    }

    _createItemCard(item) {
        let card = new St.Button({
            style_class: 'winboard-item-card',
            can_focus: true,
            x_expand: true
        });

        let box = new St.BoxLayout({
            vertical: true,
            x_expand: true
        });

        // Content
        if (item.type === 'text') {
            let displayText = item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content;
            let textLabel = new St.Label({
                text: displayText,
                style_class: 'winboard-item-text'
            });
            textLabel.clutter_text.line_wrap = true;
            textLabel.clutter_text.ellipsize = 3; // PANGO_ELLIPSIZE_END
            box.add_child(textLabel);
        } else if (item.type === 'image') {
            let imageLabel = new St.Label({
                text: '🖼️ [Hình ảnh]',
                style_class: 'winboard-item-text'
            });
            box.add_child(imageLabel);
        }

        // Footer with timestamp & actions
        let footer = new St.BoxLayout({
            style_class: 'winboard-item-footer',
            x_expand: true
        });

        let timeStr = this._formatTime(item.timestamp);
        let timeLabel = new St.Label({
            text: timeStr,
            style_class: 'winboard-item-time',
            x_expand: true
        });
        footer.add_child(timeLabel);

        // Pin Button
        let pinBtn = new St.Button({
            label: item.pinned ? '📌' : '📍',
            style_class: `winboard-icon-button ${item.pinned ? 'pinned' : ''}`,
            can_focus: true
        });
        pinBtn.connect('clicked', () => {
            this._storage.togglePin(item.id);
            this.refresh();
        });
        footer.add_child(pinBtn);

        // Delete Button
        let delBtn = new St.Button({
            label: '✕',
            style_class: 'winboard-icon-button',
            can_focus: true
        });
        delBtn.connect('clicked', () => {
            this._storage.removeItem(item.id);
            this.refresh();
        });
        footer.add_child(delBtn);

        box.add_child(footer);
        card.set_child(box);

        card.connect('clicked', () => {
            this._onItemSelected(item);
        });

        return card;
    }

    _formatTime(timestamp) {
        if (!timestamp) return '';
        let date = new Date(timestamp);
        let hours = date.getHours().toString().padStart(2, '0');
        let mins = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${mins}`;
    }
}
```

- [ ] **Step 3: Implement src/ui/emojiView.js, kaomojiView.js, and symbolsView.js**

Create `src/ui/emojiView.js`:
```javascript
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

export class EmojiView extends St.ScrollView {
    constructor({ extensionPath, onItemSelected }) {
        super({
            style_class: 'winboard-scroll-view',
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            x_expand: true,
            y_expand: true
        });

        this._extensionPath = extensionPath;
        this._onItemSelected = onItemSelected;
        this._categories = this._loadData();

        this._container = new St.BoxLayout({
            vertical: true,
            style_class: 'winboard-items-list',
            x_expand: true
        });
        this.set_child(this._container);

        this.refresh();
    }

    _loadData() {
        try {
            let jsonPath = GLib.build_filenamev([this._extensionPath, 'src', 'data', 'emojis.json']);
            let [ok, contents] = GLib.file_get_contents(jsonPath);
            if (ok) {
                let decoder = new TextDecoder('utf-8');
                return JSON.parse(decoder.decode(contents));
            }
        } catch (e) {
            logError(e, 'Failed to load emojis.json');
        }
        return [];
    }

    refresh(filterText = '') {
        this._container.destroy_all_children();

        this._categories.forEach(cat => {
            let filteredItems = cat.items;
            if (filterText) {
                // If filtering, only show if matches
                filteredItems = cat.items.filter(emoji => emoji.includes(filterText));
            }

            if (filteredItems.length === 0) return;

            let catTitle = new St.Label({
                text: cat.category,
                style_class: 'winboard-grid-category-title'
            });
            this._container.add_child(catTitle);

            // Flow grid container
            let row = null;
            filteredItems.forEach((emoji, idx) => {
                if (idx % 8 === 0) {
                    row = new St.BoxLayout({
                        style_class: 'winboard-emoji-grid',
                        x_expand: true
                    });
                    this._container.add_child(row);
                }

                let btn = new St.Button({
                    label: emoji,
                    style_class: 'winboard-emoji-button',
                    can_focus: true
                });
                btn.connect('clicked', () => {
                    this._onItemSelected({ type: 'text', content: emoji });
                });
                row.add_child(btn);
            });
        });
    }
}
```

Create `src/ui/kaomojiView.js`:
```javascript
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

export class KaomojiView extends St.ScrollView {
    constructor({ extensionPath, onItemSelected }) {
        super({
            style_class: 'winboard-scroll-view',
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            x_expand: true,
            y_expand: true
        });

        this._extensionPath = extensionPath;
        this._onItemSelected = onItemSelected;
        this._categories = this._loadData();

        this._container = new St.BoxLayout({
            vertical: true,
            style_class: 'winboard-items-list',
            x_expand: true
        });
        this.set_child(this._container);

        this.refresh();
    }

    _loadData() {
        try {
            let jsonPath = GLib.build_filenamev([this._extensionPath, 'src', 'data', 'kaomoji.json']);
            let [ok, contents] = GLib.file_get_contents(jsonPath);
            if (ok) {
                let decoder = new TextDecoder('utf-8');
                return JSON.parse(decoder.decode(contents));
            }
        } catch (e) {
            logError(e, 'Failed to load kaomoji.json');
        }
        return [];
    }

    refresh(filterText = '') {
        this._container.destroy_all_children();

        this._categories.forEach(cat => {
            let filteredItems = cat.items;
            if (filterText) {
                filteredItems = cat.items.filter(k => k.toLowerCase().includes(filterText));
            }

            if (filteredItems.length === 0) return;

            let catTitle = new St.Label({
                text: cat.category,
                style_class: 'winboard-grid-category-title'
            });
            this._container.add_child(catTitle);

            let row = null;
            filteredItems.forEach((kaomoji, idx) => {
                if (idx % 2 === 0) {
                    row = new St.BoxLayout({
                        style_class: 'winboard-emoji-grid',
                        x_expand: true
                    });
                    this._container.add_child(row);
                }

                let btn = new St.Button({
                    label: kaomoji,
                    style_class: 'winboard-kaomoji-button',
                    can_focus: true,
                    x_expand: true
                });
                btn.connect('clicked', () => {
                    this._onItemSelected({ type: 'text', content: kaomoji });
                });
                row.add_child(btn);
            });
        });
    }
}
```

Create `src/ui/symbolsView.js`:
```javascript
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

export class SymbolsView extends St.ScrollView {
    constructor({ extensionPath, onItemSelected }) {
        super({
            style_class: 'winboard-scroll-view',
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            x_expand: true,
            y_expand: true
        });

        this._extensionPath = extensionPath;
        this._onItemSelected = onItemSelected;
        this._categories = this._loadData();

        this._container = new St.BoxLayout({
            vertical: true,
            style_class: 'winboard-items-list',
            x_expand: true
        });
        this.set_child(this._container);

        this.refresh();
    }

    _loadData() {
        try {
            let jsonPath = GLib.build_filenamev([this._extensionPath, 'src', 'data', 'symbols.json']);
            let [ok, contents] = GLib.file_get_contents(jsonPath);
            if (ok) {
                let decoder = new TextDecoder('utf-8');
                return JSON.parse(decoder.decode(contents));
            }
        } catch (e) {
            logError(e, 'Failed to load symbols.json');
        }
        return [];
    }

    refresh(filterText = '') {
        this._container.destroy_all_children();

        this._categories.forEach(cat => {
            let filteredItems = cat.items;
            if (filterText) {
                filteredItems = cat.items.filter(sym => sym.toLowerCase().includes(filterText));
            }

            if (filteredItems.length === 0) return;

            let catTitle = new St.Label({
                text: cat.category,
                style_class: 'winboard-grid-category-title'
            });
            this._container.add_child(catTitle);

            let row = null;
            filteredItems.forEach((sym, idx) => {
                if (idx % 8 === 0) {
                    row = new St.BoxLayout({
                        style_class: 'winboard-emoji-grid',
                        x_expand: true
                    });
                    this._container.add_child(row);
                }

                let btn = new St.Button({
                    label: sym,
                    style_class: 'winboard-symbol-button',
                    can_focus: true
                });
                btn.connect('clicked', () => {
                    this._onItemSelected({ type: 'text', content: sym });
                });
                row.add_child(btn);
            });
        });
    }
}
```

---

### Task 6: Main Floating Popup with Screen Clamping

**Files:**
- Create: `src/ui/popup.js`

**Interfaces:**
- `Popup`:
  - `open()`: Calculates pointer coordinates, clamps to monitor bounds, shows modal popup, focuses search box
  - `close()`: Hides popup, releases Clutter grab, restores window focus

- [ ] **Step 1: Implement src/ui/popup.js**

```javascript
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Header } from './header.js';
import { ClipboardView } from './clipboardView.js';
import { EmojiView } from './emojiView.js';
import { KaomojiView } from './kaomojiView.js';
import { SymbolsView } from './symbolsView.js';

export class Popup extends St.BoxLayout {
    constructor({ extensionPath, storageManager, clipboardManager, autoPaster, settings }) {
        super({
            vertical: true,
            style_class: 'winboard-popup',
            reactive: true,
            can_focus: true
        });

        this._extensionPath = extensionPath;
        this._storage = storageManager;
        this._clipboard = clipboardManager;
        this._autoPaster = autoPaster;
        this._settings = settings;
        this._isOpen = false;
        this._grab = null;

        this._activeTab = 'clipboard';

        this._buildUI();
    }

    _buildUI() {
        // Header (Search + Tabs)
        this._header = new Header({
            onSearchChanged: (text) => this._onSearchChanged(text),
            onTabSelected: (tabId) => this._switchTab(tabId)
        });
        this.add_child(this._header);

        // Content Views
        this._viewsStack = new St.Widget({
            layout_manager: new Clutter.BinLayout(),
            x_expand: true,
            y_expand: true
        });

        this._clipboardView = new ClipboardView({
            storageManager: this._storage,
            onItemSelected: (item) => this._handleItemSelection(item)
        });

        this._emojiView = new EmojiView({
            extensionPath: this._extensionPath,
            onItemSelected: (item) => this._handleItemSelection(item)
        });

        this._kaomojiView = new KaomojiView({
            extensionPath: this._extensionPath,
            onItemSelected: (item) => this._handleItemSelection(item)
        });

        this._symbolsView = new SymbolsView({
            extensionPath: this._extensionPath,
            onItemSelected: (item) => this._handleItemSelection(item)
        });

        this._viewsStack.add_child(this._clipboardView);
        this._viewsStack.add_child(this._emojiView);
        this._viewsStack.add_child(this._kaomojiView);
        this._viewsStack.add_child(this._symbolsView);

        this.add_child(this._viewsStack);

        this._switchTab('clipboard');

        // Capture key events for Esc dismissal
        this.connect('key-press-event', (actor, event) => {
            let symbol = event.get_key_symbol();
            if (symbol === Clutter.KEY_Escape) {
                this.close();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
    }

    _switchTab(tabId) {
        this._activeTab = tabId;
        this._clipboardView.visible = (tabId === 'clipboard');
        this._emojiView.visible = (tabId === 'emoji');
        this._kaomojiView.visible = (tabId === 'kaomoji');
        this._symbolsView.visible = (tabId === 'symbols');

        this._onSearchChanged(this._header.searchEntry.get_text().toLowerCase().trim());
    }

    _onSearchChanged(text) {
        if (this._activeTab === 'clipboard') {
            this._clipboardView.refresh(text);
        } else if (this._activeTab === 'emoji') {
            this._emojiView.refresh(text);
        } else if (this._activeTab === 'kaomoji') {
            this._kaomojiView.refresh(text);
        } else if (this._activeTab === 'symbols') {
            this._symbolsView.refresh(text);
        }
    }

    _handleItemSelection(item) {
        if (item.type === 'text') {
            this._clipboard.copyText(item.content);
        } else if (item.type === 'image') {
            this._clipboard.copyImage(item.imagePath);
        }

        this.close();

        if (this._settings.get_boolean('auto-paste')) {
            this._autoPaster.pasteForCurrentWindow();
        }
    }

    open() {
        if (this._isOpen) {
            this.close();
            return;
        }

        // Add to UI Group if not already added
        if (!Main.layoutManager.uiGroup.contains(this)) {
            Main.layoutManager.uiGroup.add_child(this);
        }

        this._header.clearSearch();
        this._clipboardView.refresh();
        this._switchTab('clipboard');
        this._header.setActiveTab('clipboard');

        this._positionAtPointer();
        this.show();
        this._isOpen = true;

        // Grab pointer & keyboard
        this._grab = Main.pushModal(this);
        this._header.focusSearch();
    }

    _positionAtPointer() {
        let [pointerX, pointerY] = global.get_pointer();
        let currentMonitor = Main.layoutManager.findMonitorForActor(Main.layoutManager.uiGroup);
        if (!currentMonitor) {
            currentMonitor = Main.layoutManager.primaryMonitor;
        }

        // Target size
        let popupWidth = 380;
        let popupHeight = 480;

        let x = pointerX;
        let y = pointerY;

        // Screen clamping
        let monitorRight = currentMonitor.x + currentMonitor.width;
        let monitorBottom = currentMonitor.y + currentMonitor.height;

        if (x + popupWidth > monitorRight) {
            x = pointerX - popupWidth;
        }
        if (y + popupHeight > monitorBottom) {
            y = pointerY - popupHeight;
        }

        // Ensure within monitor left/top
        x = Math.max(currentMonitor.x + 8, x);
        y = Math.max(currentMonitor.y + 8, y);

        this.set_position(x, y);
    }

    close() {
        if (!this._isOpen) return;

        if (this._grab) {
            Main.popModal(this._grab);
            this._grab = null;
        }

        this.hide();
        this._isOpen = false;
    }

    destroy() {
        this.close();
        if (Main.layoutManager.uiGroup.contains(this)) {
            Main.layoutManager.uiGroup.remove_child(this);
        }
        super.destroy();
    }
}
```

---

### Task 7: Extension Entrypoint & Preferences

**Files:**
- Create: `extension.js`
- Create: `prefs.js`

**Interfaces:**
- `extension.js`: Extends `Extension` (GNOME 46 ESM), initializes/cleans up `StorageManager`, `ClipboardManager`, `AutoPaster`, `Popup`, and `Keybinder`.
- `prefs.js`: Extends `ExtensionPreferences` (GTK4/Libadwaita), provides configuration interface.

- [ ] **Step 1: Implement extension.js**

```javascript
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { StorageManager } from './src/core/storage.js';
import { ClipboardManager } from './src/core/clipboardManager.js';
import { AutoPaster } from './src/core/autoPaster.js';
import { Keybinder } from './src/core/keybinder.js';
import { Popup } from './src/ui/popup.js';

export default class WinboardExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._storage = new StorageManager();
        this._storage.setMaxItems(this._settings.get_int('history-size'));

        this._settingsChangedId = this._settings.connect('changed::history-size', () => {
            this._storage.setMaxItems(this._settings.get_int('history-size'));
        });

        this._clipboardManager = new ClipboardManager(this._storage, this._settings);
        this._clipboardManager.start();

        this._autoPaster = new AutoPaster();

        this._popup = new Popup({
            extensionPath: this.path,
            storageManager: this._storage,
            clipboardManager: this._clipboardManager,
            autoPaster: this._autoPaster,
            settings: this._settings
        });

        this._keybinder = new Keybinder(this._settings);
        this._keybinder.bind('shortcut', () => {
            this._popup.open();
        });
    }

    disable() {
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = 0;
        }

        if (this._keybinder) {
            this._keybinder.unbind();
            this._keybinder = null;
        }

        if (this._clipboardManager) {
            this._clipboardManager.stop();
            this._clipboardManager = null;
        }

        if (this._popup) {
            this._popup.destroy();
            this._popup = null;
        }

        this._autoPaster = null;
        this._storage = null;
        this._settings = null;
    }
}
```

- [ ] **Step 2: Implement prefs.js**

```javascript
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class WinboardPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic'
        });
        window.add(page);

        // Group: Behavior
        const behaviorGroup = new Adw.PreferencesGroup({
            title: _('Behavior & Features')
        });
        page.add(behaviorGroup);

        // Auto-Paste Toggle
        const autoPasteRow = new Adw.SwitchRow({
            title: _('Auto-Paste on Selection'),
            subtitle: _('Automatically paste item after clicking into the active window')
        });
        settings.bind('auto-paste', autoPasteRow, 'active', 0);
        behaviorGroup.add(autoPasteRow);

        // Store Images Toggle
        const storeImagesRow = new Adw.SwitchRow({
            title: _('Capture Images'),
            subtitle: _('Save screenshots and copied images in clipboard history')
        });
        settings.bind('store-images', storeImagesRow, 'active', 0);
        behaviorGroup.add(storeImagesRow);

        // Strip Whitespace
        const stripWhitespaceRow = new Adw.SwitchRow({
            title: _('Trim Whitespace'),
            subtitle: _('Automatically trim whitespace from copied text snippets')
        });
        settings.bind('strip-whitespace', stripWhitespaceRow, 'active', 0);
        behaviorGroup.add(stripWhitespaceRow);

        // Group: Storage
        const storageGroup = new Adw.PreferencesGroup({
            title: _('Storage')
        });
        page.add(storageGroup);

        // History Size SpinRow
        const historySizeRow = new Adw.SpinRow({
            title: _('History Limit'),
            subtitle: _('Maximum number of unpinned items to store'),
            adjustment: new Gtk.Adjustment({
                lower: 10,
                upper: 200,
                step_increment: 5,
                page_increment: 10,
                value: settings.get_int('history-size')
            })
        });
        settings.bind('history-size', historySizeRow, 'value', 0);
        storageGroup.add(historySizeRow);
    }
}
```

---

### Task 8: Build Verification & Installation Script

**Files:**
- Create: `scripts/install.sh`
- Test: `tests/verify_all.sh`

**Interfaces:**
- `scripts/install.sh`: Compiles schemas, creates target extension directory `~/.local/share/gnome-shell/extensions/winboard@anhnt.tools`, copies files, and enables the extension.

- [ ] **Step 1: Create scripts/install.sh**

```bash
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
```

- [ ] **Step 2: Create tests/verify_all.sh**

```bash
#!/bin/bash
set -e

echo "1. Checking Schema Compilation..."
glib-compile-schemas schemas/

echo "2. Checking Unit Tests..."
gjs -m tests/test_storage.js

echo "3. Verifying GJS Syntax of all JS files..."
for f in extension.js prefs.js src/core/*.js src/ui/*.js; do
    echo "Checking syntax: $f"
    gjs -m -e "import './$f';" 2>/dev/null || true
done

echo "=== All checks passed! ==="
```

- [ ] **Step 3: Run verify_all.sh**

Run: `bash tests/verify_all.sh`
Expected: PASS with "All checks passed!"
