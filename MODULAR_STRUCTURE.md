# Modular Structure Documentation

This project follows a **feature-based modular architecture** where each feature/model has its own folder containing all related files.

## 📁 Project Structure

```
nls-prisma-boilerplate/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── modules/                   # 🎯 Feature modules (NEW)
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.route.js
│   │   ├── user/
│   │   │   ├── user.model.js
│   │   │   ├── user.controller.js
│   │   │   └── user.route.js
│   │   ├── role/
│   │   │   └── role.model.js
│   │   ├── session/
│   │   │   └── session.model.js
│   │   ├── otp/
│   │   │   ├── otp.model.js
│   │   │   └── otp.service.js
│   │   ├── file/
│   │   │   ├── file.controller.js
│   │   │   └── file.route.js
│   │   └── backup/
│   │       ├── backup.controller.js
│   │       └── backup.route.js
│   ├── config/                    # Configuration files
│   ├── constants/                 # Application constants
│   ├── middlewares/               # Express middlewares
│   ├── providers/                 # File storage providers
│   ├── queues/                    # BullMQ job queues
│   ├── routes/                    # Main route aggregator
│   │   └── index.js              # Imports all module routes
│   ├── scripts/                   # Utility scripts
│   ├── seed/                      # Database seeding
│   ├── services/                  # Shared services
│   ├── startup/                   # Initialization logic
│   ├── templates/                 # Email templates
│   ├── utils/                     # Helper utilities
│   ├── workers/                   # Queue workers
│   ├── app.js                     # Express app setup
│   └── index.js                   # Entry point
└── package.json
```

## 🎯 Module Structure

Each module follows this pattern:

```
src/modules/<feature-name>/
├── <feature>.model.js       # Data model (Prisma wrapper)
├── <feature>.controller.js  # Request handlers
├── <feature>.service.js     # Business logic
├── <feature>.route.js       # Route definitions
└── <feature>.validation.js  # Input validation (optional)
```

## 📦 Available Modules

### 1. Auth Module (`src/modules/auth/`)
Handles authentication and authorization.

**Files:**
- `auth.controller.js` - Register, login, logout, refresh token
- `auth.service.js` - Token generation, session management
- `auth.route.js` - Auth endpoints

**Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout all sessions
- `GET /api/auth/me` - Get current user

### 2. User Module (`src/modules/user/`)
Manages user operations.

**Files:**
- `user.model.js` - User data model with Prisma
- `user.controller.js` - User CRUD operations
- `user.route.js` - User endpoints

**Endpoints:**
- `GET /api/users` - Get all users (with pagination)

### 3. Role Module (`src/modules/role/`)
Manages user roles and permissions.

**Files:**
- `role.model.js` - Role data model with Prisma

### 4. Session Module (`src/modules/session/`)
Manages user sessions and refresh tokens.

**Files:**
- `session.model.js` - Session data model with Prisma

### 5. OTP Module (`src/modules/otp/`)
Handles one-time password generation and verification.

**Files:**
- `otp.model.js` - OTP data model with Prisma
- `otp.service.js` - OTP generation, verification, cleanup

### 6. File Module (`src/modules/file/`)
Handles file uploads (local and S3).

**Files:**
- `file.controller.js` - File upload/delete operations
- `file.route.js` - File endpoints

**Endpoints:**
- `POST /api/files/local/file` - Upload single file (local)
- `POST /api/files/local/image` - Upload single image (local)
- `POST /api/files/local/files` - Upload multiple files (local)
- `POST /api/files/s3/file` - Upload single file (S3)
- `DELETE /api/files/local/file/:fileId` - Delete file (local)
- `DELETE /api/files/s3/file/:key` - Delete file (S3)

### 7. Backup Module (`src/modules/backup/`)
Handles database backups.

**Files:**
- `backup.controller.js` - Backup download operations
- `backup.route.js` - Backup endpoints

**Endpoints:**
- `GET /api/backup/download` - Download all backups
- `GET /api/backup/download/:timestamp` - Download specific backup

## 🔄 How It Works

### 1. Request Flow

```
Request → app.js → routes/index.js → module/route.js → module/controller.js → module/service.js → module/model.js → Prisma → PostgreSQL
```

### 2. Module Independence

Each module is **self-contained** and can be:
- Developed independently
- Tested in isolation
- Moved or removed easily
- Reused in other projects

### 3. Import Pattern

**Within the same module:**
```javascript
// In auth.controller.js
import AuthService from "./auth.service.js";
```

**From another module:**
```javascript
// In auth.controller.js
import UserModel from "../user/user.model.js";
import RoleModel from "../role/role.model.js";
```

**From shared utilities:**
```javascript
// In any module
import { generateApiResponse } from "../../utils/response.util.js";
import prisma from "../../config/prisma.js";
```

## 🆕 Adding a New Module

### Step 1: Create Module Folder
```bash
mkdir -p src/modules/product
```

