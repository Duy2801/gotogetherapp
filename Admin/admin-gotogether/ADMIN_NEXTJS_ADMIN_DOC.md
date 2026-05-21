# Tài liệu đề xuất kiến trúc Admin Next.js cho GoTogether

Tài liệu này mô tả cấu trúc thư mục và các màn hình chính cho khu vực admin dùng Next.js. Mục tiêu là quản lý user, danh mục, thống kê chuyến đi, phân tích chi tiêu và theo dõi điểm đến du lịch theo một bố cục rõ ràng, dễ mở rộng.

## 1. Mục tiêu của khu vực admin

- Quản lý tài khoản người dùng: xem, khóa/mở khóa, phân quyền, tìm kiếm.
- Quản lý danh mục: loại chuyến đi, loại chi tiêu, danh mục điểm đến, tag nội dung.
- Theo dõi thống kê chuyến đi: số lượng chuyến đi, trạng thái, mức độ hoạt động.
- Phân tích chi tiêu: tổng chi phí, theo người dùng, theo chuyến đi, theo thời gian.
- Phân tích điểm đến du lịch: điểm đến phổ biến, lượt ghé thăm, xu hướng theo khu vực.

## 2. Kiến trúc Next.js đề xuất

Nên tổ chức theo Next.js App Router để dễ tách layout admin, dashboard, và các module nghiệp vụ.

### Cây thư mục đề xuất

```txt
admin-gotogether/
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/
│  │  │  ├─ login/
│  │  │  │  └─ page.tsx
│  │  │  └─ layout.tsx
│  │  ├─ (dashboard)/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ users/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]/
│  │  │  │     └─ page.tsx
│  │  │  ├─ categories/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]/
│  │  │  │     └─ page.tsx
│  │  │  ├─ trips/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]/
│  │  │  │     └─ page.tsx
│  │  │  ├─ expenses/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ analytics/
│  │  │  │     └─ page.tsx
│  │  │  ├─ destinations/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]/
│  │  │  │     └─ page.tsx
│  │  │  └─ settings/
│  │  │     └─ page.tsx
│  │  ├─ api/
│  │  │  ├─ users/
│  │  │  ├─ categories/
│  │  │  ├─ trips/
│  │  │  ├─ expenses/
│  │  │  └─ destinations/
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ not-found.tsx
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ layout/
│  │  ├─ tables/
│  │  └─ charts/
│  ├─ features/
│  │  ├─ users/
│  │  ├─ categories/
│  │  ├─ trips/
│  │  ├─ expenses/
│  │  └─ destinations/
│  ├─ hooks/
│  ├─ lib/
│  │  ├─ api-client.ts
│  │  ├─ auth.ts
│  │  ├─ format.ts
│  │  └─ permissions.ts
│  ├─ stores/
│  ├─ types/
│  └─ utils/
├─ .env.local
├─ next.config.js
├─ package.json
└─ tsconfig.json
└─ .gitignore
```

## 3. Chức năng của từng file và thư mục

Phần này giải thích rõ từng file chính trong cây thư mục đề xuất để khi triển khai thực tế bạn biết mỗi file dùng để làm gì.

### `public/`

- Chứa tài nguyên tĩnh: logo, ảnh nền, icon, file tải xuống, ảnh minh họa.
- Các file trong `public/` được truy cập trực tiếp qua URL.

### `src/app/layout.tsx`

- Là layout gốc của toàn bộ ứng dụng.
- Bọc chung `html`, `body`, metadata, font và style global.
- Không chứa logic nghiệp vụ.

### `src/app/globals.css`

- Chứa toàn bộ CSS nền của admin.
- Khai báo biến màu, font, spacing, style cho sidebar, topbar, card, table, form.
- Nên giữ toàn cục ở đây để giao diện đồng nhất.

### `src/app/not-found.tsx`

- Trang hiển thị khi người dùng vào route không tồn tại.
- Dùng để hướng người dùng quay lại dashboard hoặc trang hợp lệ.

### `src/app/(auth)/layout.tsx`

- Layout riêng cho nhóm màn hình xác thực.
- Tách giao diện đăng nhập khỏi khu vực dashboard.

### `src/app/(auth)/login/page.tsx`

