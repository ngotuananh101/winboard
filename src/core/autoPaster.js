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