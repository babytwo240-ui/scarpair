# Admin Backend - Database Connection Setup

## Overview
The Admin Backend now shares the same database as the Main Backend (`scrapair_dev` / `scrapair_prod`).

### Three Tables Used by Admin

1. **users** - Business and Recycler users (shared from main backend)
2. **materials** - Material posts (shared from main backend)  
3. **admin_users** - Admin accounts (admin-specific)

---

## Database Tables Accessed

### users (READ/WRITE access)
- View all registered users (business and recyclers)
- Manage user accounts
- View user activity

### materials (READ/WRITE/DELETE access)
- View all material posts
- Approve/reject material recommendations
- Delete inappropriate materials
- Modify material status

### admin_users (admin-only)
- Admin login credentials
- Admin role management
- Activity logging

---

## Installation Steps

### Step 1: Install Dependencies

```bash
cd admin/backend
npm install
```

This will install:
- `sequelize` - ORM
- `sequelize-cli` - CLI tools
- `mysql2` - MySQL driver
- `bcryptjs` - Password hashing

### Step 2: Ensure Main Database Exists

The main backend already created these databases:
```sql
CREATE DATABASE scrapair_dev;    -- development
CREATE DATABASE scrapair_prod;   -- production
```

Admin backend uses the **same database**.

### Step 3: Update .env Configuration

```
NODE_ENV=development
PORT=5002

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=scrapair_dev

CORS_ORIGIN=http://localhost:3001
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION=24h
```

### Step 4: Run Admin Migrations

```bash
npm run db:migrate
```

This creates the `admin_users` table. The `users` and `materials` tables already exist from the main backend.

### Step 5: Create Default Admin User (Manual)

Since we don't have a seeder yet, insert the default admin manually:

**SECURITY NOTE:** Admin credentials are now configured via environment variables (`ADMIN_USERNAME` and `ADMIN_PASSWORD`) in `.env.local` or `.env.production`. Do NOT hardcode credentials in the database.

### For Development Only:
If you need to set up admin credentials in the database for testing:

```bash
mysql -u root -p scrapair_dev

-- First, generate a secure bcrypted password:
-- Use: node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourSecurePassword123!', 10));"

INSERT INTO admin_users (username, password, email, role, isActive, createdAt, updatedAt)
VALUES (
  'admin',
  '[INSERT BCRYPTED PASSWORD HERE]',
  'admin@scrapair.com',
  'super_admin',
  true,
  NOW(),
  NOW()
);

EXIT;
```

### For Production:
Admin credentials MUST be configured via environment variables:
```bash
# In .env.production:
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_very_secure_password_here
```

### Step 6: Start Admin Backend

```bash
npm run dev
```

Admin backend runs on `http://localhost:5002`

---

## Shared Database Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    SCRAPAIR DATABASE                        │
│              (scrapair_dev / scrapair_prod)                │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐                │
│  │    users        │  │   materials      │                │
│  │ (Main Backend)  │  │ (Main Backend)    │                │
│  └─────────────────┘  └──────────────────┘                │
│          │                      │                          │
│          ├── Admin Backend accesses all tables ───┘        │
│          │                                                 │
│  ┌──────────────────┐                                     │
│  │  admin_users     │                                     │
│  │ (Admin Backend)  │                                     │
│  └──────────────────┘                                     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Admin API Endpoints

### Authentication
```
POST /api/admin/login          - Admin login
```

### User Management (via Main Backend)
```
GET    /api/materials          - View all materials
POST   /api/materials          - Create material
PUT    /api/materials/:id      - Update material
DELETE /api/materials/:id      - Delete material
```

---

## Environment Files

### Development (.env)
```
NODE_ENV=development
PORT=5002
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=scrapair_dev
```

### Production (.env.production)
```
NODE_ENV=production
PORT=5002
DB_HOST=production_host
DB_USER=prod_user
DB_PASSWORD=prod_password
DB_NAME=scrapair_prod
```

---

## Tables Summary

### USERS (Shared)
```
id, type, email, password, businessName, companyName, 
phone, specialization, isActive, createdAt, updatedAt
```
- Created by: Main Backend
- Used by: Main Backend, Admin Backend

### MATERIALS (Shared)
```
id, businessUserId, materialType, quantity, unit, description,
contactEmail, status, isRecommendedForArtists, createdAt, updatedAt
```
- Created by: Main Backend
- Used by: Main Backend, Admin Backend

### ADMIN_USERS (Admin-Only)
```
id, username, password, email, role, isActive, lastLogin, 
createdAt, updatedAt
```
- Created by: Admin Backend
- Used by: Admin Backend only

---

## Admin Credentials Configuration

Admin credentials are now **environment-based** for security:

**Development (.env.local):**
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_dev_password
```

**Production (.env.production):**
```
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_very_secure_password_here
```

⚠️ **CRITICAL**: 
- Never hardcode credentials in the codebase
- Use strong passwords in production (minimum 12 characters, mixed case, numbers, symbols)
- Use different credentials for development and production
- Store credentials securely (environment variables only)
- If ADMIN_PASSWORD is not set in production, the application will fail to start
````

---

## Migration Commands

```bash
# Run pending migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Check migration status
npx sequelize-cli db:migrate:status
```

---

## Troubleshooting

### Error: "ER_NO_REFERENCED_TABLE"
**Cause**: users/materials tables don't exist yet  
**Solution**: Run main backend migrations first

### Error: "ER_DUP_ENTRY"
**Cause**: Default admin user already exists  
**Solution**: Check admin_users table, or use different username

### Error: "Unable to connect to database"
**Cause**: MySQL not running or wrong credentials  
**Solution**: Check DB_HOST, DB_USER, DB_PASSWORD in .env

---

## Next Steps

1. ✅ Create seeders for default admin users
2. ✅ Add more admin roles (editor, viewer)
3. ✅ Implement admin audit logging
4. ✅ Add material approval workflow
5. ✅ Create admin dashboard endpoints

---

**Setup Date**: January 12, 2026  
**Database Shared**: Yes (scrapair_dev / scrapair_prod)
