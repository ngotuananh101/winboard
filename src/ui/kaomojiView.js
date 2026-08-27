import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

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
        this._categories = this._loadData();

        this._container = new St.BoxLayout({
            vertical: true,
            style_class: 'winboard-items-list',
            x_expand: true
        });
        this.set_child(this._container);

        this.refresh();
    }

    _loadData() {
        try {
            let jsonPath = GLib.build_filenamev([this._extensionPath, 'src', 'data', 'kaomoji.json']);
            let [ok, contents] = GLib.file_get_contents(jsonPath);
            if (ok) {
                let decoder = new TextDecoder('utf-8');
                return JSON.parse(decoder.decode(contents));
            }
        } catch (e) {
            logError(e, 'Failed to load kaomoji.json');
        }
        return [];
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