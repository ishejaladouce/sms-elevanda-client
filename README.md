# SMS Elevanda – Client Portal (Parent/Student)

Full-stack School Management System client portal for **Elevanda Ventures (Kigali, Rwanda)**.

## What this app does

- Parents and students can **register** and **login**
- Login only works after the device is **verified by an admin**
- View **fees** (balance + history), make **deposits**, request **withdrawals**
- View **grades**, **attendance**, **timetable**, and **notifications**

## Tech stack

- **Frontend**: React + Vite, Tailwind CSS, React Router v6, Zustand, Axios, React Hook Form, Zod
- **Backend**: Node.js + Express, PostgreSQL, Prisma, JWT (httpOnly cookie), SHA-512 (`crypto`), Helmet, rate limiting, Zod, Swagger UI

## Prerequisites

- Node.js (LTS)
- PostgreSQL (running)

## Setup

### 1) Backend

Go to `backend/` and create your `.env`:

- Copy `backend/.env.example` to `backend/.env`
- Update:
  - `DATABASE_URL`
  - `JWT_SECRET`

Install and migrate:

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Backend runs on: `http://localhost:5000`  
Swagger docs: `http://localhost:5000/api/docs`

### 2) Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on: `http://localhost:5173`

## How login sessions work

- JWT is stored in an **httpOnly cookie**
- Cookie is a **session cookie** (it disappears when the browser closes)
- JWT expiry (`JWT_EXPIRES_IN`) is used as the **inactivity limit**

## API endpoints (client repo)

### Auth

- **POST** `/api/auth/register` — register with `deviceId`
- **POST** `/api/auth/login` — login (device must be verified)
- **POST** `/api/auth/logout` — clears cookie

### Client (Parent/Student)

These endpoints accept an optional query for parents:
- `?studentId=<childStudentId>`

- **GET** `/api/client/profile`
- **GET** `/api/client/fees/balance`
- **GET** `/api/client/fees/history`
- **POST** `/api/client/fees/deposit`
- **POST** `/api/client/fees/withdraw` (blocks overdraft)
- **GET** `/api/client/grades`
- **GET** `/api/client/attendance`
- **GET** `/api/client/timetable`
- **GET** `/api/client/notifications`

## Device verification (important)

An admin must set `User.isDeviceVerified=true` for the user’s device.

For local testing you can do it quickly:

```bash
cd backend
node scripts/verify-user.cjs you@example.com
```

If you also got **"Device mismatch"**, update the deviceId to match what the login page shows:

```bash
cd backend
node scripts/set-device.cjs you@example.com <deviceIdFromLoginPage>
```

## Folder structure

- `frontend/` — React web app
- `backend/` — Express API
  - `src/routes` → `src/controllers` → `src/services` → `src/dtos` → `src/models`
  - `prisma/` — schema + migrations

## Assumptions

- Parents can have multiple children. The UI lets parents select the active child.
- Seeding is not included yet. Admin app will create classes, schedules, teachers, and data.

