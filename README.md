# Phú Thi Dev — demo thư viện ảnh

Giao diện thư viện ảnh cho studio chụp ảnh, phong cách client gallery, viết bằng HTML/CSS/JS thuần, không cần build.

## Chạy

```bash
cd studio-gallery-demo
python3 server.py
# mở http://localhost:5178

# (tuỳ chọn) mở link tạm ra Internet ở terminal khác
~/.local/bin/cloudflared tunnel --url http://localhost:5178
```

`server.py` chỉ dùng thư viện chuẩn của Python (không cần Docker). Nó phục vụ trang web và thêm API đăng ảnh.
Chạy bằng `python3 -m http.server` thì trang vẫn xem được nhưng nút **Đăng ảnh** sẽ báo cần `server.py`.

## Đăng ảnh

- **Cần mật khẩu.** Mật khẩu nằm trong file `.upload-password` (hoặc đặt biến môi trường `UPLOAD_PASSWORD`). Đổi mật khẩu: sửa file rồi chạy lại `server.py`. Xoá file đó thì ai cũng đăng được.
  Sai 5 lần trong 10 phút thì IP đó bị khoá 10 phút. Nhập đúng một lần là dùng được tới khi đóng tab.
- Bấm **Đăng ảnh** (trang chủ) hoặc biểu tượng ⬆ trên thanh công cụ của bộ ảnh; hoặc kéo thả ảnh vào bất kỳ đâu trên trang; hoặc `Ctrl+V` khi hộp đang mở.
- Chọn bộ ảnh + nhóm (tab lọc). Ảnh lớn hơn 2000px được thu nhỏ trong trình duyệt trước khi gửi.
- Ảnh lưu ở `uploads/` (danh sách trong `uploads/manifest.json`), hiện đầu lưới với nhãn **Mới** và tab **Ảnh mới**; mọi người mở link đều thấy.
- Chỉ trình duyệt đã đăng ảnh mới có nút 🗑 xoá ảnh đó (server kiểm tra mã xoá riêng của từng ảnh).
- Giới hạn: JPG/PNG/WEBP/GIF (server kiểm tra nội dung file, không tin đuôi file), tối đa 20MB/ảnh, tối đa 300 ảnh.
- Xoá sạch ảnh test: dừng server, xoá các file trong `uploads/` rồi ghi `[]` vào `uploads/manifest.json`.

## Luồng màn hình

1. **Trang chủ** — logo, tên studio, lời chào, liên hệ, lưới bộ ảnh (ảnh bìa ghép 1 lớn + 2 nhỏ).
2. **Bộ ảnh** — ảnh bìa toàn màn hình + nút *View gallery*; cuộn xuống là thanh tab lọc dính trên cùng và lưới ảnh.
3. **Rê chuột lên ảnh** — hiện nút ♡ yêu thích, tải ảnh, chia sẻ.
4. **Bấm ảnh** — mở trình xem ảnh lớn: tên file, chuyển ảnh, trình chiếu, dải ảnh nhỏ.

## Hiệu ứng

- Màn chờ chữ hiện từng ký tự, rèm kéo lên
- Chuyển trang "morph" ảnh bìa từ thẻ sang ảnh bìa lớn (View Transitions API, trình duyệt cũ thì mờ dần)
- Thẻ bộ ảnh nghiêng 3D theo chuột, ảnh zoom lệch nhau, hiện dần khi cuộn
- Ảnh bìa: Ken Burns + parallax nhiều lớp + hạt nhiễu phim, tiêu đề hiện từng chữ
- Lưới masonry, ảnh mờ → nét (blur-up), lọc tab có hiệu ứng FLIP trượt/nở
- Trình xem ảnh phóng từ ô ảnh ra, nền "ambient" theo màu ảnh, vuốt/kéo để chuyển
- Thả tim có pháo hạt, đếm số ảnh yêu thích, lọc riêng ảnh yêu thích (lưu trong trình duyệt)
- Con trỏ tuỳ biến có nhãn "Xem / Mở / Kéo", nút lên đầu trang có vòng tiến độ, tìm kiếm toàn màn hình

## Phím tắt

| Phím | Tác dụng |
|---|---|
| `/` | Tìm bộ ảnh |
| `←` `→` | Ảnh trước / sau |
| `Space` | Bật/tắt trình chiếu |
| `F` | Thả tim ảnh đang xem |
| `Esc` | Đóng |

## Thay dữ liệu thật

Mọi dữ liệu nằm ở đầu `js/app.js`:

- `STUDIO` — tên, số điện thoại, địa chỉ
- `RAW` — danh sách ảnh `[mã, id ảnh, nhóm, tỉ lệ khung]`
- `COLLS` — các bộ ảnh, ảnh bìa và cách chọn ảnh

Để dùng ảnh của bạn, sửa hàm `IMG` / `COVER` trả về đường dẫn ảnh thật thay cho Unsplash.

Ảnh mẫu lấy từ [Unsplash](https://unsplash.com) (miễn phí sử dụng).
