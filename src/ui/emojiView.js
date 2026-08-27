import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

export class EmojiView extends St.ScrollView {
    constructor({ extensionPath, onItemSelected }) {
        super({
            style_class: 'winboard-scroll-view',
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            x_expand: true,
            y_expand: true
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
            let jsonPath = GLib.build_filenamev([this._extensionPath, 'src', 'data', 'emojis.json']);
            let [ok, contents] = GLib.file_get_contents(jsonPath);
            if (ok) {
                let decoder = new TextDecoder('utf-8');
                return JSON.parse(decoder.decode(contents));
            }
        } catch (e) {
            logError(e, 'Failed to load emojis.json');
        }
        return [];
    }

    refresh(filterText = '') {
        this._container.destroy_all_children();

        this._categories.forEach(cat => {
            let filteredItems = cat.items;
            if (filterText) {
                filteredItems = cat.items.filter(emoji => emoji.includes(filterText));
            }

            if (filteredItems.length === 0) return;

            let catTitle = new St.Label({
                text: cat.category,
                style_class: 'winboard-grid-category-title'
            });
            this._container.add_child(catTitle);

            // Row-based grid (8 items per row)
            let row = null;
            filteredItems.forEach((emoji, idx) => {
                if (idx % 8 === 0) {
                    row = new St.BoxLayout({
                        style_class: 'winboard-emoji-grid',
                        x_expand: true
                    });
                    this._container.add_child(row);
                }

                let btn = new St.Button({
                    label: emoji,
                    style_class: 'winboard-emoji-button',
                    can_focus: true
                });
                btn.connect('clicked', () => {
                    this._onItemSelected({ type: 'text', content: emoji });
                });
                row.add_child(btn);
            });
        });
    }
}