# Portfolio Backend System

**Private Repository - Internal Documentation**

Backend API system for Samrat Mallick's portfolio website. This is a personal project for managing portfolio content, projects, skills, and admin authentication.

---

## Tech Stack

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
- **HTTP Status**: http-status-codes v2.3.0
- **Dev Tools**: Nodemon v3.1.11, Prettier v3.7.4

---

## Project Structure

```
backend/
├── logs/
│   └── info.log                    # Winston log file
├── src/
│   ├── config/
│   │   ├── db/
│   │   │   └── config.db.js        # MongoDB connection
│   │   └── logger/
│   │       └── logger.config.js    # Winston logger setup
│   ├── controllers/
│   │   ├── about.controller.js
│   │   ├── admin.controller.js     # Admin auth & profile
│   │   ├── contact.controller.js
│   │   ├── education.controller.js
│   │   ├── hero.controller.js
│   │   ├── project.controller.js
│   │   ├── service.controller.js
│   │   └── skill.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT authentication
│   │   ├── error.middleware.js     # Global error handler
│   │   ├── upload.middleware.js    # Multer file upload
│   │   └── validation.middleware.js # express-validator rules
│   ├── model/
│   │   ├── about.model.js
│   │   ├── admin.model.js          # Admin schema with bcrypt
│   │   ├── contact.model.js
│   │   ├── education.model.js
│   │   ├── hero.model.js
│   │   ├── project.model.js
│   │   ├── service.model.js
│   │   └── skill.model.js
│   ├── repository/
│   │   ├── base.repository.js      # Generic CRUD operations
│   │   ├── about.repository.js
│   │   ├── admin.repository.js
│   │   ├── contact.repository.js
│   │   ├── education.repository.js
│   │   ├── hero.repository.js
│   │   ├── project.repository.js
│   │   ├── service.repository.js
│   │   └── skill.repository.js
│   ├── routes/
│   │   ├── v1Routes/
│   │   │   ├── about.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── contact.routes.js
│   │   │   ├── education.routes.js
│   │   │   ├── hero.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── services.routes.js
│   │   │   ├── skill.routes.js
│   │   │   └── v1.routes.js        # V1 route aggregator
│   │   └── api.routes.js           # Main API router
│   ├── service/
│   │   ├── about.service.js
│   │   ├── admin.service.js        # Business logic for admin
│   │   ├── contact.service.js
│   │   ├── education.service.js
│   │   ├── hero.service.js
│   │   ├── project.service.js
│   │   ├── service.service.js
│   │   └── skill.service.js
│   ├── utilities/
│   │   ├── cloudinary/
│   │   │   └── upload.js           # Cloudinary upload/delete
│   │   ├── email/
│   │   │   ├── generateOTP.js      # 6-digit OTP generator
│   │   │   └── sendEmail.js        # Nodemailer wrapper
│   │   ├── error/
│   │   │   ├── apiError.js         # Custom error class
│   │   │   └── asyncHandler.js     # Async wrapper
│   │   └── response/
│   │       └── apiResponse.js      # Standardized responses
│   ├── app.js                      # Express app setup
│   └── server.js                   # Entry point
├── .env                            # Environment variables
├── .gitignore
├── .prettierrc                     # Prettier config
├── package.json
└── README.md
```

---

## Environment Variables

Create `.env` file in the backend root:

```env
# Server
PORT=8000

# Client
CLIENT_URL=http://localhost:5173

# MongoDB
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
MONGO_NAME=myportfolio

# Cloudinary
CLOUD_NAME=<your_cloud_name>
CLOUD_API_KEY=<your_api_key>
CLOUD_API_SECRET=<your_api_secret>
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your_email>
EMAIL_PASS=<app_password>

# JWT (Optional - defaults to fallback_secret_key)
JWT_SECRET=<your_jwt_secret>

# Environment
NODE_ENV=development
```

**Notes:**
- `EMAIL_PASS` should be Gmail App Password (not regular password)
- `JWT_SECRET` defaults to "fallback_secret_key" if not provided (see auth.middleware.js)
- All Cloudinary variables are required for image uploads

---

## Database Schema Overview

