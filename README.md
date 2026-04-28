# Kram Vikas Full Stack Website

This repository contains a complete school website stack:

- `frontend/`: Vite + React + TypeScript website
- `backend/`: Django + Django REST Framework API
- `kramvikas/`: Python virtual environment
- `DEPLOYMENT.md`: free-hosting and low-cost Azure deployment guide

## Local Run

### 1) Backend

```powershell
cd backend
..\kramvikas\Scripts\python -m pip install -r requirements.txt
..\kramvikas\Scripts\python manage.py migrate
..\kramvikas\Scripts\python manage.py seed_demo_data
..\kramvikas\Scripts\python manage.py runserver 127.0.0.1:8000
```

### 2) Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open:

- Website: `http://localhost:3000`
- API: `http://127.0.0.1:8000/api/v1`
- Admin: `http://127.0.0.1:8000/admin`

Student login demo:

- Username: `student_demo`
- Password: `Student@123`
- Frontend login page: `http://localhost:3000/login`
- Profile page: `http://localhost:3000/student/profile`

## Environment Files

- Backend template: `backend/.env.example`
- Frontend template: `frontend/.env.example`

## Demo Hosting

Use [DEPLOYMENT.md](D:/New%20folder_gpt/DEPLOYMENT.md) for:

- frontend deployment on Vercel or Netlify
- backend deployment on Render
- PostgreSQL-based demo persistence
- Azure Static Web Apps + Azure Container Apps notes
- later migration to a Hostinger VPS
