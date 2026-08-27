import { TRANSLATIONS, getLanguage, getText, getImageKeywords, t } from '../src/core/i18n.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error('Assertion failed: ' + message);
    }
}

// 1. Verify translation dictionary completeness
assert(TRANSLATIONS.en !== undefined, 'en dictionary should exist');
assert(TRANSLATIONS.vi !== undefined, 'vi dictionary should exist');

const enKeys = Object.keys(TRANSLATIONS.en);
const viKeys = Object.keys(TRANSLATIONS.vi);

assert(enKeys.length > 0, 'en keys should not be empty');
assert(viKeys.length > 0, 'vi keys should not be empty');

for (const key of enKeys) {
    assert(TRANSLATIONS.vi[key] !== undefined, `vi dictionary missing key: "${key}"`);
    assert(typeof TRANSLATIONS.vi[key] === 'string' && TRANSLATIONS.vi[key].length > 0, `vi[${key}] must be non-empty`);
}

for (const key of viKeys) {
    assert(TRANSLATIONS.en[key] !== undefined, `en dictionary missing key: "${key}"`);
    assert(typeof TRANSLATIONS.en[key] === 'string' && TRANSLATIONS.en[key].length > 0, `en[${key}] must be non-empty`);
}

// 2. Test getLanguage default
assert(getLanguage(null) === 'en', 'default language should be en');
assert(getLanguage({}) === 'en', 'fallback language should be en');

const mockSettingsEn = { get_string: (k) => k === 'language' ? 'en' : '' };
const mockSettingsVi = { get_string: (k) => k === 'language' ? 'vi' : '' };
const mockSettingsOther = { get_string: (k) => k === 'language' ? 'fr' : '' };

assert(getLanguage(mockSettingsEn) === 'en', 'mockSettingsEn should return en');
assert(getLanguage(mockSettingsVi) === 'vi', 'mockSettingsVi should return vi');
assert(getLanguage(mockSettingsOther) === 'en', 'unsupported language should fallback to en');

// 3. Test getText & fallback
assert(getText('search_placeholder', 'en') === 'Search history / emoji...', 'en placeholder');
assert(getText('search_placeholder', 'vi') === 'Tìm kiếm trong lịch sử / emoji...', 'vi placeholder');
assert(getText('non_existent_key', 'vi') === 'non_existent_key', 'non-existent key returns key itself');

// 4. Test image keywords
let kwEn = getImageKeywords('en');
let kwVi = getImageKeywords('vi');
assert(Array.isArray(kwEn) && kwEn.includes('image'), 'en keywords should include image');
assert(Array.isArray(kwVi) && kwVi.includes('ảnh'), 'vi keywords should include ảnh');

// 5. Test t helper
assert(t('clear_all', 'en') === '🗑️ Clear all', 't helper en');
assert(t('clear_all', 'vi') === '🗑️ Xóa hết', 't helper vi');
assert(t('clear_all', mockSettingsVi) === '🗑️ Xóa hết', 't helper with settings object');

print('i18n unit tests passed successfully!');
