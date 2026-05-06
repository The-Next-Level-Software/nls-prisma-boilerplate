# Quick Start Guide

Get up and running with the Next Level Software Backend in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or pnpm installed

## 🚀 Quick Setup (5 Steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nextlevel_dev;

# Exit
\q
```

### 3. Configure Environment

```bash
# Copy environment file
cp .env.dev .env

# Edit .env and update DATABASE_URL
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/nextlevel_dev?schema=public
```

### 4. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run seed
```

### 5. Start Server

```bash
npm run dev
```

Server is now running at `http://localhost:3000` 🎉

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 📚 Next Steps

- Read the [Full Setup Guide](SETUP.md) for detailed instructions
- Check out the [Migration Guide](MIGRATION_GUIDE.md) to understand Prisma vs Mongoose
- Explore the [API Documentation](README.md#api-documentation)
- View your database with Prisma Studio: `npm run prisma:studio`

## 🆘 Common Issues

### "Can't reach database server"
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file

### "Port 3000 already in use"
- Change PORT in .env file
- Or kill the process: `lsof -ti:3000 | xargs kill -9`

### "Prisma Client not generated"
- Run: `npm run prisma:generate`

## 📖 Available Scripts

```bash
npm run dev              # Start development server
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run seed             # Seed database
npm test                 # Run tests
```

## 🎯 Default Credentials (After Seeding)

```
Email: khubaib@thenextlevelsoftware.com
Password: pa$w0rd

Email: abdullah@thenextlevelsoftware.com
Password: pa$w0rd
```

Happy coding! 🚀
