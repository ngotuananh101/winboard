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