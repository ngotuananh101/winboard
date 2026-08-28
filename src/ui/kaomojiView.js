import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

export const KaomojiView = GObject.registerClass(
class KaomojiView extends St.ScrollView {
    _init(params = {}) {
        let { extensionPath, onItemSelected, ...stParams } = params;
        super._init({
            style_class: 'winboard-scroll-view',
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            x_expand: true,
            y_expand: true,
            ...stParams
        });

        this._extensionPath = extensionPath;
        this._onItemSelected = onItemSelected;
        this._categories = [];

        this._container = new St.BoxLayout({
            vertical: true,
            style_class: 'winboard-items-list',
            x_expand: true
        });
        this.set_child(this._container);

        // Load data asynchronously, then render
        this._loadDataAsync();
    }

    async _loadDataAsync() {
        try {
            let jsonPath = GLib.build_filenamev([this._extensionPath, 'src', 'data', 'kaomoji.json']);
            let file = Gio.File.new_for_path(jsonPath);
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
                this._categories = JSON.parse(decoder.decode(contents));
                this.refresh();
            }
        } catch (e) {
            logError(e, 'Failed to load kaomoji.json');
        }
    }

    refresh(filterText = '') {
        this._container.destroy_all_children();

        this._categories.forEach(cat => {
            let filteredItems = cat.items;
            if (filterText) {
                filteredItems = cat.items.filter(k => k.toLowerCase().includes(filterText));
            }

            if (filteredItems.length === 0) return;

            let catTitle = new St.Label({
                text: cat.category,
                style_class: 'winboard-grid-category-title'
            });
            this._container.add_child(catTitle);

            // Row-based flow (2 items per row for kaomoji, which are wider)
            let row = null;
            filteredItems.forEach((kaomoji, idx) => {
                if (idx % 2 === 0) {
                    row = new St.BoxLayout({
                        style_class: 'winboard-emoji-grid',
                        x_expand: true
                    });
                    this._container.add_child(row);
                }

                let btn = new St.Button({
                    label: kaomoji,
                    style_class: 'winboard-kaomoji-button',
                    can_focus: true,
                    x_expand: true
                });
                btn.connect('clicked', () => {
                    this._onItemSelected({ type: 'text', content: kaomoji });
                });
                row.add_child(btn);
            });
        });
    }
});
