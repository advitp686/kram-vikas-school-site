# Azure Deploy Path

This folder prepares the project for the simpler Azure path:

- Frontend: Azure Static Web Apps
- Backend: Azure App Service (Linux, Python)
- Database: Neon Free PostgreSQL

This avoids Azure Container Apps, Docker, and ACR.

## Files here

- `appservice-backend.github-actions.yml.example`
  GitHub Actions template for deploying the Django backend to Azure App Service.
- `static-web-apps.github-actions.yml.example`
  GitHub Actions template for deploying the React frontend to Azure Static Web Apps.

## Backend expectations

- App root: `backend/`
- Startup command on App Service:

```bash
sh azure-startup.sh
```

- Key App Settings:

```env
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=False
DATABASE_URL=postgresql://...
DJANGO_DB_SSLMODE=require
DJANGO_ALLOWED_HOSTS=YOUR-APP.azurewebsites.net
CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND.azurestaticapps.net
DJANGO_CSRF_TRUSTED_ORIGINS=https://YOUR-FRONTEND.azurestaticapps.net
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
DJANGO_AUTO_SEED_DEMO_DATA=False
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

If you want the first hosted deploy to create demo data automatically, temporarily set:

```env
DJANGO_AUTO_SEED_DEMO_DATA=True
```

Then switch it back to `False` after the first successful deployment.

## Frontend expectations

- App location: `frontend`
- Output location: `dist`
- Build command is already defined by the Static Web Apps workflow
- The repo already includes [staticwebapp.config.json](D:/New%20folder_gpt/frontend/public/staticwebapp.config.json) for SPA routing

Frontend build env vars:

```env
VITE_API_BASE_URL=https://YOUR-BACKEND.azurewebsites.net/api/v1
VITE_SITE_URL=https://YOUR-FRONTEND.azurestaticapps.net
```
