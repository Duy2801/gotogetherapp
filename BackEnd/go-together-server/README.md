# GoTogether - Travel Expense Management App 🌍💰

> Ứng dụng quản lý chi tiêu du lịch thông minh cho cặp đôi và nhóm bạn

**GoTogether** là một ứng dụng giúp bạn dễ dàng theo dõi, phân chia và quản lý chi tiêu trong các chuyến đi du lịch. Không còn phải lo lắng về việc tính toán ai nợ ai bao nhiêu!

---

## ✨ Tính năng chính

### 🎯 Core Features

- ✅ **Quản lý chuyến đi**: Tạo, cập nhật, theo dõi các chuyến du lịch
- ✅ **Mời thành viên**: Scan QR hoặc gửi link để mời bạn bè tham gia
- ✅ **Ghi nhận chi tiêu**: Thêm chi tiêu nhanh chóng với ảnh hoá đơn
- ✅ **Phân chia thông minh**: Chia đều hoặc tùy chỉnh tỷ lệ cho từng người
- ✅ **Tự động tính toán**: Ai nợ ai bao nhiêu, rõ ràng minh bạch
- ✅ **Ngân sách**: Đặt ngân sách và nhận cảnh báo khi sắp vượt

### 📊 Advanced Features

- 📈 **Thống kê chi tiết**: Biểu đồ theo danh mục, thành viên, thời gian
- **Thông báo thông minh**: Nhắc nhở ghi chi tiêu, cảnh báo ngân sách
- 📄 **Xuất báo cáo**: PDF, Excel với biểu đồ đẹp mắt
- 🗺️ **Lịch trình**: Ghi lại kế hoạch và kỷ niệm từng ngày
- 🤖 **AI Analytics**: Phân tích thói quen, gợi ý tiết kiệm (coming soon)

---

## 🏗️ Kiến trúc hệ thống

```
GoTogether/
├── BackEnd/
│   └── go-together-server/      # NestJS Backend API
│       ├── src/
│       │   ├── auth/            # Authentication & JWT
│       │   ├── user/            # User management
│       │   ├── trip/            # Trip management
│       │   ├── trip-member/     # Member invitation & management
│       │   ├── expense/         # Expense CRUD
│       │   ├── expense-split/   # Split calculation
│       │   ├── category/        # Expense categories
│       │   ├── budget/          # Budget tracking
│       │   ├── statistics/      # Statistics & charts
│       │   ├── export/          # PDF, Excel export
│       │   ├── notification/    # Push & Email notifications
│       │   ├── itinerary/       # Travel itinerary
│       │   ├── ai-analytics/    # AI insights
│       │   ├── storage/         # File upload (Cloudinary)
│       │   ├── mail/            # Email service
│       │   ├── gateway/         # WebSocket
│       │   ├── redis/           # Cache & Queue
│       │   ├── prisma/          # Database ORM
│       │   ├── common/          # Shared utilities
│       │   ├── i18n/            # Internationalization
│       │   └── cron/            # Scheduled jobs
│       ├── prisma/
│       │   └── schema.prisma    # Database schema
│       ├── docs/                # Documentation
│       ├── test/                # Tests
│       └── package.json
│
└── FrontEnd/
    └── go-together-app/         # React Native / Flutter Mobile App
        ├── src/
        ├── assets/
        └── package.json
```

---

## 🛠️ Tech Stack

### Backend

- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT + Passport
- **Storage**: Cloudinary / AWS S3
- **Email**: Nodemailer + Handlebars
- **Push Notification**: Firebase Cloud Messaging
- **WebSocket**: Socket.io
- **Export**: PDFKit, ExcelJS
- **AI**: OpenAI API (optional)

### Frontend (Mobile)

- **Framework**: React Native + Expo / Flutter
- **State**: Redux Toolkit / Zustand
- **API Client**: Axios + React Query
- **UI**: React Native Paper / NativeBase
- **Charts**: Chart Kit
- **Camera**: Expo Camera + QR Scanner

### DevOps

- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: VPS (DigitalOcean, AWS)
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **Backup**: Rclone + Google Drive
- **Monitoring**: Sentry, PM2

---

## 📋 Prerequisites

- Node.js >= 20.x
- PostgreSQL >= 14.x
- Redis >= 7.x
- Docker & Docker Compose (optional)
- npm / yarn / pnpm

---

## 🚀 Quick Start

### 1. Clone repository

```bash
git clone https://github.com/yourusername/gotogether.git
cd gotogether/BackEnd/go-together-server
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup environment variables

```bash
cp .env.example .env
# Chỉnh sửa file .env với thông tin của bạn
```

### 4. Setup database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database với dữ liệu mẫu
npx prisma db seed
```

### 5. Start development server

```bash
npm run start:dev
```

Server sẽ chạy tại: `http://localhost:3000`

API Documentation (Swagger): `http://localhost:3000/api`

---

## 🐳 Docker Setup (Recommended)

```bash
# Build và start tất cả services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:

- **API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 📚 Documentation

- [Features](./docs/feature.md) - Danh sách đầy đủ các tính năng
- [Architecture](./docs/func-curent.md) - Kiến trúc hệ thống
- [API Endpoints](./docs/api-endpoints.md) - Chi tiết các API
- [Database Schema](./docs/database-schema.md) - Cấu trúc database
- [Tech Stack](./docs/tech-stack.md) - Công nghệ sử dụng
- [Roadmap](./docs/roadmap.md) - Lộ trình phát triển
- [Backup Guide](./docs/backup.md) - Hướng dẫn backup

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📦 Build for Production

```bash
# Build
npm run build

# Start production server
npm run start:prod
```

---

## 🔐 Environment Variables

Tạo file `.env` với các biến sau:

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gotogether"

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase
FIREBASE_PROJECT_ID=your-project-id
```

---

## 📱 Mobile App

Coming soon...

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 Authors

- **Your Name** - _Initial work_ - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Prisma team for the excellent ORM
- All contributors who helped build this project

---

## 📞 Support

- Email: support@gotogether.com
- Discord: [Join our server](https://discord.gg/gotogether)
- Issues: [GitHub Issues](https://github.com/yourusername/gotogether/issues)

---

## 🗺️ Roadmap

- [x] Phase 1: MVP (Auth, Trip, Expense)
- [x] Phase 2: Expense Split & Budget
- [ ] Phase 3: Real-time & Notifications
- [ ] Phase 4: Mobile App
- [ ] Phase 5: AI Analytics
- [ ] Phase 6: Production Launch

Xem chi tiết tại [Roadmap](./docs/roadmap.md)

---

**Made with ❤️ for travelers around the world**

🌍 Happy traveling! ✈️
