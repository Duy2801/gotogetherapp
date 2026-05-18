# Travel Expense Management Backend – Kiến trúc hệ thống

Mô tả các module và chức năng chính của backend Travel Expense Management App (GoTogether)

---

## 1. Authentication (`src/auth/`)

- **Đăng ký, đăng nhập** (email/password)
- **JWT Guard** bảo vệ route và socket (`jwt.guard.ts`, `ws-jwt.guard.ts`)
- **Access token & Refresh token**
- **Reset password qua email**
- **Quản lý session đăng nhập**
- **Đăng xuất trên nhiều thiết bị**

---

## 2. User (`src/user/`)

- **CRUD user**: Tạo, cập nhật, lấy thông tin user
- **Quản lý avatar, thông tin cá nhân**
- **Tìm kiếm user**
- **Lịch sử chuyến đi đã tham gia**
- **Thống kê tổng quan chi tiêu**
- **Cài đặt thông báo cá nhân**

---

## 3. Trip (`src/trip/`)

- **CRUD Trip**: Tạo, cập nhật, xoá, lấy thông tin chuyến đi
- **Thiết lập ngân sách tổng**
- **Chọn đơn vị tiền tệ mặc định**
- **Quản lý trạng thái (UPCOMING, ONGOING, COMPLETED, ARCHIVED)**
- **Tìm kiếm và lọc chuyến đi**
- **Thống kê tổng quan chuyến đi**

---

## 4. Trip Member (`src/trip-member/`)

- **Mời thành viên tham gia chuyến đi**
- **Generate QR code để mời**
- **Scan QR để tham gia**
- **Gửi lời mời qua email/link**
- **Chấp nhận/từ chối lời mời** (`acceptInvite`, `rejectInvite`)
- **Quản lý quyền (OWNER/MEMBER)**
- **Xoá thành viên khỏi chuyến đi**
- **Rời khỏi chuyến đi**
- **Realtime qua WebSocket**:
  - Nhận lời mời mới (`trip:invite`)
  - Nhận thông báo thành viên mới (`trip:member-joined`)
  - Thông báo thành viên rời đi (`trip:member-left`)

---

## 5. Expense (`src/expense/`)

- **CRUD Expense**: Thêm, sửa, xoá, lấy danh sách chi tiêu
- **Upload hình ảnh hoá đơn**
- **Gán người chi tiêu**
- **Gán danh mục chi tiêu**
- **Ghi chú chi tiết**
- **Phân loại chi tiêu chung/cá nhân**
- **Đánh dấu đã xác nhận**
- **Tìm kiếm và lọc chi tiêu**
- **Realtime qua WebSocket**:
  - Thông báo chi tiêu mới (`expense:created`)
  - Thông báo cập nhật chi tiêu (`expense:updated`)
  - Thông báo xoá chi tiêu (`expense:deleted`)

---

## 6. Expense Split (`src/expense-split/`)

- **Phân chia chi phí cho thành viên**
- **Chia đều hoặc chia theo tỷ lệ tuỳ chỉnh**
- **Tính toán ai nợ ai bao nhiêu**
- **Tạo danh sách thanh toán (Settlement)**
- **Đánh dấu đã thanh toán**
- **Lịch sử thanh toán**

---

## 7. Category (`src/category/`)

- **CRUD Category**: Quản lý danh mục chi tiêu
- **Danh mục mặc định hệ thống**
- **Tuỳ chỉnh danh mục cho từng chuyến đi**
- **Gán màu sắc và icon**
- **Thống kê chi tiêu theo danh mục**

---

## 8. Budget (`src/budget/`)

- **Thiết lập ngân sách tổng cho chuyến đi**
- **Thiết lập ngân sách cho từng danh mục**
- **Tính toán % ngân sách đã sử dụng**
- **Cảnh báo vượt ngân sách** (80%, 90%, 100%)
- **So sánh ngân sách dự kiến vs thực tế**
- **Thông báo realtime khi vượt ngân sách**

---

## 9. Itinerary (`src/itinerary/`)

- **CRUD lịch trình chuyến đi**
- **Ghi chú kế hoạch từng ngày**
- **Upload ảnh kỷ niệm theo ngày**
- **Liên kết chi tiêu với lịch trình**
- **Tạo timeline chuyến đi**

---

## 10. Notification (`src/notification/`)

- **Gửi thông báo push (FCM)**
- **Gửi email thông báo**
- **Nhắc nhở ghi nhận chi tiêu**
- **Nhắc nhở thanh toán công nợ**
- **Cảnh báo vượt ngân sách**
- **Quản lý cài đặt thông báo**
- **Lịch sử thông báo**

