# HƯỚNG DẪN HỆ THỐNG BACKUP GOOGLE DRIVE (RCLONE)

## 1. Cấu hình Google Cloud (OAuth 2.0)

- **Project:** `travel-expense-backup`
- **API:** Đã bật `Google Drive API`.
- **Lưu ý quan trọng:** Nếu bị lỗi 403, phải vào mục **Audience** (hoặc OAuth Consent Screen) để thêm Email cá nhân vào danh sách **Test Users**.
- **Credentials:** Sử dụng Client ID và Client Secret riêng để tối ưu tốc độ.

## 2. Xác thực Rclone (Macbook & VPS)

- VPS không có trình duyệt nên cần dùng máy cá nhân (Macbook) để lấy token.
- **Lệnh trên Mac:** `./rclone authorize "drive" "ID" "SECRET"`
- **Lỗi macOS:** Nếu file bị chặn, vào `System Settings > Privacy & Security > Open Anyway`.
- **Kết quả:** Copy đoạn mã JSON `{...}` dán ngược lại vào VPS.

## 3. Cấu trúc Script Backup (`backup_gdrive.sh`)

Script được thiết kế để tự động hóa hoàn toàn:

1. **Đọc biến môi trường:** Sử dụng `source .env` để lấy `DATABASE_URL`.
2. **Dump Database:** Xuất dữ liệu từ Docker PostgreSQL bằng lệnh `pg_dump`.
3. **Nén dữ liệu:** Dùng `gzip` để giảm dung lượng file trước khi tải lên.
4. **Upload:** Dùng `rclone copy` đẩy file lên thư mục `gotogether_backups` trên Drive.
5. **Dọn dẹp:** Tự động xóa file backup cũ trên VPS sau 7 ngày để tránh đầy ổ cứng.
6. **Backup uploaded files:** Backup folder `uploads/` chứa ảnh hoá đơn và ảnh kỷ niệm.

## 4. Quản lý lịch trình (Cronjob)

Để kiểm tra lịch backup tự động, dùng lệnh:
`crontab -l`

Cấu hình hiện tại: `0 2 * * *` (Chạy vào lúc 02:00 sáng mỗi ngày).
Log được lưu tại: `~/gotogether-app/backups/backup_history.log`

## 5. Các lệnh kiểm tra nhanh

- Kiểm tra danh sách file trên Drive: `rclone lsd gdrive:`
- Chạy backup thủ công ngay lập tức: `~/gotogether-app/backup_gdrive.sh`
- Xem log backup gần nhất: `tail -f ~/gotogether-app/backups/backup_history.log`
- Restore database từ backup:
  - PostgreSQL: `gunzip < backup.sql.gz | docker exec -i postgres_container psql -U user -d database`

## 6. Backup Strategy cho Travel Expense App

- **Daily backup:** Database và uploaded files
- **Retention:** Giữ 30 ngày backup gần nhất trên Drive
- **Critical data:**
  - User data
  - Trip information
  - Expense records
  - Receipt images
  - Itinerary photos
- **Recovery Point Objective (RPO):** 24 hours
- **Recovery Time Objective (RTO):** 4 hours

## 7. Monitoring & Alerts

- Gửi email/Slack notification khi backup thất bại
- Kiểm tra dung lượng backup định kỳ
- Alert khi dung lượng Drive sắp đầy

## sudo timedatectl set-timezone Asia/Ho_Chi_Minh // set timezone

_Ghi chú: File này được tạo cho hệ thống Travel Expense Management App (GoTogether)_
