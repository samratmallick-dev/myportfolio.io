# Samrat Mallick – Fullstack Portfolio Platform

> Private, personal portfolio & CMS (not open source)

Modern MERN-based platform powering Samrat Mallick’s public-facing portfolio and an authenticated admin console for managing all content (hero, projects, services, skills, education, about, contact).

---

## Overview
- **Public experience**: High-performing, responsive portfolio with featured projects, services, skills, education timeline, and contact form.
- **Admin console**: Secure dashboard to manage all portfolio content, media uploads to Cloudinary, and OTP-backed account actions.
- **API-first**: Layered Express + MongoDB backend with JWT auth, validation, logging.

---

## End-to-End API Request Flow
1. **Frontend call** (React + Axios) → `VITE_API_BASE_URL` (`/api/v1/...`).
2. **Routing**: Express v5 mounts versioned routers (`/admin`, `/hero`, `/about`, `/education`, `/projects`, `/services`, `/contact`, `/skills`) @ backend/src/routes/v1Routes/v1.routes.js.
3. **Middleware**:
   - `authenticate` (short-lived Bearer access token + active session check) protects admin-only routes.
   - `validation.middleware` validates payloads (e.g., contact message, CRUD forms).
   - `upload.middleware` handles Multer file buffers for media uploads.
4. **Controllers → Services → Repositories → MongoDB**:
   - Example public fetch: GET `/projects/get-all-projects` → project controller → service → repo → Mongo → JSON response.
   - Example admin update: POST `/hero/add-and-update-hero-content` (auth, upload) → hero controller/service → Cloudinary upload → Mongo update.
5. **Cloudinary**: Media buffers uploaded, returning `public_id` + `secure_url` stored in Mongo.
6. **Email/OTP**: Gmail API for contact acknowledgments and admin OTP flows.
7. **Response format**: Standardized success/error envelope with timestamps.

### Public-side calls
- Content fetch: `/hero/get-hero-content`, `/about/get-about`, `/services/get-all-services`, `/skills/get-all-skills`, `/education/get-all-education`, `/projects/get-all-projects`, `/projects/get-featured-projects`, `/contact/get-contact-details`.
- Contact form submit: POST `/contact/send-message` (validation, email notifications).

### Admin-side calls (access token required)
- Auth: `/admin/bootstrap` (one-time, secret header), `/admin/login`, `/admin/refresh`, `/admin/logout`, `/admin/logout-all`, `/admin/me`, `/admin/sessions`, `/admin/change-password`, OTP endpoints for email/password updates.
- Content CRUD: hero, about, services, skills, education, projects (including set featured), contact details, message management (read/delete/count).
- File uploads: Multer + Cloudinary for hero/profile, project images, service/contact images.

### Client handling
- Axios base URL + interceptors (frontend/src/config/api.js) to send credentials, parse responses, and surface errors to UI.
- Redux Toolkit thunks wrap API helpers (e.g., contact.slice for sending messages and fetching contact details).

---

## Authentication Flow
1. **One-time bootstrap**: POST `/api/v1/admin/bootstrap` with the `X-Admin-Bootstrap-Secret` header (creates the first admin exactly once; no public registration exists).
2. **Login**: POST `/api/v1/admin/login` → returns a 15-minute access token (stored in Redux memory only) and sets an HTTP-only, SHA-256-hashed refresh cookie.
3. **Refresh**: POST `/api/v1/admin/refresh` exchanges the cookie for a new access token and rotates the refresh token (reuse revokes the session).
4. **Protected routes**: `authenticate` middleware validates the access token, the admin account, and the backing session.
5. **Logout**: `/admin/logout` (current device) and `/admin/logout-all` (every device).
6. **OTP System**: Email-based OTP for password/email changes.

Full details: [docs/auth-architecture.md](docs/auth-architecture.md).

---

## API Routes
**Base URL**: `http://localhost:8000/api/v1`

### Admin Routes (`/admin`)
- POST `/bootstrap` - Create the first admin (one-time, `X-Admin-Bootstrap-Secret` header)
- POST `/login` - Admin login (sets HTTP-only refresh cookie)
- POST `/refresh` - Rotate refresh token + new access token (cookie only)
- POST `/logout` - Admin logout (Auth)
- POST `/logout-all` - Revoke every session (Auth)
- GET `/me` / GET `/get-admin-user` - Get current admin (Auth)
- GET `/sessions` - List active sessions (Auth)
- DELETE `/sessions/:id` - Revoke a session (Auth)
- PATCH `/change-password` - Change password with current password (Auth)
- POST `/create` - Create an additional admin (Auth)
- POST `/generate-otp` - Generate OTP (Auth)
- POST `/verify-otp-update-email` - Update email (Auth)
- POST `/verify-otp-update-password` - Update password (Auth)

