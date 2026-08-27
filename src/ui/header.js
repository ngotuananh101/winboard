import St from 'gi://St';
import Clutter from 'gi://Clutter';

export class Header extends St.BoxLayout {
    constructor({ onSearchChanged, onTabSelected }) {
        super({
            vertical: true,
            style_class: 'winboard-header'
        });

        this._onSearchChanged = onSearchChanged;
        this._onTabSelected = onTabSelected;

        this._buildSearchEntry();
        this._buildTabsBar();
    }

    _buildSearchEntry() {
        this.searchEntry = new St.Entry({
            hint_text: 'Tìm kiếm trong lịch sử / emoji...',
            style_class: 'winboard-search-entry',
            can_focus: true
        });

        this.searchEntry.clutter_text.connect('text-changed', () => {
            this._onSearchChanged(this.searchEntry.get_text().toLowerCase().trim());
        });

        this.add_child(this.searchEntry);
    }

    _buildTabsBar() {
        this.tabsBar = new St.BoxLayout({
            style_class: 'winboard-tabs-bar',
            x_expand: true
        });

        this._tabButtons = [];
        const tabs = [
            { id: 'clipboard', label: '📋 Clipboard' },
            { id: 'emoji', label: '😀 Emoji' },
            { id: 'kaomoji', label: '¯\\_(ツ)' },
            { id: 'symbols', label: 'Ω Ký tự' }
        ];

        tabs.forEach((tab, index) => {
            let btn = new St.Button({
                label: tab.label,
                style_class: 'winboard-tab-button',
                can_focus: true
            });

            if (index === 0) btn.add_style_class_name('active');

            btn.connect('clicked', () => {
                this.setActiveTab(tab.id);
            });

            this._tabButtons.push({ id: tab.id, button: btn });
            this.tabsBar.add_child(btn);
        });

        this.add_child(this.tabsBar);
    }

    setActiveTab(tabId) {
        this._tabButtons.forEach(t => {
            if (t.id === tabId) {
                t.button.add_style_class_name('active');
            } else {
                t.button.remove_style_class_name('active');
            }
        });
        this._onTabSelected(tabId);
    }

    focusSearch() {
        this.searchEntry.grab_key_focus();
    }

    clearSearch() {
        this.searchEntry.set_text('');
    }
}
