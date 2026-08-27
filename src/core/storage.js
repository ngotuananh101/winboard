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
