# Demo Hosting Guide

## Lowest-friction path right now

- Frontend: Render Static Site
- Backend: Render Free web service
- Database: Neon Free PostgreSQL

This avoids Azure Cloud Shell, Docker, and ACR entirely. The repo now includes a root [render.yaml](D:/New%20folder_gpt/render.yaml) that can create both the frontend and backend from the Render dashboard.

## Simplest Azure path

- Frontend: Azure Static Web Apps
- Backend: Azure App Service (Linux, Python)
- Database: Neon Free PostgreSQL

This is the better Azure path for this repo because it avoids:

- Cloud Shell deployment loops
- Azure Container Apps CLI issues
- Azure Container Registry build restrictions

Azure-specific repo files:

- [backend/azure-startup.sh](D:/New%20folder_gpt/backend/azure-startup.sh)
- [deploy/azure/README.md](D:/New%20folder_gpt/deploy/azure/README.md)
- [deploy/azure/appservice-backend.github-actions.yml.example](D:/New%20folder_gpt/deploy/azure/appservice-backend.github-actions.yml.example)
- [deploy/azure/static-web-apps.github-actions.yml.example](D:/New%20folder_gpt/deploy/azure/static-web-apps.github-actions.yml.example)

## Why this is the easiest route

- No CLI deployment is required after the code is on GitHub.
- Neon gives you a free PostgreSQL database without using Azure credits.
- Render can build both services directly from your repo.
- You can add a custom domain later without changing the app code.

## Local demo defaults

- Frontend: `http://localhost:3000`
- Backend API: `http://127.0.0.1:8000/api/v1`

## Render dashboard deploy

### 1. Create the database on Neon

- Create a Neon project.
- Use the direct connection string with pooling turned off.
- Keep the full `postgresql://...` URL ready for Render.

### 2. Deploy from the Render blueprint

In Render:

1. Click `New` -> `Blueprint`.
2. Connect the GitHub repo.
3. Select this repository.
4. Render will detect [render.yaml](D:/New%20folder_gpt/render.yaml) and propose:
   - `kram-vikas-school-api`
   - `kram-vikas-school-site`
5. When prompted for environment values, paste your Neon `DATABASE_URL`.
6. Finish the deploy.

If Render says either service name is already taken, change the service names and then update these values in Render before the first successful deploy:

- Backend `DJANGO_ALLOWED_HOSTS`
- Backend `CORS_ALLOWED_ORIGINS`
- Backend `DJANGO_CSRF_TRUSTED_ORIGINS`
- Frontend `VITE_API_BASE_URL`
- Frontend `VITE_SITE_URL`

### 3. First deploy options

By default the backend will not reseed demo content on every deploy.

If you want the hosted backend to create the demo content automatically on the first deploy, temporarily set:

```env
DJANGO_AUTO_SEED_DEMO_DATA=True
```

After the first successful deploy, switch it back to:

```env
DJANGO_AUTO_SEED_DEMO_DATA=False
```

### 4. Built-in Render commands

The blueprint uses:

- Backend build: `pip install -r requirements.txt`
- Backend pre-deploy: `sh ./render-predeploy.sh`
- Backend start: `sh ./render-start.sh`
- Frontend build: `npm install && npm run build`

Health check endpoint:

```text
/api/v1/health
```

## Optional frontend alternatives

If you prefer, the frontend can still go to Netlify or Vercel later.

Set:

```env
VITE_API_BASE_URL=https://YOUR-RENDER-API.onrender.com/api/v1
VITE_SITE_URL=https://YOUR-FRONTEND-DOMAIN
```

The repo already includes:

- [frontend/netlify.toml](D:/New%20folder_gpt/frontend/netlify.toml)
- [frontend/vercel.json](D:/New%20folder_gpt/frontend/vercel.json)

## Azure deployment notes

### Frontend on Azure Static Web Apps

- Build the `frontend` app normally with the environment variables below.
- The repo now includes [staticwebapp.config.json](D:/New%20folder_gpt/frontend/public/staticwebapp.config.json) so React Router routes work on Azure's default domain too.

```env
VITE_API_BASE_URL=https://YOUR-BACKEND-URL/api/v1
VITE_SITE_URL=https://YOUR-SITE.azurestaticapps.net
```

### Backend on Azure App Service

- Deploy only the `backend` folder.
- Use the startup command:

```bash
sh azure-startup.sh
```

- App settings:

```env
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=False
DATABASE_URL=postgresql://...
DJANGO_DB_SSLMODE=require
DJANGO_ALLOWED_HOSTS=YOUR-APP.azurewebsites.net
CORS_ALLOWED_ORIGINS=https://YOUR-SITE.azurestaticapps.net
DJANGO_CSRF_TRUSTED_ORIGINS=https://YOUR-SITE.azurestaticapps.net
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
DJANGO_AUTO_SEED_DEMO_DATA=False
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

- Use `/api/v1/health` as the backend verification path.
- Keep `DJANGO_AUTO_SEED_DEMO_DATA=False` after the first data setup.

## Later move to Hostinger

When you buy a domain/server later:

- Point the frontend domain to the new frontend host.
- Move the Django backend to a VPS, not standard shared hosting.
- Reuse the same env-based configuration.
- Reuse the same Neon/PostgreSQL data or migrate it to your long-term database.
