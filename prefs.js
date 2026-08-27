import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Adw from 'gi://Adw';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { getLanguage, getText } from './src/core/i18n.js';

export default class WinboardPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        let currentLang = getLanguage(settings);
        const _t = (key) => getText(key, currentLang);

        const page = new Adw.PreferencesPage({
            title: _t('prefs_general'),
            icon_name: 'dialog-information-symbolic'
        });
        window.add(page);

        // Group 1: Language
        const languageGroup = new Adw.PreferencesGroup({
            title: _t('prefs_language')
        });
        page.add(languageGroup);

        const langModel = new Gtk.StringList();
        langModel.append('English');
        langModel.append('Tiếng Việt');

        const langRow = new Adw.ComboRow({
            title: _t('prefs_language_title'),
            subtitle: _t('prefs_language_sub'),
            model: langModel,
            selected: currentLang === 'vi' ? 1 : 0
        });
        languageGroup.add(langRow);

        // Group 2: Keyboard Shortcuts
        const shortcutGroup = new Adw.PreferencesGroup({
            title: _t('prefs_shortcuts')
        });
        page.add(shortcutGroup);

        const shortcutRow = new Adw.ActionRow({
            title: _t('prefs_popup_shortcut_title'),
            subtitle: _t('prefs_popup_shortcut_sub')
        });

        const currentShortcut = () => {
            let sc = settings.get_strv('shortcut');
            return (sc && sc.length > 0) ? sc[0] : '<Super>v';
        };

        const shortcutLabel = new Gtk.ShortcutLabel({
            accelerator: currentShortcut(),
            valign: Gtk.Align.CENTER
        });
        shortcutRow.add_suffix(shortcutLabel);

        const changeButton = new Gtk.Button({
            label: _t('prefs_change_shortcut'),
            valign: Gtk.Align.CENTER
        });
        shortcutRow.add_suffix(changeButton);

        const resetButton = new Gtk.Button({
            label: _t('prefs_reset_shortcut'),
            valign: Gtk.Align.CENTER
        });
        shortcutRow.add_suffix(resetButton);
        shortcutGroup.add(shortcutRow);

        // Group 3: Behavior
        const behaviorGroup = new Adw.PreferencesGroup({
            title: _t('prefs_behavior')
        });
        page.add(behaviorGroup);

        const autoPasteRow = new Adw.SwitchRow({
            title: _t('prefs_auto_paste_title'),
            subtitle: _t('prefs_auto_paste_sub')
        });
        settings.bind('auto-paste', autoPasteRow, 'active', 0);
        behaviorGroup.add(autoPasteRow);

        const storeImagesRow = new Adw.SwitchRow({
            title: _t('prefs_store_images_title'),
            subtitle: _t('prefs_store_images_sub')
        });
        settings.bind('store-images', storeImagesRow, 'active', 0);
        behaviorGroup.add(storeImagesRow);

        const stripWhitespaceRow = new Adw.SwitchRow({
            title: _t('prefs_strip_whitespace_title'),
            subtitle: _t('prefs_strip_whitespace_sub')
        });
        settings.bind('strip-whitespace', stripWhitespaceRow, 'active', 0);
        behaviorGroup.add(stripWhitespaceRow);

        // Group 4: Storage
        const storageGroup = new Adw.PreferencesGroup({
            title: _t('prefs_storage')
        });
        page.add(storageGroup);

        const historySizeRow = new Adw.SpinRow({
            title: _t('prefs_history_size_title'),
            subtitle: _t('prefs_history_size_sub'),
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

        // Helper to update all UI text when language changes
        const updateAllLabels = () => {
            page.title = _t('prefs_general');
            languageGroup.title = _t('prefs_language');
            langRow.title = _t('prefs_language_title');
            langRow.subtitle = _t('prefs_language_sub');

            shortcutGroup.title = _t('prefs_shortcuts');
            shortcutRow.title = _t('prefs_popup_shortcut_title');
            shortcutRow.subtitle = _t('prefs_popup_shortcut_sub');
            changeButton.label = _t('prefs_change_shortcut');
            resetButton.label = _t('prefs_reset_shortcut');

            behaviorGroup.title = _t('prefs_behavior');
            autoPasteRow.title = _t('prefs_auto_paste_title');
            autoPasteRow.subtitle = _t('prefs_auto_paste_sub');
            storeImagesRow.title = _t('prefs_store_images_title');
            storeImagesRow.subtitle = _t('prefs_store_images_sub');
            stripWhitespaceRow.title = _t('prefs_strip_whitespace_title');
            stripWhitespaceRow.subtitle = _t('prefs_strip_whitespace_sub');

            storageGroup.title = _t('prefs_storage');
            historySizeRow.title = _t('prefs_history_size_title');
            historySizeRow.subtitle = _t('prefs_history_size_sub');
        };

        // Language change event
        langRow.connect('notify::selected', () => {
            const newLang = langRow.selected === 1 ? 'vi' : 'en';
            if (settings.get_string('language') !== newLang) {
                settings.set_string('language', newLang);
            }
            currentLang = newLang;
            updateAllLabels();
        });

        // Shortcut update handler
        settings.connect('changed::shortcut', () => {
            shortcutLabel.accelerator = currentShortcut();
        });

        // Reset Shortcut
        resetButton.connect('clicked', () => {
            settings.set_strv('shortcut', ['<Super>v']);
            shortcutLabel.accelerator = '<Super>v';
        });

        // Key Capture Modal / Controller
        let isCapturing = false;
        let keyController = null;

        const stopCapturing = () => {
            if (keyController && window) {
                window.remove_controller(keyController);
                keyController = null;
            }
            isCapturing = false;
            changeButton.label = _t('prefs_change_shortcut');
            changeButton.remove_css_class('suggested-action');
        };

        const startCapturing = () => {
            if (isCapturing) {
                stopCapturing();
                return;
            }

            isCapturing = true;
            changeButton.label = _t('prefs_press_keys');
            changeButton.add_css_class('suggested-action');

            keyController = new Gtk.EventControllerKey();
            keyController.connect('key-pressed', (_controller, keyval, keycode, state) => {
                let mask = state & Gtk.accelerator_get_default_mod_mask();

                // Allow Escape to cancel
                if (keyval === Gdk.KEY_Escape) {
                    stopCapturing();
                    return Gdk.EVENT_STOP;
                }

                // Ignore lone modifiers (Shift, Control, Alt, Super, Meta)
                let isModifier = Gtk.accelerator_valid(keyval, 0) === false &&
                    (keyval === Gdk.KEY_Control_L || keyval === Gdk.KEY_Control_R ||
                     keyval === Gdk.KEY_Shift_L || keyval === Gdk.KEY_Shift_R ||
                     keyval === Gdk.KEY_Alt_L || keyval === Gdk.KEY_Alt_R ||
                     keyval === Gdk.KEY_Super_L || keyval === Gdk.KEY_Super_R ||
                     keyval === Gdk.KEY_Meta_L || keyval === Gdk.KEY_Meta_R);

                if (isModifier) {
                    return Gdk.EVENT_PROPAGATE;
                }

                let accel = Gtk.accelerator_name_with_keycode(null, keyval, keycode, mask) ||
                            Gtk.accelerator_name(keyval, mask);

                if (accel) {
                    settings.set_strv('shortcut', [accel]);
                    shortcutLabel.accelerator = accel;
                }

                stopCapturing();
                return Gdk.EVENT_STOP;
            });

            window.add_controller(keyController);
        };

        changeButton.connect('clicked', () => {
            startCapturing();
        });
    }
}