import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { getLanguage, getText, getImageKeywords } from '../core/i18n.js';

export const ClipboardView = GObject.registerClass(
class ClipboardView extends St.ScrollView {
    _init(params = {}) {
        let { settings, storageManager, onItemSelected, ...stParams } = params;
        super._init({
            style_class: 'winboard-scroll-view',
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            x_expand: true,
            y_expand: true,
            ...stParams
        });

        this._settings = settings;
        this._lang = getLanguage(this._settings);
        this._storage = storageManager;
        this._onItemSelected = onItemSelected;
        this._currentFilter = '';

        this._container = new St.BoxLayout({
            vertical: true,
            style_class: 'winboard-items-list',
            x_expand: true
        });
        this.set_child(this._container);

        this.refresh();
    }

    updateLocale(lang) {
        this._lang = lang;
        this.refresh(this._currentFilter);
    }

    refresh(filterText = this._currentFilter) {
        this._currentFilter = filterText || '';
        this._container.destroy_all_children();

        let history = this._storage.loadHistory();
        let items = history.items || [];

        if (this._currentFilter) {
            let query = this._currentFilter.toLowerCase().trim();
            let imageKeywords = getImageKeywords(this._lang);
            items = items.filter(item => {
                if (item.type === 'text') {
                    return item.content.toLowerCase().includes(query);
                } else if (item.type === 'image') {
                    return imageKeywords.some(kw => kw.includes(query) || query.includes(kw));
                }
                return false;
            });
        }

        let pinnedItems = items.filter(i => i.pinned);
        let recentItems = items.filter(i => !i.pinned);

        if (pinnedItems.length === 0 && recentItems.length === 0) {
            let emptyLabel = new St.Label({
                text: this._currentFilter ? getText('empty_search', this._lang) : getText('empty_history', this._lang),
                style_class: 'winboard-empty-state'
            });
            this._container.add_child(emptyLabel);
            return;
        }

        // Pinned Section
        if (pinnedItems.length > 0) {
            let pinnedHeader = new St.Label({
                text: getText('pinned_section', this._lang),
                style_class: 'winboard-section-header'
            });
            this._container.add_child(pinnedHeader);

            pinnedItems.forEach(item => {
                this._container.add_child(this._createItemCard(item));
            });
        }

        // Recent Section
        if (recentItems.length > 0) {
            let recentHeaderBox = new St.BoxLayout({
                x_expand: true,
                style_class: 'winboard-header'
            });

            let recentLabel = new St.Label({
                text: getText('recent_section', this._lang),
                style_class: 'winboard-section-header',
                x_expand: true
            });
            recentHeaderBox.add_child(recentLabel);

            let clearBtn = new St.Button({
                label: getText('clear_all', this._lang),
                style_class: 'winboard-clear-button',
                can_focus: true
            });
            clearBtn.connect('clicked', () => {
                this._storage.clearUnpinned();
                this.refresh(this._currentFilter);
            });
            recentHeaderBox.add_child(clearBtn);

            this._container.add_child(recentHeaderBox);

            recentItems.forEach(item => {
                this._container.add_child(this._createItemCard(item));
            });
        }
    }

    _createItemCard(item) {
        let card = new St.Button({
            style_class: 'winboard-item-card',
            can_focus: true,
            x_expand: true
        });

        let box = new St.BoxLayout({
            vertical: true,
            x_expand: true
        });

        // Content
        if (item.type === 'text') {
            let displayText = item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content;
            let textLabel = new St.Label({
                text: displayText,
                style_class: 'winboard-item-text'
            });
            textLabel.clutter_text.line_wrap = true;
            textLabel.clutter_text.ellipsize = 3; // PANGO_ELLIPSIZE_END
            box.add_child(textLabel);
        } else if (item.type === 'image') {
            let imageActor = this._createImagePreview(item.imagePath);
            if (imageActor) {
                let previewBox = new St.BoxLayout({
                    style_class: 'winboard-image-preview-container',
                    x_align: Clutter.ActorAlign.CENTER,
                    y_align: Clutter.ActorAlign.CENTER,
                    x_expand: true
                });
                previewBox.add_child(imageActor);
                box.add_child(previewBox);
            } else {
                let imageLabel = new St.Label({
                    text: getText('image_unavailable', this._lang),
                    style_class: 'winboard-item-text'
                });
                box.add_child(imageLabel);
            }
        }

        // Footer with timestamp & actions
        let footer = new St.BoxLayout({
            style_class: 'winboard-item-footer',
            x_expand: true
        });

        let timeStr = this._formatTime(item.timestamp);
        let timeLabel = new St.Label({
            text: timeStr,
            style_class: 'winboard-item-time',
            x_expand: true
        });
        footer.add_child(timeLabel);

        // Pin Button
        let pinBtn = new St.Button({
            label: item.pinned ? '📌' : '📍',
            style_class: `winboard-icon-button ${item.pinned ? 'pinned' : ''}`,
            can_focus: true
        });
        pinBtn.connect('clicked', () => {
            this._storage.togglePin(item.id);
            this.refresh(this._currentFilter);
        });
        footer.add_child(pinBtn);

        // Delete Button
        let delBtn = new St.Button({
            label: '✕',
            style_class: 'winboard-icon-button',
            can_focus: true
        });
        delBtn.connect('clicked', () => {
            this._storage.removeItem(item.id);
            this.refresh(this._currentFilter);
        });
        footer.add_child(delBtn);

        box.add_child(footer);
        card.set_child(box);

        card.connect('clicked', () => {
            this._onItemSelected(item);
        });

        return card;
    }

    _createImagePreview(imagePath) {
        if (!imagePath || !GLib.file_test(imagePath, GLib.FileTest.EXISTS)) {
            return null;
        }

        try {
            const MAX_WIDTH = 320;
            const MAX_HEIGHT = 180;

            let [info, origW, origH] = GdkPixbuf.Pixbuf.get_file_info(imagePath);
            if (!info || origW <= 0 || origH <= 0) {
                return null;
            }

            let scale = Math.min(MAX_WIDTH / origW, MAX_HEIGHT / origH, 1.0);
            let targetW = Math.max(1, Math.round(origW * scale));
            let targetH = Math.max(1, Math.round(origH * scale));

            let pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
                imagePath,
                targetW,
                targetH,
                true
            );

            if (!pixbuf) {
                return null;
            }

            let image = new Clutter.Image();
            let format = pixbuf.get_has_alpha() ? Cogl.PixelFormat.RGBA_8888 : Cogl.PixelFormat.RGB_888;
            image.set_data(
                pixbuf.get_pixels(),
                format,
                pixbuf.get_width(),
                pixbuf.get_height(),
                pixbuf.get_rowstride()
            );

            let actor = new Clutter.Actor({
                content: image,
                width: pixbuf.get_width(),
                height: pixbuf.get_height(),
                x_align: Clutter.ActorAlign.CENTER,
                y_align: Clutter.ActorAlign.CENTER
            });

            return actor;
        } catch (e) {
            logError(e, 'Failed to create image preview');
            return null;
        }
    }

    _formatTime(timestamp) {
        if (!timestamp) return '';
        let date = new Date(timestamp);
        let hours = date.getHours().toString().padStart(2, '0');
        let mins = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${mins}`;
    }
});