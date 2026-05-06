# MongoDB to PostgreSQL Migration Guide

This document outlines the key differences and changes made when migrating from MongoDB/Mongoose to PostgreSQL/Prisma.

## 🔄 Key Changes

### 1. Database Connection

**Before (MongoDB/Mongoose):**
```javascript
import mongoose from "mongoose";
await mongoose.connect(MONGO_URI);
```

**After (PostgreSQL/Prisma):**
```javascript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
await prisma.$connect();
```

### 2. Schema Definition

**Before (Mongoose Schema):**
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }
}, { timestamps: true });
```

**After (Prisma Schema):**
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3. Model Methods

**Before (Mongoose Instance Methods):**
```javascript
userSchema.methods.comparePassword = function(password) {
  return PasswordUtils.compare(password, this.password);
};

const user = await User.findOne({ email });
const isMatch = await user.comparePassword(password);
```

**After (Prisma Static Methods):**
```javascript
class UserModel {
  static async comparePassword(plainPassword, hashedPassword) {
    return await PasswordUtils.compare(plainPassword, hashedPassword);
  }
}

const user = await UserModel.findByEmail(email);
const isMatch = await UserModel.comparePassword(password, user.password);
```

### 4. CRUD Operations

#### Create

**Before:**
```javascript
const user = await User.create({ name, email, password });
```

**After:**
```javascript
const user = await prisma.user.create({
  data: { name, email, password }
});
// Or using model wrapper:
const user = await UserModel.create({ name, email, password });
```

#### Read

**Before:**
```javascript
const user = await User.findById(id);
const user = await User.findOne({ email });
const users = await User.find({ isActive: true });
```

**After:**
```javascript
const user = await prisma.user.findUnique({ where: { id } });
const user = await prisma.user.findFirst({ where: { email } });
const users = await prisma.user.findMany({ where: { isActive: true } });
// Or using model wrapper:
const user = await UserModel.findById(id);
const user = await UserModel.findByEmail(email);
const users = await UserModel.find({ where: { isActive: true } });
```

#### Update

**Before:**
```javascript
const user = await User.findByIdAndUpdate(id, { name }, { new: true });
await User.updateOne({ email }, { $set: { isActive: false } });
await User.updateMany({ role: "user" }, { $set: { isActive: true } });
```

**After:**
```javascript
const user = await prisma.user.update({
  where: { id },
  data: { name }
});
await prisma.user.updateMany({
  where: { email },
  data: { isActive: false }
});
// Or using model wrapper:
const user = await UserModel.updateById(id, { name });
```

#### Delete

**Before:**
```javascript
await User.findByIdAndDelete(id);
await User.deleteOne({ email });
await User.deleteMany({ isActive: false });
```

**After:**
```javascript
await prisma.user.delete({ where: { id } });
await prisma.user.deleteMany({ where: { email } });
await prisma.user.deleteMany({ where: { isActive: false } });
// Or using model wrapper:
await UserModel.deleteById(id);
```

### 5. Relations and Population

**Before (Mongoose Populate):**
```javascript
const user = await User.findById(id).populate("role");
const users = await User.find().populate({
  path: "role",
  select: "name permissions"
});
```

**After (Prisma Include):**
```javascript
const user = await prisma.user.findUnique({
  where: { id },
  include: { role: true }
});
const users = await prisma.user.findMany({
  include: {
    role: {
      select: { name: true, permissions: true }
    }
  }
});
```

### 6. Query Operators

**Before (MongoDB Operators):**
```javascript
// Greater than
await User.find({ age: { $gte: 18 } });

// In array
await User.find({ role: { $in: roleIds } });

// Regex search
await User.find({ name: { $regex: "john", $options: "i" } });

// Or condition
await User.find({
  $or: [
    { email: searchTerm },
    { name: searchTerm }
  ]
});
```

**After (Prisma Operators):**
```javascript
// Greater than or equal
await prisma.user.findMany({
  where: { age: { gte: 18 } }
});

// In array
await prisma.user.findMany({
  where: { roleId: { in: roleIds } }
});

// Case-insensitive search
await prisma.user.findMany({
  where: {
    name: {
      contains: "john",
      mode: "insensitive"
    }
  }
});

// Or condition
await prisma.user.findMany({
  where: {
    OR: [
      { email: { contains: searchTerm } },
      { name: { contains: searchTerm } }
    ]
  }
});
```

### 7. Pagination

**Before:**
```javascript
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const users = await User.find()
  .skip(skip)
  .limit(limit)
  .sort("-createdAt");

const total = await User.countDocuments();
```

**After:**
```javascript
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const users = await prisma.user.findMany({
  skip,
  take: limit,
  orderBy: { createdAt: "desc" }
});

const total = await prisma.user.count();
```

### 8. Transactions

**Before (Mongoose Transactions):**
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await User.create([{ name, email }], { session });
  await Role.updateOne({ name: "user" }, { $inc: { count: 1 } }, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**After (Prisma Transactions):**
```javascript
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data: { name, email } });
  await tx.role.update({
    where: { name: "user" },
    data: { count: { increment: 1 } }
  });
});
```

### 9. Aggregation

**Before (MongoDB Aggregation):**
```javascript
const result = await User.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: "$role", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

**After (Prisma Aggregation):**
```javascript
const result = await prisma.user.groupBy({
  by: ["roleId"],
  where: { isActive: true },
  _count: true,
  orderBy: { _count: { roleId: "desc" } }
});
```

### 10. ID Fields

**Before (MongoDB ObjectId):**
```javascript
_id: ObjectId("507f1f77bcf86cd799439011")
userId: user._id
```

**After (PostgreSQL UUID):**
```javascript
id: "550e8400-e29b-41d4-a716-446655440000"
userId: user.id
```

## 🔧 Configuration Changes

### Environment Variables

**Before:**
```env
MONGO_URI=mongodb://localhost:27017/mydb
```

**After:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/mydb?schema=public
```

### Package.json Dependencies

**Removed:**
- `mongoose`

**Added:**
- `@prisma/client`
- `prisma`
- `pg` (PostgreSQL driver)

## 📝 Best Practices

1. **Use Model Wrappers**: Create model wrapper classes to maintain similar API to Mongoose
2. **Handle Relations**: Use `include` instead of `populate` for relations
3. **Use Transactions**: Wrap multiple operations in `$transaction` for data consistency
4. **Type Safety**: Leverage Prisma's TypeScript support for better type safety
5. **Migrations**: Use Prisma Migrate for schema changes instead of manual SQL
6. **Seeding**: Update seed scripts to use Prisma Client
7. **Testing**: Update tests to use Prisma Client and PostgreSQL test database

## 🚨 Common Pitfalls

1. **ID Field Names**: Remember to change `_id` to `id` throughout the codebase
2. **Populate vs Include**: Don't forget to update all `.populate()` calls to use `include`
3. **Update Syntax**: Prisma uses `data` object for updates, not direct field assignment
4. **Array Operations**: PostgreSQL arrays work differently than MongoDB arrays
5. **Case Sensitivity**: PostgreSQL is case-sensitive by default, use `mode: "insensitive"` for searches
6. **Null vs Undefined**: Prisma distinguishes between `null` and `undefined` in queries

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [MongoDB to PostgreSQL Migration](https://www.prisma.io/docs/guides/migrate-to-prisma/migrate-from-mongoose)
