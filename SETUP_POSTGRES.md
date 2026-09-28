# PostgreSQL Setup Guide for Windows

Since automated installation is complex, here's the manual setup:

## Option 1: Download and Install from Official Website (Recommended)

1. **Download PostgreSQL 16** from: https://www.postgresql.org/download/windows/
2. **Run the installer** and follow these steps:
   - Accept the default installation directory
   - Set superuser password: **12345678** (matches your .env file)
   - Port: **5432** (default)
   - Locale: Leave as default
   - Complete the installation
   - When asked to launch Stack Builder, you can skip it

3. **Verify Installation**:
   ```powershell
   psql --version
   psql -U postgres -h localhost -c "SELECT version();"
   ```

## Option 2: Quick Setup via Command Line

After PostgreSQL is installed, run this to create the database:

```powershell
# Connect to PostgreSQL
psql -U postgres -h localhost

# Then execute in psql:
CREATE DATABASE itd_portfolio;
\c itd_portfolio
\i "C:\Users\Insa\Desktop\Home\server\src\db\schema.sql"
```

## Option 3: Use Pre-made Setup Script

After PostgreSQL is installed, run:

```powershell
cd c:\Users\Insa\Desktop\Home\server
node src/db/seed.js
```

## Verification

1. Open pgAdmin (comes with PostgreSQL installer)
2. Connect to localhost:5432
3. Create database "itd_portfolio"
4. Run the schema.sql to create tables
5. Run seed.js to add demo users

## Environment Variables (.env)

Verify your `.server/.env` has:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itd_portfolio
DB_USER=postgres
DB_PASSWORD=12345678
```

Then restart the Node.js server and it will connect to PostgreSQL!
