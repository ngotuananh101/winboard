# Winboard - Windows 11 Style Clipboard Manager for GNOME Shell 46

**Winboard** is a GNOME Shell extension that brings the seamless **Windows 11 Clipboard Manager experience (`Win + V`)** to GNOME 46 (Wayland & X11).

---

## ✨ Features

- 🚀 **Open at Cursor Position**: Press `Super + V` to toggle the floating popup right at your mouse pointer (with automatic screen edge clamping to prevent overflow).
- 📋 **Rich Clipboard History**: Automatically tracks and stores copied text, code snippets, URLs, and image screenshots (`image/png`) with natural aspect ratio previews.
- 📌 **Smart Pinning**: Pin important items so they stay permanently and never get pruned during cleanups or when storage reaches its limit.
- 😀 **4-in-1 Picker Tabs**:
  - **Clipboard**: Clipboard history with search, pin, and individual/bulk delete.
  - **Emoji**: Comprehensive Unicode emoji category grid.
  - **Kaomoji**: Expressive Japanese text emoticons (e.g., `¯\_(ツ)_/¯`, `(╯°□°)╯︵ ┻━┻`).
  - **Symbols**: Mathematical symbols, currency (`$`, `€`, `¥`, `₫`), arrows, punctuation, and Greek letters.
- ⚡ **Intelligent Auto-Paste**: Automatically detects the active window type:
  - Terminal windows (`gnome-terminal`, `ptyxis`, `alacritty`, `kitty`...): Sends virtual `Ctrl + Shift + V`.
  - Regular applications (Browsers, VSCode, text editors...): Sends virtual `Ctrl + V`.
- 🌐 **Multilingual Support**: English (default) and Vietnamese, configurable directly in Preferences.
- ⌨️ **Customizable Shortcuts**: Rebind the popup activation shortcut interactively in Preferences (with built-in conflict resolution and Reset button).
- 🎨 **Windows 11 Fluent Design**: Smooth acrylic/glassmorphism background, subtle border glow, and modern rounded corners.

---

## 🛠️ Installation & Usage

### 1. Local Installation
Run the included installation script:
```bash
./scripts/install.sh
```

### 2. Enable the Extension
- If you are on **Wayland**, GNOME Shell requires a session restart to recognize newly installed extensions in `~/.local/share/gnome-shell/extensions/`:
  - **Log Out** and **Log Back In**.
- Enable the extension via terminal:
```bash
gnome-extensions enable winboard@ponta.dev
```
or toggle **Winboard** in the **Extensions** app.

### 3. Shortcuts & Preferences
- Default shortcut: `Super + V` (or `Win + V`).
- Open **Preferences** (Extension Settings) to customize:
  - **Interface Language**: Switch between **English** and **Tiếng Việt**.
  - **Keyboard Shortcut**: Record a custom shortcut combination or reset to `<Super>v`.
  - **Auto-Paste on Selection**: Enable/disable automatic pasting after selection.
  - **Capture Images**: Enable/disable image screenshot tracking.
  - **History Limit**: Adjust max stored unpinned items (10 – 200).
  - **Trim Whitespace**: Automatically remove leading and trailing whitespace from copied text snippets.

### 4. Package for extensions.gnome.org (EGO)
To create a bundle ready for submission:
```bash
./scripts/package.sh
```
The validated extension package will be generated at `build/winboard@ponta.dev.shell-extension.zip`, ready for upload to [GNOME Extensions Upload](https://extensions.gnome.org/upload/).

---

## 🧪 Verification & Testing

Run the automated test suite:
```bash
bash tests/verify_all.sh
```

## 📄 License

GPL-3.0-or-later
