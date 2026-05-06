# Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│                    (Web/Mobile/API)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    EXPRESS SERVER                            │
│                      (app.js)                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MIDDLEWARE LAYER                         │  │
│  │  • CORS                                               │  │
│  │  • Helmet (Security)                                  │  │
│  │  • Auth Middleware                                    │  │
│  │  • Rate Limiter                                       │  │
│  │  • Error Handler                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    ROUTES LAYER                              │
│                  (routes/index.js)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/auth      → Auth Module                        │  │
│  │  /api/users     → User Module                        │  │
│  │  /api/files     → File Module                        │  │
│  │  /api/backup    → Backup Module                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   MODULES LAYER                              │
│                  (src/modules/)                              │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    AUTH     │  │    USER     │  │    FILE     │        │
│  │   MODULE    │  │   MODULE    │  │   MODULE    │        │
│  │             │  │             │  │             │        │
│  │ • Route     │  │ • Route     │  │ • Route     │        │
│  │ • Controller│  │ • Controller│  │ • Controller│        │
│  │ • Service   │  │ • Model     │  │             │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐        │
│  │    ROLE     │  │   SESSION   │  │     OTP     │        │
│  │   MODULE    │  │   MODULE    │  │   MODULE    │        │
│  │             │  │             │  │             │        │
│  │ • Model     │  │ • Model     │  │ • Model     │        │
│  └──────┬──────┘  └──────┬──────┘  │ • Service   │        │
│         │                │          └──────┬──────┘        │
└─────────┼────────────────┼─────────────────┼───────────────┘
          │                │                 │
          │                │                 │
┌─────────▼────────────────▼─────────────────▼───────────────┐
│                   SHARED SERVICES                            │
│  • Email Service                                             │
│  • Cache Service (Redis)                                     │
│  • File Service                                              │
│  • Query Service                                             │
│  • Upload Service                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   DATA ACCESS LAYER                          │
│                    (Prisma Client)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PRISMA ORM                               │  │
│  │  • Type-safe queries                                  │  │
│  │  • Automatic migrations                               │  │
│  │  • Connection pooling                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   DATABASE LAYER                             │
│                    (PostgreSQL)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables:                                              │  │
│  │  • users                                              │  │
│  │  • roles                                              │  │
│  │  • sessions                                           │  │
│  │  • otps                                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### Example: User Login

```
1. Client Request
   POST /api/auth/login
   { email, password }
        │
        ▼
2. Express Server
   • CORS check
   • Helmet security
   • Body parsing
        │
        ▼
3. Routes Layer
   routes/index.js
   → /api/auth → auth.route.js
        │
        ▼
4. Auth Module
   auth.route.js
   → POST /login → auth.controller.js
        │
        ▼
5. Auth Controller
   • Validate input
   • Call auth.service.js
        │
        ▼
6. Auth Service
   • Find user (via user.model.js)
   • Verify password
   • Generate tokens
   • Create session (via session.model.js)
        │
        ▼
7. Models
   user.model.js → Prisma Client
   session.model.js → Prisma Client
        │
        ▼
8. Prisma Client
   • Execute SQL queries
   • Type-safe operations
        │
        ▼
9. PostgreSQL
   • Query users table
   • Insert into sessions table
        │
        ▼
10. Response
    { accessToken, refreshToken, user }
```

## 📦 Module Architecture

### Module Structure Pattern

```
src/modules/<feature>/
│
├── <feature>.route.js       ← Route definitions
│   │
│   ▼
├── <feature>.controller.js  ← Request handlers
│   │
│   ▼
├── <feature>.service.js     ← Business logic (optional)
│   │
│   ▼
├── <feature>.model.js       ← Data access (Prisma)
│   │
│   ▼
└── Prisma Client → PostgreSQL
```

### Example: Auth Module Flow

```
auth.route.js
    │
    │ POST /login
    ▼
auth.controller.js
    │
    │ login(req, res)
    ▼
auth.service.js
    │
    │ generateAuthTokens()
    ▼
user.model.js
    │
    │ findByEmail()
    ▼
Prisma Client
    │
    │ prisma.user.findUnique()
    ▼
PostgreSQL
```

## 🔐 Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /api/auth/login
       │    { email, password }
       ▼
┌─────────────────────────────────┐
│     Auth Controller             │
│  • Validate credentials         │
└──────┬──────────────────────────┘
       │
       │ 2. Find user
       ▼
┌─────────────────────────────────┐
│     User Model                  │
│  • Query database               │
└──────┬──────────────────────────┘
       │
       │ 3. User found
       ▼
┌─────────────────────────────────┐
│     Auth Service                │
│  • Verify password              │
│  • Generate JWT tokens          │
│  • Create session               │
└──────┬──────────────────────────┘
       │
       │ 4. Save session
       ▼
┌─────────────────────────────────┐
│     Session Model               │
│  • Store refresh token          │
└──────┬──────────────────────────┘
       │
       │ 5. Return tokens
       ▼
