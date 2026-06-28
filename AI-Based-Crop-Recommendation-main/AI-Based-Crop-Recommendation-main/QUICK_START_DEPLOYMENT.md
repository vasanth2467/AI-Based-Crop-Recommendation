# Quick Deployment Setup

## Local Development Setup

### Backend

```bash
cd crop-recommendation-system/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Copy environment template
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# Train the ML model (creates crop_model.pkl)
python train_model.py

# Run the backend server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd crop-recommendation-system/frontend

# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## One-Click Deployment

### 1. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd crop-recommendation-system/frontend
vercel --prod

# Follow prompts and set VITE_API_BASE_URL when asked
```

### 2. Deploy Backend to Railway (Recommended)

1. Go to [Railway.app](https://railway.app)
2. Click "Create Project" → "Deploy from GitHub"
3. Select your repository
4. Select `crop-recommendation-system/backend` as root directory
5. Add PostgreSQL database
6. Set environment variables:
   ```
   ALLOWED_ORIGINS=https://yourdomain.vercel.app
   ENVIRONMENT=production
   ```
7. Deploy

---

## Platform-Specific Guides

- **Railway**: See section "Option A" in DEPLOYMENT_GUIDE.md
- **Heroku**: See section "Option B" in DEPLOYMENT_GUIDE.md
- **AWS EC2**: See section "Option C" in DEPLOYMENT_GUIDE.md
- **DigitalOcean**: See section "Option D" in DEPLOYMENT_GUIDE.md

---

## Environment Variables Reference

### Frontend (.env or .env.local)

```
VITE_API_BASE_URL=http://localhost:8000  # Development
VITE_API_BASE_URL=https://your-api.com   # Production
```

### Backend (.env)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/agrismart
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ENVIRONMENT=development
```

---

## Common Issues & Solutions

| Issue                       | Solution                                               |
| --------------------------- | ------------------------------------------------------ |
| "Model file not found"      | Run `python train_model.py` in backend directory       |
| "CORS error"                | Update ALLOWED_ORIGINS in backend with frontend URL    |
| "Database connection error" | Verify DATABASE_URL is correct and database is running |
| "API 404 error"             | Check VITE_API_BASE_URL ends without trailing slash    |

---

## Verification Checklist

- [ ] Model trained locally (`crop_model.pkl` exists)
- [ ] Backend runs locally: `uvicorn main:app --reload`
- [ ] Frontend loads: `npm run dev`
- [ ] Can submit prediction form and get result
- [ ] Backend deployed to production platform
- [ ] Database set up on production
- [ ] Frontend environment variables set in Vercel
- [ ] Backend environment variables set
- [ ] Health check endpoint returns 200: `curl https://your-api.com/health`
- [ ] Full e2e test: Submit form → Get prediction → See in history

---

## Next Steps

1. Complete the local development setup
2. Train and commit the ML model
3. Deploy backend to production platform
4. Deploy frontend to Vercel
5. Test the full production flow
6. Monitor logs and set up alerts

For detailed information, see **DEPLOYMENT_GUIDE.md**
