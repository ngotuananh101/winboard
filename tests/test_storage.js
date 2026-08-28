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

// Test empty state (before async load)
let items = storage.getItems();
assert(Array.isArray(items), 'getItems() should return array');
assert(items.length === 0, 'initial items should be empty');

// Test adding text item
let item1 = storage.addItem({ type: 'text', content: 'Hello Winboard' });
assert(item1.id !== undefined, 'item should have uuid');
assert(item1.content === 'Hello Winboard', 'item content match');
assert(storage.getItems().length === 1, 'items count 1');

// Test deduplication / bumping
let item2 = storage.addItem({ type: 'text', content: 'Hello Winboard' });
assert(storage.getItems().length === 1, 'items count should remain 1 on duplicate');
assert(item2.id === item1.id, 'item id should match bumped item');

// Test adding second item
let item3 = storage.addItem({ type: 'text', content: 'Second Item' });
assert(storage.getItems().length === 2, 'items count should be 2');
assert(storage.getItems()[0].content === 'Second Item', 'latest item should be at head');

// Test toggle pin
storage.togglePin(item1.id);
assert(storage.getItems().find(i => i.id === item1.id).pinned === true, 'item1 should be pinned');

// Test clear unpinned
storage.clearUnpinned();
let remaining = storage.getItems();
assert(remaining.length === 1, 'only pinned item should remain');
assert(remaining[0].id === item1.id, 'remaining item should be item1');

// Test remove item
storage.removeItem(item1.id);
assert(storage.getItems().length === 0, 'items should be empty after delete');

// Test async loadFromDisk with pre-existing data
let rawHistoryFile = GLib.build_filenamev([testDir, 'history.json']);
GLib.file_set_contents(rawHistoryFile, JSON.stringify({
    items: [
        { type: 'text', content: 'Item without ID', timestamp: Date.now(), pinned: false }
    ]
}));

// Create a fresh storage instance to test loading
const storage2 = new StorageManager(testDir);
await storage2.loadFromDisk();
let loaded = storage2.getItems();
assert(loaded.length === 1, 'loaded items length should be 1');
assert(typeof loaded[0].id === 'string' && loaded[0].id.length > 0, 'missing id should be filled');

print('StorageManager tests passed successfully!');
