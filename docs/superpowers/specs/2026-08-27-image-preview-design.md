# Thiết kế tính năng Preview Hình ảnh (Image Preview) cho Winboard

## 1. Tổng quan
Hiện tại Winboard chỉ hiển thị dòng chữ `🖼️ [Hình ảnh]` cho các mục clipboard dạng ảnh. Thiết kế này bổ sung giao diện hiển thị hình ảnh thu nhỏ (thumbnail preview) trực quan trên mỗi card item tương tự như Windows 11 Clipboard History (Win + V), giúp người dùng dễ dàng nhận diện và phân biệt các ảnh chụp màn hình hoặc hình ảnh đã copy.

---

## 2. Thiết kế chi tiết UI & Kiến trúc

### 2.1. Cập nhật `src/ui/clipboardView.js`
- **Tải và hiển thị ảnh thumbnail**:
  - Kiểm tra sự tồn tại của tệp ảnh tại đường dẫn `item.imagePath` thông qua `GLib.file_test`.
  - Nếu tệp tồn tại:
    - Tạo `St.BoxLayout` container làm khung chứa (`winboard-image-preview-container`).
    - Khởi tạo `Gio.FileIcon` từ `Gio.File.new_for_path(item.imagePath)`.
    - Dùng `St.Icon` với `gicon`, đặt `icon_size: 140` và gán class `winboard-image-preview`.
    - Thêm vào card item trước phần footer (thời gian, nút pin, nút xoá).
  - Nếu tệp không tồn tại hoặc lỗi tải:
    - Hiển thị fallback label `🖼️ [Hình ảnh không khả dụng]`.
- **Hỗ trợ tìm kiếm**:
  - Cho phép lọc các mục ảnh khi người dùng gõ từ khóa như `"ảnh"`, `"image"`, `"hinh anh"`, `"screenshot"`, `"png"`.

### 2.2. Cập nhật `stylesheet.css`
- Bổ sung CSS classes cho preview:
  ```css
  /* Image Preview Container & Icon */
  .winboard-image-preview-container {
      background-color: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      padding: 4px;
      margin-bottom: 6px;
  }

  .winboard-image-preview {
      border-radius: 4px;
  }
  ```

---

## 3. Kế hoạch kiểm thử (Verification Plan)
1. **Kiểm tra cú pháp & module**:
   - Chạy `bash tests/verify_all.sh` để đảm bảo không có lỗi cú pháp JS / GJS.
2. **Kiểm tra unit tests & dữ liệu**:
   - Đảm bảo toàn bộ test storage và UI test pass.
