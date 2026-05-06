# MedBridge Health Hub

MedBridge is a hospital-to-hospital collaboration platform for discovering facilities, tracking equipment, coordinating inter-facility requests, visualizing nearby providers on a map, generating rule-based referral suggestions, **managing hospital-scoped users**, **approving facility registrations**, and **patient record sharing** between approved hospitals.

This repo contains the **frontend** app. The backend API lives at:

- `../medbridge-backend`

## What The App Is

MedBridge is an operational dashboard for healthcare collaboration between hospitals and laboratories. It helps users:

- **Authenticate** against the Node API (JWT in `localStorage`); optional first-login password change for invited staff
- **Register a hospital** (founding doctor + facility license); platform **super admin** approves before that hospital can sign in
- **Invite doctors** (hospital admins) with email + temporary password (SMTP when configured)
- **Manage facilities** (hospitals and laboratories) and **equipment** linked to facilities
- **Create and track equipment requests** between facilities (scoped by hospital for regular users)
- **Maintain patient records** at the owning hospital and **send** summaries to other approved hospitals; recipients **accept** to view full records
- View nearby hospitals/labs on an **interactive map**
- Get **recommendation** cards ranked by proximity and equipment availability

## High-Level Architecture

- **Frontend:** React + Vite + TypeScript + React Router (`bridge-health-hub`)
- **Backend:** Node.js + Express + PostgreSQL (`medbridge-backend`)
- **Auth:** JWT issued by the backend; `AuthProvider` persists `authToken` and `authUser`. The bundled Supabase client is **not** used for login or app data in the current flow.
- **API base URL:** `VITE_BACKEND_URL` (defaults to `http://localhost:7777`)

## Roles

| Role | Typical use |
|------|-------------|
| `super_admin` | Platform directory: approve hospitals, view admin dashboard, browse all patient records (read-only oversight). |
| `hospital_admin` | First approved user for a registered hospital; manage **Team** invites. |
| `physician` | Day-to-day use: equipment, requests, map, AI, **patients** (create/share for own hospital). |

Seeded demo accounts (after `npm run seed` in `medbridge-backend`):

- **Super admin:** `admin@medbridge.demo` / `Password123!`
- **Demo physician** (General Hospital): `doctor@medbridge.demo` / `Password123!`

## Frontend Routes

### Public

- `/auth` — Sign in; **Register hospital** (organization signup, no token until hospital is approved)

### Protected (`AppAuthGate`)

If `must_change_password` is true (e.g. after an invite), the user is redirected to **`/change-password`** until they update their password.

Main app (sidebar layout):

| Route | Purpose |
|-------|---------|
| `/dashboard` | Summary counts and recent requests |
| `/facilities` | List / add facilities |
| `/equipment` | Inventory, search |
| `/requests` | Request tracking |
| `/requests/new` | New equipment request |
| `/map` | Leaflet map + nearby facilities |
| `/ai` | Rule-based recommendations |
| `/patients` | Patient list: **Our hospital**, **Shared with us**, **Incoming** transfers |
| `/patients/new` | Create patient record (hospital staff only) |
| `/patients/:id` | View/edit (if owner), share to another hospital, upload attachment |
| `/profile` | Read-only profile + hospital affiliation |
| `/settings` | Preferences, **change password**, sign out |
| `/team` | **Hospital admins only** — invite doctors (email + temp password) |
| `/admin` | **Super admins only** — overview, hospitals, pending approvals, users, labs, equipment |

## Authentication API (backend)

- `POST /api/auth/register-organization` — Body: founding doctor + nested `hospital` (name, `license_number`, contact fields). Creates **pending** hospital; no JWT returned.
- `POST /api/auth/login` — Returns JWT + user (includes `hospital_id`, `must_change_password`, etc.). Logins blocked until hospital is **approved** (except `super_admin`).
- `POST /api/auth/change-password` — Authenticated; returns new token.
- `GET /api/auth/me` — Current user profile.

## Patient Records API (backend)

All under `/api/patients`, **Bearer JWT** required.

