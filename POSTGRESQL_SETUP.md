# PostgreSQL Setup Guide for ITD Portfolio CMS

## Prerequisites

You need to have PostgreSQL installed and running on your system.

### Installation Options

#### Option 1: Install PostgreSQL via Windows Installer
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. **Remember the password** you set for the `postgres` user
4. Complete the installation

#### Option 2: Install PostgreSQL via Homebrew (macOS)
```bash
brew install postgresql
brew services start postgresql
```

#### Option 3: Docker (All Platforms)
```bash
docker run --name itd-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=itd_portfolio \
  -p 5432:5432 \
  -d postgres:15
```

## Configuration

### 1. Update Database Credentials

Edit `server/.env` with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itd_portfolio
DB_USER=postgres
DB_PASSWORD=postgres
```

### 2. Verify PostgreSQL is Running

```bash
# Windows (from Command Prompt or PowerShell)
psql -U postgres -h localhost

# macOS/Linux
psql -U postgres -h localhost
```

You should see the PostgreSQL prompt: `postgres=#`

Type `\q` to exit.

### 3. Create Database (Optional - Migration Script will create it)

```bash
createdb -U postgres itd_portfolio
```

## Running Migration

### Step 1: Navigate to Project
```bash
cd c:\Users\Insa\Desktop\Home
```

### Step 2: Run Migration Script
```bash
node server/src/db/migrate.js
```

This will:
1. Connect to PostgreSQL
2. Create all tables from schema.sql
3. Migrate all data from JSON to PostgreSQL
4. Display migration progress

### Expected Output
```
🔄 Starting data migration from JSON to PostgreSQL...

📋 Initializing database schema...
👥 Migrating X users...
📁 Migrating X project categories...
🔧 Migrating X technologies...
📈 Migrating X projects...
... (more tables)

✅ Migration completed successfully!
📊 All data has been migrated from JSON to PostgreSQL.
```

## Running the Server

After migration, start the development server:

```bash
npm run dev
```

The server should connect to PostgreSQL automatically and output:
```
✅ Database schema initialized successfully
🚀 REST API Server running on port 5000
```

## Troubleshooting

### Error: Connection refused
- Check if PostgreSQL is running
- Verify credentials in `.env`
- Ensure PostgreSQL is listening on port 5432

### Error: Database does not exist
- The migration script creates the database automatically
- Or manually run: `createdb -U postgres itd_portfolio`

### Error: Permission denied
- Check `.env` credentials match your PostgreSQL setup
- Ensure the `postgres` user has proper permissions

### To Reset Everything
```bash
# Drop database (delete all data)
dropdb -U postgres itd_portfolio

# Run migration again to start fresh
node server/src/db/migrate.js
```

## Backup & Restore

### Backup PostgreSQL Database
```bash
pg_dump -U postgres itd_portfolio > backup.sql
```

### Restore from Backup
```bash
psql -U postgres itd_portfolio < backup.sql
```

## Next Steps

1. ✅ Install PostgreSQL
2. ✅ Update `.env` with credentials
3. ✅ Run migration script: `node server/src/db/migrate.js`
4. ✅ Start development server: `npm run dev`
5. ✅ Access application at http://localhost:3000

---

Need help? Check the logs for detailed error messages.
