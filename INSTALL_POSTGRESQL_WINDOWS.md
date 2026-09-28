# PostgreSQL Installation for Windows

## Step 1: Download PostgreSQL Installer

1. Go to [PostgreSQL Official Downloads](https://www.postgresql.org/download/windows/)
2. Click on the **Windows x86-64** link (for 64-bit Windows)
3. This will download the PostgreSQL installer (`.exe` file)

## Step 2: Run the Installer

1. Run the downloaded `.exe` file
2. Follow the installation wizard:
   - **Installation Directory**: Keep default or choose your preferred location
   - **Select Components**: 
     - ✅ PostgreSQL Server (REQUIRED)
     - ✅ pgAdmin (optional, for GUI management)
     - ✅ Command Line Tools (REQUIRED)
     - ✅ Development Libraries (optional)
   - **Data Directory**: Keep default or choose your location
   - **Database Superuser Password**: 
     - **IMPORTANT**: Set password to `postgres` (or remember what you set)
     - This will be used in your `.env` file

3. **Port**: Default is `5432` - **KEEP THIS** (matches your `.env`)
4. **Locale**: Keep default
5. Complete the installation

## Step 3: Verify Installation

Open PowerShell and run:

```powershell
psql --version
```

You should see output like:
```
psql (PostgreSQL) 15.0
```

## Step 4: Test Connection

```powershell
psql -U postgres -h localhost
```

You should see the PostgreSQL prompt:
```
postgres=#
```

Type `\q` to exit.

## Step 5: Update .env File

Edit `server/.env` with your PostgreSQL settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=itd_portfolio
DB_USER=postgres
DB_PASSWORD=postgres
SERVER_PORT=5000
NODE_ENV=development
```

⚠️ **If you set a different password during installation, replace `postgres` with your password**

## Step 6: Run Migration

Open PowerShell and navigate to project:

```powershell
cd c:\Users\Insa\Desktop\Home
node server/src/db/migrate.js
```

Expected output:
```
🔄 Starting data migration from JSON to PostgreSQL...
📋 Initializing database schema...
👥 Migrating X users...
... (more tables)
✅ Migration completed successfully!
```

## Step 7: Restart Development Server

Stop the current `npm run dev` and restart:

```powershell
npm run dev
```

You should now see:
```
✅ Database schema initialized successfully
🚀 REST API Server running on port 5000
```

## Troubleshooting

### Issue: "psql is not recognized"
**Solution**: PostgreSQL is not in your PATH. Add it:
1. Open Environment Variables (search in Windows)
2. Add to PATH: `C:\Program Files\PostgreSQL\15\bin` (adjust version number if needed)
3. Restart PowerShell

### Issue: "password authentication failed"
**Solution**: Your `.env` password doesn't match PostgreSQL password
- During installation, what password did you set? Use that in `.env`
- Or reset PostgreSQL password (see below)

### Issue: "could not connect to server"
**Solution**: PostgreSQL service might not be running
```powershell
# Check if service is running (as Admin)
Get-Service postgresql-x64-15  # adjust version number

# Start the service if stopped
Start-Service postgresql-x64-15
```

### Issue: "database does not exist"
**Solution**: Migration will create it automatically, but if not:
```powershell
createdb -U postgres itd_portfolio
```

## Reset PostgreSQL Password (if needed)

1. Stop PostgreSQL service (as Administrator):
```powershell
Stop-Service postgresql-x64-15
```

2. Start in recovery mode (complex process)
   OR
3. **Easiest**: Uninstall and reinstall PostgreSQL with a known password

## Additional Commands

### Start PostgreSQL Service
```powershell
Start-Service postgresql-x64-15
```

### Stop PostgreSQL Service
```powershell
Stop-Service postgresql-x64-15
```

### Check Service Status
```powershell
Get-Service postgresql-x64-15
```

### Backup Database
```powershell
pg_dump -U postgres itd_portfolio > backup.sql
```

### Restore Database
```powershell
psql -U postgres itd_portfolio < backup.sql
```

---

## Next Steps Once PostgreSQL is Running

1. ✅ PostgreSQL installed and running
2. ✅ `.env` file updated with credentials
3. ✅ Run: `node server/src/db/migrate.js`
4. ✅ Restart: `npm run dev`
5. ✅ Access: http://localhost:3000

**If you need help at any step, provide the error message you're seeing.**
