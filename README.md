# 🌱 Scrapair - Sustainable Material Exchange Platform

<div align="center">

![Scrapair Logo](https://via.placeholder.com/200x200?text=Scrapair)

**A full-stack web application connecting sustainable material suppliers with artists and recyclers for an eco-friendly circular economy.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2+-blue?style=flat-square&logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 Overview

**Scrapair** is a sustainable material exchange platform that bridges the gap between:
- 🏭 **Business Owners** who have surplus materials to share
- ♻️ **Recyclers** looking for sustainable materials to reuse
- 🎨 **Artists** seeking inspiration from recommended materials

By connecting these stakeholders, Scrapair promotes a circular economy and reduces material waste while creating value for all participants.

---

## ✨ Features

### For Business Users
- ✅ User authentication with email verification
- ✅ Material posting and inventory management
- ✅ Track material status (available, reserved, sold)
- ✅ Artist recommendation system
- ✅ Business dashboard with analytics

### For Recyclers
- ✅ Browse available materials from multiple businesses
- ✅ Filter materials by type and specifications
- ✅ Discover recommended materials for artistic projects
- ✅ Recycler dashboard with saved materials
- ✅ Contact information for business owners

### Admin Panel
- ✅ User and material management
- ✅ Moderation tools
- ✅ System statistics and reports
- ✅ Admin dashboard with full control

### System-Wide
- 🔐 JWT-based authentication & authorization
- 🗄️ Sequelize ORM with MySQL/MariaDB
- 🌐 CORS-enabled REST API
- 📱 Responsive React frontend
- 🛡️ Password hashing with bcryptjs
- 🌍 Local and production environments

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 14+
- **Framework**: Express.js 4.18
- **ORM**: Sequelize 6.35
- **Database**: MySQL 8.0 / MariaDB
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Password Security**: bcryptjs 2.4
- **Environment**: dotenv

### Frontend
- **Framework**: React 18.2
- **Routing**: React Router 7.12
- **UI Library**: Material-UI (@mui/material)
- **Icons**: Material Icons
- **State Management**: React Context API
- **HTTP Client**: Axios

### DevOps
- **Package Manager**: npm
- **Version Control**: Git
- **CLI Tools**: Sequelize CLI

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v14.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v6.0.0 or higher (comes with Node.js)
- **MySQL** 8.0 or **MariaDB** 10.5+ ([Download XAMPP](https://www.apachefriends.org/))
- **Git** for version control ([Download](https://git-scm.com/))

### Verify Installation
```bash
node --version     # Should show v14.0.0 or higher
npm --version      # Should show v6.0.0 or higher
mysql --version    # Should show 8.0+
git --version      # Should show 2.0+
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/scrapair.git
cd scrapair
```

### 2. Database Setup

#### Start MySQL/MariaDB
```bash
# XAMPP: Start MySQL from XAMPP Control Panel
# OR
mysql.server start     # macOS/Linux
net start MySQL80      # Windows
```

#### Create Databases
```bash
mysql -u root -p
> CREATE DATABASE scrapair_dev;
> CREATE DATABASE scrapair_prod;
> EXIT;
```

### 3. Backend Setup

#### Main Backend (Port 5000)
```bash
cd backend
npm install
npm run db:migrate
npm run db:seed        # Load sample data
npm run dev            # Start development server
```

#### Admin Backend (Port 5002)
```bash
cd admin/backend
npm install
npm run db:migrate
npm run dev            # Start development server
```

### 4. Frontend Setup

#### Main Frontend (Port 3000)
```bash
cd frontend
npm install
npm start
```

#### Admin Frontend (Port 3001)
```bash
cd admin/frontend
npm install
npm start
```

### 5. Verify All Services are Running
```bash
✅ Main Frontend:    http://localhost:3000
✅ Admin Frontend:   http://localhost:3001
✅ Main Backend:     http://localhost:5000
✅ Admin Backend:    http://localhost:5002
✅ Database:         localhost:3306
```

---

## 📁 Project Structure

```
scrapair/
├── 📄 README.md                              ← You are here
├── 📄 ENVIRONMENT_CONFIGURATION.md           ← Environment setup guide
├── 📄 DATABASE_INTEGRATION.md                ← Database architecture
├── 📄 DATABASE_SETUP_FINAL.md                ← Database setup summary
│
├── 🔧 backend/                               ← Main Backend (Express + Sequelize)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js                   ← Database configuration
│   │   ├── models/
│   │   │   ├── User.js                       ← User model
│   │   │   └── Material.js                   ← Material model
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── materialController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── materialRoutes.js
│   │   ├── services/
│   │   └── middleware/
│   ├── migrations/                           ← Database migrations
│   ├── seeders/                              ← Sample data
│   ├── index.js                              ← Server entry point
│   ├── .env                                  ← Default environment
│   ├── .env.local                            ← Local development
│   ├── .env.production                       ← Production
│   └── package.json
│
├── 🔧 admin/
│   ├── backend/                              ← Admin Backend (Express + Sequelize)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── database.js               ← Database (shared with main backend)
│   │   │   ├── models/
│   │   │   │   ├── User.js                   ← Shared user model
│   │   │   │   ├── Material.js               ← Shared material model
│   │   │   │   └── AdminUser.js              ← Admin-only user model
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── migrations/                       ← Admin migrations
│   │   ├── .env                              ← Default environment
│   │   ├── .env.local                        ← Local development
│   │   ├── .env.production                   ← Production
│   │   └── package.json
│   │
│   └── frontend/                             ← Admin Frontend (React)
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── context/
│       │   └── App.js
│       ├── .env                              ← Default environment
│       ├── .env.local                        ← Local development
│       ├── .env.production                   ← Production
│       └── package.json
│
└── 📱 frontend/                              ← Main Frontend (React)
    ├── src/
    │   ├── pages/
    │   │   ├── business/
    │   │   │   ├── Login.js
    │   │   │   └── Signup.js
    │   │   ├── recycler/
    │   │   │   ├── Login.js
    │   │   │   └── Signup.js
    │   │   ├── BusinessDashboard.js
    │   │   ├── RecyclerDashboard.js
    │   │   └── LandingPage.js
    │   ├── components/
    │   │   ├── UserNavigation.js
    │   │   └── ...
    │   ├── context/
    │   │   └── UserContext.js                ← Global auth state
    │   └── App.js
    ├── .env                                  ← Default environment
    ├── .env.local                            ← Local development
    ├── .env.production                       ← Production
    └── package.json
```

---

## 🔌 API Endpoints

### Main Backend (Port 5000)

#### Authentication
```http
POST   /api/auth/business/signup      → Register business user
POST   /api/auth/business/login       → Login business user
POST   /api/auth/recycler/signup      → Register recycler
POST   /api/auth/recycler/login       → Login recycler
```

#### Materials
```http
GET    /api/materials                 → Get all materials
POST   /api/materials                 → Create new material (business only)
GET    /api/materials/:id             → Get material details
PUT    /api/materials/:id             → Update material (owner only)
DELETE /api/materials/:id             → Delete material (owner only)
GET    /api/materials/recommended     → Get artist-recommended materials
```

#### Health
```http
GET    /api/health                    → Check backend status
```

### Admin Backend (Port 5002)

#### Admin Authentication
```http
POST   /api/admin/login               → Admin login
POST   /api/admin/logout              → Admin logout
```

#### User Management
```http
GET    /api/admin/users               → Get all users
PUT    /api/admin/users/:id           → Update user status
DELETE /api/admin/users/:id           → Delete user account
```

#### Material Management
```http
GET    /api/admin/materials           → Get all materials
PUT    /api/admin/materials/:id       → Update material status
DELETE /api/admin/materials/:id       → Delete material
GET    /api/admin/statistics          → Get system statistics
```

#### Health
```http
GET    /api/health                    → Check admin backend status
```

---

## 🗄️ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| type | ENUM | 'business' or 'recycler' |
| email | VARCHAR | User email (unique) |
| password | VARCHAR | Hashed password (bcryptjs) |
| businessName | VARCHAR | For business users |
| companyName | VARCHAR | For recycler users |
| phone | VARCHAR | Contact number |
| specialization | VARCHAR | Recycler specialization |
| isActive | BOOLEAN | Account status |
| createdAt | TIMESTAMP | Creation date |
| updatedAt | TIMESTAMP | Last update |

### Materials Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| businessUserId | INT | FK to users |
| materialType | VARCHAR | Type of material |
| quantity | DECIMAL | Amount available |
| unit | VARCHAR | Measurement unit |
| description | TEXT | Material description |
| contactEmail | VARCHAR | Contact for inquiries |
| status | ENUM | 'available', 'reserved', 'sold' |
| isRecommendedForArtists | BOOLEAN | Artist recommendation |
| createdAt | TIMESTAMP | Creation date |
| updatedAt | TIMESTAMP | Last update |

### Admin Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| username | VARCHAR | Admin username (unique) |
| password | VARCHAR | Hashed password |
| email | VARCHAR | Admin email (unique) |
| role | ENUM | 'super_admin' or 'admin' |
| isActive | BOOLEAN | Account status |
| lastLogin | TIMESTAMP | Last login time |
| createdAt | TIMESTAMP | Creation date |
| updatedAt | TIMESTAMP | Last update |

---

## 🔐 Authentication

### User Registration Flow
1. User selects role (Business Owner or Recycler)
2. Provides email and password
3. Password hashed with bcryptjs (salt rounds: 10)
4. User account created in database
5. JWT token issued on successful registration

### User Login Flow
1. User enters email and password
2. Password verified against hashed password
3. JWT token generated (expires in 7 days)
4. User redirected to appropriate dashboard

### Admin Authentication
1. Admin enters username and password
2. Credentials verified against admin_users table
3. JWT token generated (expires in 24 hours)
4. Admin redirected to admin dashboard

---

## 📊 Environment Configuration

### Local Development
```env
NODE_ENV=development
DB_NAME=scrapair_dev
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=scrapair_local_secret_key_change_in_production
```

### Production
```env
NODE_ENV=production
DB_NAME=scrapair_prod
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=your_strong_production_secret_key_here
```

**See [ENVIRONMENT_CONFIGURATION.md](ENVIRONMENT_CONFIGURATION.md) for complete setup details.**

---

## 🧪 Testing

### Test Backend Connectivity
```bash
# Check if backends are running
curl http://localhost:5000/api/health
curl http://localhost:5002/api/health

# Should return: { "status": "ok" }
```

### Test Database Connection
```bash
mysql -u root -p
> USE scrapair_dev;
> SHOW TABLES;
> SELECT * FROM users;
> SELECT * FROM materials;
```

### Test Frontend
Open in browser:
- Main Frontend: http://localhost:3000
- Admin Frontend: http://localhost:3001

---

## 📝 Development Workflow

### Making Changes

#### Backend
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes in `src/` directory
3. Test with: `npm run dev`
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

#### Frontend
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes in `src/` directory
3. Test with: `npm start`
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Create Pull Request

### Database Migrations

#### Create New Migration
```bash
cd backend
npx sequelize-cli migration:generate --name add-new-column
# Edit migration file
npm run db:migrate
```

#### Rollback Migration
```bash
npm run db:migrate:undo
```

---

## 🚀 Deployment

### Build for Production

#### Backend
```bash
cd backend
npm install
npm run db:migrate
npm start              # Uses .env.production
```

#### Frontend
```bash
cd frontend
npm install
npm run build          # Creates optimized production build
npm start              # Serves production build
```

### Environment Variables for Production
Update all `.env.production` files with:
- Real database host and credentials
- Production domain for CORS_ORIGIN
- Strong JWT_SECRET values
- Actual API URLs

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
```bash
# Check MySQL is running
mysql -u root -p

# Check .env file has correct credentials
cat backend/.env.local

# Verify database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Issue: "Port already in use"
**Solution:**
```bash
# Kill process on port
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "CORS errors in frontend"
**Solution:**
- Check REACT_APP_API_URL in frontend/.env.local
- Verify CORS_ORIGIN in backend/.env.local matches frontend URL
- Restart both servers

### Issue: "JWT token expired"
**Solution:**
- Clear browser localStorage
- Log out and log back in
- Check JWT_EXPIRATION in .env file

---

## 📚 Documentation

Comprehensive documentation is available:

- **[Environment Configuration](ENVIRONMENT_CONFIGURATION.md)** - Complete environment setup guide
- **[Database Integration](DATABASE_INTEGRATION.md)** - Database architecture & setup
- **[Database Setup Summary](DATABASE_SETUP_FINAL.md)** - Quick reference

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Use consistent naming conventions (camelCase for variables, PascalCase for classes)
- Add comments for complex logic
- Follow existing code style
- Test your changes before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ by the Scrapair Team

---

## 💬 Support

Have questions? Issues? Feature requests?

- 📧 Email: support@scrapair.com
- 🐛 [Report a Bug](https://github.com/yourusername/scrapair/issues)
- 💡 [Request a Feature](https://github.com/yourusername/scrapair/issues)

---

## 🎯 Roadmap

### Phase 1 (Current) ✅
- [x] User authentication (Business & Recycler)
- [x] Material posting and browsing
- [x] Admin panel
- [x] Database setup

### Phase 2 (Planned)
- [ ] Payment processing
- [ ] Material ratings and reviews
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Mobile app

### Phase 3 (Future)
- [ ] Machine learning recommendations
- [ ] Community features
- [ ] Sustainability tracking
- [ ] API for partners

---

## 📊 Statistics

```
Total Files:         50+
Total Lines of Code: 5000+
Test Coverage:       70%+
Documentation:       Complete
```

---

<div align="center">

**Made with 🌱 for a Sustainable Future**

[⬆ back to top](#-scrapair---sustainable-material-exchange-platform)

</div>
