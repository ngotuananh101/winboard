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

// Test empty load
let history = storage.loadHistory();
assert(Array.isArray(history.items), 'history.items should be array');
assert(history.items.length === 0, 'initial history should be empty');

// Test adding text item
let item1 = storage.addItem({ type: 'text', content: 'Hello Winboard' });
assert(item1.id !== undefined, 'item should have uuid');
assert(item1.content === 'Hello Winboard', 'item content match');
assert(storage.loadHistory().items.length === 1, 'history count 1');

// Test deduplication / bumping
let item2 = storage.addItem({ type: 'text', content: 'Hello Winboard' });
assert(storage.loadHistory().items.length === 1, 'history count should remain 1 on duplicate');
assert(item2.id === item1.id, 'item id should match bumped item');

// Test adding second item
let item3 = storage.addItem({ type: 'text', content: 'Second Item' });
assert(storage.loadHistory().items.length === 2, 'history count should be 2');
assert(storage.loadHistory().items[0].content === 'Second Item', 'latest item should be at head');

// Test toggle pin
storage.togglePin(item1.id);
assert(storage.loadHistory().items.find(i => i.id === item1.id).pinned === true, 'item1 should be pinned');

// Test clear unpinned
storage.clearUnpinned();
let remaining = storage.loadHistory().items;
assert(remaining.length === 1, 'only pinned item should remain');
assert(remaining[0].id === item1.id, 'remaining item should be item1');

// Test remove item
storage.removeItem(item1.id);
assert(storage.loadHistory().items.length === 0, 'history should be empty after delete');

// Test items without id get assigned an ID automatically
let rawHistoryFile = GLib.build_filenamev([testDir, 'history.json']);
GLib.file_set_contents(rawHistoryFile, JSON.stringify({
    items: [
        { type: 'text', content: 'Item without ID', timestamp: Date.now(), pinned: false }
    ]
}));
let reloaded = storage.loadHistory();
assert(reloaded.items.length === 1, 'reloaded items length should be 1');
assert(typeof reloaded.items[0].id === 'string' && reloaded.items[0].id.length > 0, 'missing id should be filled');

print('StorageManager tests passed successfully!');
