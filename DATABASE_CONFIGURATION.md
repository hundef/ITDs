# ITD Staff Portal - Database Configuration Guide

## Current Setup

### Database
- **Type**: PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: itd_portfolio
- **User**: postgres
- **Password**: 12345678

### Demo Users (Seeded in PostgreSQL)

| Name | Email | Password | Role |
|------|-------|----------|------|
| Tibebe Getachew | superadmin@insa.gov.et | admin123 | super_admin |
| Elena Rostova | admin@nexora.io | admin123 | administrator |
| Israel | isru@insa.gov.et | pm123 | project_manager |
| Melaku | mela@insa.gov.et | content123 | content_manager |

## Server Configuration

### Environment File (.env)

```env
# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itd_portfolio
DB_USER=postgres
DB_PASSWORD=12345678

# Server
NODE_ENV=development
PORT=5000

# Security (set these for production)
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here
```

**Location**: `c:\Users\Insa\Desktop\Home\server\.env`

## Database Tables

### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  status VARCHAR(50) DEFAULT 'active',
  custom_permissions TEXT[],
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ... (additional columns)
);
```

### Roles and Permissions

**Roles Available**:
- `super_admin` - Full system access
- `administrator` - Full management access
- `project_manager` - Project and team management
- `content_manager` - Content and blog management
- `viewer` - Read-only access

**Permission Keys**:
- `projects.view` - View projects
- `projects.create` - Create projects
- `projects.edit` - Edit projects
- `projects.delete` - Delete projects
- `projects.publish` - Publish projects
- `users.view` - View users
- `users.manage` - Manage users
- `users.manage_security` - Manage security settings
- `security.audit` - View audit logs
- `settings.manage` - Manage system settings
- `blogs.manage` - Manage blog posts
- `team.manage` - Manage team members
- `categories.manage` - Manage categories
- `technologies.manage` - Manage technologies
- `services.manage` - Manage services
- `testimonials.manage` - Manage testimonials
- `inquiries.manage` - Manage inquiries

## Database Connection Flow

```
Client (React App)
    ↓
API Endpoints (/api/auth/login, etc.)
    ↓
Express Server (port 5000)
    ↓
Database Connection Pool
    ↓
PostgreSQL (port 5432)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users Management
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Projects
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Other Resources
- `/api/categories` - Categories management
- `/api/technologies` - Technologies management
- `/api/services` - Services management
- `/api/team` - Team members management
- `/api/blogs` - Blog posts management
- `/api/inquiries` - Contact inquiries
- `/api/settings` - System settings

## Migration Scripts

### Seed Demo Users
```bash
node seed-postgres.js
```

**Location**: `c:\Users\Insa\Desktop\Home\seed-postgres.js`

This script:
- Connects to PostgreSQL
- Clears existing users
- Creates 4 demo users with correct passwords
- Verifies data insertion

### Check Database Connection
```bash
node check-db.js
```

**Location**: `c:\Users\Insa\Desktop\Home\check-db.js`

This script:
- Tests PostgreSQL connection
- Shows current users count
- Lists all users with their roles

## Security Features

### Authentication
- JWT-based token authentication
- Bcrypt password hashing
- Secure password reset flow

### Authorization
- Role-Based Access Control (RBAC)
- Permission-based resource access
- Custom permission support

### Account Security
- Failed login attempt tracking
- Account lockout after 5 failed attempts
- 15-minute lockout duration
- Account suspension capability
- Two-factor authentication ready (future)

### Audit Logging
- Track all user actions
- Log security events
- Store login/logout history
- Record permission changes

## Production Checklist

- [ ] Change all demo user passwords
- [ ] Update database credentials in .env
- [ ] Set JWT_SECRET to strong random value
- [ ] Enable HTTPS/SSL
- [ ] Configure backup schedule
- [ ] Set up monitoring and alerts
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Test disaster recovery
- [ ] Document admin procedures

## Backup and Recovery

### Backup Database
```bash
pg_dump itd_portfolio > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql itd_portfolio < backup_20260904.sql
```

## Server Status

**Current Status**: ✅ Running
- Port: 5000
- Database: PostgreSQL (Connected)
- Demo Users: 4 users seeded

## Troubleshooting

### Cannot connect to database
1. Verify PostgreSQL is running: `psql -U postgres`
2. Check .env credentials match PostgreSQL setup
3. Verify database `itd_portfolio` exists
4. Check network connectivity to localhost:5432

### Users not seeding
1. Run `node seed-postgres.js` again
2. Verify previous users were cleared
3. Check bcryptjs is installed: `npm list bcryptjs`

### Login fails
1. Verify user exists: `SELECT * FROM users WHERE email='...';`
2. Check password hash: Verify with bcrypt
3. Check user status is 'active'
4. Check account is not locked

## Next Steps

1. **Test Login**: Use demo credentials to verify setup
2. **Create Admin Account**: Change demo passwords
3. **Configure Backups**: Set up automated backups
4. **Enable Monitoring**: Set up error tracking
5. **Deploy to Production**: Follow deployment guide

---

**Configured on**: 2026-09-04
**Last Updated**: 2026-09-04
