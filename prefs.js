import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class WinboardPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic'
        });
        window.add(page);

        // Group: Behavior
        const behaviorGroup = new Adw.PreferencesGroup({
            title: _('Behavior & Features')
        });
        page.add(behaviorGroup);

        // Auto-Paste Toggle
        const autoPasteRow = new Adw.SwitchRow({
            title: _('Auto-Paste on Selection'),
            subtitle: _('Automatically paste item after clicking into the active window')
        });
        settings.bind('auto-paste', autoPasteRow, 'active', 0);
        behaviorGroup.add(autoPasteRow);

        // Store Images Toggle
        const storeImagesRow = new Adw.SwitchRow({
            title: _('Capture Images'),
            subtitle: _('Save screenshots and copied images in clipboard history')
        });
        settings.bind('store-images', storeImagesRow, 'active', 0);
        behaviorGroup.add(storeImagesRow);

        // Strip Whitespace
        const stripWhitespaceRow = new Adw.SwitchRow({
            title: _('Trim Whitespace'),
            subtitle: _('Automatically trim whitespace from copied text snippets')
        });
        settings.bind('strip-whitespace', stripWhitespaceRow, 'active', 0);
        behaviorGroup.add(stripWhitespaceRow);

        // Group: Storage
        const storageGroup = new Adw.PreferencesGroup({
            title: _('Storage')
        });
        page.add(storageGroup);

        // History Size SpinRow
        const historySizeRow = new Adw.SpinRow({
            title: _('History Limit'),
            subtitle: _('Maximum number of unpinned items to store'),
            adjustment: new Gtk.Adjustment({
                lower: 10,
                upper: 200,
                step_increment: 5,
                page_increment: 10,
                value: settings.get_int('history-size')
            })
        });
        settings.bind('history-size', historySizeRow, 'value', 0);
        storageGroup.add(historySizeRow);
    }
}