### Admin Model
```javascript
{
  username: String (unique, 3-50 chars),
  email: String (unique, lowercase),
  password: String (bcrypt hashed, min 6 chars),
  role: String (enum: ["admin"], default: "admin"),
  isActive: Boolean (default: true),
  lastLogin: Date,
  otp: String (6-digit, temporary),
  otpExpiry: Date,
  newEmail: String (pending email change),
  timestamps: true
}
```

### Hero Model
```javascript
{
  name: String,
  title: [String] (array of titles),
  description: String,
  resumeLink: String,
  profileImage: {
    public_id: String,
    url: String
  },
  isActive: Boolean,
  timestamps: true
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
  images: [{
    public_id: String,
    url: String,
    alt: String
  }],
  liveUrl: String,
  githubUrl: String,
  featured: Boolean,
  status: String (enum: ["completed", "in-progress", "planned"]),
  startDate: Date,
  endDate: Date,
  teamSize: Number,
  role: String,
  challenges: [String],
  solutions: [String],
  isActive: Boolean,
  timestamps: true
}
```

### Skill Model
```javascript
{
  category: String (unique),
  skills: [{
    name: String,
    level: Number (0-100),
    iconName: String,
    iconColor: String
  }],
  isActive: Boolean,
  timestamps: true
}
```

**Other Models**: About, Education, Service, Contact follow similar patterns with `isActive` and `timestamps`.

---

## Authentication & Authorization

### Flow
1. **Admin Initialization**: POST `/api/v1/admin/initialize` - Creates first admin (one-time)
2. **Login**: POST `/api/v1/admin/login` - Returns JWT token in cookie + response
3. **Protected Routes**: Use `authenticate` middleware to verify JWT
4. **Token Storage**: JWT stored in httpOnly cookie named "token"
5. **Token Verification**: Checks `req.cookies.token` or `Authorization: Bearer <token>` header

### JWT Payload
```javascript
{
  adminId: admin._id,
  iat: timestamp,
  exp: timestamp
}
```

### Middleware Usage
```javascript
// Public route
router.get("/get-hero-content", heroController.getHeroContent);

// Protected route
router.post("/add-project", authenticate, upload.array("images", 5), projectController.createProject);
```

### OTP System
- **Generate OTP**: Admin requests OTP for email/password change
- **OTP Storage**: Stored in admin document with expiry (typically 10 minutes)
- **Verification**: OTP validated before updating email/password
- **Email Delivery**: Sent via Nodemailer (Gmail SMTP)

---

## API Routes

**Base URL**: `http://localhost:8000/api/v1`

### Admin Routes (`/admin`)
| Method | Endpoint                      | Auth | Description              |
| ------ | ----------------------------- | ---- | ------------------------ |
| POST   | `/initialize`                 | No   | Create first admin       |
| POST   | `/login`                      | No   | Admin login              |
| POST   | `/logout`                     | Yes  | Admin logout             |
| GET    | `/get-admin-user`             | Yes  | Get current admin        |
| POST   | `/generate-otp`               | Yes  | Generate OTP for changes |
| POST   | `/verify-otp-update-email`    | Yes  | Update email with OTP    |
| POST   | `/verify-otp-update-password` | Yes  | Update password with OTP |

### Hero Routes (`/hero`)
| Method | Endpoint                       | Auth | Description            |
| ------ | ------------------------------ | ---- | ---------------------- |
| POST   | `/add-and-update-hero-content` | Yes  | Add/update hero        |
| GET    | `/get-hero-content`            | No   | Get active hero        |
| GET    | `/get-hero-content/:id`        | No   | Get hero by ID         |
| PUT    | `/update-hero-content/:id`     | Yes  | Update hero            |
| DELETE | `/delete-hero-content/:id`     | Yes  | Delete hero            |
| GET    | `/get-all-hero-content`        | Yes  | Get all heroes (admin) |

