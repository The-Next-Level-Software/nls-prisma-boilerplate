# Prisma vs Mongoose: Quick Reference

This document provides a side-by-side comparison of common operations in Mongoose (MongoDB) and Prisma (PostgreSQL).

## Table of Contents
- [Connection](#connection)
- [Schema Definition](#schema-definition)
- [Create Operations](#create-operations)
- [Read Operations](#read-operations)
- [Update Operations](#update-operations)
- [Delete Operations](#delete-operations)
- [Relations](#relations)
- [Queries](#queries)
- [Transactions](#transactions)

## Connection

### Mongoose
```javascript
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGO_URI);
```

### Prisma
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
await prisma.$connect();
```

## Schema Definition

### Mongoose
```javascript
// user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
```

### Prisma
```prisma
// schema.prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id])
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("users")
}
```

## Create Operations

### Mongoose
```javascript
// Single document
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed_password'
});

// Multiple documents
const users = await User.insertMany([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
]);
```

### Prisma
```javascript
// Single record
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password'
  }
});

// Multiple records
const users = await prisma.user.createMany({
  data: [
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' }
  ]
});
```

## Read Operations

### Mongoose
```javascript
// Find by ID
const user = await User.findById(id);

// Find one
const user = await User.findOne({ email: 'john@example.com' });

// Find many
const users = await User.find({ isActive: true });

// Find with select
const users = await User.find().select('name email');

// Find with populate
const user = await User.findById(id).populate('role');

// Count
const count = await User.countDocuments({ isActive: true });
```

### Prisma
```javascript
// Find by ID
const user = await prisma.user.findUnique({
  where: { id }
});

// Find one
const user = await prisma.user.findFirst({
  where: { email: 'john@example.com' }
});

// Find many
const users = await prisma.user.findMany({
  where: { isActive: true }
});

// Find with select
const users = await prisma.user.findMany({
  select: { name: true, email: true }
});

// Find with include (relations)
const user = await prisma.user.findUnique({
  where: { id },
  include: { role: true }
});

// Count
const count = await prisma.user.count({
  where: { isActive: true }
});
```

## Update Operations

### Mongoose
```javascript
// Update one by ID
const user = await User.findByIdAndUpdate(
  id,
  { name: 'New Name' },
  { new: true }
);

// Update one
await User.updateOne(
  { email: 'john@example.com' },
  { $set: { isActive: false } }
);

// Update many
await User.updateMany(
  { role: 'user' },
  { $set: { isActive: true } }
);

// Increment
await User.updateOne(
  { _id: id },
  { $inc: { loginCount: 1 } }
);
```

### Prisma
```javascript
// Update one by ID
const user = await prisma.user.update({
  where: { id },
  data: { name: 'New Name' }
});

// Update many
await prisma.user.updateMany({
  where: { email: 'john@example.com' },
  data: { isActive: false }
});

// Update many with condition
await prisma.user.updateMany({
  where: { role: { name: 'user' } },
  data: { isActive: true }
});

// Increment
await prisma.user.update({
  where: { id },
  data: { loginCount: { increment: 1 } }
});
```

## Delete Operations

### Mongoose
```javascript
// Delete by ID
await User.findByIdAndDelete(id);

// Delete one
await User.deleteOne({ email: 'john@example.com' });

// Delete many
await User.deleteMany({ isActive: false });
```

### Prisma
```javascript
// Delete by ID
await prisma.user.delete({
  where: { id }
});

// Delete many
await prisma.user.deleteMany({
  where: { email: 'john@example.com' }
});

// Delete many with condition
await prisma.user.deleteMany({
  where: { isActive: false }
});
```

## Relations

### Mongoose
```javascript
// Define relation
const userSchema = new mongoose.Schema({
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }
});

// Populate relation
const user = await User.findById(id).populate('role');

// Populate with select
const user = await User.findById(id).populate({
  path: 'role',
  select: 'name permissions'
});

// Populate nested
const user = await User.findById(id)
  .populate({
    path: 'role',
    populate: { path: 'permissions' }
  });
```

### Prisma
```javascript
// Define relation (in schema.prisma)
model User {
  roleId String
  role   Role   @relation(fields: [roleId], references: [id])
}

// Include relation
const user = await prisma.user.findUnique({
  where: { id },
  include: { role: true }
});

// Include with select
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    role: {
      select: { name: true, permissions: true }
    }
  }
});

// Include nested
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    role: {
      include: { permissions: true }
    }
  }
});
```

## Queries

### Mongoose
```javascript
// Comparison operators
await User.find({ age: { $gte: 18 } });
await User.find({ age: { $lt: 65 } });