- Màn hình đăng nhập của admin.
- Nhận email/mật khẩu, gọi API đăng nhập, lưu session, chuyển hướng vào dashboard.
- Hiển thị lỗi nếu đăng nhập thất bại.

### `src/app/(dashboard)/layout.tsx`

- Layout cho toàn bộ khu vực quản trị sau khi đăng nhập.
- Kiểm tra session, nếu chưa đăng nhập thì đẩy về `/login`.
- Bọc `AdminShell` để hiển thị sidebar và topbar.

### `src/app/(dashboard)/page.tsx`

- Trang dashboard tổng quan.
- Hiển thị KPI, top trip, danh mục nổi bật, điểm đến nổi bật và các liên kết nhanh.

### `src/app/(dashboard)/users/page.tsx`

- Trang danh sách user.
- Có tìm kiếm, lọc trạng thái, phân trang, khóa/mở khóa.

### `src/app/(dashboard)/users/[id]/page.tsx`

- Trang chi tiết một user.
- Hiển thị hồ sơ, lịch sử chuyến đi và chi tiêu gần đây.

### `src/app/(dashboard)/categories/page.tsx`

- Trang quản lý danh mục.
- Dùng để xem danh mục hiện có, thêm mới, sửa, xóa và phân loại nhóm danh mục.

### `src/app/(dashboard)/trips/page.tsx`

- Trang danh sách chuyến đi.
- Hiển thị trạng thái, số thành viên, ngân sách và tổng chi tiêu.

### `src/app/(dashboard)/trips/[id]/page.tsx`

- Trang chi tiết chuyến đi.
- Hiển thị thành viên, chi tiêu và thông tin tổng quan của chuyến đi.

### `src/app/(dashboard)/expenses/page.tsx`

- Trang phân tích chi tiêu tổng quan.
- Dùng để xem số liệu chi tiêu theo tháng, theo danh mục, theo chuyến đi.

### `src/app/(dashboard)/expenses/analytics/page.tsx`

- Trang phân tích chi tiêu nâng cao.
- Phù hợp cho biểu đồ, so sánh, báo cáo và góc nhìn dữ liệu sâu hơn.

### `src/app/(dashboard)/destinations/page.tsx`

- Trang danh sách điểm đến.
- Hiển thị các điểm đến có trong hệ thống và số liệu liên quan.

### `src/app/(dashboard)/destinations/[id]/page.tsx`

- Trang chi tiết điểm đến.
- Hiển thị tổng quan hoạt động, chuyến đi liên quan và chi tiêu gắn với điểm đến đó.

### `src/app/(dashboard)/settings/page.tsx`

- Trang cấu hình hệ thống admin.
- Dùng cho ngôn ngữ, timezone, chế độ báo cáo, thông báo và các thiết lập chung.

### `src/app/(dashboard)/analysis/page.tsx`

- Route rút gọn để vào khu vực phân tích nhanh.
- Có thể dùng như lối vào trực tiếp cho người chỉ cần xem báo cáo.

### `src/app/api/*`

- Thư mục giữ chỗ cho API routes nội bộ nếu cần proxy, middleware hoặc handler phía Next.js.
- Hiện tại chủ yếu để bám đúng cấu trúc tài liệu.

### `src/components/layout/`

- Chứa các component khung giao diện dùng lại nhiều lần.
- `AdminShell`: layout sidebar + topbar + khung nội dung.
- `PageHeader`: tiêu đề trang, mô tả và nút hành động.

### `src/components/ui/`

- Chứa các component UI dùng chung ở mức nhỏ.
- `Card`: khung hiển thị nội dung, KPI hoặc block dữ liệu.

### `src/components/tables/`

- Dành cho component liên quan đến bảng dữ liệu.
- Có thể đặt table template, row renderer, filter bar, pagination, empty state.

### `src/components/charts/`

- Dành cho biểu đồ và khối trực quan hóa dữ liệu.
- Có thể chứa line chart, bar chart, pie chart hoặc chart wrapper.

### `src/features/users/`

- Chứa logic riêng cho user: schema, service, helper, component nhỏ.
- Nếu sau này user page phình to, phần này sẽ gom logic ra khỏi `app/`.

### `src/features/categories/`

- Chứa logic quản lý danh mục.
- Tách riêng phần xử lý danh mục để dễ mở rộng thêm taxonomy khác.