### Project Routes (`/projects`)
| Method | Endpoint                                  | Auth | Description           |
| ------ | ----------------------------------------- | ---- | --------------------- |
| POST   | `/add-project`                            | Yes  | Create project        |
| GET    | `/get-all-projects`                       | No   | Get active projects   |
| GET    | `/get-project/:projectId`                 | No   | Get project by ID     |
| PUT    | `/update-project/:projectId`              | Yes  | Update project        |
| DELETE | `/delete-project/:projectId`              | Yes  | Delete project        |
| GET    | `/get-featured-projects`                  | No   | Get featured projects |
| POST   | `/set-featured-projects`                  | Yes  | Set featured status   |
| GET    | `/get-all-projects-admin`                 | Yes  | Get all (admin)       |
| GET    | `/get-projects-by-category/:category`     | No   | Filter by category    |
| GET    | `/get-projects-by-technology/:technology` | No   | Filter by tech        |

### Skill Routes (`/skills`)
Similar CRUD pattern with category management

### Other Routes
- `/about` - About section CRUD
- `/education` - Education entries CRUD
- `/services` - Services CRUD
- `/contact` - Contact form submission

---

## Request/Response Flow

### Standard Flow
```
Request → Express Middleware → Router → Controller → Service → Repository → Database
                                                                              ↓
Response ← ApiResponse ← Controller ← Service ← Repository ← Database Result
```

### Layer Responsibilities

**Controller**: HTTP handling, validation, file processing
```javascript
const createProject = asyncHandler(async (req, res) => {
  const data = req.body;
  const files = req.files;
  const result = await projectService.createProject(data, files);
  return sendCreated(res, "Project created", result);
});
```

**Service**: Business logic, orchestration
```javascript
const createProject = async (data, files) => {
  const uploadedImages = await uploadImages(files);
  const project = await projectRepository.create({ ...data, images: uploadedImages });
  return project;
};
```

**Repository**: Database operations
```javascript
class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }
  // Inherits: create, findById, updateById, deleteById, etc.
}
```

---

## Middleware Details

### 1. Authentication (`auth.middleware.js`)
- Extracts JWT from cookie or Authorization header
- Verifies token with `JWT_SECRET` (defaults to "fallback_secret_key")
- Fetches admin from database
- Checks `isActive` status
- Attaches `req.admin` object: `{ id, username, email }`

### 2. Error Handler (`error.middleware.js`)
- Catches all errors from routes
- Logs errors with Winston
- Handles specific error types:
  - ValidationError (Mongoose)
  - CastError (Invalid MongoDB ID)
  - Duplicate key (code 11000)
  - JWT errors
  - Multer errors (file size, count)
- Returns standardized ApiResponse
- Includes stack trace in development mode

### 3. Upload (`upload.middleware.js`)
- Uses Multer with memory storage
- Allowed types: JPEG, JPG, PNG, WebP, GIF
- File size limit: 5MB per file
- Max files: 10
- Usage: `upload.single("fieldName")` or `upload.array("fieldName", maxCount)`

### 4. Validation (`validation.middleware.js`)
- Uses express-validator
- Pre-defined validation rules:
  - `validateLogin`: email + password (min 6 chars)
  - `validateAdminInitialization`: username (3-50) + email + password
  - `validateMongoId`: MongoDB ObjectId format
  - `validateProject`: title, description, technologies, category
  - `validateSkill`: name, level (0-100), iconName, iconColor
  - `validateContactMessage`: name, email, subject, message
  - `validateOTP`: 6-digit numeric
- `handleValidationErrors`: Collects and throws validation errors

---

## File Upload Handling

### Cloudinary Integration

**Upload Process**:
1. Multer receives file in memory (buffer)
2. Controller passes buffer to service
3. Service calls `uploadToCloudinary(file, options)`
4. Returns `{ public_id, url, ... }`
5. Store `public_id` and `url` in database

**Upload Function**:
```javascript
uploadToCloudinary(file, {
  folder: "portfolio/projects",
  public_id: "custom-name", // optional
  overwrite: false
})
```

**Delete Function**:
```javascript
deleteFromCloudinary(public_id, "image")
```

**Configuration**:
- Cloud name, API key, API secret from `.env`
- Default folder: "portfolio"
- Resource type: "auto" (detects image/video)

---

## Error Handling Strategy

