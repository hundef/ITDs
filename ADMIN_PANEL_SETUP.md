# ITD Admin Panel - Complete Setup Guide

## Overview

The admin panel is a comprehensive management system for the ITD public website, built with:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Authentication**: JWT + Role-Based Access Control

## Access Points

### Public Website
- **URL**: `http://localhost:5000/`
- **Features**: Homepage, About, Services, Projects, Team, Blog, Contact

### Admin Panel
- **URL**: `http://localhost:5000/admin`
- **Login**: `http://localhost:5000/admin/login`
- **Authentication Required**: Yes

## Admin Features

### Dashboard (`/admin`)
Overview of:
- Recent projects
- User statistics
- System health
- Quick actions

### Projects Management (`/admin/projects`)
- ✅ View all projects
- ✅ Create new projects
- ✅ Edit existing projects (including editable start_date/completion_date)
- ✅ Delete projects
- ✅ Publish/unpublish
- ✅ Categorize by type

### Content Management
- **Categories** (`/admin/categories`) - Manage project categories
- **Technologies** (`/admin/technologies`) - Manage tech stack
- **Services** (`/admin/services`) - Manage service offerings
- **Team Members** (`/admin/team`) - Manage staff
- **Testimonials** (`/admin/testimonials`) - Client testimonials
- **Blog Posts** (`/admin/blogs`) - Blog content
- **Inquiries** (`/admin/inquiries`) - Contact form submissions

### System Management
- **Users & Roles** (`/admin/users`) - User account management
- **Departments** (`/admin/departments`) - Department management
- **Settings** (`/admin/settings`) - Website settings (company name, tagline, etc.)
- **Audit Logs** (`/admin/audit-logs`) - Activity tracking
- **Profile** (`/admin/profile`) - User profile settings

## User Roles

### 1. Super Admin
**Email**: superadmin@insa.gov.et  
**Password**: admin123  
**Permissions**: Full system access, can manage all resources and users

### 2. Administrator
**Email**: admin@nexora.io  
**Password**: admin123  
**Permissions**: Full content management, security audit access

### 3. Project Manager
**Email**: isru@insa.gov.et  
**Password**: pm123  
**Permissions**: Project management, team coordination

### 4. Content Manager
**Email**: mela@insa.gov.et  
**Password**: content123  
**Permissions**: Blog, testimonials, inquiries (NO project access)

## Database Schema

### Users Table
Stores admin user accounts with:
- Authentication credentials
- Role and permissions
- Account status (active/locked/suspended)
- Login history
- Security settings

### Projects Table
Stores project information:
- Title, description, overview
- Problem, solution
- Technologies used
- Start date and completion date (editable)
- Status (draft, published)
- Featured flag
- Cover image

### Other Tables
- categories, technologies, services, team_members
- testimonials, blog_posts, inquiries
- departments, audit_logs, security_logs
- settings, security_policies

## API Architecture

```
┌─────────────────┐
│   React App     │
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│ Express Server  │
│  Port 5000      │
└────────┬────────┘
         │ SQL Queries
         ▼
┌─────────────────┐
│   PostgreSQL    │
│  Port 5432      │
└─────────────────┘
```

## Key Components

### Authentication Flow
1. User enters email/password on login page
2. Server validates credentials against PostgreSQL users table
3. Server generates JWT token if valid
4. Token stored in localStorage (browser)
5. Token sent with each API request (Authorization header)
6. Server validates token before processing request

### Permission System
```javascript
// Example permission check
if (hasPermission('projects.edit')) {
  // Show edit button
}

// Permission structure
super_admin: ALL permissions
administrator: All except user management
project_manager: Projects, team
content_manager: Blog, testimonials, inquiries only
```

### Project Date Handling
- **Start Date**: Editable date field (no time component)
- **Completion Date**: Editable date field (no time component)
- **Display Format**: "Jan 15, 2025" (no timestamp)
- **Case Study**: Dates shown without timestamps

## Important Features

### ✅ Implemented
- [x] Login page with email/password
- [x] Admin dashboard
- [x] Project CRUD with date editing
- [x] User management (4 demo users)
- [x] Role-based access control
- [x] Audit logging
- [x] Account lockout protection
- [x] PostgreSQL integration
- [x] JWT authentication
- [x] Responsive design

### 🔄 Ready for Expansion
- [ ] Two-factor authentication
- [ ] Email notifications
- [ ] API rate limiting
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Content scheduling

## Login Instructions

1. **Navigate to**: `http://localhost:5000/admin/login`
2. **Select a demo user**:
   - Super Admin: superadmin@insa.gov.et / admin123
   - Administrator: admin@nexora.io / admin123
   - Project Manager: isru@insa.gov.et / pm123
   - Content Manager: mela@insa.gov.et / content123
3. **Click "Sign In"**
4. **Access dashboard** at `/admin`

## File Structure

```
src/
├── pages/
│   ├── admin/
│   │   ├── AdminLoginPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AdminProjectsPage.tsx
│   │   ├── AdminProjectEditPage.tsx
│   │   ├── AdminUsersPage.tsx
│   │   ├── AdminSettingsPage.tsx
│   │   └── ... (other admin pages)
│   └── public/
│       ├── HomePage.tsx
│       ├── AboutPage.tsx
│       ├── ProjectsPage.tsx
│       └── ... (public pages)
├── components/
│   ├── admin/
│   │   └── AdminLayout.tsx
│   └── common/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── ... (shared components)
├── context/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── SettingsContext.tsx
├── services/
│   └── api.ts
└── App.tsx

server/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── users.js
│   │   ├── blogs.js
│   │   └── ... (other routes)
│   ├── db/
│   │   ├── db.js
│   │   ├── schema.sql
│   │   └── seed.js
│   └── index.js
├── data/
│   └── database.json (fallback)
└── .env
```

## Deployment Checklist

Before going live:

- [ ] Change all demo user passwords
- [ ] Update database credentials
- [ ] Set strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure backup schedule
- [ ] Set up monitoring
- [ ] Test all user roles
- [ ] Verify audit logging
- [ ] Configure email notifications
- [ ] Set up error tracking (Sentry)

## Support & Troubleshooting

### Common Issues

**Black screen on login page**
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private window
- Check browser console for errors

**Cannot connect to database**
- Verify PostgreSQL is running
- Check .env credentials
- Run: `node check-db.js`

**User cannot login**
- Verify email exists: `SELECT * FROM users WHERE email='...';`
- Check account is active: `status = 'active'`
- Verify not locked: `locked_until IS NULL`

**Permissions issues**
- Check user role: `SELECT role FROM users WHERE email='...';`
- Verify permission mapping in permissions.ts
- Check custom_permissions field

## Next Steps

1. **Access the admin panel** at `http://localhost:5000/admin/login`
2. **Log in with demo credentials**
3. **Explore the dashboard**
4. **Create/edit some content**
5. **Invite team members** to use their roles
6. **Set up production deployment**

---

**Admin Panel Ready**: ✅ Yes  
**Database**: ✅ PostgreSQL (4 demo users)  
**Authentication**: ✅ JWT + RBAC  
**Public Website**: ✅ Integrated  

For technical questions, refer to DATABASE_CONFIGURATION.md and DEPLOYMENT_GUIDE.md
