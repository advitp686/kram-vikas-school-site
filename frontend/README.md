# Frontend (Vite + React + TypeScript)

## Setup

```powershell
npm install
```

## Environment

Create `.env` (or copy from `.env.example`):

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_SITE_URL=http://localhost:3000
```

## Run

```powershell
npm run dev
```

Website: `http://localhost:3000`

## Build and Lint

```powershell
npm run lint
npm run build
```

## SEO Assets

- `public/robots.txt`
- `public/sitemap.xml`
- `public/favicon.svg`

`robots.txt` and `sitemap.xml` are generated automatically from `VITE_SITE_URL` before `dev` and `build`.

## Hosting helpers

- `vercel.json` handles React Router rewrites on Vercel
- `netlify.toml` handles SPA redirects on Netlify