### Custom Error Class (`ApiError`)
```javascript
ApiError.badRequest("Invalid input")           // 400
ApiError.unauthorized("Invalid token")          // 401
ApiError.forbidden("Access denied")             // 403
ApiError.notFound("Resource not found")         // 404
ApiError.conflict("Duplicate entry")            // 409
ApiError.unprocessableEntity("Validation fail") // 422
ApiError.internal("Server error")               // 500
```

### Async Handler
Wraps async route handlers to catch errors:
```javascript
const handler = asyncHandler(async (req, res) => {
  // Any thrown error is caught and passed to error middleware
});
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "errors": []
}
```

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Operation failed",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "errors": ["detail1", "detail2"]
}
```

### Helper Functions
```javascript
sendSuccess(res, "Message", data, statusCode)
sendCreated(res, "Message", data)
sendError(res, "Message", errors, statusCode)
sendNotFound(res, "Message")
sendUnauthorized(res, "Message")
sendPaginated(res, "Message", data, pagination)
```

---

## Validation Rules

### Common Patterns
- **Email**: `isEmail().normalizeEmail()`
- **Password**: `isLength({ min: 6 })`
- **MongoDB ID**: `isMongoId()`
- **Required String**: `notEmpty().trim()`
- **Array**: `isArray({ min: 1 })`
- **Number Range**: `isInt({ min: 0, max: 100 })`

### Usage in Routes
```javascript
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  adminController.login
);
```

---

## Logging

### Winston Configuration
- **Level**: info
- **Format**: `YYYY-MM-DD HH:mm:ss [Abar Khabo Services] LEVEL: message`
- **Transports**:
  - Console (all logs)
  - File: `logs/info.log` (info level)

### Usage
```javascript
Logger.info("Server started");
Logger.error("Database connection failed", error);
```

### Logged Events
- Server startup
- Database connection
- Email sending
- Errors (with request context)

---

## Coding Standards

### Naming Conventions
- **Files**: `kebab-case.js` (e.g., `admin.controller.js`)
- **Classes**: `PascalCase` (e.g., `ApiError`, `BaseRepository`)
- **Functions**: `camelCase` (e.g., `createProject`, `sendEmail`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `CLOUDINARY_API_KEY`)
- **Routes**: `kebab-case` (e.g., `/get-hero-content`)

### Code Style (Prettier)
```json
{
  "singleQuote": false,
  "bracketSpacing": true,
  "tabWidth": 6,
  "trailingComma": "es6",
  "semi": true
}
```

### Architecture Pattern
**Layered Architecture**:
- Routes → Controllers → Services → Repositories → Models
- Each layer has single responsibility
- Repository extends BaseRepository for common operations

### Import Style
```javascript
import express from "express";
import { authenticate } from "./middleware/auth.middleware.js";
```
- ES Modules (type: "module" in package.json)
- Always include `.js` extension

---

## Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Gmail account with App Password

### Setup Steps

1. **Clone and Navigate**
```bash
cd backend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
Create `.env` file with all required variables (see Environment Variables section)

4. **Start Development Server**
```bash
npm run dev
```

5. **Start Production Server**
```bash
npm start
```

6. **Initialize Admin** (First Time Only)
```bash
POST http://localhost:8000/api/v1/admin/initialize
Content-Type: application/json

{
  "username": "admin",
  "email": "your@email.com",
  "password": "yourpassword"
}
```

### Verify Setup
- Server: `http://localhost:8000`
- Health Check: `http://localhost:8000/` (should return JSON with status)
- API Base: `http://localhost:8000/api/v1`

---

## Common Commands

```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Format code
npx prettier --write .

# Check logs
cat logs/info.log
```

---

## Known Issues & Caveats

### 1. JWT Secret Fallback
- If `JWT_SECRET` is not in `.env`, defaults to "fallback_secret_key"
- **TODO**: Make JWT_SECRET required and throw error if missing

### 2. Single Admin System
- Only one admin can be initialized
- No multi-admin or role-based access control
- **TODO**: Add support for multiple admins with different roles

### 3. Email Password Whitespace
- `sendEmail.js` strips whitespace from `EMAIL_PASS`: `.replace(/\s/g, "")`
- Required because Gmail App Passwords are formatted with spaces