### `src/features/trips/`

- Chứa logic cho chuyến đi.
- Có thể gom validation, mapper, helper xử lý trạng thái trip.

### `src/features/expenses/`

- Chứa logic cho chi tiêu và phân tích chi tiêu.
- Phù hợp để gom filter, calculator, format dữ liệu chi tiêu.

### `src/features/destinations/`

- Chứa logic cho điểm đến du lịch.
- Có thể gom mapping điểm đến, thống kê, tag và dữ liệu liên quan.

### `src/hooks/`

- Chứa custom hooks dùng chung cho admin.
- Ví dụ: hook lấy dữ liệu, hook debounce, hook phân quyền, hook pagination.

### `src/lib/api-client.ts`

- Là lớp gọi API dùng chung cho toàn bộ admin.
- Chịu trách nhiệm thêm base URL, token, xử lý lỗi và chuẩn hóa response.

### `src/lib/api.ts`

- Chứa các hàm API cụ thể cho login, dashboard, users, categories, trips, expenses, destinations, settings.
- Nên dùng file này ở page hoặc feature thay vì gọi `fetch` trực tiếp khắp nơi.

### `src/lib/auth.ts`

- Xử lý session admin trên trình duyệt.
- Lưu, lấy, xóa token và dữ liệu user sau khi đăng nhập.

### `src/lib/format.ts`

- Chứa các hàm định dạng ngày, tiền tệ, số liệu.
- Giúp các trang hiển thị dữ liệu thống nhất.

### `src/lib/permissions.ts`

- Chứa helper kiểm tra quyền và role.
- Dùng để chặn nút, ẩn chức năng hoặc kiểm tra trước khi vào một màn hình.

### `src/stores/`

- Chứa store toàn cục nếu dùng Zustand, Redux, Jotai hoặc context nâng cao.
- Phù hợp cho trạng thái đăng nhập, ngôn ngữ, filter chung.

### `src/types/`

- Chứa type/interface dùng chung cho toàn admin.
- Nên khai báo type cho user, trip, expense, category, destination, auth.

### `src/utils/`

- Chứa helper nhỏ không thuộc nhóm `lib` hay `features`.
- Ví dụ: xử lý chuỗi, check null, convert dữ liệu đơn giản.

## 4. Danh sách màn hình và nhiệm vụ

### 4.1 Màn hình đăng nhập

Đường dẫn: `/login`

Nhiệm vụ:

- Xác thực tài khoản admin.
- Chuyển hướng vào dashboard sau khi đăng nhập thành công.
- Hiển thị lỗi sai mật khẩu, tài khoản bị khóa, hoặc hết phiên.

### 4.2 Dashboard tổng quan

Đường dẫn: `/`

Nhiệm vụ:

- Hiển thị KPI chính: tổng user, tổng chuyến đi, tổng chi tiêu, điểm đến nổi bật.
- Hiển thị biểu đồ xu hướng theo thời gian.
- Cho phép đi nhanh đến các module quản trị chính.

### 4.3 Quản lý user

Đường dẫn: `/users`

Nhiệm vụ:

- Danh sách user có phân trang, tìm kiếm, lọc theo trạng thái.
- Xem chi tiết user: hồ sơ, lịch sử chuyến đi, chi tiêu liên quan.
- Khóa/mở khóa tài khoản.
- Cập nhật quyền: admin, editor, support, hoặc role tùy hệ thống.

### 4.4 Chi tiết user

Đường dẫn: `/users/[id]`

Nhiệm vụ:

- Hiển thị thông tin cá nhân và thống kê hoạt động.
- Xem danh sách chuyến đi đã tham gia.
- Xem lịch sử chi tiêu và hành vi theo thời gian.
- Ghi chú nội bộ nếu có nhu cầu hỗ trợ.

### 4.5 Quản lý danh mục

Đường dẫn: `/categories`

Nhiệm vụ:

- Quản lý các danh mục dùng trong hệ thống.
- Có thể bao gồm: loại chuyến đi, loại chi tiêu, tag nội dung, nhóm điểm đến.
- Thêm, sửa, xóa, bật/tắt trạng thái hiển thị.

### 4.6 Quản lý chuyến đi

Đường dẫn: `/trips`

Nhiệm vụ:

