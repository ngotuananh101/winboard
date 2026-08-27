import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { getLanguage, getText } from '../core/i18n.js';

export const Header = GObject.registerClass(
class Header extends St.BoxLayout {
    _init(params = {}) {
        let { settings, onSearchChanged, onTabSelected, ...stParams } = params;
        super._init({
            vertical: true,
            style_class: 'winboard-header',
            ...stParams
        });

        this._settings = settings;
        this._lang = getLanguage(this._settings);
        this._onSearchChanged = onSearchChanged;
        this._onTabSelected = onTabSelected;

        this._buildSearchEntry();
        this._buildTabsBar();
    }

    _buildSearchEntry() {
        this.searchEntry = new St.Entry({
            hint_text: getText('search_placeholder', this._lang),
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
            { id: 'clipboard', key: 'tab_clipboard' },
            { id: 'emoji', key: 'tab_emoji' },
            { id: 'kaomoji', key: 'tab_kaomoji' },
            { id: 'symbols', key: 'tab_symbols' }
        ];

        tabs.forEach((tab, index) => {
            let btn = new St.Button({
                label: getText(tab.key, this._lang),
                style_class: 'winboard-tab-button',
                can_focus: true
            });

            if (index === 0) btn.add_style_class_name('active');

            btn.connect('clicked', () => {
                this.setActiveTab(tab.id);
            });

            this._tabButtons.push({ id: tab.id, key: tab.key, button: btn });
            this.tabsBar.add_child(btn);
        });

        this.add_child(this.tabsBar);
    }

    updateLocale(lang) {
        this._lang = lang;
        if (this.searchEntry) {
            this.searchEntry.hint_text = getText('search_placeholder', this._lang);
        }
        if (this._tabButtons) {
            this._tabButtons.forEach(t => {
                t.button.set_label(getText(t.key, this._lang));
            });
        }
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
});
