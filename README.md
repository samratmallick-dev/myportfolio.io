# Fullstack Portfolio System

**Private Repository - Internal Documentation**

Complete fullstack portfolio system for Samrat Mallick. Includes backend API for content management and frontend React application for public display and admin dashboard.

---

## Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB (Mongoose v9.1.2)
- **Authentication**: JWT (jsonwebtoken v9.0.3)
- **Password Hashing**: bcryptjs v3.0.3
- **File Upload**: Multer v2.0.2
- **Cloud Storage**: Cloudinary v2.8.0
- **Email**: Nodemailer v7.0.12
- **Validation**: express-validator v7.0.1
- **Logging**: Winston v3.19.0

### Frontend
- **Framework**: React 18+ with Vite
- **Routing**: React Router v6
- **State Management**: Context API / Redux
- **Styling**: Tailwind CSS / CSS Modules
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: React Icons

---

## Project Structure

```
Fullstack_Portfolio/
├── backend/
│   ├── logs/
│   ├── src/
│   │   ├── config/          # DB & logger config
│   │   ├── controllers/     # HTTP handlers
│   │   ├── middleware/      # Auth, validation, upload, error
│   │   ├── model/           # Mongoose schemas
│   │   ├── repository/      # Database operations
│   │   ├── routes/          # API routes
│   │   ├── service/         # Business logic
│   │   ├── utilities/       # Cloudinary, email, error, response
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Reusable components
│   │   │   ├── admin/       # Admin dashboard
│   │   │   └── public/      # Public pages
│   │   ├── pages/           # Route pages
│   │   ├── context/         # State management
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API calls
│   │   ├── utils/           # Helpers
│   │   ├── styles/          # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
└── README.md
```

---

## Environment Variables

### Backend (.env)
```env
PORT=8000
CLIENT_URL=http://localhost:5173
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
MONGO_NAME=myportfolio
CLOUD_NAME=<your_cloud_name>
CLOUD_API_KEY=<your_api_key>
CLOUD_API_SECRET=<your_api_secret>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your_email>
EMAIL_PASS=<app_password>
JWT_SECRET=<your_jwt_secret>
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Samrat Mallick Portfolio
```

---

## Database Schema

### Admin Model
```javascript
{
  username: String (unique, 3-50 chars),
  email: String (unique),
  password: String (bcrypt hashed),
  role: String (default: "admin"),
  isActive: Boolean,
  lastLogin: Date,
  otp: String (6-digit),
  otpExpiry: Date,
  newEmail: String
}
```

### Hero Model
```javascript
{
  name: String,
  title: [String],
  description: String,
  resumeLink: String,
  profileImage: { public_id, url },
  isActive: Boolean
}
```

### Project Model
```javascript
{
  title: String,
  description: String,
  shortDescription: String,
  technologies: [String],
  category: String,
  images: [{ public_id, url, alt }],
  liveUrl: String,
  githubUrl: String,
  featured: Boolean,
  status: String (completed/in-progress/planned),
  startDate: Date,
  endDate: Date,
  teamSize: Number,
  role: String,
  challenges: [String],
  solutions: [String],
  isActive: Boolean
}
```

### Skill Model
```javascript
{
  category: String (unique),
  skills: [{ name, level, iconName, iconColor }],
  isActive: Boolean
}
```

**Other Models**: About, Education, Service, Contact

---

## Authentication Flow

1. **Admin Initialization**: POST `/api/v1/admin/initialize` (one-time)
2. **Login**: POST `/api/v1/admin/login` (returns JWT in httpOnly cookie)
3. **Protected Routes**: Use `authenticate` middleware
4. **Token Storage**: httpOnly cookie named "token"
5. **OTP System**: Email-based OTP for password/email changes

---

## API Routes

**Base URL**: `http://localhost:8000/api/v1`

### Admin Routes (`/admin`)
- POST `/initialize` - Create first admin
- POST `/login` - Admin login
- POST `/logout` - Admin logout (Auth)
- GET `/get-admin-user` - Get current admin (Auth)
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
1. Admin login → JWT generated → Stored in httpOnly cookie
2. Protected route → Middleware checks JWT → Attaches admin to req
3. Controller accesses req.admin for user info
```

---

## Running Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account
- Gmail App Password

### Backend Setup
```bash
cd backend
npm install
# Create .env file
npm run dev          # Development
npm start            # Production
```

**Initialize Admin** (first time):
```bash
POST http://localhost:8000/api/v1/admin/initialize
{
  "username": "admin",
  "email": "your@email.com",
  "password": "yourpassword"
}
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file
npm run dev          # Development
npm run build        # Production build
npm run preview      # Preview build
```

### Access Points
- **Backend API**: `http://localhost:8000/api/v1`
- **Frontend**: `http://localhost:5173`
- **Admin Dashboard**: `http://localhost:5173/admin`

