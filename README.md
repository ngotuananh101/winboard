# Winboard - Windows 11 Style Clipboard Manager for GNOME Shell 46

**Winboard** là một tiện ích mở rộng (GNOME Shell Extension) mang trải nghiệm **Clipboard Manager của Windows 11 (`Win + V`)** lên GNOME 46 (Wayland & X11).

---

## ✨ Tính năng nổi bật

- 🚀 **Mở tại vị trí chuột**: Nhấn `Super + V` để mở popup nổi ngay tại đầu con trỏ chuột (có thuật toán chống tràn viền màn hình).
- 📋 **Lịch sử Clipboard đầy đủ**: Tự động lưu trữ Text, Code, Link và Hình ảnh chụp màn hình (`image/png`).
- 📌 **Ghim (Pin) thông minh**: Giữ lại các đoạn văn bản quan trọng không bị xóa khi dọn dẹp hoặc khi đầy bộ nhớ.
- 😀 **Bộ chọn biểu tượng phong phú (4 Tabs)**:
  - **Clipboard**: Lịch sử sao chép.
  - **Emoji**: Danh mục biểu tượng cảm xúc Unicode đầy đủ.
  - **Kaomoji**: Kho ký tự biểu cảm Nhật Bản (ví dụ: `¯\_(ツ)_/¯`, `(╯°□°)╯︵ ┻━┻`).
  - **Symbols**: Ký tự toán học, tiền tệ (`₫`, `$`, `€`), mũi tên, dấu câu đặc biệt.
- ⚡ **Auto-Paste thông minh**: Tự động nhận diện loại cửa sổ để dán:
  - Cửa sổ Terminal (`gnome-terminal`, `ptyxis`, `alacritty`, `kitty`...): gửi phím ảo `Ctrl + Shift + V`.
  - Ứng dụng thông thường (Browser, VSCode, Editor...): gửi phím ảo `Ctrl + V`.
- 🎨 **Giao diện Fluent Design**: Nền mờ Acrylic/Glassmorphism mượt mà, bo góc hiện đại.

---

## 🛠️ Cài đặt & Sử dụng

### 1. Cài đặt tự động
Chạy script cài đặt có sẵn trong thư mục dự án:
```bash
./scripts/install.sh
```

### 2. Kích hoạt Extension
- Do bạn đang dùng **Wayland**, GNOME Shell cần được reload lại session để nhận diện extension mới được cài vào `~/.local/share/gnome-shell/extensions/`:
  - **Đăng xuất (Log Out)** và **Đăng nhập lại (Log In)**.
- Sau khi đăng nhập lại, bật extension bằng lệnh:
```bash
gnome-extensions enable winboard@anhnt.tools
```
hoặc mở ứng dụng **Extensions (Tiện ích mở rộng)** trong danh sách phần mềm và bật công tắc cho **Winboard**.

### 3. Phím tắt & Cấu hình
- Phím tắt mặc định: `Super + V` (hoặc `Win + V`).
- Bạn có thể vào phần Cài đặt (Preferences) của extension để tùy chỉnh:
  - Bật/Tắt Auto-Paste.
  - Bật/Tắt lưu hình ảnh.
  - Điều chỉnh giới hạn số lượng mục lưu trữ (10 - 200).
  - Tự động cắt khoảng trắng thừa (Trim Whitespace).
