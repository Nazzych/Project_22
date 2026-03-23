# Project Structure Walkthrough

## Overview
We have set up a full-stack project with **Django** (Backend) and **React + TypeScript** (Frontend).

## Directory Structure
```
Project_22/
├── backend/                # Django Project Root
│   ├── apps/               # Custom Django Apps
│   │   ├── users/          # Users App
│   │   └── courses/        # Courses App
│   ├── backend/            # Project Settings
│   └── manage.py
├── frontend/               # React + TypeScript Project
│   ├── public/             # Static public assets
│   │   └── index.html      # Includes TailwindCSS CDN
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── venv/                   # Python Virtual Environment
```

## Backend Configuration
- **Apps Location**: All custom apps (`users`, `courses`) are located in `backend/apps`.
- **Settings**: Adjusted `sys.path` to include `apps` directory so apps can be imported directly (e.g., `INSTALLED_APPS = ['users', ...]`).
- **Dependencies**: `djangorestframework`, `django-cors-headers` installed and configured.
- **CORS**: Configured to allow requests from `localhost:3000`.

## Frontend Configuration
- **Framework**: Created using `create-react-app` with TypeScript template.
- **Styling**: TailwindCSS added via CDN in `public/index.html`.
- **Libraries**: `axios` and `react-router-dom` installed.
- **Structure**: Created directories for organized development (`components`, `pages`, `services`, `types`).

## Next Steps
1.  **Backend**: Define models in `users` and `courses`.
2.  **Frontend**: Start development server (`npm start`) and build UI components.
