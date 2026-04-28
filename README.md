# BrazilFit - PT Management & Training App

**BrazilFit** is a full-stack web application for personal trainers and clients to manage training sessions, track progress, and build fitness communities. Built with React (frontend) and Express (backend), styled with Tailwind CSS inspired by Nike Training Club.

## Features

### For Clients
- **Session Management**: Book, track, and complete training sessions
- **Progress Tracking**: Photo comparisons, measurement history, activity rings
- **Workout Player**: Full-featured workout execution with rest timers
- **Achievements & Challenges**: Community challenges, badges, and leaderboards
- **Check-ins**: Weekly health check-ins (energy, mood, sleep, nutrition)
- **Messages**: In-app messaging with PT
- **Pro Subscription**: Advanced analytics, nutrition tracking, virtual sessions

### For Trainers
- **Client Management**: View all clients, schedules, and progress
- **Session Scheduling**: Manage blocks and session assignments
- **Analytics Dashboard**: Revenue, retention, attendance metrics
- **Training Blocks**: Periodized program planning and management
- **Media Manager**: Upload and manage workout videos and images

## Tech Stack

- **Frontend**: React 18 + React Router + Tailwind CSS + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT with refresh tokens
- **Payment**: Stripe for Pro subscriptions
- **Deployment**: Railway

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (for production)
- npm or yarn
- Stripe account (for Pro subscription testing)

### Local Development Setup

#### 1. Clone the repository
```bash
git clone <repo-url>
cd brazilfit
```

#### 2. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` with your local values:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/brazilfit
NODE_ENV=development
PORT=3001
JWT_SECRET=your_secure_secret_min_32_characters
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
SENDGRID_API_KEY=SG.xxx (optional for local)
```

#### 3. Install dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

#### 4. Setup database

**First time setup:**
```bash
cd backend
npm run db:init
npm run db:seed  # Seed with 18 demo clients and PT account
```

**Run migrations:**
```bash
npm run db:migrate
```

#### 5. Start development servers

Backend:
```bash
cd backend
npm run dev    # Runs on http://localhost:3001
```

Frontend (new terminal):
```bash
cd frontend
npm run dev    # Runs on http://localhost:5173
```

Visit `http://localhost:5173`

### Test Accounts

**PT Account (for testing trainer features):**
- Email: `trainer@brazilfit.com`
- Password: `password123`

**Client Accounts (18 demo clients available):**
- Email: `client1@brazilfit.com` → `client18@brazilfit.com`
- Password: All use `password123`

## Project Structure

```
brazilfit/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   │   ├── client/        # Client-facing pages
│   │   │   └── pt/            # Trainer pages
│   │   ├── context/            # Auth context
│   │   ├── utils/              # API client, date utils
│   │   └── App.jsx             # Main app component
│   └── package.json
│
├── backend/                    # Express backend
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/        # Request handlers
│   │   ├── models/            # Database models
│   │   ├── middleware/        # Auth, error handling
│   │   ├── db/                # Database setup
│   │   └── app.js             # Express app
│   └── package.json
│
├── .env.example               # Environment variables template
├── Dockerfile                 # Container configuration
├── railway.json              # Railway deployment config
└── README.md                 # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout

### Client Routes
- `GET /api/client/profile` - Get client profile
- `GET /api/sessions/client/:clientId` - Get client's sessions
- `GET /api/progress/photos` - Get progress photos
- `GET /api/progress/measurements` - Get measurement history

### Trainer Routes
- `GET /api/pt/clients` - List all clients
- `GET /api/pt/analytics` - Get analytics data
- `POST /api/pt/sessions` - Create session
- `GET /api/pt/notifications` - Get notifications

### Pro Features
- `POST /api/stripe/create-checkout` - Create Stripe checkout
- `GET /api/pro/features` - Check Pro status

## Deployment to Railway

### Prerequisites
- Railway account (https://railway.app)
- GitHub repository linked to Railway
- Environment variables configured

### Step-by-Step Deployment

#### 1. Create Railway Project
```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Create new project
railway init
```

#### 2. Link Database
Railway will automatically detect PostgreSQL requirements:
```bash
# Add PostgreSQL plugin in Railway Dashboard
```

#### 3. Configure Environment Variables
In Railway Dashboard:
1. Go to Variables
2. Add all variables from `.env.example`
3. Ensure `NODE_ENV=production`

#### 4. Deploy Frontend
```bash
# Railway auto-builds from Dockerfile
# Frontend is built and served with backend
```

#### 5. Set Custom Domain (Optional)
```bash
# In Railway Dashboard:
# 1. Go to your service
# 2. Click "View Logs" → "Deployments"
# 3. Add custom domain (e.g., brazilfit.railway.app)
```

#### 6. Run Database Migrations
```bash
# After first deployment, run:
railway run npm run db:migrate
```

#### 7. Seed Production Data (First Time)
```bash
railway run npm run db:seed:production
```

### Manual Deployment Commands
```bash
# Deploy with Railway CLI
railway up

# Check deployment status
railway status

# View logs
railway logs
```

### Common Issues

**Database Connection Error:**
- Verify `DATABASE_URL` in Railway variables
- Check PostgreSQL service is running
- Run `railway run npm run db:migrate`

**Frontend Not Building:**
- Check `frontend/package.json` has all dependencies
- Verify build command: `npm run build`
- Check Dockerfile paths are correct

**Environment Variables Not Loading:**
- Verify variables are added in Railway Dashboard
- Restart deployment after adding variables
- Check `.env` file is NOT committed (should be in .gitignore)

## Development

### Adding Features
1. Create feature branch: `git checkout -b feature/feature-name`
2. Develop and test locally
3. Create pull request for review
4. Deploy to staging (if applicable)
5. Merge to main and deploy to production

### Database Migrations
```bash
# Create new migration
npm run db:create-migration create_users_table

# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback
```

### Testing

Backend:
```bash
cd backend
npm run test
```

Frontend:
```bash
cd frontend
npm run test
```

## Security Checklist

Before production deployment:
- [ ] All API endpoints require authentication (JWT)
- [ ] Passwords hashed with bcrypt (cost 12)
- [ ] Rate limiting enabled (100 req/min per IP)
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced in production
- [ ] Secure headers configured
- [ ] File uploads validated and scanned
- [ ] Sensitive data logged securely
- [ ] CORS properly configured
- [ ] Database backups automated
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging enabled

## Performance Targets

- Page load time: < 1 second (4G)
- First paint: < 500ms
- Largest contentful paint: < 2 seconds
- API response time: < 200ms
- Bundle size: < 400KB gzipped (frontend)

## Monitoring & Analytics

### Application Monitoring
- Railway built-in metrics dashboard
- Error tracking (optional: Sentry integration)
- Performance monitoring (optional: New Relic)

### Business Analytics
- Session completion rates
- Client retention metrics
- Revenue tracking (via Stripe)
- User engagement (in-app events)

## Support & Documentation

- **Help Center**: In-app `/help` page with FAQ
- **API Documentation**: See `backend/API.md`
- **Email**: support@brazilfit.com (configure in backend)

## License

Proprietary - All rights reserved

## Contact

**Andre Viana**
Email: andre.vianaluis@gmail.com
