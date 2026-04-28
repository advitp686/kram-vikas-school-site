# Demo Hosting Guide

## Cheapest school-owned path right now

- Frontend: Azure Static Web Apps Free
- Backend: Azure Container Apps on consumption
- Database: Azure Database for PostgreSQL Flexible Server on the smallest burstable tier your student credits allow

This keeps the public website on Azure default domains for now and lets you connect a custom domain later without changing app code.

## Recommended free demo stack

- Frontend: Vercel Hobby or Netlify Free
- Backend: Render Free web service
- Database: Render Postgres Free

This matches the current codebase and avoids SQLite data loss on Render's ephemeral filesystem.

## Local demo defaults

- Frontend: `http://localhost:3000`
- Backend API: `http://127.0.0.1:8000/api/v1`

## Frontend deployment

### Vercel

Set:

```env
VITE_API_BASE_URL=https://YOUR-RENDER-API.onrender.com/api/v1
VITE_SITE_URL=https://YOUR-FRONTEND-DOMAIN
```

The frontend already includes `vercel.json` for React Router rewrites.

### Netlify

Set the same environment variables:

```env
VITE_API_BASE_URL=https://YOUR-RENDER-API.onrender.com/api/v1
VITE_SITE_URL=https://YOUR-FRONTEND-DOMAIN
```

The frontend already includes `netlify.toml` for SPA rewrites.

## Backend deployment on Render

Use the root [render.yaml](D:/New%20folder_gpt/render.yaml) blueprint or configure manually:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command:

```bash
sh ./entrypoint.sh
```

Required env vars:

```env
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=YOUR-RENDER-API.onrender.com
CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND-DOMAIN
DJANGO_CSRF_TRUSTED_ORIGINS=https://YOUR-FRONTEND-DOMAIN
DATABASE_URL=postgresql://...
DJANGO_DB_SSLMODE=require
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
DJANGO_SECURE_HSTS_SECONDS=3600
```

Optional one-time first deploy seed:

```bash
python manage.py seed_demo_data
```

If shell access is inconvenient on the first hosted deploy, you can temporarily set:

```env
DJANGO_AUTO_SEED_DEMO_DATA=True
```

Then switch it back to `False` after the initial content is created.

Health check endpoint:

```text
/api/v1/health
```

## Azure deployment notes

### Frontend on Azure Static Web Apps

- Build the `frontend` app normally with the environment variables below.
- The repo now includes [staticwebapp.config.json](D:/New%20folder_gpt/frontend/public/staticwebapp.config.json) so React Router routes work on Azure's default domain too.

```env
VITE_API_BASE_URL=https://YOUR-BACKEND-URL/api/v1
VITE_SITE_URL=https://YOUR-SITE.azurestaticapps.net
```

### Backend on Azure Container Apps

- Build from [backend/Dockerfile](D:/New%20folder_gpt/backend/Dockerfile)
- Container startup uses [entrypoint.sh](D:/New%20folder_gpt/backend/entrypoint.sh)
- Use `/api/v1/health` as the health probe path
- Keep `DJANGO_AUTO_SEED_DEMO_DATA=False` after the first data setup

## Later move to Hostinger

When you buy a domain/server later:

- Point the frontend domain to the new frontend host.
- Move the Django backend to a VPS, not standard shared hosting.
- Reuse the same env-based configuration.
- Migrate data from Render Postgres to the long-term database before the free database expires.
