# --- Stage 1: build the React frontend -------------------------------------
FROM node:20-alpine AS frontend-build

WORKDIR /app/react-vite

COPY react-vite/package.json react-vite/package-lock.json ./
RUN npm ci

COPY react-vite/ ./
RUN npm run build

# --- Stage 2: Python runtime -------------------------------------------------
FROM python:3.12-slim AS backend

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY migrations/ ./migrations/
COPY manage.py .
COPY --from=frontend-build /app/react-vite/dist ./react-vite/dist

# DB migrations and seeding need a live DATABASE_URL, which only exists at
# runtime on Render (not at build time), so they run from CMD instead of RUN.
# `seed ensure` only seeds an empty database, so redeploys/restarts never
# wipe real user signups or trades.
CMD ["sh", "-c", "flask db upgrade && flask seed ensure && gunicorn -b 0.0.0.0:${PORT:-8000} app:app"]