### Step 2: Create Model
```javascript
// src/modules/product/product.model.js
import prisma from "../../config/prisma.js";

class ProductModel {
  static async create(data) {
    return await prisma.product.create({ data });
  }

  static async findById(id) {
    return await prisma.product.findUnique({ where: { id } });
  }

  // ... other methods
}

export default ProductModel;
```

### Step 3: Create Controller
```javascript
// src/modules/product/product.controller.js
import { StatusCodes } from "http-status-codes";
import ProductModel from "./product.model.js";
import { generateApiResponse } from "../../utils/response.util.js";

class ProductController {
  static async getAll(req, res) {
    const products = await ProductModel.find();
    return generateApiResponse(res, StatusCodes.OK, "Products retrieved", { products });
  }

  // ... other methods
}

export default ProductController;
```

### Step 4: Create Routes
```javascript
// src/modules/product/product.route.js
import express from "express";
import ProductController from "./product.controller.js";

const router = express.Router();

router.get("/", ProductController.getAll);
router.post("/", ProductController.create);

export default router;
```

### Step 5: Register Routes
```javascript
// src/routes/index.js
import productRoutes from "../modules/product/product.route.js";

router.use("/products", productRoutes);
```

### Step 6: Add to Prisma Schema
```prisma
// prisma/schema.prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  price       Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}
```

### Step 7: Run Migration
```bash
npm run prisma:migrate
```

## 🎨 Module Patterns

### Pattern 1: Simple CRUD Module
```
module/
├── <name>.model.js       # Data access layer
├── <name>.controller.js  # Request handlers
└── <name>.route.js       # Route definitions
```

### Pattern 2: Complex Module with Service
```
module/
├── <name>.model.js       # Data access layer
├── <name>.service.js     # Business logic
├── <name>.controller.js  # Request handlers
└── <name>.route.js       # Route definitions
```

### Pattern 3: Module with Validation
```
module/
├── <name>.model.js       # Data access layer
├── <name>.service.js     # Business logic
├── <name>.controller.js  # Request handlers
├── <name>.validation.js  # Input validation
└── <name>.route.js       # Route definitions
```

## 🔧 Best Practices

### 1. Single Responsibility
Each file should have a single, well-defined purpose:
- **Models**: Database operations only
- **Services**: Business logic only
- **Controllers**: Request/response handling only
- **Routes**: Route definitions only

### 2. Dependency Direction
```
Routes → Controllers → Services → Models → Prisma
```

Dependencies should flow in one direction. Never import from a higher layer.

### 3. Naming Conventions
- **Files**: `<feature>.<type>.js` (e.g., `user.controller.js`)
- **Classes**: PascalCase (e.g., `UserController`)
- **Functions**: camelCase (e.g., `getAllUsers`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### 4. Export Patterns
```javascript
// Default export for main class
export default UserController;

// Named exports for utilities
export { helper1, helper2 };
```

### 5. Error Handling
Always use try-catch in controllers and return proper error responses:
```javascript
static async create(req, res) {
  try {
    const result = await Service.create(req.body);
    return generateApiResponse(res, 201, "Created", result);
  } catch (error) {
    return generateErrorApiResponse(res, 500, error.message);
  }
}
```

## 📊 Benefits of Modular Structure

### ✅ Advantages

1. **Better Organization**: Easy to find related files
2. **Scalability**: Add new features without affecting existing code
3. **Maintainability**: Changes are isolated to specific modules
4. **Testability**: Test modules independently
5. **Reusability**: Modules can be reused across projects
6. **Team Collaboration**: Multiple developers can work on different modules
7. **Clear Boundaries**: Each module has well-defined responsibilities

### 🎯 When to Use

- ✅ Medium to large applications
- ✅ Applications with multiple features
- ✅ Team-based development
- ✅ Long-term projects
- ✅ Applications that need to scale

## 🔄 Migration from Old Structure

### Old Structure (Flat)
```
src/
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   └── file.controller.js
├── services/
│   ├── auth.service.js
│   └── user.service.js
├── models/
│   ├── user.model.js
│   └── role.model.js
└── routes/
    ├── auth.route.js
    └── user.route.js
```

### New Structure (Modular)
```
src/
└── modules/
    ├── auth/
    │   ├── auth.controller.js
    │   ├── auth.service.js
    │   └── auth.route.js
    ├── user/
    │   ├── user.model.js
    │   ├── user.controller.js
    │   └── user.route.js
    └── file/
        ├── file.controller.js
        └── file.route.js
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Project Structure](https://github.com/goldbergyoni/nodebestpractices)

## 🆘 Common Issues

### Issue 1: Import Path Errors
**Problem**: `Cannot find module '../user/user.model.js'`

**Solution**: Check relative paths. Use `../` to go up one level.

### Issue 2: Circular Dependencies
**Problem**: Module A imports Module B, Module B imports Module A

**Solution**: Extract shared logic to a separate service or utility.

### Issue 3: Route Not Found
**Problem**: Endpoint returns 404

**Solution**: Ensure route is registered in `src/routes/index.js`

---

**Last Updated**: May 6, 2026
**Structure Version**: 2.0.0
**Status**: ✅ Production Ready