- `GET /api/patients?scope=owned|shared` — Own hospital’s patients, or patients shared **to** you and **accepted**.
- `GET /api/patients/incoming` — Pending share requests **to** your hospital.
- `PATCH /api/patients/shares/:shareId/respond` — Body `{ "action": "accept" | "decline" }`.
- `POST /api/patients` — Create record (`physician` / `hospital_admin` with `hospital_id`).
- `GET /api/patients/:id` — View if owner, accepted recipient, or `super_admin`.
- `PATCH /api/patients/:id` — Update (owning hospital staff).
- `POST /api/patients/:id/share` — Body `{ to_hospital_id, sender_notes? }`; target hospital must be **approved**.
- `POST /api/patients/:id/attachment` — Multipart field `file` (PDF / JPG / PNG / WebP, size limit per backend).

## Other Backend Routes (summary)

- **Team (hospital admin):** `GET/POST /api/hospital/team`, `POST .../invite`
- **Admin (super admin):** `GET /api/admin/overview`, `GET /api/admin/hospitals`, `PATCH .../hospitals/:id/approve|reject`, `GET /api/admin/users`
- **Facilities / equipment / requests / map / recommendations:** unchanged in purpose; `GET /api/requests` and related handlers require JWT and **scope requests by hospital** for non–super-admin users.

See `medbridge-backend/Server.js` for full mount paths.

## Data Model (high level)

In addition to `users`, `hospitals`, `laboratories`, `facilities`, `equipment`, `equipment_requests`, `equipment_request_results`:

- Hospital **registration** fields (`license_number`, `registration_status`, etc.)
- User **hospital** link, `must_change_password`, invite metadata
- **`patients`** — owning `hospital_id`, demographics, `clinical_summary`, optional `attachment_path`
- **`patient_shares`** — transfer workflow between hospitals (`pending` → `accepted` / `declined`)

Migrations live under `medbridge-backend/sql/` and are applied after the base dump when running `db:init`, or via `npm run migrate` on an existing database.

## End-to-End Journeys

### Equipment collaboration (original focus)

1. Sign in on `/auth`
2. Dashboard → facilities / equipment as needed
3. New request from one facility to another; track on `/requests`
4. Map and AI pages for discovery and prefilled referral flow

### Hospital onboarding

1. On `/auth`, use **Register hospital** with license and founding doctor credentials
2. Super admin opens **`/admin`** → **Pending approval** → **Approve** (or **Reject**)
3. Founding user signs in; role is **`hospital_admin`**
4. Optional: **`/team`** → invite physicians (email; configure **SMTP** on backend for delivery)

### Patient record sharing

1. Physician (or hospital admin) creates a record under **`/patients/new`**
2. On **`/patients/:id`**, **Share record** → choose an **approved** target hospital
3. Recipient hospital sees **Incoming** on **`/patients`** → **Accept** to view under **Shared with us**

## Running Locally

### Frontend (`bridge-health-hub`)

1. `npm install`
2. Optional: `VITE_BACKEND_URL` if the API is not at `http://localhost:7777`
3. `npm run dev` (default dev server: `http://localhost:8080`)

### Backend (`medbridge-backend`)

1. `npm install`
2. Configure `.env` (minimum):

   - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
   - `JWT_SECRET` (required for production)
   - Optional: `JWT_EXPIRES_IN` (default `8h`)
   - Optional: `CORS_ORIGINS` (comma-separated; default includes `http://localhost:8080`)
   - Optional: `FRONTEND_URL` — link base in invite / approval emails (e.g. `http://localhost:8080`)
   - Optional **SMTP** (invites / approval mail): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

3. **New database:** `npm run db:init` then `npm run seed`
4. **Existing database:** `npm run migrate` (applies SQL migrations in order), then adjust data if needed
5. `npm run dev` or `npm start` (entry: `Server.js`)

## Notes

- Invite and approval emails are sent only when SMTP is configured; otherwise the backend logs a warning and invite credentials may appear only in server logs during development.
- Patient sharing is an MVP workflow (audit trails, consent capture, and retention policies are not modeled in the schema).
- Request **results** attachments are supported by the backend (`POST /api/requests/:id/results`); the requests UI may still use `PATCH` for some status transitions—align with `medbridge-backend` controllers as you extend the UI.
