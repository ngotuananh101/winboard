import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import { StorageManager } from "./src/core/storage.js";
import { ClipboardManager } from "./src/core/clipboardManager.js";
import { AutoPaster } from "./src/core/autoPaster.js";
import { Keybinder } from "./src/core/keybinder.js";
import { Popup } from "./src/ui/popup.js";

export default class WinboardExtension extends Extension {
  enable() {
    this._settings = this.getSettings();
    this._storage = new StorageManager();
    this._storage.setMaxItems(this._settings.get_int("history-size"));

    this._settingsChangedId = this._settings.connect(
      "changed::history-size",
      () => {
        this._storage.setMaxItems(this._settings.get_int("history-size"));
      },
    );

    this._shortcutChangedId = this._settings.connect(
      "changed::shortcut",
      () => {
        if (this._keybinder) {
          this._keybinder.rebind("shortcut");
        }
      },
    );

    this._clipboardManager = new ClipboardManager(
      this._storage,
      this._settings,
    );
    this._clipboardManager.start();

    this._autoPaster = new AutoPaster();
    this._keybinder = new Keybinder(this._settings);
    this._keybinder.bind("shortcut", () => {
      if (!this._popup) {
        this._popup = new Popup({
          extensionPath: this.path,
          storageManager: this._storage,
          clipboardManager: this._clipboardManager,
          autoPaster: this._autoPaster,
          settings: this._settings,
        });
      }
      this._popup.open();
    });
  }

  disable() {
    if (this._settingsChangedId) {
      this._settings.disconnect(this._settingsChangedId);
      this._settingsChangedId = 0;
    }

    if (this._shortcutChangedId) {
      this._settings.disconnect(this._shortcutChangedId);
      this._shortcutChangedId = 0;
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

    // Dọn dẹp virtual keyboard khi disable
    if (this._autoPaster) {
      this._autoPaster.destroy();
      this._autoPaster = null;
    }
    this._storage = null;
    this._settings = null;
  }
}