---

## Key Features

### Backend
- RESTful API with Express.js
- JWT authentication with httpOnly cookies
- File upload to Cloudinary
- Email notifications with OTP
- Comprehensive error handling
- Request validation
- Winston logging
- Repository pattern architecture

### Frontend
- Responsive design
- Admin dashboard for content management
- Public portfolio pages
- Protected routes
- Form validation
- Image optimization
- Smooth animations
- SEO optimized

---

## Middleware

### 1. Authentication (`auth.middleware.js`)
- Extracts JWT from cookie or Authorization header
- Verifies token with JWT_SECRET
- Attaches `req.admin` object

### 2. Error Handler (`error.middleware.js`)
- Catches all errors
- Logs with Winston
- Returns standardized responses

### 3. Upload (`upload.middleware.js`)
- Multer with memory storage
- Allowed: JPEG, PNG, WebP, GIF
- Max size: 5MB per file

### 4. Validation (`validation.middleware.js`)
- express-validator rules
- Pre-defined validators for all routes

---

## File Upload (Cloudinary)

**Upload Process**:
1. Multer receives file buffer
2. Service calls `uploadToCloudinary(file, options)`
3. Returns `{ public_id, url }`
4. Store in database

**Delete**: `deleteFromCloudinary(public_id, "image")`

---

## API Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error
```json
{
  "success": false,
  "message": "Operation failed",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "errors": ["detail1", "detail2"]
}
```

---

## Deployment

### Backend (Railway/Render/Heroku)
1. Set all environment variables
2. Ensure MongoDB Atlas is accessible
3. Set `NODE_ENV=production`
4. Deploy from main branch

### Frontend (Vercel/Netlify)
1. Set `VITE_API_BASE_URL` to production API
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add redirects for SPA routing

### Production Checklist
- Update CORS origin to match frontend URL
- Use production MongoDB cluster
- Enable MongoDB IP whitelist
- Use strong JWT_SECRET
- Rotate API keys periodically

---

## Known Issues & TODO

### Backend
- [ ] JWT_SECRET fallback (make required)
- [ ] Single admin system (add multi-admin)
- [ ] CORS hardcoded (use CLIENT_URL env)
- [ ] No rate limiting (add express-rate-limit)
- [ ] Pagination not implemented
- [ ] Old images not deleted on update
- [ ] OTP expiry not consistently enforced
- [ ] Log rotation not implemented

### Frontend
- [ ] Add loading states for all API calls
- [ ] Implement error boundaries
- [ ] Add offline support
- [ ] Optimize bundle size
- [ ] Add unit tests
- [ ] Implement lazy loading for images

---

## Troubleshooting

### Backend
- **MongoDB Connection**: Check MONGO_URL, IP whitelist, network
- **JWT Invalid**: Verify JWT_SECRET, check expiration, clear cookies
- **File Upload Fails**: Check file size (5MB max), type, Cloudinary credentials
- **Email Not Sending**: Use Gmail App Password, verify SMTP settings
- **CORS Errors**: Match frontend URL in CORS config

### Frontend
- **API Calls Fail**: Check VITE_API_BASE_URL, backend running, CORS
- **Auth Not Working**: Check cookie settings, JWT token
- **Images Not Loading**: Verify Cloudinary URLs, CORS headers
- **Build Fails**: Clear node_modules, reinstall, check Node version

---

## Coding Standards

### Naming Conventions
- **Files**: `kebab-case.js`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Routes**: `kebab-case`

### Architecture
- Layered: Routes → Controllers → Services → Repositories → Models
- Single responsibility per layer
- Repository extends BaseRepository

### Import Style
```javascript
import express from "express";
import { authenticate } from "./middleware/auth.middleware.js";
```
- ES Modules (type: "module")
- Always include `.js` extension

---

## Contact & Notes

**Project Owner**: Samrat Mallick  
**Purpose**: Personal fullstack portfolio system  
**Status**: Active Development  
**Last Updated**: 2024

This is a private repository. Keep all credentials secure and never commit `.env` files.
