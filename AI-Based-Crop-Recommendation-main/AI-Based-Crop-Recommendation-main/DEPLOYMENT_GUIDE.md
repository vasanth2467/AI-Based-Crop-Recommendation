# Deployment Guide for AgriSmart AI

This guide explains how to deploy the AgriSmart AI crop recommendation system to production using Vercel and other cloud platforms.

## Architecture Overview

The application consists of three main components:

- **Frontend**: React + Vite (deployed on Vercel)
- **Backend**: FastAPI (deployed on Railway, Heroku, AWS, or similar)
- **Database**: PostgreSQL (managed service like Railway, AWS RDS, or similar)

---

## Prerequisites

1. **Frontend**: Vercel account (free tier available at vercel.com)
2. **Backend**: Cloud hosting account (Railway, Heroku, AWS, DigitalOcean, etc.)
3. **Database**: PostgreSQL instance (managed or self-hosted)
4. **Git**: Version control for deployment
5. **Python 3.10+** and **Node.js 18+** for local development

---

## Step 1: Prepare the Frontend for Vercel Deployment

### 1.1 Create `.env.production` File

In the `frontend/` directory, create a `.env.production` file:

```bash
VITE_API_BASE_URL=https://your-backend-url.com
```

Replace `https://your-backend-url.com` with your actual backend API URL.

### 1.2 Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project and select your Git repository
3. In **Project Settings → Environment Variables**, add:
   - **VITE_API_BASE_URL**: `https://your-backend-url.com`
4. Click **Deploy**

### 1.3 Alternative: Deploy via CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

---

## Step 2: Prepare the Backend for Production Deployment

### 2.1 Set Up Database

**Option A: Railway (Recommended for beginners)**

1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL plugin
4. Copy the generated `DATABASE_URL` connection string

**Option B: AWS RDS**

1. Create an RDS PostgreSQL instance
2. Configure security groups to allow connections
3. Get the connection string: `postgresql://user:password@host:5432/agrismart`

**Option C: DigitalOcean Managed Database**

1. Create a PostgreSQL managed database
2. Get the connection string from the dashboard

### 2.2 Generate and Train the ML Model

The backend requires a trained model (`crop_model.pkl`). To generate it:

```bash
cd backend
python train_model.py
```

This creates `crop_model.pkl` in the backend directory.

**Important**: For production deployment, you must commit this file to your repository:

```bash
git add crop_model.pkl
git commit -m "Add trained crop recommendation model"
git push
```

### 2.3 Set Up Environment Variables

Create a `.env` file in `backend/`:

```bash
DATABASE_URL=postgresql://username:password@hostname:5432/agrismart
ALLOWED_ORIGINS=https://yourdomain.vercel.app,https://yourdomain.com
ENVIRONMENT=production
```

Or if using Railway/Heroku config vars:

```bash
# Via CLI
railway variables set DATABASE_URL="postgresql://..."
railway variables set ALLOWED_ORIGINS="https://yourdomain.vercel.app"
railway variables set ENVIRONMENT="production"
```

### 2.4 Install Dependencies

```bash
pip install -r requirements.txt
```

Update `requirements.txt` to include Python-dotenv:

```
python-dotenv>=1.0.0
```

### 2.5 Test Locally

```bash
cd backend
export DATABASE_URL="sqlite:///./agrismart.db"
python train_model.py
uvicorn main:app --reload --port 8000
```

---

## Step 3: Deploy Backend

### Option A: Railway Deployment

