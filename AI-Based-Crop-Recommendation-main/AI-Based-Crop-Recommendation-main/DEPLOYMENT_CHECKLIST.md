# Pre-Deployment Checklist

## Before Deploying to Production

Use this checklist to ensure everything is ready for deployment.

### ✅ Code Quality

- [ ] All code has been reviewed
- [ ] No console.log() statements left in production code
- [ ] No hardcoded secrets or credentials
- [ ] TypeScript/JavaScript has no type errors
- [ ] Python code passes linting: `pylint backend/*.py`
- [ ] Backend tests pass: `pytest` (if available)
- [ ] Frontend tests pass: `npm test` (if available)

### ✅ Backend Preparation

- [ ] ML model has been trained: `python train_model.py`
- [ ] `crop_model.pkl` exists in backend directory
- [ ] `crop_model.pkl` is committed to git repository
- [ ] `.env.example` file is up to date
- [ ] `requirements.txt` is up to date with all dependencies
- [ ] Database schema is correct: `schema.sql`
- [ ] All endpoints tested locally with various inputs
- [ ] Error handling is implemented for edge cases
- [ ] CORS configuration is set for production domains
- [ ] Health check endpoint returns 200 status

### ✅ Frontend Preparation

- [ ] `.env.example` file is up to date
- [ ] `VITE_API_BASE_URL` works with production backend
- [ ] Build completes without warnings: `npm run build`
- [ ] No console errors in browser dev tools
- [ ] All pages render correctly
- [ ] Forms submit successfully
- [ ] Responsive design tested on mobile/tablet
- [ ] Links and navigation work correctly

### ✅ Database Setup

- [ ] Database is created on production server
- [ ] PostgreSQL version is 12 or higher
- [ ] Database credentials are secure
- [ ] Firewall allows connections from backend server
- [ ] Backup strategy is planned
- [ ] Schema migration script is ready

### ✅ Environment Configuration

- [ ] Frontend environment variables are set in Vercel:
  - [ ] `VITE_API_BASE_URL`
- [ ] Backend environment variables are configured:
  - [ ] `DATABASE_URL` (pointing to production DB)
  - [ ] `ALLOWED_ORIGINS` (includes frontend URL)
  - [ ] `ENVIRONMENT=production`
- [ ] Secrets are stored in platform-specific secret managers
- [ ] No `.env` file is committed to git

### ✅ Deployment Platforms

- [ ] Vercel account created and linked to GitHub
- [ ] Railway/Heroku/AWS account and project created
- [ ] Database provider account set up
- [ ] Domain name configured (if applicable)
- [ ] SSL/HTTPS certificates configured

### ✅ Monitoring & Logging

- [ ] Error tracking set up (Sentry recommended)
- [ ] Application logs are accessible
- [ ] Database query logs enabled
- [ ] Uptime monitoring configured
- [ ] Email alerts configured for errors

### ✅ Security

- [ ] All dependencies are up to date (no known vulnerabilities)
- [ ] Database password is strong (16+ characters)
- [ ] API keys and tokens are secure
- [ ] CORS is restricted to known origins
- [ ] No sensitive data in logs
- [ ] Rate limiting considered (for future)

### ✅ Performance

- [ ] Backend response time is acceptable (<500ms)
- [ ] Database queries are optimized
- [ ] Frontend bundle size is optimized
- [ ] Images are optimized
- [ ] CDN is configured (Vercel handles this)

### ✅ Backup & Recovery

- [ ] Database backup plan is in place
- [ ] Model file is backed up
- [ ] Disaster recovery procedure documented
- [ ] Can restore from backup if needed

### ✅ Post-Deployment

- [ ] Frontend loads without errors
- [ ] Backend health check returns 200
- [ ] Can submit prediction and get result
- [ ] History shows past predictions
- [ ] Analytics dashboard displays data
- [ ] No errors in browser console
- [ ] Monitor error logs for first 24 hours
- [ ] Performance metrics are acceptable

### ✅ Documentation

- [ ] README.md is up to date
- [ ] DEPLOYMENT_GUIDE.md is complete
- [ ] Environment configuration is documented
- [ ] API documentation is accessible at `/docs`
- [ ] Troubleshooting guide is helpful

---

## Deployment Steps

```bash
# 1. Final checks
git status                                    # No uncommitted changes
npm run build                                 # Frontend builds successfully
python -m pytest                              # Tests pass (if available)

# 2. Train and commit model
cd backend
python train_model.py
git add crop_model.pkl
git commit -m "Update trained crop recommendation model"

# 3. Deploy frontend
cd ../frontend
vercel --prod

# 4. Deploy backend
cd ../backend
# Use Railway CLI or git push to Heroku
railway up        # For Railway
# heroku git:push -u heroku main  # For Heroku

# 5. Verify deployment
curl https://your-backend-url.com/health
curl https://your-frontend-url.com

# 6. Monitor
# Check logs on Railway/Heroku dashboard
# Monitor for errors in the first hour
```

---

## Rollback Plan

If deployment fails:

1. **Frontend**: Revert to previous deployment in Vercel dashboard
2. **Backend**:
   - Railway: Use deployment history to rollback
   - Heroku: `heroku releases:rollback v<number>`
3. **Database**: Restore from backup if data corrupted

---

## Common Issues

| Issue                  | Resolution                                |
| ---------------------- | ----------------------------------------- |
| "Model file not found" | Ensure crop_model.pkl is committed to git |
| "Database connection"  | Verify DATABASE_URL and firewall settings |
| "CORS error"           | Update ALLOWED_ORIGINS in backend         |
| "500 error on deploy"  | Check backend logs: `railway logs`        |

---

## Support

Need help? See:

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- [Backend README](crop-recommendation-system/README.md)
- Platform-specific documentation

---

**Last updated**: 2024
**Checklist version**: 1.0
