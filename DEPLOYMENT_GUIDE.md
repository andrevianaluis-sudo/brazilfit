# BrazilFit Railway Deployment Guide

This guide walks you through deploying BrazilFit to Railway with your PostgreSQL database.

## Prerequisites

1. **Railway Account**: Sign up at https://railway.app
2. **GitHub Account**: Code must be pushed to GitHub
3. **Railway CLI** (optional): For command-line deployments
4. **Environment Variables**: All values from `.env.example`

## Step-by-Step Deployment (Web Dashboard)

### Step 1: Push Code to GitHub

```bash
# Initialize git repo (if not already)
git init
git add .
git commit -m "Initial commit: BrazilFit full stack app"

# Create repo on GitHub and push
git remote add origin https://github.com/yourusername/brazilfit.git
git branch -M main
git push -u origin main
```

**IMPORTANT:** Ensure `.env` is in `.gitignore` and NOT committed.

### Step 2: Create Railway Project

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Click "Deploy from GitHub"
4. Select your `brazilfit` repository
5. Click "Deploy"

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "+ Add"
2. Select "PostgreSQL"
3. Create the database
4. Note the credentials shown:
   - Host
   - Port
   - Username
   - Password
   - Database name

### Step 4: Configure Environment Variables

1. In your Railway project, click "Variables"
2. Add these variables:

```
NODE_ENV=production
PORT=3001
VITE_API_URL=https://YOUR_RAILWAY_DOMAIN.railway.app

DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

JWT_SECRET=your_secure_random_string_min_32_chars
JWT_EXPIRE=24h
REFRESH_TOKEN_EXPIRE=30d

STRIPE_PUBLIC_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key

SENDGRID_API_KEY=SG.your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@brazilfit.com

BCRYPT_ROUNDS=12
SESSION_SECRET=your_secure_random_string_min_32_chars
CORS_ORIGIN=https://YOUR_RAILWAY_DOMAIN.railway.app

LOG_LEVEL=info
```

**How to generate secure strings:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString())) | Select-Object -First 32
```

### Step 5: Deploy Backend

1. In Railway Dashboard, make sure your service is selected
2. Click "View Logs" → scroll down to see build/deploy status
3. Wait for "Build" to complete (should say "Passed")
4. Watch for "Deployment" to say "Healthy"
5. Copy your Railway domain (shown at top of logs)

**If build fails:**
- Check logs for error messages
- Ensure all environment variables are set
- Verify `Dockerfile` exists in root
- Check `backend/package.json` has correct `npm start` command

### Step 6: Run Database Migrations

Once deployment is healthy:

```bash
# Via Railway CLI:
railway run npm run db:migrate

# Via Railway Web Dashboard (if you can't run CLI):
1. Click Service
2. Click "Tools" 
3. Click "Terminal"
4. Run: npm run db:migrate
5. Run: npm run db:seed:production
```

### Step 7: Seed Production Data (First Time Only)

```bash
railway run npm run db:seed:production
```

This creates:
- 1 Trainer account (trainer@brazilfit.com / password123)
- 18 Demo client accounts

### Step 8: Test the Deployment

**In Browser:**
```
https://YOUR_RAILWAY_DOMAIN.railway.app
```

**Test Login:**
- Email: `trainer@brazilfit.com` (or any `client@brazilfit.com`)
- Password: `password123`

**Test API:**
```bash
curl https://YOUR_RAILWAY_DOMAIN.railway.app/api/health
# Should return: {"status":"ok"}
```

### Step 9: Set Custom Domain (Optional)

1. In Railway Dashboard, click your service
2. Go to "Settings" → "Domains"
3. Click "+ Add Domain"
4. Enter your domain (e.g., `brazilfit.com`)
5. Update DNS to point to Railway
6. Wait 5-10 minutes for SSL certificate

## Troubleshooting

### Build Fails with "Cannot find module"

**Solution:**
```bash
# Check dependencies are installed
cd backend && npm install
cd ../frontend && npm install

