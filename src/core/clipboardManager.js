import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

export class ClipboardManager {
    constructor(storageManager, settings) {
        this._storage = storageManager;
        this._settings = settings;
        this._clipboard = St.Clipboard.get_default();
        this._selection = null;
        this._ownerChangedId = 0;
        this._ignoreNextChange = false;
        this._lastCopiedText = null;
    }

    start() {
        if (this._ownerChangedId === 0) {
            if (typeof global !== 'undefined' && global.display) {
                this._selection = global.display.get_selection();
                if (this._selection) {
                    this._ownerChangedId = this._selection.connect('owner-changed', (_selection, selectionType) => {
                        if (selectionType === Meta.SelectionType.SELECTION_CLIPBOARD) {
                            this._onClipboardChanged();
                        }
                    });
                }
            }
        }
    }

    stop() {
        if (this._ownerChangedId !== 0 && this._selection) {
            this._selection.disconnect(this._ownerChangedId);
            this._ownerChangedId = 0;
            this._selection = null;
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