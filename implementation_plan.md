# Project Structure Plan

## Goal
Create a robust project structure for a programming learning platform using Django (backend) and React + TypeScript (frontend).

## Proposed Changes

### Backend (Django)
- Create a Django project named `backend`.
- Install `django`, `djangorestframework`, `django-cors-headers`.
- Create a folder `apps` to store all Django apps.
- Create apps inside `apps/`:
    - `users`: Custom user model and authentication.
    - `courses`: Managing courses, lessons, and progress.
- Configure `settings.py` to include apps from `apps` folder (`sys.path` adjustment or dot notation) or configuring app config paths.
- Configure REST framework and CORS.

### Frontend (React + TypeScript)
- Create a React project named `frontend` using `create-react-app` with TypeScript template.
- Install `axios`, `react-router-dom`.
- Add TailwindCSS via CDN script link in public/index.html.
- Setup directory structure:
    - `src/components`
    - `src/pages`
    - `src/services` (API calls)
    - `src/types`

### Integration
- The frontend will consume the backend via API (Django Rest Framework).
- CORS headers will allow local development communication.

## Verification Plan
### Automated Tests
- Run Django system checks: `python manage.py check`.
- Start Django server: `python manage.py runserver`.
- Build frontend: `npm run build`.
- Start frontend dev server: `npm run dev`.

### Manual Verification
- Check if both servers start without errors.
- Verify directory structure matches the plan.
