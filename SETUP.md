# Setup Guide

This guide will help you set up the Next Level Software Backend with Prisma and PostgreSQL.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Redis** (optional, for caching) - [Download](https://redis.io/download)
- **npm** or **pnpm** package manager

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set Up PostgreSQL Database

#### Option A: Using PostgreSQL CLI

```bash
# Connect to PostgreSQL
psql -U postgres

# Create a new database
CREATE DATABASE nextlevel_dev;

# Create a user (optional)
CREATE USER nextlevel_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nextlevel_dev TO nextlevel_user;

# Exit
\q
```

#### Option B: Using pgAdmin

1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Enter database name: `nextlevel_dev`
4. Click "Save"

### 3. Configure Environment Variables

Copy the development environment file:

```bash
cp .env.dev .env
```

Update the `.env` file with your database credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/nextlevel_dev?schema=public

# Example:
# DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/nextlevel_dev?schema=public
```

**Important Environment Variables:**

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/nextlevel_dev?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=MyApp
EMAIL_FROM_EMAIL=your-email@gmail.com

# Redis (optional)
REDIS_URL=redis://127.0.0.1:6379

# File Storage
FILE_STORAGE=local  # or 's3'

# AWS S3 (if using S3)
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket-name
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

This command generates the Prisma Client based on your schema.

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

This will:
- Create the database tables
- Apply the schema to your PostgreSQL database
- Generate migration files

If prompted for a migration name, enter something descriptive like: `init`

### 6. Seed the Database (Optional)

Populate the database with initial data:

```bash
npm run seed
```

This will create:
- Default roles (admin, user)
- Sample users

**Default Users:**
- Email: `khubaib@thenextlevelsoftware.com` | Password: `pa$w0rd`
- Email: `abdullah@thenextlevelsoftware.com` | Password: `pa$w0rd`
- Email: `fahad@thenextlevelsoftware.com` | Password: `pa$w0rd`

### 7. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 8. Verify Installation

Open your browser or use a tool like Postman to test:

```
GET http://localhost:3000/health
```

You should see a health check response.

## 🔧 Additional Configuration

### Setting Up Gmail for Email Service

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password
4. Update `.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=generated-app-password
   ```

### Setting Up Redis (Optional)

#### macOS (using Homebrew):
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian:
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

#### Windows:
Download from: https://redis.io/download

### Prisma Studio (Database GUI)

To view and edit your database visually:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555`

## 🧪 Testing the API

### Register a New User

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

### Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**

Solution:
1. Ensure PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```
2. Check your DATABASE_URL in `.env`
3. Verify PostgreSQL is listening on port 5432

**Error: "Authentication failed"**

Solution:
1. Check username and password in DATABASE_URL
2. Ensure the user has proper permissions

### Prisma Migration Issues

**Error: "Migration failed"**

Solution:
1. Reset the database:
   ```bash
   npm run prisma:migrate reset
   ```
2. Run migrations again:
   ```bash
   npm run prisma:migrate
   ```

### Port Already in Use

**Error: "Port 3000 is already in use"**

Solution:
1. Change the PORT in `.env`:
   ```env
   PORT=3001
   ```
2. Or kill the process using port 3000:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

## 📚 Next Steps

1. **Explore the API**: Check out the available endpoints in the routes folder
2. **Read the Documentation**: See README.md for detailed API documentation
3. **Customize**: Modify the schema, add new models, create new endpoints
4. **Deploy**: Follow the deployment guide for production setup

## 🆘 Getting Help

If you encounter any issues:

1. Check the [Migration Guide](MIGRATION_GUIDE.md) for MongoDB to PostgreSQL differences
2. Review [Prisma Documentation](https://www.prisma.io/docs)
3. Check PostgreSQL logs for database errors
4. Contact the development team

## ✅ Checklist

- [ ] Node.js installed
- [ ] PostgreSQL installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env`)
- [ ] Prisma Client generated (`npm run prisma:generate`)
- [ ] Database migrated (`npm run prisma:migrate`)
- [ ] Database seeded (`npm run seed`)
- [ ] Development server running (`npm run dev`)
- [ ] Health check endpoint working
- [ ] Successfully registered and logged in a user

Congratulations! Your Next Level Software Backend is now set up and ready to use! 🎉