### Hero Routes (`/hero`)
- POST `/add-and-update-hero-content` (Auth)
- GET `/get-hero-content`
- GET `/get-hero-content/:id`
- PUT `/update-hero-content/:id` (Auth)
- DELETE `/delete-hero-content/:id` (Auth)
- GET `/get-all-hero-content` (Auth)

### Project Routes (`/projects`)
- POST `/add-project` (Auth)
- GET `/get-all-projects`
- GET `/get-project/:projectId`
- PUT `/update-project/:projectId` (Auth)
- DELETE `/delete-project/:projectId` (Auth)
- GET `/get-featured-projects`
- POST `/set-featured-projects` (Auth)
- GET `/get-all-projects-admin` (Auth)
- GET `/get-projects-by-category/:category`
- GET `/get-projects-by-technology/:technology`

### Other Routes
- `/skills` - Skills CRUD
- `/about` - About section CRUD
- `/education` - Education CRUD
- `/services` - Services CRUD
- `/contact` - Contact form submission

---

## Architecture Overview

### Request Flow
```
User → Frontend (React) → API Call (Axios) → Backend (Express) → Database (MongoDB)
                                               ↓
                                       Cloudinary (Images)
                                               ↓
                                       Email Service (Nodemailer)
```

### Backend Layers
```
Routes → Controllers → Services → Repositories → Models → Database
```

### Authentication Flow
```
1. Login → short-lived access token (memory) + HTTP-only refresh cookie (opaque, SHA-256 hashed in DB)
2. Access token expires → POST /admin/refresh rotates the refresh cookie and issues a new token
3. Protected route → authenticate middleware verifies JWT + admin + live session → req.admin
4. Controller accesses req.admin for user info
```

---

## Features
### Public
- Responsive landing, hero, featured projects, project listing, services, skills, education, and contact sections.
- Contact form posting to backend API with validation and email delivery.
- SEO-friendly metadata and smooth micro-animations.

### Admin
- Content management for hero, about, services, skills, education, projects, and contact details.
- Media upload pipeline (Multer + Cloudinary) with URL storage.
- Auth with rotating refresh tokens (HTTP-only cookie) + in-memory access tokens, session management, OTP flows for sensitive changes, and role-locked routes.
- Dashboard analytics cards, list/detail views, and inline editing forms.

### Platform
- Express v5 API with layered architecture (routes → controllers → services → repositories → models).
- MongoDB via Mongoose v9, structured validation, and Winston logging.
- Frontend built with React (Vite), React Router v7, Redux Toolkit, Tailwind CSS v4 utilities, and Axios.

---

## Tech Stack
**Frontend**
- React 19 (Vite), React Router v7, Redux Toolkit, Axios
- Tailwind CSS v4, class-variance-authority, lucide-react icons, Radix UI primitives

**Backend**
- Node.js 18+, Express 5, MongoDB + Mongoose 9
- JWT auth, bcryptjs, cookie-parser, Multer, Cloudinary
- Gmail API (OAuth2), express-validator, Winston logging, CORS

---

