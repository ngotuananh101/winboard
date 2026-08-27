export const TRANSLATIONS = {
    en: {
        // Header & Search
        'search_placeholder': 'Search history / emoji...',
        'tab_clipboard': '📋 Clipboard',
        'tab_emoji': '😀 Emoji',
        'tab_kaomoji': '¯\\_(ツ)',
        'tab_symbols': 'Ω Symbols',

        // Clipboard View
        'pinned_section': '📌 PINNED',
        'recent_section': '🕒 RECENT',
        'clear_all': '🗑️ Clear all',
        'empty_history': 'Clipboard history is empty',
        'empty_search': 'No results found',
        'image_unavailable': '🖼️ [Image unavailable]',

        // Emoji & Symbols categories
        'cat_smileys': 'Smileys & Emotion',
        'cat_gestures': 'People & Body',
        'cat_animals': 'Animals & Nature',
        'cat_food': 'Food & Drink',
        'cat_objects': 'Objects & Symbols',
        'cat_happy': 'Happy / Joy',
        'cat_sad': 'Sad / Crying',
        'cat_angry': 'Angry / Rage',
        'cat_surprised': 'Surprised / Shocked',
        'cat_actions': 'Actions / Misc',
        'cat_math': 'Math & Logic',
        'cat_arrows': 'Arrows',
        'cat_currency': 'Currency',
        'cat_punctuation': 'Punctuation & Stars',
        'cat_greek': 'Greek Letters',

        // Preferences Window
        'prefs_general': 'General',
        'prefs_behavior': 'Behavior & Features',
        'prefs_auto_paste_title': 'Auto-Paste on Selection',
        'prefs_auto_paste_sub': 'Automatically paste item after clicking into the active window',
        'prefs_store_images_title': 'Capture Images',
        'prefs_store_images_sub': 'Save screenshots and copied images in clipboard history',
        'prefs_strip_whitespace_title': 'Trim Whitespace',
        'prefs_strip_whitespace_sub': 'Automatically trim whitespace from copied text snippets',
        'prefs_storage': 'Storage',
        'prefs_history_size_title': 'History Limit',
        'prefs_history_size_sub': 'Maximum number of unpinned items to store',
        'prefs_shortcuts': 'Keyboard Shortcuts',
        'prefs_popup_shortcut_title': 'Toggle Winboard Popup',
        'prefs_popup_shortcut_sub': 'Shortcut to open clipboard manager popup',
        'prefs_change_shortcut': 'Change',
        'prefs_press_keys': 'Press shortcut keys...',
        'prefs_reset_shortcut': 'Reset',
        'prefs_language': 'Language',
        'prefs_language_title': 'Interface Language',
        'prefs_language_sub': 'Select display language for Winboard',
        'prefs_lang_en': 'English',
        'prefs_lang_vi': 'Tiếng Việt',
    },
    vi: {
        // Header & Search
        'search_placeholder': 'Tìm kiếm trong lịch sử / emoji...',
        'tab_clipboard': '📋 Clipboard',
        'tab_emoji': '😀 Emoji',
        'tab_kaomoji': '¯\\_(ツ)',
        'tab_symbols': 'Ω Ký tự',

        // Clipboard View
        'pinned_section': '📌 ĐÃ GHIM',
        'recent_section': '🕒 GẦN ĐÂY',
        'clear_all': '🗑️ Xóa hết',
        'empty_history': 'Lịch sử clipboard trống',
        'empty_search': 'Không tìm thấy kết quả nào',
        'image_unavailable': '🖼️ [Hình ảnh không khả dụng]',

        // Emoji & Symbols categories
        'cat_smileys': 'Mặt cười & Cảm xúc',
        'cat_gestures': 'Cử chỉ & Con người',
        'cat_animals': 'Động vật & Thiên nhiên',
        'cat_food': 'Đồ ăn & Thức uống',
        'cat_objects': 'Đồ vật & Biểu tượng',
        'cat_happy': 'Vui vẻ / Hạnh phúc',
        'cat_sad': 'Buồn / Khóc',
        'cat_angry': 'Tức giận',
        'cat_surprised': 'Ngạc nhiên',
        'cat_actions': 'Hành động / Khác',
        'cat_math': 'Toán học & Logic',
        'cat_arrows': 'Mũi tên',
        'cat_currency': 'Tiền tệ',
        'cat_punctuation': 'Dấu câu & Ngôi sao',
        'cat_greek': 'Ký tự Hy Lạp',

        // Preferences Window
        'prefs_general': 'Chung',
        'prefs_behavior': 'Hành vi & Tính năng',
        'prefs_auto_paste_title': 'Tự động dán khi chọn',
        'prefs_auto_paste_sub': 'Tự động dán nội dung vào cửa sổ đang active sau khi chọn',
        'prefs_store_images_title': 'Lưu trữ hình ảnh',
        'prefs_store_images_sub': 'Lưu ảnh chụp màn hình và ảnh đã sao chép vào lịch sử',
        'prefs_strip_whitespace_title': 'Cắt khoảng trắng thừa',
        'prefs_strip_whitespace_sub': 'Tự động cắt bỏ khoảng trắng ở đầu và cuối văn bản sao chép',
        'prefs_storage': 'Lưu trữ',
        'prefs_history_size_title': 'Giới hạn lịch sử',
        'prefs_history_size_sub': 'Số lượng mục chưa ghim tối đa được lưu',
        'prefs_shortcuts': 'Phím tắt',
        'prefs_popup_shortcut_title': 'Mở cửa sổ Winboard',
        'prefs_popup_shortcut_sub': 'Tổ hợp phím để bật/tắt popup Winboard',
        'prefs_change_shortcut': 'Thay đổi',
        'prefs_press_keys': 'Nhấn tổ hợp phím...',
        'prefs_reset_shortcut': 'Đặt lại',
        'prefs_language': 'Ngôn ngữ',
        'prefs_language_title': 'Ngôn ngữ giao diện',
        'prefs_language_sub': 'Chọn ngôn ngữ hiển thị cho Winboard',
        'prefs_lang_en': 'English',
        'prefs_lang_vi': 'Tiếng Việt',
    }
};

const IMAGE_KEYWORDS = {
    en: ['image', 'img', 'screenshot', 'photo', 'picture', 'png', 'jpg', 'jpeg'],
    vi: ['ảnh', 'anh', 'image', 'hinh', 'hinh anh', 'hình ảnh', 'screenshot', 'png', 'jpg']
};

export function getLanguage(settings = null) {
    if (settings && typeof settings.get_string === 'function') {
        try {
            let lang = settings.get_string('language');
            if (lang === 'en' || lang === 'vi') {
                return lang;
            }
        } catch (_) {}
    }
    return 'en';
}

export function getText(key, lang = 'en') {
    let dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    if (dict && dict[key] !== undefined) {
        return dict[key];
    }
    return TRANSLATIONS.en[key] || key;
}

export function getImageKeywords(lang = 'en') {
    return IMAGE_KEYWORDS[lang] || IMAGE_KEYWORDS.en;
}

export function t(key, langOrSettings = 'en') {
    let lang = typeof langOrSettings === 'string' ? langOrSettings : getLanguage(langOrSettings);
    return getText(key, lang);
}
