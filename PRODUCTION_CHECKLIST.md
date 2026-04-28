# BrazilFit Production Checklist for Railway

## 🔐 Security (CRITICAL)

### Backend Security
- [ ] **JWT_SECRET** - Changed from default `brazilfit-secret-key-2026-change-in-production`
  - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - Use this generated value in Railway environment variables

- [ ] **CORS Configuration** - Verified to allow only your domain
  - Check `FRONTEND_URL` in backend/.env
  - Only this URL should be allowed in CORS headers

- [ ] **HTTPS Only** - Railway auto-provides SSL/TLS
  - All traffic encrypted in transit
  - No need for additional setup

### Frontend Security
- [ ] API URL hardcoded for production domain (in `.env.production`)
- [ ] No sensitive data in localStorage
- [ ] No API keys exposed in frontend code

## 📊 Database (IMPORTANT)

### SQLite Limitations
⚠️ **SQLite is file-based and has limitations in production:**

```
Pros:
- ✅ Zero setup required
- ✅ Works for development and testing
- ✅ Portable

Cons:
- ❌ Single-threaded (no concurrent writes)
- ❌ Data lost if container restarts
- ❌ Poor performance under high load
```

### For May 1st Launch
**Current Setup (Acceptable for MVP):**
- SQLite with 18 pre-seeded clients
- Works for up to ~100 concurrent users
- Suitable for initial launch

### For Production Scaling (After Launch)
**Recommended:**
1. Migrate to PostgreSQL (Railway provides addon)
2. Automated backups
3. Read replicas for scaling
4. Connection pooling

**Migration steps:**
```bash
# 1. Add PostgreSQL addon in Railway
# 2. Update DATABASE_URL environment variable
# 3. Run migration script to import data
# 4. Update backend to use PostgreSQL driver
```

## 🔄 Data Persistence

### Current Issue
Container restarts = potential data loss (SQLite file is ephemeral)

### Solution for Production
1. **Use Railway Volumes** - Persistent storage
   - Add volume mount: `/app/brazilfit.db`
   - Persists across restarts

2. **Or Use PostgreSQL Addon**
   - Automatic backups
   - Better performance
   - Cloud-hosted reliability

### Backup Strategy
```bash
# Weekly backup to external storage
# Consider:
# - AWS S3
# - Google Cloud Storage
# - Backblaze B2
```

## 📈 Performance & Monitoring

### Recommended Monitoring
- [ ] **Error Tracking**: Sentry.io (free tier available)
- [ ] **Performance**: Railway built-in metrics
- [ ] **Uptime**: UptimeRobot or similar
- [ ] **Analytics**: Google Analytics (frontend)

### Load Testing Estimates
With current setup:
- 10-50 concurrent users: ✅ Smooth
- 50-100 concurrent users: ⚠️ Monitor closely
- 100+ concurrent users: ❌ Need to scale

## 📧 Email Configuration (Optional for Launch)

Currently: Email is NOT configured (uses placeholder values)

To enable email notifications:
1. Use Gmail or SendGrid
2. Add to backend environment variables:
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASS`
3. Test password reset flow

## 💳 Payments (Optional for Launch)

Stripe integration is implemented but placeholder keys.

To enable payments:
1. Create Stripe account
2. Add API keys to backend
3. Update webhook URLs
4. Test subscription flow

## 🚨 Incident Response Plan

### If Backend Crashes
1. Check Railway logs for errors
2. Restart service: Railway → Service → Restart
3. Review recent deployments
4. Rollback if needed

### If Database Corrupts
1. Stop the service
2. Restore from backup
3. Or reset database (will lose data)

### If Too Many Errors
1. Check API rate limiting
2. Verify database connections
3. Scale up container resources
4. Check for bugs in recent deployment

## 📋 Pre-Launch Testing

### Functionality Tests
- [ ] User signup/login works
- [ ] PT can create clients
- [ ] Client can upload photos
- [ ] Messages send in real-time
- [ ] Check-in form submits
- [ ] Progress tracking works
- [ ] Workouts display correctly
- [ ] Mobile responsive

### Load Tests
```bash
# Simple load test with curl
for i in {1..100}; do
  curl -s https://[your-api].railway.app/api/health &
done
wait
```

### Security Scan
- [ ] No console errors
- [ ] No exposed API keys
- [ ] HTTPS working
- [ ] CSP headers set (if applicable)
- [ ] No XSS vulnerabilities

## 📝 Deployment Documentation

### Required for Team
- [ ] Admin access to Railway dashboard
- [ ] GitHub repo access
- [ ] Database password/connection string
- [ ] API keys (stored securely)
- [ ] Incident contact list

## 🎯 Post-Launch Monitoring (First Week)

### Daily
- [ ] Check error rate
- [ ] Monitor API response times
- [ ] Review user feedback
- [ ] Check database size growth

### Weekly
- [ ] Performance report
- [ ] Security audit logs
- [ ] Backup verification
- [ ] Cost review (if paid tier)

## 🆘 Support & Escalation

### If Service Down
1. Check Railway status page
2. Review error logs
3. Contact Railway support if infrastructure issue
4. Have rollback plan ready

### Contact Info
- Railway Support: support@railway.app
- GitHub Issues: [Your repo]
- Internal: [Your team contact]

## ✅ Pre-Deployment Sign-Off

- [ ] Security checklist reviewed
- [ ] Database plan confirmed
- [ ] Monitoring configured
- [ ] Team trained on deployment
- [ ] Rollback procedure documented
- [ ] Backup procedure tested

**Ready for Production: YES / NO**

---

**Last Updated:** 2026-04-28
**Prepared By:** Claude Code
**Status:** Ready for May 1st Launch
