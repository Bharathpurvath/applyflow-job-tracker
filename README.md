# ApplyFlow — Job Application Tracker

ApplyFlow is a full-stack application for organizing a job search in one place. Track companies, roles, application status, dates, links, and notes through a responsive React dashboard backed by a FastAPI REST API and SQLite database.

## Features

- Dashboard summaries for total applications, active applications, interviews, and offers
- Add, edit, update status, search, filter, and delete applications
- Track company, role, location, employment type, job link, applied date, follow-up date, and notes
- REST API with FastAPI and interactive API documentation
- Persistent application data in SQLite when the backend is running
- Demo mode with browser-local storage if the API is not available
- Responsive design for desktop and mobile
- Accessible labels, focus styles, and reduced-motion support

## Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, FastAPI, Pydantic
- **Database:** SQLite, SQLAlchemy
- **API:** REST, documented with OpenAPI / Swagger UI

## Run Locally

You need Python 3.10+ and Node.js installed.

### 1. Start the backend

Open a terminal in the project root:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at [http://127.0.0.1:8000](http://127.0.0.1:8000). Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to explore the API.

On macOS / Linux, activate the virtual environment with:

```bash
source .venv/bin/activate
```

### 2. Start the frontend

Open a second terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually [http://localhost:5173](http://localhost:5173).

### Configuration

The frontend defaults to `http://127.0.0.1:8000` for its API. To use another backend URL, create `frontend/.env` with:

```env
VITE_API_URL=http://127.0.0.1:8000
```

The backend stores its SQLite database in `backend/applyflow.db` by default. Override the database URL with the `DATABASE_URL` environment variable if required.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/applications` | List applications; supports `search` and `status` query parameters |
| POST | `/api/applications` | Create an application |
| GET | `/api/applications/{id}` | Get one application |
| PATCH | `/api/applications/{id}` | Update application fields |
| DELETE | `/api/applications/{id}` | Delete an application |

## Storage and Privacy

With the API running, records are stored in the local SQLite database. When the API cannot be reached, the interface switches to demo mode and keeps demo records in that browser's local storage. Demo-mode records are separate from the backend database and are not synchronized across browsers or devices.

## Project Structure

```text
applyflow-job-tracker/
├── backend/
│   ├── app/
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Author

**Bharath B** · [GitHub](https://github.com/Bharathpurvath)
