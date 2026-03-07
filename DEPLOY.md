# Deployment Guide — Human Design App

## Architecture

- **Frontend**: Next.js on **Vercel**
- **Backend**: FastAPI on **Railway**
- **Auth/DB**: Supabase
- **Payments**: Stripe

---

## Step 1: Deploy the Backend (Railway)

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select this repo and set the **Root Directory** to `backend`
4. Railway will detect the Dockerfile automatically
5. Add these **environment variables** in the Railway dashboard:

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook signing secret |
| `STRIPE_PRICE_ID_MONTHLY` | Your Stripe price ID for the $34/mo plan |
| `EPHEMERIS_PATH` | `./ephe` |
| `FRONTEND_URL` | Your Vercel URL (set after Step 2) |

6. Deploy! Note the Railway URL (e.g., `https://your-app.up.railway.app`)
7. Verify: visit `https://your-app.up.railway.app/health`

---

## Step 2: Deploy the Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"** → Import this GitHub repo
3. Set the **Root Directory** to `frontend`
4. Framework Preset: **Next.js** (auto-detected)
5. Add these **environment variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL (e.g., `https://your-app.up.railway.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

6. Deploy!

---

## Step 3: Connect the Services

1. **Update Railway**: Go back to Railway and set `FRONTEND_URL` to your Vercel URL
2. **Stripe Webhooks**: In the Stripe dashboard, add a webhook endpoint:
   - URL: `https://your-railway-app.up.railway.app/api/webhook/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.deleted`
   - Copy the webhook signing secret to Railway's `STRIPE_WEBHOOK_SECRET`
3. **Supabase**: Ensure the schema is applied (run `supabase/schema.sql` in the SQL editor)

---

## Local Development

```bash
# Backend
cd backend
cp .env.example .env  # Fill in your keys
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

The frontend proxies `/api/*` requests to the backend at `localhost:8000`.