// In array
await User.find({ role: { $in: roleIds } });

// Not in array
await User.find({ role: { $nin: roleIds } });

// Regex search
await User.find({ name: { $regex: 'john', $options: 'i' } });

// OR condition
await User.find({
  $or: [
    { email: 'john@example.com' },
    { username: 'john' }
  ]
});

// AND condition
await User.find({
  $and: [
    { isActive: true },
    { role: 'admin' }
  ]
});

// Sorting
await User.find().sort({ createdAt: -1 });
await User.find().sort('-createdAt name');

// Pagination
await User.find()
  .skip(10)
  .limit(10);
```

### Prisma
```javascript
// Comparison operators
await prisma.user.findMany({ where: { age: { gte: 18 } } });
await prisma.user.findMany({ where: { age: { lt: 65 } } });

// In array
await prisma.user.findMany({
  where: { roleId: { in: roleIds } }
});

// Not in array
await prisma.user.findMany({
  where: { roleId: { notIn: roleIds } }
});

// Case-insensitive search
await prisma.user.findMany({
  where: {
    name: {
      contains: 'john',
      mode: 'insensitive'
    }
  }
});

// OR condition
await prisma.user.findMany({
  where: {
    OR: [
      { email: 'john@example.com' },
      { username: 'john' }
    ]
  }
});

// AND condition
await prisma.user.findMany({
  where: {
    AND: [
      { isActive: true },
      { role: { name: 'admin' } }
    ]
  }
});

// Sorting
await prisma.user.findMany({
  orderBy: { createdAt: 'desc' }
});
await prisma.user.findMany({
  orderBy: [
    { createdAt: 'desc' },
    { name: 'asc' }
  ]
});

// Pagination
await prisma.user.findMany({
  skip: 10,
  take: 10
});
```

## Transactions

### Mongoose
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await User.create([{ name: 'John' }], { session });
  await Role.updateOne(
    { name: 'user' },
    { $inc: { count: 1 } },
    { session }
  );
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Prisma
```javascript
await prisma.$transaction(async (tx) => {
  await tx.user.create({
    data: { name: 'John' }
  });
  
  await tx.role.update({
    where: { name: 'user' },
    data: { count: { increment: 1 } }
  });
});

// Or with array syntax
await prisma.$transaction([
  prisma.user.create({ data: { name: 'John' } }),
  prisma.role.update({
    where: { name: 'user' },
    data: { count: { increment: 1 } }
  })
]);
```

## Key Differences Summary

| Feature | Mongoose | Prisma |
|---------|----------|--------|
| **Database** | MongoDB | PostgreSQL, MySQL, SQLite, etc. |
| **Schema** | JavaScript/TypeScript | Prisma Schema Language |
| **Type Safety** | Limited | Full TypeScript support |
| **ID Type** | ObjectId | UUID, Int, etc. |
| **Relations** | Manual with `populate()` | Automatic with `include` |
| **Migrations** | Manual | Built-in Prisma Migrate |
| **Query Builder** | Chainable methods | Object-based |
| **Transactions** | Session-based | Callback or array-based |
| **Raw Queries** | `db.collection.find()` | `prisma.$queryRaw` |

## Performance Considerations

### Mongoose
- Better for flexible, document-based data
- Excellent for rapid prototyping
- Schema-less flexibility
- Horizontal scaling with sharding

### Prisma
- Better for relational data
- Type-safe queries prevent runtime errors
- Optimized query generation
- Built-in connection pooling
- Better for complex joins and relations

## When to Use Each

### Use Mongoose/MongoDB when:
- You need flexible, schema-less documents
- Your data structure changes frequently
- You're working with nested, hierarchical data
- You need horizontal scaling

### Use Prisma/PostgreSQL when:
- You need strong data consistency
- You have complex relational data
- You want full type safety
- You need ACID transactions
- You're building enterprise applications

## Migration Tips

1. **Start with Schema**: Convert Mongoose schemas to Prisma schema first
2. **Update IDs**: Change `_id` to `id` throughout your codebase
3. **Relations**: Replace `populate()` with `include`
4. **Queries**: Update query syntax from MongoDB to Prisma
5. **Transactions**: Simplify transaction code with Prisma's API
6. **Testing**: Update tests to use Prisma Client
7. **Seeding**: Rewrite seed scripts for Prisma

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB to PostgreSQL Migration Guide](https://www.prisma.io/docs/guides/migrate-to-prisma/migrate-from-mongoose)
