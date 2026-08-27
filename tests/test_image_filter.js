#!/usr/bin/env gjs
// Test filter logic for text and image clipboard items

import GLib from 'gi://GLib';

function assert(condition, message) {
    if (!condition) {
        throw new Error('Assertion failed: ' + message);
    }
}

// Test filter logic helper
function matchesFilter(item, filterText) {
    if (!filterText) return true;
    let query = filterText.toLowerCase().trim();
    if (item.type === 'text') {
        return item.content.toLowerCase().includes(query);
    } else if (item.type === 'image') {
        let imageKeywords = ['ảnh', 'anh', 'image', 'hinh', 'hinh anh', 'screenshot', 'png'];
        return imageKeywords.some(kw => kw.includes(query) || query.includes(kw));
    }
    return false;
}

let textItem = { type: 'text', content: 'Xin chào thế giới' };
let imageItem = { type: 'image', imagePath: '/tmp/test.png' };

assert(matchesFilter(textItem, 'chào') === true, 'Text filter should match content');
assert(matchesFilter(textItem, 'ảnh') === false, 'Text filter should not match image query');
assert(matchesFilter(imageItem, 'ảnh') === true, 'Image filter should match "ảnh"');
assert(matchesFilter(imageItem, 'image') === true, 'Image filter should match "image"');
assert(matchesFilter(imageItem, 'screenshot') === true, 'Image filter should match "screenshot"');
assert(matchesFilter(imageItem, 'chào') === false, 'Image filter should not match unrelated query');

print('Image filter test passed successfully!');
