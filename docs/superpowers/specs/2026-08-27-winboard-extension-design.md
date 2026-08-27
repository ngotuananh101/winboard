# Winboard - Windows 11 Style Clipboard Manager for GNOME Shell 46

**Date:** 2026-08-27  
**Status:** Approved  
**Target Platform:** GNOME Shell 46 (ESM, Wayland & X11)  
**UUID:** `winboard@anhnt.tools`

---

## 1. Overview & Goals

Winboard is a GNOME Shell extension replicating the sleek, fluent aesthetic and functionality of the Windows 11 Clipboard Manager (`Win + V`):
- Open a floating popup container right at the current mouse cursor location with intelligent screen-edge clamping.
- Comprehensive history tracking: Plain text, formatted text/code snippets, images/screenshots.
- Pinning system: Keep important items from being cleared or pruned.
- Full Windows 11 style tabs: **Clipboard History**, **Emoji Picker**, **Kaomoji**, and **Special Symbols**.
- One-click selection with intelligent Auto-Paste (adapting `Ctrl+V` vs `Ctrl+Shift+V` for terminal windows).
- Search filtering across history and emoji/symbol datasets.
- Native GNOME 46 ESM implementation with zero external daemon dependencies.

---

## 2. Architecture & File Structure

```text
winboard/
├── metadata.json              # Shell 46 ESM metadata and UUID
├── extension.js               # Extension lifecycle (Extension class: enable/disable)
├── stylesheet.css             # Windows 11 Fluent UI theme (Acrylic, blur, borders)
├── schemas/
│   ├── org.gnome.shell.extensions.winboard.gschema.xml
│   └── gschemas.compiled
├── prefs.js                   # Preferences UI (GTK4 + Libadwaita)
├── src/
│   ├── ui/
│   │   ├── popup.js           # Floating popup positioned at mouse coordinates
│   │   ├── header.js          # Search bar & Tab navigation bar
│   │   ├── clipboardView.js   # Clipboard history list (Pinned & Recent sections)
│   │   ├── emojiView.js       # Categorized Emoji grid with search
│   │   ├── kaomojiView.js     # Japanese Kaomoji selector
│   │   └── symbolsView.js     # Math, currency, punctuation, arrow symbols
│   ├── core/
│   │   ├── clipboardManager.js # Listens to St.Clipboard, processes text/images
│   │   ├── storage.js         # JSON history persistence & image cache handling
│   │   ├── autoPaster.js      # Virtual input keypress simulation via Clutter
│   │   └── keybinder.js       # Global keybinding management (Super+V)
│   └── data/
│       ├── emojis.json        # Categorized Unicode emojis
│       ├── kaomoji.json       # Kaomoji dataset
│       └── symbols.json       # Special symbols dataset
└── assets/
    ├── icons/                 # UI icons (pin, unpin, trash, tabs)
    └── data/
```

---

## 3. Detailed Component Specifications

### 3.1. Core Modules

#### `core/clipboardManager.js`
- Connects to `St.Clipboard.get_default().connect('owner-changed', ...)` to detect copy actions.
- Ignores internal copy events triggered by Winboard to prevent feedback loops.
- Reads `St.ClipboardType.CLIPBOARD` content:
  - Text: UTF-8 string extracted via `get_text()`.
  - Image: Extracted as bytes when MIME `image/png` or `image/jpeg` is available, saved as thumbnail in `~/.cache/winboard/images/<hash>.png`.
- Password / Private flag detection: Checks for `x-kde-passwordManagerHint` to avoid saving sensitive credentials.
- Deduplication: Avoids adding consecutive identical copies.

#### `core/storage.js`
- Path: `~/.local/share/winboard/history.json`.
- Structure:
  ```json
  {
    "items": [
      {
        "id": "uuid-v4",
        "type": "text",
        "content": "copied string...",
        "timestamp": 1724748000,
        "pinned": true
      },
      {
        "id": "uuid-v4",
        "type": "image",
        "imagePath": "/home/user/.cache/winboard/images/abc.png",
        "timestamp": 1724747900,
        "pinned": false
      }
    ]
  }
  ```
- Max items: Configurable (default 50). Pinned items are exempt from automatic pruning and "Clear All".