- Xem danh sách chuyến đi theo trạng thái: sắp diễn ra, đang diễn ra, đã hoàn thành, đã hủy.
- Lọc theo thời gian, người tạo, điểm đến, ngân sách.
- Xem chi tiết chuyến đi, thành viên, chi tiêu, ghi chú.

### 4.7 Chi tiết chuyến đi

Đường dẫn: `/trips/[id]`

Nhiệm vụ:

- Hiển thị timeline chuyến đi.
- Hiển thị ngân sách dự kiến và thực chi.
- Liệt kê các khoản chi theo từng hạng mục.
- Xem danh sách thành viên và trạng thái tham gia.

### 4.8 Phân tích chi tiêu

Đường dẫn: `/expenses`

Nhiệm vụ:

- Thống kê tổng chi tiêu theo ngày, tuần, tháng.
- Phân tích chi tiêu theo user, chuyến đi, danh mục.
- Phát hiện nhóm chi phí lớn nhất và xu hướng tăng giảm.
- Cung cấp bộ lọc để xem theo khoảng thời gian hoặc khu vực.

### 4.9 Phân tích chi tiêu nâng cao

Đường dẫn: `/expenses/analytics`

Nhiệm vụ:

- Biểu đồ line theo thời gian.
- Biểu đồ pie theo danh mục chi tiêu.
- Biểu đồ bar so sánh giữa các chuyến đi.
- Xuất báo cáo phục vụ phân tích nội bộ.

### 4.10 Quản lý điểm đến du lịch

Đường dẫn: `/destinations`

Nhiệm vụ:

- Danh sách điểm đến theo quốc gia, tỉnh thành, khu vực.
- Thêm/sửa thông tin điểm đến, ảnh đại diện, mô tả, tag.
- Gắn số liệu lượt xem, lượt đặt, lượt ghé thăm nếu có.

### 4.11 Chi tiết điểm đến

Đường dẫn: `/destinations/[id]`

Nhiệm vụ:

- Xem dữ liệu tổng quan của một điểm đến.
- Hiển thị thống kê chuyến đi liên quan đến điểm đến đó.
- Xem các khoản chi tiêu trung bình tại điểm đến.

### 4.12 Cài đặt hệ thống

Đường dẫn: `/settings`

Nhiệm vụ:

- Cấu hình vai trò, quyền truy cập, thông báo.
- Cấu hình ngôn ngữ, timezone, quy tắc hiển thị báo cáo.
- Quản lý thông số chung của admin.

## 5. Luồng điều hướng đề xuất

1. Đăng nhập vào `/login`.
2. Vào `/` để xem dashboard tổng quan.
3. Từ sidebar, đi đến `Users`, `Categories`, `Trips`, `Expenses`, `Destinations`, `Settings`.
4. Tại mỗi module, có màn hình danh sách và màn hình chi tiết riêng.

## 6. Gợi ý chia quyền

- `Super Admin`: toàn quyền.
- `Admin`: quản lý user, danh mục, thống kê, báo cáo.
- `Analyst`: chỉ xem dashboard, thống kê, báo cáo.
- `Support`: xem user và lịch sử liên quan, không được xoá dữ liệu.

## 7. Gợi ý thành phần UI chính

- Sidebar điều hướng.
- Topbar có tìm kiếm và tài khoản.
- KPI cards ở dashboard.
- Bảng dữ liệu có filter, sort, pagination.
- Drawer hoặc modal cho thêm/sửa nhanh.
- Chart section cho phân tích chi tiêu và chuyến đi.

## 8. Kết luận

Cấu trúc trên phù hợp để phát triển một hệ thống admin Next.js rõ ràng, dễ mở rộng và dễ tách module. Nếu triển khai thực tế, nên bắt đầu từ `layout`, `sidebar`, `dashboard`, `users` và `trips` trước, sau đó mở rộng sang `expenses` và `destinations`.

## 9. Ghi chú triển khai thực tế

- Nếu một thư mục chỉ giữ chỗ, nên thêm `.gitkeep` để Git không bỏ trống.
- Nếu một module chưa có backend thật, vẫn nên giữ file route đúng tên để sau này thay dữ liệu dễ hơn.
- Khi tài liệu và code lệch nhau, ưu tiên giữ cây thư mục đúng như tài liệu này để dễ bàn giao cho người khác.