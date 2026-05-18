# Tech Stack - Travel Expense Management App

Danh sách công nghệ sử dụng cho dự án GoTogether

---

## Backend (NestJS)

### Core Framework

- **NestJS** v10+ - Progressive Node.js framework
- **TypeScript** v5+ - Typed JavaScript
- **Node.js** v20+ - JavaScript runtime

### Database & ORM

- **PostgreSQL** - Relational database
- **Prisma ORM** v5+ - Type-safe database client
- **Redis** - Caching & session storage

### Authentication & Security

- **Passport.js** - Authentication middleware
- **JWT** (jsonwebtoken) - Access & refresh tokens
- **bcrypt** - Password hashing
- **@nestjs/throttler** - Rate limiting
- **helmet** - Security headers

### File Upload & Storage

- **Cloudinary** / **AWS S3** - Cloud storage cho ảnh
- **multer** - File upload middleware
- **sharp** - Image processing & optimization

### WebSocket & Realtime

- **@nestjs/websockets** - WebSocket support
- **Socket.io** - Realtime bi-directional communication

### Email

- **@nestjs-modules/mailer** - Email service
- **Nodemailer** - Email sending
- **Handlebars** - Email templates

### Push Notification

- **Firebase Cloud Messaging (FCM)** - Push notifications
- **firebase-admin** - Firebase Admin SDK

### API Integration

- **Axios** - HTTP client

### Export & Report

- **PDFKit** / **Puppeteer** - PDF generation
- **ExcelJS** - Excel file generation
- **Chart.js** - Charts for reports

### AI & Analytics (Optional)

- **OpenAI API** - AI insights & suggestions
- **Google AI (Gemini)** - Alternative AI service

### Validation & Documentation

- **class-validator** - DTO validation
- **class-transformer** - Object transformation
- **@nestjs/swagger** - API documentation
- **Swagger UI** - Interactive API docs

### Scheduling & Background Jobs

- **@nestjs/schedule** - Cron jobs
- **Bull** + **Redis** - Job queue & processing

### Testing

- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **@nestjs/testing** - NestJS testing utilities

### Logging & Monitoring

- **Winston** - Logging
- **Morgan** - HTTP request logging
- **Sentry** - Error tracking (production)

### i18n

- **nestjs-i18n** - Internationalization
- Hỗ trợ: Vietnamese (vi), English (en)

---

## Frontend (React Native / Flutter)

### Mobile Framework

- **React Native** + **Expo** (hoặc **Flutter**)
- **TypeScript**

### State Management

- **Redux Toolkit** / **Zustand** / **MobX**
- **React Query (TanStack Query)** - Server state management

### Navigation

- **React Navigation** (React Native)
- **Flutter Navigator** (Flutter)

### UI Components

- **React Native Paper** / **NativeBase**
- **React Native Chart Kit** - Biểu đồ
- **Lottie** - Animations

### Camera & QR

- **react-native-camera** / **expo-camera**
- **react-native-qrcode-scanner**

### Storage

- **AsyncStorage** / **MMKV** - Local storage
- **SQLite** - Offline database

### Push Notifications

- **Firebase Cloud Messaging**
- **expo-notifications**

### Map (optional for Itinerary)

- **react-native-maps** / **Google Maps API**

---

## DevOps & Deployment

### Version Control

- **Git** + **GitHub** / **GitLab**

### CI/CD

- **GitHub Actions** / **GitLab CI**
- **Docker** - Containerization
- **Docker Compose** - Multi-container setup

### Hosting

- **VPS** (DigitalOcean, Linode, AWS EC2)
- **Railway** / **Render** (alternative)
- **Vercel** (for documentation)

### Reverse Proxy & SSL

- **Nginx** - Reverse proxy
- **Certbot** - SSL certificates (Let's Encrypt)

### Monitoring & Analytics

- **PM2** - Process manager
- **Sentry** - Error tracking
- **Google Analytics** / **Mixpanel** - User analytics

### Backup

- **Rclone** - Google Drive backup
- **Cron** - Scheduled backups

---

## Development Tools

### Code Quality

- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Staged files linting

### API Testing

- **Postman** / **Insomnia**
- **Thunder Client** (VS Code extension)

### Database Management

- **Prisma Studio** - Database GUI
- **TablePlus** / **DBeaver** - Alternative DB clients

### Documentation

- **Swagger UI** - API docs
- **Markdown** - Project documentation

---

## Package Manager

- **npm** / **yarn** / **pnpm**

---

## Recommended VS Code Extensions

- Prisma
- ESLint
- Prettier
- REST Client
- Docker
- GitLens
- Thunder Client

---

## Environment Variables (.env)

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gotogether"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@gotogether.com

# Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# AI (Optional)
OPENAI_API_KEY=your-openai-key

# Sentry (Production)
SENTRY_DSN=your-sentry-dsn
```

---

_Ghi chú: Danh sách công nghệ có thể điều chỉnh tùy theo yêu cầu dự án_
