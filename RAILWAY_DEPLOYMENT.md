# BrazilFit Railway.app Deployment Guide

## Overview
BrazilFit is deployed as a **monorepo** with:
- **Backend**: Express.js API (Node.js)
- **Frontend**: React + Vite SPA
- **Database**: SQLite (file-based, included in container)

## Prerequisites
- GitHub account with your code repository
- Railway.app account (free tier sufficient)
- Domain name (optional, for custom domain)

## Deployment Instructions

### 1. Push Code to GitHub
```bash
git remote add origin https://github.com/YOUR-USERNAME/brazilfit.git
git branch -M main
git push -u origin main
```

### 2. Create Railway Project
- Go to railway.app
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your `brazilfit` repository
- Wait for auto-build to complete

### 3. Backend Configuration

**Environment Variables:**
```
NODE_ENV=production
PORT=3001
JWT_SECRET=[GENERATE-RANDOM-STRING]
JWT_EXPIRES_IN=7d
DB_PATH=./brazilfit.db
FRONTEND_URL=https://[your-frontend-url].railway.app
ELEVENLABS_API_KEY=sk_3f9ff190d163ca6324c72651b74dd430ebe40375af4695e9
FREESOUND_API_KEY=cx1bOa2Mp6U05qdttnp6Pi6FsXfxiZLYLk9l0WpF
```

**Build & Deploy:**
- Builder: Dockerfile (auto-detected)
- Start Command: `npm run start` (from railway.json)
- Health Check: `/api/health` endpoint (auto-configured)

### 4. Frontend Configuration

**Environment Variables:**
```
VITE_API_URL=https://[your-backend-url].railway.app
VITE_APP_NAME=BrazilFit
VITE_ENVIRONMENT=production
VITE_LOG_LEVEL=error
```

**Build & Deploy:**
- Root Directory: `frontend/`
- Build Command: `npm run build`
- Start Command: `npm run preview`

### 5. Database Management

SQLite database is stored in the container's `/app/brazilfit.db`.

**Important:** Docker containers are ephemeral!
- Use Railway's storage or PostgreSQL addon for persistence
- Or: Set up backups to external storage

**To backup database:**
```bash
# Download from Railway logs/downloads
# Or connect via SSH and copy the file
```

### 6. Monitoring & Logs

Access logs in Railway dashboard:
- **Service** → **Logs** tab
- Real-time streaming logs
- Filter by level (error, warn, info)

### 7. Scaling & High Availability

Railway Free Tier includes:
- ✅ 1 running service
- ✅ 500 hours/month per service
- ✅ Auto-backups (optional)

For production (paid tier):
- Horizontal scaling (multiple replicas)
- Auto-scaling based on load
- PostgreSQL instead of SQLite
- Backup and restore

## Testing Deployment

### Backend Health Check
```bash
curl https://[your-backend].railway.app/api/health
# Should return: {"status":"ok","app":"BrazilFit API","version":"1.0.0"}
```

### Frontend Access
```
https://[your-frontend].railway.app
```

### Test Scenarios
1. Load login page → verify no CSS/JS errors
2. Login with test account → verify API connection
3. Navigate to dashboard → verify responsive design
4. Upload photo → verify file handling
5. Send message → verify real-time polling
6. Check mobile view → test responsive design

## Troubleshooting

### Build Fails
- Check Dockerfile syntax
- Verify both backend and frontend have package.json
- View build logs in Railway dashboard

### App Crashes on Startup
- Check environment variables (typos, missing values)
- Review logs for errors
- Verify database path is writable (`./brazilfit.db`)

### API Not Responding
- Verify `FRONTEND_URL` includes your actual URL
- Check CORS configuration in backend
- Review API logs for errors

### Database Issues
- SQLite doesn't handle concurrent writes well
- For production, migrate to PostgreSQL
- Check database file has write permissions

## Production Checklist

- [ ] JWT_SECRET changed from default
- [ ] FRONTEND_URL points to correct domain
- [ ] All environment variables set
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] SSL/TLS certificate auto-renewed
- [ ] Error tracking enabled (optional: Sentry)
- [ ] Performance monitoring enabled (optional)

## Support & Documentation

- Railway Docs: https://docs.railway.app
- Deployment Monitoring: Railway Dashboard
- Logs: Real-time in web interface
- Support: Railway Discord community

## Next Steps

1. **Custom Domain** (optional)
   - Add domain in Railway → Domains settings
   - Configure DNS at registrar
   
2. **Database Persistence**
   - Consider PostgreSQL addon for production
   - Set up automated backups

3. **Monitoring & Alerts**
   - Set up error notifications
   - Monitor uptime
   - Track performance metrics

4. **Scaling**
   - Monitor CPU/memory usage
   - Scale resources as needed
   - Consider edge deployment

---

**Deployment Date:** 2026-04-28
**Status:** Production Ready ✅
**Version:** 1.0.0