1. Go to [Railway.app](https://railway.app)
2. Create a new project from your Git repository
3. Add PostgreSQL database
4. Configure environment variables:
   - `DATABASE_URL`: Set by Railway
   - `ALLOWED_ORIGINS`: Your Vercel frontend URL
   - `ENVIRONMENT`: `production`
5. Set up deployment:
   - **Root Directory**: `crop-recommendation-system/backend`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Deploy

### Option B: Heroku Deployment

1. Install Heroku CLI: `brew install heroku` (or see heroku.com)
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
5. Configure environment:

```bash
heroku config:set ALLOWED_ORIGINS="https://yourdomain.vercel.app"
heroku config:set ENVIRONMENT="production"
```

6. Create `Procfile` in `backend/`:

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
release: python -c "from models import Base, engine; Base.metadata.create_all(engine)"
```

7. Deploy:

```bash
git push heroku main
```

### Option C: AWS EC2/Lightsail

1. Launch an EC2 instance or Lightsail instance
2. SSH into it and install Python, pip, PostgreSQL client
3. Clone repository: `git clone <repo-url>`
4. Set up environment variables
5. Install dependencies: `pip install -r requirements.txt`
6. Run with Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

7. Use Nginx as reverse proxy
8. Set up SSL with Let's Encrypt
9. Use systemd service to keep it running

### Option D: DigitalOcean App Platform

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Create a new app from your Git repository
3. Configure the backend service:
   - **Source Repo**: Your GitHub repo
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `uvicorn main:app --host 0.0.0.0 --port 8080`
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

---

## Step 4: Update Frontend API URL

After deploying the backend, update the frontend environment variable:

**In Vercel Dashboard:**

1. Go to **Project Settings → Environment Variables**
2. Update `VITE_API_BASE_URL` to your backend URL
3. Trigger a redeploy: Go to **Deployments** and click the three dots → **Redeploy**

---

## Step 5: Create Initial Database and Seed Data

After deployment, initialize the database:

```bash
# Option A: Via backend health check
curl https://your-backend-url.com/health

# This will trigger database creation and seeding via the lifespan handler in main.py

# Option B: Direct database connection
psql postgresql://user:password@host:5432/agrismart < database/schema.sql
psql postgresql://user:password@host:5432/agrismart < database/seed_data.sql
```

---

## Step 6: Verify Deployment

### Frontend

1. Visit `https://yourdomain.vercel.app`
2. Should load without errors
3. Check browser console for any API errors

### Backend

1. Check health endpoint: `curl https://your-backend-url.com/health`
2. Should return: `{"status":"ok","model_loaded":true,...}`

### Full Flow

1. Go to frontend
2. Fill in the form with sample data
3. Click "Predict"
4. Should get crop recommendation from backend

---

## Troubleshooting

### "Failed to get prediction. Ensure the backend is running."

- Check that `VITE_API_BASE_URL` is correctly set in frontend environment
- Verify backend is running and responding to requests
- Check CORS settings - backend `ALLOWED_ORIGINS` should include frontend URL
- Check browser console (F12) for actual error messages

### "Model file not found"

- Ensure `crop_model.pkl` is committed to git repository
- Check that `train_model.py` was run before deployment
- Verify the file exists in the backend directory

### Database Connection Error

- Verify `DATABASE_URL` is correct and accessible
- Check database credentials
- Ensure database firewall allows connections from your hosting provider
- For PostgreSQL, check that `postgresql` Python package is installed

### CORS Errors

- Update `ALLOWED_ORIGINS` in backend environment variables
- Include full URL with protocol: `https://yourdomain.vercel.app`
- For development: include `http://localhost:5173`

---

## Performance Optimization

### Frontend (Vercel)

- Automatic image optimization
- Edge caching
- Zero-config deployment

### Backend (Railway/Heroku)

- Use connection pooling (already configured in models.py)
- Monitor database query performance
- Consider caching predictions for identical inputs

### Database (PostgreSQL)

- Create indexes on frequently queried columns
- Regular backups (automatic on managed services)
- Monitor slow query logs

---

## Monitoring and Logging

### Vercel

- Automatic error tracking via Integrations
- View logs in **Deployments → Details → Logs**

### Railway/Heroku

- View logs: `railway logs` or `heroku logs --tail`
- Set up error tracking with Sentry: [sentry.io](https://sentry.io)

### AWS CloudWatch

- Monitor EC2 instances and RDS
- Set up CloudWatch alarms

---

## Security Best Practices

1. ✅ Use environment variables for sensitive data
2. ✅ Restrict CORS to specific origins (not `*`)
3. ✅ Use HTTPS only (automatic on Vercel)
4. ✅ Validate all user inputs (Pydantic models already do this)
5. ✅ Keep dependencies up to date
6. ✅ Use strong database passwords
7. ✅ Enable firewall rules on database
8. ✅ Regularly backup database
9. ✅ Monitor API usage for abuse

---

## Cost Estimates (Monthly)

| Service            | Plan                  | Cost            |
| ------------------ | --------------------- | --------------- |
| Vercel Frontend    | Pro                   | $20             |
| Railway Backend    | Pay-as-you-go         | $5-20           |
| Railway PostgreSQL | Free tier or $7/month | $0-7            |
| **Total**          |                       | **$5-47/month** |

_Note: Exact costs depend on traffic and usage. Free tiers available for low-traffic applications._

---

## Support & Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **Vercel Documentation**: https://vercel.com/docs
- **Railway Documentation**: https://docs.railway.app
- **PostgreSQL Documentation**: https://www.postgresql.org/docs

---

## Next Steps

After deployment:

1. Monitor error logs daily
2. Collect user feedback
3. Optimize based on real-world usage
4. Plan feature enhancements
5. Set up automated backups
6. Consider adding authentication for farmer accounts

---

For questions or issues, refer to the main README.md or open an issue on GitHub.
