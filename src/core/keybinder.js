import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class Keybinder {
    constructor(settings) {
        this._settings = settings;
        this._boundAction = null;
        this._shellSettings = new Gio.Settings({ schema_id: 'org.gnome.shell.keybindings' });
        this._overriddenTrayKeys = null;
    }

    bind(keyName, handler) {
        this.unbind(keyName);
        this._boundAction = keyName;
        this._handler = handler;

        // Automatically liberate Super+V from GNOME's built-in toggle-message-tray if needed
        this._resolveConflicts();

        Main.wm.addKeybinding(
            keyName,
            this._settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW | Shell.ActionMode.POPUP,
            handler
        );
    }

    rebind(keyName = null, handler = null) {
        let action = keyName || this._boundAction;
        let h = handler || this._handler;
        if (action && h) {
            this.bind(action, h);
        }
    }

    _resolveConflicts() {
        try {
            let shortcutKeys = this._settings.get_strv('shortcut');
            let hasSuperV = shortcutKeys.some(k => k.toLowerCase() === '<super>v');
            if (hasSuperV) {
                let trayKeys = this._shellSettings.get_strv('toggle-message-tray');
                if (trayKeys.some(k => k.toLowerCase() === '<super>v')) {
                    this._overriddenTrayKeys = [...trayKeys];
                    let filtered = trayKeys.filter(k => k.toLowerCase() !== '<super>v');
                    if (filtered.length === 0) filtered = ['<Super>m'];
                    this._shellSettings.set_strv('toggle-message-tray', filtered);
                }
            }
        } catch (e) {
            logError(e, 'Failed to resolve GNOME shortcut conflict');
        }
    }

    unbind(keyName = null) {
        let name = keyName || this._boundAction;
        if (name) {
            Main.wm.removeKeybinding(name);
            if (name === this._boundAction) {
                this._boundAction = null;
            }
        }

        // Restore original tray keys on disable if we modified them
        if (this._overriddenTrayKeys && this._shellSettings) {
            try {
                this._shellSettings.set_strv('toggle-message-tray', this._overriddenTrayKeys);
                this._overriddenTrayKeys = null;
            } catch (_) {}
        }
    }
}