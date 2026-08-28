import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export class StorageManager {
    constructor(customBaseDir = null) {
        this._baseDir = customBaseDir || GLib.build_filenamev([GLib.get_user_data_dir(), 'winboard']);
        this._cacheDir = GLib.build_filenamev([GLib.get_user_cache_dir(), 'winboard', 'images']);
        this._historyFile = GLib.build_filenamev([this._baseDir, 'history.json']);
        this._maxItems = 50;
        this._items = [];
        this._loaded = false;
        this._savePending = false;

        this._ensureDirectories();
    }

    setMaxItems(max) {
        this._maxItems = Math.max(5, max);
    }

    _ensureDirectories() {
        GLib.mkdir_with_parents(this._baseDir, 0o755);
        GLib.mkdir_with_parents(this._cacheDir, 0o755);
    }

    /**
     * Load history from disk asynchronously.
     * Returns a Promise that resolves when loading is complete.
     * Safe to call multiple times — subsequent calls are no-ops if already loaded.
     */
    async loadFromDisk() {
        if (this._loaded) return;

        try {
            let file = Gio.File.new_for_path(this._historyFile);
            let [ok, contents] = await new Promise(resolve => {
                file.load_contents_async(null, (_file, result) => {
                    try {
                        resolve(file.load_contents_finish(result));
                    } catch (e) {
                        resolve([false, null]);
                    }
                });
            });

            if (ok && contents) {
                let decoder = new TextDecoder('utf-8');
                let data = JSON.parse(decoder.decode(contents));
                if (data && Array.isArray(data.items)) {
                    let modified = false;
                    data.items.forEach(item => {
                        if (!item.id) {
                            item.id = GLib.uuid_string_random();
                            modified = true;
                        }
                    });
                    this._items = data.items;
                    if (modified) {
                        this._scheduleSave();
                    }
                }
            }
        } catch (e) {
            logError(e, 'Failed to load Winboard history');
        }

        this._loaded = true;
    }

    /**
     * Synchronous accessor for in-memory items.
     * Call loadFromDisk() first during extension enable().
     */
    getItems() {
        return this._items;
    }

    /**
     * Schedule an async save to disk. Debounced — multiple rapid calls
     * result in a single write.
     */
    _scheduleSave() {
        if (this._savePending) return;
        this._savePending = true;

        GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._savePending = false;
            this._writeToDisk();
            return GLib.SOURCE_REMOVE;
        });
    }

    /**
     * Write current items to disk asynchronously using atomic rename.
     */
    async _writeToDisk() {
        try {
            this._ensureDirectories();
            let jsonString = JSON.stringify({ items: this._items }, null, 2);
            let tmpPath = `${this._historyFile}.tmp`;
            let tmpFile = Gio.File.new_for_path(tmpPath);
            let destFile = Gio.File.new_for_path(this._historyFile);

            // Async write to temp file (requires GBytes, not string)
            let bytes = new GLib.Bytes(jsonString);
            await new Promise((resolve, reject) => {
                tmpFile.replace_contents_async(
                    bytes, null, false,
                    Gio.FileCreateFlags.REPLACE_DESTINATION,
                    null,
                    (_file, result) => {
                        try {
                            tmpFile.replace_contents_finish(result);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    }
                );
            });

            // Atomic rename: tmp -> final
            await new Promise((resolve, reject) => {
                tmpFile.move_async(
                    destFile,
                    Gio.FileCopyFlags.OVERWRITE,
                    GLib.PRIORITY_DEFAULT,
                    null,
                    null,
                    (_file, result) => {
                        try {
                            tmpFile.move_finish(result);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    }
                );
            });
        } catch (e) {
            logError(e, 'Failed to save Winboard history');
        }
    }

    addItem({ type, content = '', imagePath = '', pinned = false }) {
        let items = this._items;

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
        this._scheduleSave();
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
        let index = this._items.findIndex(i => i.id === id);
        if (index !== -1) {
            let removed = this._items.splice(index, 1)[0];
            if (removed.type === 'image' && removed.imagePath) {
                try {
                    let file = Gio.File.new_for_path(removed.imagePath);
                    file.delete(null);
                } catch (_) {}
            }
            this._scheduleSave();
            return true;
        }
        return false;
    }

    togglePin(id) {
        let item = this._items.find(i => i.id === id);
        if (item) {
            item.pinned = !item.pinned;
            this._scheduleSave();
            return item.pinned;
        }
        return false;
    }

    clearUnpinned() {
        this._items = this._items.filter(item => {
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
        this._scheduleSave();
    }
}
