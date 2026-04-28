# BrazilFit Railway Deployment - 30 Minute Quick Start

## ⏱️ Timeline: ~30 minutes to live

### STEP 1: Railway Account Setup (5 min)
```
1. Go to railway.app
2. Click "Sign up" 
3. Sign in with GitHub (easiest)
4. Authorize Railway to access your GitHub
```

### STEP 2: Create Project (2 min)
```
1. In Railway dashboard: "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: andrevianaluis-sudo/brazilfit
4. Click "Deploy"
⏳ Wait for build to complete (~5-10 min)
```

### STEP 3: Get Frontend URL (2 min)
```
After build completes:
1. Click your project
2. Look for two services in the list
3. Note the "Public URL" for frontend service
   Example: https://brazilfit-frontend-prod-xyz.railway.app
```

### STEP 4: Get Backend URL (1 min)
```
1. Click backend service
2. Copy the "Public URL"
   Example: https://brazilfit-api-prod-xyz.railway.app
```

### STEP 5: Set Backend Variables (5 min)
```
Backend Service → Variables tab:

NODE_ENV = production
PORT = 3001
JWT_SECRET = [GENERATE THIS: copy output of command below]
JWT_EXPIRES_IN = 7d
DB_PATH = ./brazilfit.db
FRONTEND_URL = [paste your FRONTEND URL from Step 3]

# Already in .env (optional to add):
ELEVENLABS_API_KEY = sk_3f9ff190d163ca6324c72651b74dd430ebe40375af4695e9
FREESOUND_API_KEY = cx1bOa2Mp6U05qdttnp6Pi6FsXfxiZLYLk9l0WpF
```

**Generate JWT_SECRET:**
Run this in your terminal and copy the output:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### STEP 6: Set Frontend Variables (3 min)
```
Frontend Service → Variables tab:

VITE_API_URL = [paste your BACKEND URL from Step 4]
VITE_APP_NAME = BrazilFit
VITE_ENVIRONMENT = production
VITE_LOG_LEVEL = error
```

### STEP 7: Trigger Redeploy (5 min)
```
1. Go to Deployments tab
2. Click "Redeploy latest" on both services
3. Wait for "Running" status (green) on both
```

### STEP 8: Test It Works! (2 min)
```
1. Open your FRONTEND URL in browser
   https://[your-frontend-url].railway.app

2. You should see: BrazilFit login page

3. Test login with:
   Username: pt
   Password: password

4. If dashboard loads = SUCCESS! ✅
```

---

## 📋 Checklist

- [ ] GitHub repo created: https://github.com/andrevianaluis-sudo/brazilfit.git ✅
- [ ] Code pushed to main branch ✅
- [ ] Railway account created
- [ ] Project created from GitHub
- [ ] Backend build complete
- [ ] Frontend build complete
- [ ] Backend variables set (with JWT_SECRET!)
- [ ] Frontend variables set (with Backend URL!)
- [ ] Both services redeployed
- [ ] Both services showing "Running"
- [ ] Frontend URL accessible in browser
- [ ] Login page loads
- [ ] Can login with pt/password
- [ ] Dashboard displays correctly

---

## 🔍 Testing Checklist

After deployment, verify:

### Backend
```bash
curl https://[your-backend-url].railway.app/api/health

Expected response:
{"status":"ok","app":"BrazilFit API","version":"1.0.0"}
```

### Frontend
```
Open in browser:
https://[your-frontend-url].railway.app

Look for:
- BrazilFit logo and title
- Login form
- No 404 errors
- No red console errors
```

### Functionality
- [ ] Login works (pt/password)
- [ ] Dashboard loads
- [ ] Sidebar navigation works
- [ ] Can navigate to different pages
- [ ] No API errors in Network tab

---

## ❌ If Something Breaks

### Error: "Service won't start"
1. Check Logs tab in Railway
2. Look for error messages
3. Verify environment variables
4. Check `NODE_ENV=production`

### Error: "Cannot reach API"
1. Copy Backend URL into VITE_API_URL
2. Verify it doesn't have trailing slash
3. Check Backend service is "Running"
4. Wait 2-3 minutes for DNS propagation

### Error: "Database error"
1. Database initializes on first run
2. Wait 30 seconds and refresh
3. Check logs for errors

### Error: "Build failed"
1. Check build logs
2. Verify Dockerfile exists at project root
3. Try redeploying
4. Check GitHub has all files pushed

---

## ✅ DONE!

You now have BrazilFit running 24/7 on Railway!

### Next Steps:
1. Share frontend URL with users
2. Monitor logs daily for first week
3. Set up custom domain (optional)
4. Configure backups (important!)
5. Plan scaling strategy

### Monitor Dashboard:
- Railway → Your Project → Logs
- Watch for errors
- Check API response times
- Monitor resource usage

---

## Support
- Railway Docs: https://docs.railway.app
- GitHub Issues: Fix issues and push
- Logs: Real-time in Railway dashboard
- Help: Railway Discord community

---

**Status:** Ready to deploy ✅
**Deployment Time:** ~30 minutes
**Live Time:** Immediately after deployment
