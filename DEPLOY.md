# Deployment Guide

This guide will help you deploy your Expense Tracker app **completely FREE**.

## Architecture

- **Frontend** → Vercel (Free tier: Unlimited sites)
- **Backend** → Fly.io (Free tier: 3 VMs, 3GB storage, always running)
- **Database** → Neon (Free tier: 500MB storage)

---

## Step 1: Set up Neon PostgreSQL (Database)

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up (use GitHub/Google for quick signup)
3. Create a new project
4. Name it `expense-tracker`
5. Select the region closest to you (e.g., `Asia Pacific (Singapore)`)
6. **Save these credentials:**
   - Database host (e.g., `your-db-123.us-east-1.aws.neon.tech`)
   - Database name (usually `neondb`)
   - Username (usually `neondb_owner`)
   - Password (copy it now - you can't see it again!)

### Test Connection
```bash
# Install psql locally, then test:
psql "postgresql://username:password@your-host/neondb?sslmode=require"
```

---

## Step 2: Deploy Backend to Fly.io

### Install Fly CLI
```bash
# Windows (PowerShell):
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux:
curl -L https://fly.io/install.sh | sh
```

### Login to Fly.io
```bash
fly auth login
```

### Deploy
```bash
# From project root directory
fly launch

# When asked:
# - Name: expense-tracker-api (or your choice)
# - Region: Select closest to you (e.g., sin for Singapore)
# - No need to create a Postgres DB (we're using Neon)
# - Deploy now? Yes
```

### Set Environment Variables
```bash
# Set the secrets (these are encrypted)
fly secrets set STAGE=prod
fly secrets set DB_HOST=your-neon-host
fly secrets set DB_PORT=5432
fly secrets set DB_USERNAME=your-neon-username
fly secrets set DB_PASSWORD=your-neon-password
fly secrets set DB_DATABASE=neondb
fly secrets set JWT_SECRET="your-super-secret-key-min-32-characters"
fly secrets set FRONTEND_URL="https://expense-tracker-your-name.vercel.app"
```

### Verify Backend
```bash
# Check status
fly status

# View logs
fly logs

# Test API
open https://expense-tracker-api.fly.dev/api/health
# (You'll need to add a health endpoint)
```

---

## Step 3: Deploy Frontend to Vercel

### Install Vercel CLI
```bash
npm i -g vercel
```

### Deploy
```bash
cd frontend

# Login
vercel login

# Deploy
vercel

# When asked:
# - Set up project? Yes
# - Link to existing? No
# - Project name: expense-tracker (or your choice)
```

### Set Environment Variables
```bash
vercel env add VITE_API_URL

# Enter value:
# https://expense-tracker-api.fly.dev/api
```

Or via Vercel Dashboard:
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - Name: `VITE_API_URL`
   - Value: `https://expense-tracker-api.fly.dev/api`

### Rebuild with new env vars
```bash
vercel --prod
```

---

## Step 4: Update CORS (if needed)

If you get CORS errors, update the backend:

```bash
fly secrets set FRONTEND_URL="https://your-vercel-app.vercel.app"
```

Then restart:
```bash
fly restart
```

---

## Free Tier Limits

| Service | Free Limit | Your Usage |
|---------|-----------|------------|
| **Neon** | 500MB storage, 190 compute hrs/mo | Small DB: ~5-10MB per user |
| **Fly.io** | 3 shared VMs, 3GB storage | 1 VM: ~0.5GB |
| **Vercel** | 100GB bandwidth/mo | ~10-50MB per user |

### Estimate
- **~50 users** with moderate usage will fit comfortably in free tier
- **500MB DB** ≈ 10,000 expenses + 100 users
- Monitor usage in each dashboard

---

## Quick Commands Reference

```bash
# Backend
fly status          # Check if running
fly logs            # View logs
fly restart         # Restart app
fly deploy          # Redeploy after code changes

# Frontend
vercel              # Deploy preview
vercel --prod       # Deploy production
```

---

## Troubleshooting

### Database Connection Errors
- Check Neon dashboard: Is database active?
- Verify secrets: `fly secrets list`
- Test connection string locally

### CORS Errors
- Make sure `FRONTEND_URL` secret matches your Vercel URL exactly
- Check browser console for exact error
- Backend must restart after changing secrets

### Frontend can't reach backend
- Verify `VITE_API_URL` in Vercel dashboard
- Test backend URL directly in browser: `https://your-api.fly.dev/api`
- Check if backend is running: `fly status`

---

## Next Steps / Scaling

When you outgrow free tier:
- **Neon**: $19/mo for 10GB (or keep free and archive old data)
- **Fly.io**: ~$5/mo for continuous running (or stay free, sleeps when idle)
- **Vercel**: Hobby plan stays free for personal projects

---

## URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://expense-tracker-your-name.vercel.app` |
| Backend API | `https://expense-tracker-api.fly.dev/api` |
| Database | Neon console → `https://console.neon.tech` |

---

Good luck! Your app will be live and free! 🚀
