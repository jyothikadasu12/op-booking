# Docker and Deployment

This project uses Docker and Docker Compose for reproducible runtime environments.

## Important database note

The primary development database remains the locally installed PostgreSQL server managed with pgAdmin 4.

Compose does not replace that database. By default, the backend container connects to PostgreSQL through `host.docker.internal`.

## Build and run

From the project root:

```bash
docker compose build
docker compose up
```

Frontend will be available at `http://localhost:5173`.

Backend API will be available at `http://localhost:8000`.

Swagger UI will be available at `http://localhost:8000/docs`.

## Required environment variables

Set these values in your shell or root `.env` before running Compose:

- `DATABASE_URL`
- `SECRET_KEY`
- `ADMIN_SETUP_SECRET`
- `FRONTEND_URL`
- `VITE_API_BASE_URL`

Example:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@host.docker.internal:5432/service_booking_db
SECRET_KEY=CHANGE_THIS_TO_A_SECURE_RANDOM_SECRET
ADMIN_SETUP_SECRET=CHANGE_THIS_TO_A_ONE_TIME_SETUP_SECRET
FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Production notes

- Set `DEBUG=False`.
- Use a strong, unique `SECRET_KEY`.
- Restrict `FRONTEND_URL` and CORS to trusted origins.
- Use HTTPS in production.
- Run database migrations with Alembic during deployment.
- Do not include real secrets in Docker images.
