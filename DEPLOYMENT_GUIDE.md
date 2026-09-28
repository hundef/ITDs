# ITD Staff Portal Deployment Guide

## Production Deployment Checklist

### 1. HTTPS/SSL Configuration

#### Option A: Self-Signed Certificate (Development/Testing)
```bash
# Create certs directory
mkdir -p server/certs

# Generate self-signed certificate (valid for 365 days)
openssl req -x509 -newkey rsa:4096 -keyout server/certs/key.pem -out server/certs/cert.pem -days 365 -nodes \
  -subj "/C=ET/ST=Addis Ababa/L=Addis Ababa/O=ITD/CN=localhost"
```

#### Option B: Let's Encrypt (Production/Live)
```bash
# Using Certbot
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to server/certs/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem server/certs/key.pem
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem server/certs/cert.pem
```

#### Option C: Cloudflare SSL (Recommended)
- Use Cloudflare's free SSL/TLS encryption
- Set up origin certificate for secure connection between Cloudflare and origin
- Enable "Full (strict)" SSL mode in Cloudflare dashboard

### 2. Production Environment Variables

Create `.env.production`:
```env
NODE_ENV=production
PORT=5000
HTTPS_PORT=5443

# Database
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=itd_portfolio
DB_USER=postgres
DB_PASSWORD=your-secure-password

# SSL Certificates
SSL_KEY_PATH=./certs/key.pem
SSL_CERT_PATH=./certs/cert.pem

# Security
JWT_SECRET=your-very-long-random-secret-key-here
SESSION_SECRET=your-another-random-secret-key-here
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn-if-using-error-tracking
```

### 3. Security Headers & CORS

The server already includes security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Strict-Transport-Security (HSTS) when HTTPS is enabled

### 4. Database Setup for Production

#### Migrate from JSON to PostgreSQL:
1. Ensure PostgreSQL is running on production server
2. Run migrations: `node server/src/db/schema.sql`
3. Seed demo users (optional)
4. Verify connection pooling is configured

### 5. Rate Limiting & DDoS Protection

Current implementation includes:
- Failed login attempt tracking (5 attempts → 15 minute lockout)
- Account suspension after repeated violations
- Security event logging

For production, add:
- Cloudflare rate limiting
- AWS WAF or similar
- IP-based rate limiting via reverse proxy

### 6. Monitoring & Logging

Key endpoints to monitor:
- `GET /api/health` - Health check
- `GET /api/uploads-debug` - Upload directory status
- Security logs in database (audit_logs table)

### 7. Backup & Disaster Recovery

```bash
# Daily database backup
0 2 * * * pg_dump itd_portfolio > /backup/itd_portfolio_$(date +\%Y\%m\%d).sql

# Backup to S3
0 2 * * * aws s3 cp /backup/itd_portfolio_$(date +\%Y\%m\%d).sql s3://your-bucket/backups/

# Restore from backup
psql itd_portfolio < /backup/itd_portfolio_20260904.sql
```

### 8. Deployment Steps

1. **Prepare Server:**
   ```bash
   git clone <repository> /var/www/itd-portal
   cd /var/www/itd-portal
   npm install
   ```

2. **Build Frontend:**
   ```bash
   npm run build
   ```

3. **Set Environment:**
   ```bash
   cp .env.production .env
   ```

4. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start server/src/index.js --name "itd-portal"
   pm2 save
   pm2 startup
   ```

5. **Set Up Reverse Proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com www.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-Frame-Options "SAMEORIGIN" always;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

6. **Verify Deployment:**
   ```bash
   curl https://yourdomain.com/api/health
   # Should return: {"status":"online","secure":true,...}
   ```

### 9. Admin Credentials (Change on First Login)

**Demo Users** (for initial setup):
- **Tibebe Getachew** (superadmin@insa.gov.et / admin123) - Super Admin
- **Elena Rostova** (admin@nexora.io / admin123) - Administrator  
- **Israel** (isru@insa.gov.et / pm123) - Project Manager
- **Melaku** (mela@insa.gov.et / content123) - Content Manager

⚠️ **IMPORTANT**: Change all passwords on first production login!

### 10. Post-Deployment Monitoring

Monitor these metrics:
- CPU usage < 70%
- Memory usage < 80%
- Database query response time < 100ms
- API response time < 500ms
- Error rate < 1%

Use tools like:
- New Relic
- DataDog
- Sentry (error tracking)
- UptimeRobot (status monitoring)

---

## Support

For issues or questions, contact the development team.