#### `core/autoPaster.js`
- Focus handling: Closes popup, yields focus back to the previously active `Meta.Window`.
- Terminal detection: Inspects active window `wm_class` (e.g., `gnome-terminal`, `ptyxis`, `alacritty`, `kitty`, `foot`, `tilix`).
  - Terminal windows: Dispatches `Ctrl + Shift + V`.
  - Standard windows: Dispatches `Ctrl + V`.
- Uses `Clutter.get_default_backend().get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE)` to inject key down and key up events.

#### `core/keybinder.js`
- Manages global keybinding `Super+V` via `Main.wm.addKeybinding` and `GSettings`.

---

### 3.2. User Interface (`src/ui/`)

#### `ui/popup.js`
- Built on `St.Widget` / `Clutter.Actor` inserted into `Main.layoutManager.uiGroup`.
- Mouse Cursor Placement:
  - Fetches cursor position via `global.get_pointer()`.
  - Screen Clamping: Queries current monitor work area dimensions (`Main.layoutManager.monitors`). Shifts popup position left or up if opening downwards/rightwards would cause overflow.
- Clutter Grab: Grabs keyboard & pointer to capture clicks outside the popup (modal behavior) and dismisses on `Esc` or external clicks.

#### `ui/header.js`
- **Search Entry**: `St.Entry` with placeholder "Tìm kiếm trong lịch sử / emoji...". Filters active tab items dynamically on `text-changed`.
- **Tab Bar**: Horizontal buttons for 4 modes:
  1. `Clipboard` (📋)
  2. `Emoji` (😀)
  3. `Kaomoji` (¯\\_(ツ)_/¯)
  4. `Symbols` (Ω)
- Supports keyboard navigation: `Tab`/`Shift+Tab` or `Ctrl+1..4`.

#### `ui/clipboardView.js`
- Divided into:
  - **Pinned Section** (📌 ĐÃ GHIM): Displays pinned items.
  - **Recent Section** (🕒 GẦN ĐÂY): Displays recent unpinned items + "Clear All" (🗑️) button.
- Item Card:
  - Text preview (up to 3 lines, formatted).
  - Image thumbnail for screenshot items.
  - Timestamp label.
  - Action buttons: Pin / Unpin button, Delete individual item button.
  - Click event: Loads content to `St.Clipboard` -> Closes popup -> Triggers `AutoPaster`.

#### `ui/emojiView.js`, `kaomojiView.js`, `symbolsView.js`
- Grid layouts with category selector (Smileys, People, Animals, Food, Math, Currency, etc.).
- Clicking any emoji/symbol copies it and triggers auto-paste into active input.

---

## 4. Visual Design & Theme (`stylesheet.css`)

- Windows 11 Fluent aesthetic:
  - Background: `rgba(32, 32, 32, 0.85)` (Dark mode) / `rgba(243, 243, 243, 0.85)` (Light mode) with subtle border `1px solid rgba(255, 255, 255, 0.1)`.
  - Border radius: `12px` for container, `8px` for item cards.
  - Smooth hover transitions, scrollbar styling, active state glow.

---

## 5. Configuration & Preferences (`prefs.js`)

Libadwaita settings page:
- **Shortcut configuration**: Key combination accelerator (default: `<Super>v`).
- **History limit**: SpinRow (range 10 - 200, default 50).
- **Auto-Paste toggle**: SwitchRow (default: enabled).
- **Image capture toggle**: SwitchRow (default: enabled).
- **Clear history button**: ActionRow with destructive action button.

---

## 6. Testing & Validation Plan

1. **Clipboard Capture Verification**:
   - Copy short text, long text, code with indentation, and screenshot via GNOME screenshot tool (`PrintScreen`).
   - Verify items appear in storage and popup.
2. **Popup Positioning Verification**:
   - Trigger `Super+V` at screen center, top-left, bottom-right, and dual-monitor edges.
   - Ensure popup never renders off-screen.
3. **Auto-Paste Verification**:
   - Test in Text Editor / Browser (verify `Ctrl+V` pastes instantly).
   - Test in GNOME Terminal / Alacritty (verify `Ctrl+Shift+V` pastes correctly without escape codes).
4. **Lifecycle & Cleanliness**:
   - Enable/disable extension multiple times; verify no signal leaks or lingering clutter actors.
