# MarketPulse Commerce

MarketPulse Commerce is a full-stack e-commerce starter built from your schema requirements. It includes:

- PostgreSQL schema with normalized commerce tables
- Full-text product search using `tsvector` + GIN
- Transaction-safe checkout workflow
- Monthly order partitioning for time-range scale
- Express backend API
- React storefront inspired by modern marketplaces
- Seed data and optimization objects like partial indexes and materialized views

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express + PostgreSQL (`pg`)
- Database: PostgreSQL 15+

## Project Structure

```text
database/
  migrations/
    001_init.sql
  seeds/
    001_seed.sql
backend/
  src/
frontend/
  src/
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+

## 1. Create the Database

Create a PostgreSQL database named `marketpulse` and run:

```sql
\i database/migrations/001_init.sql
\i database/seeds/001_seed.sql
```

Or from a terminal:

```powershell
psql -U postgres -d marketpulse -f database/migrations/001_init.sql
psql -U postgres -d marketpulse -f database/seeds/001_seed.sql
```

## 2. Configure Environment Files

Copy these files and update values if needed:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`

## 3. Install Dependencies

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

## 4. Start the App

Backend:

```powershell
cd backend
npm run dev
```

Frontend:

```powershell
cd frontend
npm run dev
```

## Local Links

- Storefront: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:4000/api](http://localhost:4000/api)

## Features

- Hierarchical categories
- Product catalog with ratings and stock
- Real-time full-text product search
- Partial keyword search for marketplace-style discovery
- Cart and checkout flow
- ACID-safe order placement with row locking
- Partitioned `orders` table by month for faster time-range access
- In-memory cache for read-heavy catalog and dashboard queries
- PgBouncer-ready pooled connection support via `DATABASE_POOL_URL`
- Sales dashboard cards and category insights
- Optimized indexes for read-heavy commerce queries

## Important Note

This environment did not have Node.js, npm, or PostgreSQL installed, so the codebase was created and wired, but not executed here. Once those prerequisites are installed on your machine, the URLs above are the links you can use locally.

## Deploy on Render

This repo now includes a one-service Render deployment file: [render.yaml](/C:/Users/shiva/OneDrive/Desktop/CODEX/render.yaml)

It deploys:

- one Docker web service for the frontend + backend together
- one managed PostgreSQL database

### Deploy Steps

1. Push this folder to a GitHub repository.
2. In Render, choose `New +` -> `Blueprint`.
3. Select your repository.
4. Render will detect `render.yaml` and create:
   - `marketpulse-web`
   - `marketpulse-db`
5. After deployment finishes, open the public Render URL for `marketpulse-web`.

### Public Link

Your public frontend link will be the Render web service URL, which will look like:

`https://marketpulse-web.onrender.com`

The exact URL is assigned by Render when you deploy.