┌─────────────┐
│   Client    │
│  • Store    │
│    tokens   │
└─────────────┘
```

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────┐
│                      POSTGRESQL                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐            │
│  │    roles     │         │    users     │            │
│  ├──────────────┤         ├──────────────┤            │
│  │ id (PK)      │◄────────│ id (PK)      │            │
│  │ name         │    1:N  │ name         │            │
│  │ permissions  │         │ email        │            │
│  │ createdAt    │         │ password     │            │
│  │ updatedAt    │         │ roleId (FK)  │            │
│  └──────────────┘         │ isActive     │            │
│                            │ createdAt    │            │
│                            │ updatedAt    │            │
│                            └──────┬───────┘            │
│                                   │                     │
│                                   │ 1:N                 │
│                                   │                     │
│                            ┌──────▼───────┐            │
│                            │   sessions   │            │
│                            ├──────────────┤            │
│                            │ id (PK)      │            │
│                            │ userId (FK)  │            │
│                            │ refreshToken │            │
│                            │ ip           │            │
│                            │ userAgent    │            │
│                            │ isActive     │            │
│                            │ createdAt    │            │
│                            │ updatedAt    │            │
│                            └──────────────┘            │
│                                                          │
│  ┌──────────────┐                                      │
│  │     otps     │                                      │
│  ├──────────────┤                                      │
│  │ id (PK)      │                                      │
│  │ email        │                                      │
│  │ otp          │                                      │
│  │ attempts     │                                      │
│  │ expiresAt    │                                      │
│  │ createdAt    │                                      │
│  │ updatedAt    │                                      │
│  └──────────────┘                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔌 External Integrations

```
┌─────────────────────────────────────────────────────────┐
│                   NLS PRISMA BOILERPLATE                 │
└────────┬────────────────────────────────────────────────┘
         │
         ├──────────────────────────────────────────────┐
         │                                               │
         │                                               │
    ┌────▼────┐  ┌──────────┐  ┌──────────┐  ┌────────▼────┐
    │  Redis  │  │   AWS    │  │  Email   │  │  Socket.IO  │
    │ (Cache) │  │   S3     │  │  SMTP    │  │  (Real-time)│
    └─────────┘  │ (Files)  │  │(Nodemailer)│ └─────────────┘
                 └──────────┘  └──────────┘
```

## 📊 Data Flow Patterns

### Pattern 1: Simple CRUD

```
Route → Controller → Model → Prisma → PostgreSQL
```

### Pattern 2: With Business Logic

```
Route → Controller → Service → Model → Prisma → PostgreSQL
```

### Pattern 3: With External Service

```
Route → Controller → Service → External API
                    ↓
                   Model → Prisma → PostgreSQL
```

### Pattern 4: With Queue

```
Route → Controller → Queue → Worker → Service → Model
                                         ↓
                                      Prisma → PostgreSQL
```

## 🔄 Module Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                      MODULES                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐                                           │
│  │   Auth   │──────────┐                                │
│  │  Module  │          │                                │
│  └────┬─────┘          │                                │
│       │                │                                │
│       │ uses           │ uses                           │
│       │                │                                │
│  ┌────▼─────┐     ┌────▼─────┐                         │
│  │   User   │     │   Role   │                         │
│  │  Module  │     │  Module  │                         │
│  └────┬─────┘     └──────────┘                         │
│       │                                                  │
│       │ uses                                            │
│       │                                                  │
│  ┌────▼─────┐                                           │
│  │ Session  │                                           │
│  │  Module  │                                           │
│  └──────────┘                                           │
│                                                          │
│  ┌──────────┐     ┌──────────┐                         │
│  │   File   │     │  Backup  │                         │
│  │  Module  │     │  Module  │                         │
│  └──────────┘     └──────────┘                         │
│                                                          │
│  ┌──────────┐                                           │
│  │   OTP    │                                           │
│  │  Module  │                                           │
│  └──────────┘                                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Network                                        │
│  • HTTPS/TLS                                             │
│  • CORS                                                  │
│                                                          │
│  Layer 2: Application                                    │
│  • Helmet (Security headers)                             │
│  • Rate Limiting                                         │
│  • Input Validation                                      │
│                                                          │
│  Layer 3: Authentication                                 │
│  • JWT Tokens                                            │
│  • Refresh Tokens                                        │
│  • Session Management                                    │
│                                                          │
│  Layer 4: Authorization                                  │
│  • Role-based Access Control                             │
│  • Permission Checks                                     │
│  • Admin Middleware                                      │
│                                                          │
│  Layer 5: Data                                           │
│  • Password Hashing (bcrypt)                             │
│  • SQL Injection Prevention (Prisma)                     │
│  • Data Validation                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📈 Scalability Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    LOAD BALANCER                         │
└────────┬────────────────────────────────────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ Server  │    │ Server  │    │ Server  │    │ Server  │
    │ Node 1  │    │ Node 2  │    │ Node 3  │    │ Node N  │
    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
    ┌────▼────┐                   ┌────▼────┐
    │  Redis  │                   │PostgreSQL│
    │ Cluster │                   │ Primary  │
    └─────────┘                   └────┬─────┘
                                       │
                                  ┌────▼─────┐
                                  │PostgreSQL│
                                  │ Replica  │
                                  └──────────┘
```

## 🎯 Key Architectural Principles

### 1. Separation of Concerns
- Each module handles one feature
- Clear boundaries between layers
- Single responsibility principle

### 2. Modularity
- Independent, self-contained modules
- Easy to add, remove, or modify
- Reusable across projects

### 3. Scalability
- Horizontal scaling ready
- Stateless application design
- Database connection pooling

### 4. Maintainability
- Clear folder structure
- Consistent naming conventions
- Comprehensive documentation

### 5. Security
- Multiple security layers
- Input validation
- Authentication & authorization

### 6. Performance
- Connection pooling
- Redis caching
- Optimized queries

---

**Architecture Version:** 2.0.0
**Last Updated:** May 6, 2026
**Status:** ✅ Production Ready
