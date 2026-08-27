import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Header } from './header.js';
import { ClipboardView } from './clipboardView.js';
import { EmojiView } from './emojiView.js';
import { KaomojiView } from './kaomojiView.js';
import { SymbolsView } from './symbolsView.js';

export const Popup = GObject.registerClass(
class Popup extends St.Widget {
    _init(params = {}) {
        let { extensionPath, storageManager, clipboardManager, autoPaster, settings, ...stParams } = params;
        super._init({
            reactive: true,
            can_focus: true,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            ...stParams
        });

        this._extensionPath = extensionPath;
        this._storage = storageManager;
        this._clipboard = clipboardManager;
        this._autoPaster = autoPaster;
        this._settings = settings;
        this._isOpen = false;
        this._grab = null;

        this._activeTab = 'clipboard';

        this.add_constraint(new Clutter.BindConstraint({
            source: Main.layoutManager.uiGroup,
            coordinate: Clutter.BindCoordinate.ALL
        }));

        this._buildUI();
    }

    _buildUI() {
        // Dismiss when clicking the backdrop outside the card
        this.connect('button-press-event', (actor, event) => {
            let source = event.get_source();
            if (source === this || !this._card.contains(source)) {
                this.close();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });

        // The inner floating card container
        this._card = new St.BoxLayout({
            vertical: true,
            style_class: 'winboard-popup',
            reactive: true,
            can_focus: true
        });

        // Header (Search + Tabs)
        this._header = new Header({
            onSearchChanged: (text) => this._onSearchChanged(text),
            onTabSelected: (tabId) => this._switchTab(tabId)
        });
        this._card.add_child(this._header);

        // Content Views
        this._viewsStack = new St.Widget({
            layout_manager: new Clutter.BinLayout(),
            x_expand: true,
            y_expand: true
        });

        this._clipboardView = new ClipboardView({
            storageManager: this._storage,
            onItemSelected: (item) => this._handleItemSelection(item)
        });

        this._emojiView = new EmojiView({
            extensionPath: this._extensionPath,
            onItemSelected: (item) => this._handleItemSelection(item)
        });

        this._kaomojiView = new KaomojiView({
            extensionPath: this._extensionPath,
            onItemSelected: (item) => this._handleItemSelection(item)
        });

        this._symbolsView = new SymbolsView({
            extensionPath: this._extensionPath,
            onItemSelected: (item) => this._handleItemSelection(item)
        });

        this._viewsStack.add_child(this._clipboardView);
        this._viewsStack.add_child(this._emojiView);
        this._viewsStack.add_child(this._kaomojiView);
        this._viewsStack.add_child(this._symbolsView);

        this._card.add_child(this._viewsStack);
        this.add_child(this._card);

        this._switchTab('clipboard');

        // Capture key events for Esc dismissal
        this.connect('key-press-event', (actor, event) => {
            let symbol = event.get_key_symbol();
            if (symbol === Clutter.KEY_Escape) {
                this.close();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
    }

    _switchTab(tabId) {
        this._activeTab = tabId;
        this._clipboardView.visible = (tabId === 'clipboard');
        this._emojiView.visible = (tabId === 'emoji');
        this._kaomojiView.visible = (tabId === 'kaomoji');
        this._symbolsView.visible = (tabId === 'symbols');

        this._onSearchChanged(this._header.searchEntry.get_text().toLowerCase().trim());
    }

    _onSearchChanged(text) {
        if (this._activeTab === 'clipboard') {
            this._clipboardView.refresh(text);
        } else if (this._activeTab === 'emoji') {
            this._emojiView.refresh(text);
        } else if (this._activeTab === 'kaomoji') {
            this._kaomojiView.refresh(text);
        } else if (this._activeTab === 'symbols') {
            this._symbolsView.refresh(text);
        }
    }

    _handleItemSelection(item) {
        if (item.type === 'text') {
            this._clipboard.copyText(item.content);
        } else if (item.type === 'image') {
            this._clipboard.copyImage(item.imagePath);
        }

        this.close();

        if (this._settings.get_boolean('auto-paste')) {
            this._autoPaster.pasteForCurrentWindow();
        }
    }

    open() {
        if (this._isOpen) {
            this.close();
            return;
        }

        // Add to UI Group if not already added
        if (!Main.layoutManager.uiGroup.contains(this)) {
            Main.layoutManager.uiGroup.add_child(this);
        }

        this._header.clearSearch();
        this._clipboardView.refresh();
        this._switchTab('clipboard');
        this._header.setActiveTab('clipboard');

        this._positionAtPointer();
        this.show();
        this._isOpen = true;

        // Grab pointer & keyboard
        this._grab = Main.pushModal(this);
        this._header.focusSearch();
    }

    _positionAtPointer() {
        // Expand full screen backdrop for outside click capturing
        this.set_position(Main.layoutManager.uiGroup.x, Main.layoutManager.uiGroup.y);
        this.set_size(Main.layoutManager.uiGroup.width, Main.layoutManager.uiGroup.height);

        let [pointerX, pointerY] = global.get_pointer();

        // Find the monitor containing the pointer
        let currentMonitor = null;
        for (let monitor of Main.layoutManager.monitors) {
            if (pointerX >= monitor.x && pointerX < monitor.x + monitor.width &&
                pointerY >= monitor.y && pointerY < monitor.y + monitor.height) {
                currentMonitor = monitor;
                break;
            }
        }
        if (!currentMonitor) {
            currentMonitor = Main.layoutManager.primaryMonitor;
        }

        // Target size
        let popupWidth = 380;
        let popupHeight = 480;

        let x = pointerX;
        let y = pointerY;

        // Screen clamping
        let monitorRight = currentMonitor.x + currentMonitor.width;
        let monitorBottom = currentMonitor.y + currentMonitor.height;

        if (x + popupWidth > monitorRight) {
            x = pointerX - popupWidth;
        }
        if (y + popupHeight > monitorBottom) {
            y = pointerY - popupHeight;
        }

        // Ensure within monitor left/top
        x = Math.max(currentMonitor.x + 8, x);
        y = Math.max(currentMonitor.y + 8, y);

        this._card.set_position(x, y);
    }

    close() {
        if (!this._isOpen) return;

        if (this._grab) {
            Main.popModal(this._grab);
            this._grab = null;
        }

        this.hide();
        this._isOpen = false;
    }

    destroy() {
        this.close();
        if (Main.layoutManager.uiGroup.contains(this)) {
            Main.layoutManager.uiGroup.remove_child(this);
        }
        super.destroy();
    }
});