---

## 11. Statistics (`src/statistics/`)

- **Thống kê tổng chi phí chuyến đi**
- **Thống kê theo ngày, danh mục, thành viên**
- **Tạo dữ liệu cho biểu đồ**:
  - Pie Chart (theo danh mục)
  - Bar Chart (theo thành viên)
  - Line Chart (theo thời gian)
- **Báo cáo chi tiêu cá nhân**
- **So sánh chi tiêu giữa các chuyến đi**

---

## 12. Export (`src/export/`)

- **Xuất báo cáo PDF** (với biểu đồ)
- **Xuất Excel** (dữ liệu chi tiết)
- **Tạo link chia sẻ công khai**
- **Gửi báo cáo qua email**
- **Template báo cáo tuỳ chỉnh**

---

## 13. AI Analytics (`src/ai-analytics/`)

- **Phân tích thói quen chi tiêu**
- **Gợi ý tiết kiệm**
- **Dự đoán chi phí chuyến đi**
- **So sánh với chuyến đi trước**
- **Gửi insights qua notification**
- **Tích hợp OpenAI API**

---

## 14. Storage (`src/storage/`)

- **Upload, lưu trữ file** (Cloudinary/AWS S3)
- **Upload hình ảnh hoá đơn**
- **Upload ảnh kỷ niệm**
- **Xử lý resize, optimize ảnh**
- **Quản lý file upload/download**

---

## 15. Mail (`src/mail/`)

- **Gửi email xác thực**
- **Gửi email reset password**
- **Gửi email lời mời tham gia chuyến đi**
- **Gửi báo cáo chi tiêu**
- **Template email tuỳ chỉnh**
- **Queue email để gửi hàng loạt**

---

## 16. Device (`src/device/`)

- **Quản lý thiết bị đăng nhập**
- **Lưu FCM token cho push notification**
- **Đăng xuất từ xa trên thiết bị cụ thể**
- **Theo dõi thiết bị đang hoạt động**

---

## 17. Redis (`src/redis/`)

- **Cache dữ liệu thường dùng**
- **Lưu tạm QR code, session**
- **Cache tỷ giá tiền tệ**
- **Rate limiting**
- **Queue cho background jobs**

---

## 18. Prisma ORM (`src/prisma/`)

- **Kết nối database PostgreSQL**
- **Migration database**
- **Seed dữ liệu mẫu**
- **Quản lý schema**

---

## 19. Common (`src/common/`)

- **Các service, DTO, filter, interceptor dùng chung**
- **Xử lý phân trang**
- **Xử lý lỗi toàn cục**
- **Response formatter**
- **Validation pipes**
- **Logger**

---

## 20. I18n (`src/i18n/`)

- **Hỗ trợ đa ngôn ngữ (vi, en)**
- **Translation files**
- **Dynamic locale switching**

---

## 21. Cron Jobs (`src/cron/`)

- **Gửi nhắc nhở định kỳ**
- **Cleanup dữ liệu cũ**
- **Tạo báo cáo tự động**

---

## 22. WebSocket Gateway

- **Namespace:** `/trip`, `/expense`
- **Guard:** `WsJwtGuard` xác thực JWT
- **Events chính:**
  - `trip:invite` - Lời mời chuyến đi
  - `trip:member-joined` - Thành viên mới
  - `expense:created` - Chi tiêu mới
  - `expense:updated` - Cập nhật chi tiêu
  - `budget:warning` - Cảnh báo ngân sách

---

## Cấu trúc Database (Prisma Schema)

### Core Tables:

- **User**: Thông tin người dùng
- **Trip**: Chuyến đi
- **TripMember**: Thành viên chuyến đi (với role)
- **Expense**: Chi tiêu
- **ExpenseSplit**: Phân chia chi phí
- **Category**: Danh mục chi tiêu
- **Budget**: Ngân sách
- **Settlement**: Thanh toán công nợ
- **Itinerary**: Lịch trình
- **Notification**: Thông báo
- **Device**: Thiết bị

---

_Ghi chú: File này mô tả kiến trúc module cho Travel Expense Management App_

- `presence:ping`: Ping trạng thái online

---

> **Lưu ý:**

- Mỗi module đều có thể mở rộng thêm chức năng riêng.
- Các chức năng realtime đều đi qua Gateway và bảo vệ bởi JWT Guard.
- Tham khảo chi tiết code trong từng file/module tương ứng.