## Project Structure
```
Fullstack_Portfolio/
├── backend/
│   ├── src/
│   │   ├── config/        # DB, logger, and app configuration
│   │   ├── controllers/   # HTTP handlers
│   │   ├── middleware/    # auth, validation, upload, error handling
│   │   ├── model/         # Mongoose schemas
│   │   ├── repository/    # Data access layer
│   │   ├── routes/        # API route definitions
│   │   ├── service/       # Business logic
│   │   ├── utilities/     # Cloudinary, email, response helpers
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/portfolio_web-view_screenshorts/  # Product screenshots
│   │   ├── components/   # common, admin, public
│   │   ├── pages/        # routed pages
│   │   ├── context/      # state management
│   │   ├── services/     # API clients
│   │   ├── hooks/        # custom hooks
│   │   ├── utils/        # helpers
│   │   ├── styles/       # global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## Screenshots
### Public experience
| Hero & CTA | Featured projects |
| --- | --- |
| ![Public hero](frontend/src/assets/portfolio_web-view_screenshorts/user-view-hero-section.png) | ![Featured projects](frontend/src/assets/portfolio_web-view_screenshorts/user-view-feature_project-section.png) |
| Services | Projects listing |
| ![Services](frontend/src/assets/portfolio_web-view_screenshorts/user-view-services-section.png) | ![All projects](frontend/src/assets/portfolio_web-view_screenshorts/user-view-all-project-page-section.png) |
| Skills | Contact |
| ![Skills](frontend/src/assets/portfolio_web-view_screenshorts/user-view-skills-section.png) | ![Contact](frontend/src/assets/portfolio_web-view_screenshorts/user-view-contact-page-section.png) |

### Admin console
| Dashboard | Hero management |
| --- | --- |
| ![Admin dashboard](frontend/src/assets/portfolio_web-view_screenshorts/admin-view-dashboard-up-section.png) | ![Admin hero](frontend/src/assets/portfolio_web-view_screenshorts/admin-view-hero-section.png) |
| Projects management | Settings |
| ![Admin projects](frontend/src/assets/portfolio_web-view_screenshorts/admin-view-projects-section.png) | ![Admin settings](frontend/src/assets/portfolio_web-view_screenshorts/admin-view-settings-section.png) |
| Contact/messages | Auth |
| ![Contact details](frontend/src/assets/portfolio_web-view_screenshorts/admin-view-contact-details-section.png) | ![Auth](frontend/src/assets/portfolio_web-view_screenshorts/portfolio-auth-page-section.png) |

---

## Setup & Installation
### Prerequisites
- Node.js v18+
- MongoDB Atlas database
- Cloudinary account (API key/secret)
- Gmail API account (OAuth2 credentials) for email/OTP

### Backend
```bash
cd backend
npm install
# create backend/.env using the values below
npm run dev            # development
npm start              # production
```
Initialize the first admin (one-time, backend-only secret from `ADMIN_BOOTSTRAP_SECRET`):
```bash
POST http://localhost:8000/api/v1/admin/bootstrap
X-Admin-Bootstrap-Secret: <your ADMIN_BOOTSTRAP_SECRET value>

{
  "username": "admin",
  "email": "your@email.com",
  "password": "a-password-of-at-least-8-characters"
}
```
The endpoint permanently disables itself after the first admin exists (409 afterwards).

### Frontend
```bash
cd frontend
npm install
# create frontend/.env using the values below
npm run dev            # development
npm run build          # production build
npm run preview        # preview build
```

### Access Points
- Backend API: `http://localhost:8000/api/v1`
- Frontend: `http://localhost:5173`
- Admin dashboard: `http://localhost:5173/admin`

---

## Environment Variables
### Backend (`backend/.env`)
See [backend/.env.example](backend/.env.example) for the complete, commented template.
```
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
MONGO_NAME=myportfolio
CLOUD_NAME=<your_cloud_name>
CLOUD_API_KEY=<your_api_key>
CLOUD_API_SECRET=<your_api_secret>
GMAIL_CLIENT_ID=<your_gmail_client_id>
GMAIL_CLIENT_SECRET=<your_gmail_client_secret>
GMAIL_REFRESH_TOKEN=<your_gmail_refresh_token>
GMAIL_SENDER=<your_gmail_address>

# --- Auth (required; no hardcoded fallbacks) ---
JWT_ACCESS_SECRET=<32+ random characters>
JWT_ISSUER=portfolio-backend
JWT_AUDIENCE=portfolio-admin
JWT_ACCESS_EXPIRES_IN=15m
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
ADMIN_BOOTSTRAP_SECRET=<32+ random characters, backend only>
BCRYPT_ROUNDS=12
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Samrat Mallick Portfolio
```

---

## Development Notes
- Layered backend: routes → controllers → services → repositories → models.
- Validation and error handling centralized in middleware.
- Media pipeline: Multer buffer → Cloudinary upload → stored URL + public_id.
- Email service: Gmail API with OAuth2 for sending emails and OTPs.
- Authentication: rotating refresh tokens in an HTTP-only cookie + 15-minute access tokens in memory; guard protected routes server-side (session validated on every request) and client-side (`CheckAuth`).

---

## License & Usage
- Licensed under the [MIT License](LICENSE).
- This repository is currently **private** and intended for personal portfolio use. External distribution or commercial use should only occur with explicit written consent from Samrat Mallick.

---

## Contact
- Email: [samratmallick2002@gmail.com](mailto:samratmallick2002@gmail.com)
- LinkedIn: [linkedin.com/in/samrat-mallick01](https://linkedin.com/in/samrat-mallick01)
- GitHub: [github.com/samratmallick-dev](https://github.com/samratmallick-dev)

<div align="center">
© 2026 Samrat Mallick. All Rights Reserved.
</div>
