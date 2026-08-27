# Image Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị thumbnail preview trực quan cho các mục hình ảnh trong lịch sử clipboard của Winboard, thay thế cho nhãn chữ `[Hình ảnh]`.

**Architecture:** Sử dụng `Gio.FileIcon` và `St.Icon` bên trong `St.BoxLayout` container của item card (`src/ui/clipboardView.js`), bổ sung styles Fluent trong `stylesheet.css`, xử lý fallback an toàn khi file ảnh không tồn tại và cải thiện tính năng lọc tìm kiếm đối với item ảnh.

**Tech Stack:** GNOME Shell 46 (ESM), GJS, `gi://St`, `gi://Gio`, `gi://GLib`.

## Global Constraints
- Target platform: GNOME Shell 46 on Wayland & X11.
- Language/Runtime: GJS ECMAScript modules (ESM).
- UI Toolkit: St & Clutter.
- Style: Fluent Design dark aesthetics matching `stylesheet.css`.

---

### Task 1: Thêm Image Preview UI & Search Filter vào `src/ui/clipboardView.js` và `stylesheet.css`

**Files:**
- Modify: `src/ui/clipboardView.js:39-46,129-135`
- Modify: `stylesheet.css:126-136`
- Modify: `tests/test_ui_syntax.js`
- Test: `tests/test_image_filter.js`

**Interfaces:**
- Consumes: `item.imagePath` from `StorageManager` (`{ type: 'image', imagePath: string, timestamp: number, pinned: boolean, id: string }`).
- Produces: Visual thumbnail preview card inside `ClipboardView._createItemCard(item)`.

- [ ] **Step 1: Viết test cho logic lọc tìm kiếm và kiểm tra ảnh**

Tạo `tests/test_image_filter.js`:
```javascript
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
assert(matchesFilter(imageItem, 'chào') === false, 'Image filter should not match unrelated query');

print('Image filter test passed successfully!');
```

- [ ] **Step 2: Chạy test để xác nhận test chạy tốt**

Run: `gjs -m tests/test_image_filter.js`
Expected: `Image filter test passed successfully!`

- [ ] **Step 3: Cập nhật `src/ui/clipboardView.js` để render Thumbnail Preview và lọc ảnh**

Chỉnh sửa `src/ui/clipboardView.js`:
- Cập nhật hàm `refresh(filterText)` để lọc cả item ảnh:
```javascript
        if (filterText) {
            let query = filterText.toLowerCase().trim();
            items = items.filter(item => {
                if (item.type === 'text') {
                    return item.content.toLowerCase().includes(query);
                } else if (item.type === 'image') {
                    let imageKeywords = ['ảnh', 'anh', 'image', 'hinh', 'hinh anh', 'screenshot', 'png'];
                    return imageKeywords.some(kw => kw.includes(query) || query.includes(kw));
                }
                return false;
            });
        }
```
- Cập nhật hàm `_createItemCard(item)` phần `item.type === 'image'`:
```javascript
        } else if (item.type === 'image') {
            if (item.imagePath && GLib.file_test(item.imagePath, GLib.FileTest.EXISTS)) {
                let previewBox = new St.BoxLayout({
                    style_class: 'winboard-image-preview-container',
                    x_align: Clutter.ActorAlign.CENTER,
                    y_align: Clutter.ActorAlign.CENTER,
                    x_expand: true
                });

                let file = Gio.File.new_for_path(item.imagePath);
                let gicon = Gio.FileIcon.new(file);
                let imageIcon = new St.Icon({
                    gicon: gicon,
                    icon_size: 140,
                    style_class: 'winboard-image-preview'
                });

                previewBox.add_child(imageIcon);
                box.add_child(previewBox);
            } else {
                let imageLabel = new St.Label({
                    text: '🖼️ [Hình ảnh không khả dụng]',
                    style_class: 'winboard-item-text'
                });
                box.add_child(imageLabel);
            }
        }
```

- [ ] **Step 4: Cập nhật `stylesheet.css` để thêm styling cho preview**

Thêm các style sau vào `stylesheet.css`:
```css
/* Image Preview */
.winboard-image-preview-container {
    background-color: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    padding: 6px;
    margin-bottom: 4px;
}

.winboard-image-preview {
    border-radius: 4px;
}
```

- [ ] **Step 5: Cập nhật `tests/verify_all.sh` và chạy bộ test toàn diện**

Cập nhật `tests/verify_all.sh` để thêm `gjs -m tests/test_image_filter.js`.
Chạy `bash tests/verify_all.sh`
Expected: `=== All checks passed! ===`

- [ ] **Step 6: Commit các thay đổi**

```bash
git add src/ui/clipboardView.js stylesheet.css tests/test_image_filter.js tests/verify_all.sh docs/superpowers/plans/2026-08-27-image-preview-plan.md
git commit -m "feat: add image preview thumbnail and search support for clipboard items"
```