### 4. OTP Expiry Not Enforced
- OTP expiry is stored but not consistently checked across all endpoints
- **TODO**: Add expiry validation in all OTP verification flows

### 5. File Upload Error Handling
- Multer errors are caught globally but could be more specific
- No cleanup of uploaded files on transaction failure

### 6. CORS Configuration
- Hardcoded to `http://localhost:5173`
- **TODO**: Use `CLIENT_URL` from environment variables

### 7. Logger Label Mismatch
- Logger label says "Abar Khabo Services" instead of portfolio name
- **TODO**: Update to "Portfolio Backend" or similar

### 8. No Rate Limiting
- No protection against brute force or spam
- **TODO**: Add rate limiting middleware (express-rate-limit)

### 9. Pagination Not Used
- BaseRepository has pagination support but not implemented in most endpoints
- **TODO**: Add pagination to project/skill listing endpoints

### 10. Image Deletion on Update
- When updating projects with new images, old images not deleted from Cloudinary
- **TODO**: Delete old images before uploading new ones

---

## Maintenance Notes

### Database Backups
- Use MongoDB Atlas automated backups
- Manual export: `mongodump --uri="<MONGO_URL>/<MONGO_NAME>"`

### Cloudinary Storage
- Monitor storage usage in Cloudinary dashboard
- Implement cleanup script for orphaned images (images in Cloudinary but not in DB)

### Log Rotation
- `logs/info.log` grows indefinitely
- **TODO**: Implement log rotation (winston-daily-rotate-file)

### Security Checklist
- [ ] Change JWT_SECRET from fallback
- [ ] Use strong admin password
- [ ] Enable MongoDB IP whitelist
- [ ] Rotate Cloudinary API keys periodically
- [ ] Use environment-specific CORS origins
- [ ] Add rate limiting
- [ ] Implement request size limits
- [ ] Add helmet.js for security headers

---

## Future Refactoring Ideas

### High Priority
1. **Environment Validation**: Validate all required env vars on startup
2. **JWT Secret**: Make JWT_SECRET mandatory
3. **CORS Dynamic**: Use CLIENT_URL from env instead of hardcoded
4. **OTP Expiry**: Enforce expiry checks consistently
5. **Image Cleanup**: Delete old Cloudinary images on update/delete

### Medium Priority
6. **Rate Limiting**: Add express-rate-limit for auth endpoints
7. **Pagination**: Implement pagination for all list endpoints
8. **Multi-Admin**: Support multiple admin accounts
9. **Role-Based Access**: Add granular permissions (super-admin, editor, viewer)
10. **Audit Logs**: Track who changed what and when

### Low Priority
11. **API Versioning**: Prepare for v2 API structure
12. **Caching**: Add Redis for frequently accessed data
13. **Search**: Implement full-text search for projects/skills
14. **Analytics**: Track API usage and performance metrics
15. **Testing**: Add unit and integration tests

### Code Quality
16. **TypeScript**: Migrate to TypeScript for type safety
17. **ESLint**: Add ESLint for code quality
18. **Documentation**: Generate API docs with Swagger/OpenAPI
19. **Error Codes**: Add unique error codes for debugging
20. **Dependency Updates**: Regular security updates

---

## Troubleshooting

### MongoDB Connection Failed
- Check `MONGO_URL` and `MONGO_NAME` in `.env`
- Verify MongoDB Atlas IP whitelist includes your IP
- Check network connectivity

### JWT Token Invalid
- Verify `JWT_SECRET` matches between token generation and verification
- Check token expiration
- Clear cookies and login again

### File Upload Fails
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, WebP, GIF only)
- Check Cloudinary credentials in `.env`

### Email Not Sending
- Verify Gmail App Password (not regular password)
- Check `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- Enable "Less secure app access" or use App Password

### CORS Errors
- Verify frontend URL matches CORS origin in `app.js`
- Check `credentials: true` is set in frontend fetch/axios

---

## Contact & Notes

**Project Owner**: Samrat Mallick  
**Purpose**: Personal portfolio backend  
**Status**: Active Development  
**Last Updated**: 2024

This is a private repository for personal use. All credentials in `.env` should be kept secure and never committed to version control.
