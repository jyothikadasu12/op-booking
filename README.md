# Service Booking Application

Service Booking Application is a full-stack clinic appointment-booking platform.

Customers can register, log in, browse services, view availability, book appointments, reschedule eligible appointments, cancel appointments, and view their booking history. Administrators can manage services, providers, availability slots, and bookings.

## Technology Stack

### Frontend
- React
- JavaScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend
- FastAPI
- Python
- SQLAlchemy
- Alembic
- Pydantic
- JWT authentication
- Role-based access control

### Database
- PostgreSQL (local installation managed with pgAdmin 4)

## Project Structure

```text
op-booking/
  backend/
  frontend/
  database/
  docs/
  md_files/
  docker-compose.yml
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- Python 3.12+
- PostgreSQL 18
- pgAdmin 4
- Git
- Docker and Docker Compose (optional for containerized runtime)

## PostgreSQL Setup

1. Open pgAdmin 4.
2. Connect to the local PostgreSQL server.
3. Create a database named `service_booking_db`.
4. Confirm the connection values:

```text
Host: localhost
Port: 5432
Username: postgres
Database: service_booking_db
```

## Backend Setup

1. Open a terminal in `backend/`.
2. Create and activate a virtual environment:

```bash
python -m venv .venv
```

On Windows:

```bash
.venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create environment configuration from the example:

```bash
copy .env.example .env
```

Update `.env` with your local PostgreSQL password and JWT secret.

Required backend environment variables:

```env
APP_NAME=Service Booking API
APP_ENV=development
DEBUG=True
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/service_booking_db
SECRET_KEY=CHANGE_THIS_TO_A_SECURE_RANDOM_SECRET
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:5173
ADMIN_SETUP_SECRET=CHANGE_THIS_TO_A_ONE_TIME_SETUP_SECRET
```

5. Run database migrations:

```bash
alembic upgrade head
```

6. Start the backend:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

7. Verify:

- Health: `http://127.0.0.1:8000/api/v1/health`
- Swagger UI: `http://127.0.0.1:8000/docs`

## Frontend Setup

1. Open a terminal in `frontend/`.
2. Install dependencies:

```bash
npm install
```

3. Create environment configuration:

```bash
copy .env.example .env
```

Default frontend environment:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

4. Start the frontend:

```bash
npm run dev
```

Frontend will run at `http://localhost:5173`.

## First Administrator Account

Create the first administrator using the protected bootstrap endpoint.

Example request:

```http
POST /api/v1/auth/bootstrap-admin
X-Admin-Setup-Secret: <ADMIN_SETUP_SECRET>
Content-Type: application/json
```

```json
{
  "full_name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPass123",
  "phone": "1234567890"
}
```

After the first admin exists, this endpoint is disabled.

## Running Tests

### Backend tests

From `backend/`:

```bash
pytest
```

Backend tests use the isolated database `service_booking_test_db`.

### Frontend unit tests

From `frontend/`:

```bash
npm run test
```

### End-to-end tests

From `frontend/`:

```bash
npm run e2e
```

## Docker (Optional)

From the project root:

```bash
docker compose build
docker compose up
```

See `docs/deployment/docker.md` for details.

The Compose setup is configured to connect to the existing local PostgreSQL database by default. It does not replace pgAdmin-managed PostgreSQL.

## Database Backup and Restore

See `docs/database/backup-restore.md`.

## Documentation

Project reference documents:

- `md_files/architecture.md`
- `md_files/design.md`
- `md_files/phases.md`
- `md_files/PRD.md`

## Security Notes

- Passwords are hashed with Argon2.
- JWT tokens are validated on protected endpoints.
- Role-based authorization is enforced on the backend.
- Real secrets must be stored in local `.env` files.
- Never commit real `.env` files, database passwords, JWT secrets, or API keys.
```
Need update .env.example maybe already. Good.

Final verification: run backend tests and frontend build/test, maybe backend uvicorn+frontend dev. We'll run backend pytest and frontend npm test/build. Also maybe Playwright smoke again (already). Let's run backend pytest (full) and frontend test/build.