# Ensure all packages are committed
git add package-lock.json
git commit -m "Add lock files"
git push
```

### Database Connection Error

**Error:** `FATAL: password authentication failed`

**Solution:**
- Verify `DATABASE_URL` format is correct
- Check PostgreSQL service is running (Railway dashboard)
- Try reconnecting the database in Railway
- Run migrations again

### Frontend Shows 404 or Blank Page

**Solution:**
- Verify `VITE_API_URL` points to correct Railway domain
- Check frontend build succeeded (see Logs)
- Restart deployment: Go to "Deployments" → right-click latest → "Redeploy"

### API Endpoints Return 401 Unauthorized

**Solution:**
- Verify `JWT_SECRET` is set in environment variables
- Ensure tokens are saved in localStorage after login
- Check cookies are being sent with requests (check browser DevTools)
- Verify `CORS_ORIGIN` matches your domain

### High Database Connection Errors

**Solution:**
- Reduce connection pool size in `backend/src/db/index.js`
- Add connection pooling: `max: 10, idleTimeoutMillis: 30000`
- Monitor Railway PostgreSQL dashboard for connections

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] `.env` file is in `.gitignore`
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] All environment variables configured
- [ ] Build completed successfully
- [ ] Deployment shows "Healthy"
- [ ] Database migrations ran successfully
- [ ] Production data seeded
- [ ] Login works with test account
- [ ] API endpoints responding
- [ ] Frontend loads without errors
- [ ] Can book sessions and complete workouts
- [ ] Stripe checkout works (test mode)
- [ ] HTTPS enabled and working

## Continuous Deployment

BrazilFit is configured for automatic deployment:

1. Push changes to `main` branch on GitHub
2. Railway automatically detects changes
3. Build and deployment start automatically
4. Wait for "Deployment" to show "Healthy"

To disable auto-deploy:
- Go to Project Settings
- Uncheck "Redeploy on push"

## Rollback a Deployment

If something breaks after deployment:

1. Go to "Deployments" in Railway
2. Find the previous working deployment
3. Right-click → "Redeploy"
4. Or click the timestamp → "Redeploy this version"

This rolls back to the previous version (takes ~2 minutes).

## Monitoring & Logs

### View Live Logs
```bash
railway logs -f
```

### Common Log Entries
- `INFO - Server running on port 3001` = Backend started
- `ERROR - Connection refused` = Database not accessible
- `ERROR - EADDRINUSE` = Port already in use

### Performance Monitoring

In Railway Dashboard:
- Click Service
- Go to "Metrics"
- Monitor: CPU, Memory, Request count, Response times

## Adding a New Feature Post-Deployment

1. Create feature branch locally
2. Make changes and test locally
3. Push to GitHub
4. Railway auto-deploys
5. If needed, run migrations:
   ```bash
   railway run npm run db:migrate
   ```

## Backup & Recovery

### Automatic Backups (Railway Pro)

Railway automatically backs up PostgreSQL. To restore:

1. Go to PostgreSQL plugin in Railway
2. Click "Backups"
3. Select a backup
4. Click "Restore"

### Manual Backup

```bash
# Export database
railway run pg_dump $DATABASE_URL > brazilfit_backup.sql

# Import database
railway run psql $DATABASE_URL < brazilfit_backup.sql
```

## Performance Tips

1. **Enable CDN** (Railway Pro feature)
2. **Use image optimization** - serve WebP with JPEG fallback
3. **Implement caching** - 5-minute API response cache
4. **Code splitting** - split React bundle by route
5. **Database indexing** - index frequently queried columns

## Cost Optimization

**Railway Pricing (as of 2026):**
- Free tier: $5/month credit
- Pay-as-you-go: ~$0.51/hour for web service + database

**Reducing costs:**
- Use Railway's auto-scaling
- Optimize database queries
- Implement aggressive caching
- Monitor resource usage regularly

## Support

- **Railway Status**: https://status.railway.app
- **Railway Docs**: https://docs.railway.app
- **BrazilFit Issues**: Contact andre.vianaluis@gmail.com

---

## Deployment Summary

**Deployed at:** `https://YOUR_RAILWAY_DOMAIN.railway.app`
**Database:** PostgreSQL on Railway
**Environment:** Production
**Auto-deployment:** Enabled (via GitHub webhook)
**Estimated deployment time:** 5-10 minutes
