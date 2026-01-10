# Portfolio Backend System

A comprehensive backend system for Samrat Mallick's portfolio website built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based admin authentication
- **Content Management**: Full CRUD operations for portfolio content
- **File Uploads**: Cloudinary integration for image management
- **Email Services**: OTP generation and email notifications
- **Error Handling**: Centralized error handling with logging
- **API Documentation**: RESTful API with versioned routes
- **Validation**: Input validation and sanitization
- **Security**: CORS, cookie handling, and secure headers

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db/config.db.js            # Database configuration
│   │   └── logger/logger.config.js    # Winston logger setup
│   ├── controllers/                    # Request handlers
│   │   ├── admin.controller.js
│   │   ├── hero.controller.js
│   │   ├── about.controller.js
│   │   ├── education.controller.js
│   │   ├── project.controller.js
│   │   ├── skill.controller.js
│   │   ├── service.controller.js
│   │   └── contact.controller.js
│   ├── middleware/                     # Custom middleware
│   │   ├── auth.middleware.js         # JWT authentication
│   │   ├── upload.middleware.js        # Multer file upload
│   │   ├── error.middleware.js         # Error handling
│   │   └── validation.middleware.js    # Input validation
│   ├── model/                          # MongoDB models
│   │   ├── admin.model.js
│   │   ├── hero.model.js
│   │   ├── about.model.js
│   │   ├── education.model.js
│   │   ├── project.model.js
│   │   ├── skill.model.js
│   │   ├── service.model.js
│   │   └── contact.model.js
│   ├── repository/                     # Data access layer
│   │   ├── admin.repository.js
│   │   ├── hero.repository.js
│   │   ├── about.repository.js
│   │   ├── education.repository.js
│   │   ├── project.repository.js
│   │   ├── skill.repository.js
│   │   ├── service.repository.js
│   │   └── contact.repository.js
│   ├── routes/                         # API routes
│   │   ├── api.routes.js               # Main API router
│   │   ├── v1.routes.js                # API v1 routes
│   │   └── v1Routes/                   # Individual route modules
│   ├── service/                        # Business logic layer
│   │   ├── admin.service.js
│   │   ├── hero.service.js
│   │   ├── about.service.js
│   │   ├── education.service.js
│   │   ├── project.service.js
│   │   ├── skill.service.js
│   │   ├── service.service.js
│   │   └── contact.service.js
│   ├── utilities/                       # Helper utilities
│   │   ├── cloudinary/
│   │   │   └── upload.js               # Cloudinary upload helpers
│   │   ├── email/
│   │   │   ├── generateOTP.js          # OTP generation
│   │   │   └── sendEmail.js            # Email sending
│   │   ├── error/
│   │   │   ├── appError.js             # Custom error class
│   │   │   └── asyncHandler.js         # Async error wrapper
│   │   └── response/
│   │       └── apiResponse.js          # API response helpers
│   ├── app.js                          # Express app setup
│   └── server.js                       # Server bootstrap
├── logs/                               # Log files
├── .env                                # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- Cloudinary account (for image uploads)
- Gmail account (for email services - optional)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # Database Configuration
   MONGO_URL=mongodb://localhost:27017
   MONGO_NAME=portfolio_db

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # Cloudinary Configuration
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

### Quick Start

After installation, initialize your admin account:

```bash
curl -X POST http://localhost:5000/api/v1/admin/initialize \
-H "Content-Type: application/json" \
-d '{"username":"admin","email":"admin@example.com","password":"yourpassword"}'
```

### Development Workflow

1. **Start development server**: `npm run dev`
2. **API testing**: Use Postman or curl with the provided endpoints
3. **Database management**: Use MongoDB Compass or CLI
4. **File uploads**: Images are automatically stored in Cloudinary
5. **Email testing**: Configure Gmail app password for OTP features

### Production Deployment

1. **Environment variables**: Set all required production variables
2. **Database**: Use MongoDB Atlas or production MongoDB instance
3. **File storage**: Cloudinary is production-ready
4. **Email**: Use production email service
5. **Security**: Enable HTTPS and secure headers
6. **Monitoring**: Set up logging and monitoring tools

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication Routes
- `POST /admin/initialize` - Initialize admin user
  - **Body**: `{ username, email, password }`
  - **Response**: Admin user object
- `POST /admin/login` - Admin login
  - **Body**: `{ email, password }`
  - **Response**: `{ admin, token }`
- `POST /admin/logout` - Admin logout
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Success message
- `GET /admin/get-admin-user` - Get current admin user
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Admin user object
- `POST /admin/generate-otp` - Generate OTP for email/password update
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ newEmail }` (for email update) or `{ email }` (for password reset)
  - **Response**: OTP sent message
- `POST /admin/verify-otp-update-email` - Verify OTP and update email
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ otp }`
  - **Response**: Updated admin user
- `POST /admin/verify-otp-update-password` - Verify OTP and update password
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ otp, newPassword }`
  - **Response**: Updated admin user

### Hero Content Routes
- `POST /hero/add-and-update-hero-content` - Add/update hero content
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ name, title, subtitle, description, profileImage, resumeUrl, socialLinks }`
  - **Files**: `profileImage` (optional)
  - **Response**: Hero content object
- `GET /hero/get-hero-content` - Get hero content
  - **Response**: Hero content object
- `DELETE /hero/delete-hero-content/:id` - Delete hero content
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Success message

### About Content Routes
- `POST /about/add-and-update-about-content` - Add/update about content
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ title, description, profileImage, experience, skills, personalInfo }`
  - **Files**: `profileImage` (optional)
  - **Response**: About content object
- `GET /about/get-about-content` - Get about content
  - **Response**: About content object
- `DELETE /about/delete-about-content/:id` - Delete about content
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Success message

### Education Routes
- `POST /education/create-education-details` - Create education entry
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ institution, degree, field, startDate, endDate, grade, description, achievements }`
  - **Files**: `logo` (optional)
  - **Response**: Education object
- `GET /education/get-all-education-details` - Get all education entries
  - **Response**: Array of education objects
- `GET /education/get-education-details/:id` - Get education by ID
  - **Response**: Education object
- `PUT /education/update-education-details/:id` - Update education entry
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: Same as create
  - **Files**: `logo` (optional)
  - **Response**: Updated education object
- `DELETE /education/delete-education-details/:id` - Delete education entry
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Success message

### Projects Routes
- `POST /projects/add-project` - Create project
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ title, description, technologies, category, githubUrl, liveUrl, status, teamSize, role, challenges, solutions }`
  - **Files**: `images` (multiple, optional)
  - **Response**: Project object
- `GET /projects/get-all-projects` - Get all projects
  - **Query**: `?category=<category>` (optional filter)
  - **Response**: Array of project objects
- `GET /projects/get-project/:id` - Get project by ID
  - **Response**: Project object
- `PUT /projects/update-project/:id` - Update project
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: Same as create
  - **Files**: `images` (multiple, optional)
  - **Response**: Updated project object
- `DELETE /projects/delete-project/:id` - Delete project
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Success message
- `GET /projects/get-featured-projects` - Get featured projects
  - **Response**: Array of featured project objects
- `POST /projects/set-featured-projects` - Set featured projects
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ projectIds }`
  - **Response**: Success message

### Skills Routes
- `POST /skills/create-skill-category` - Create skill category
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ categoryName, description }`
  - **Response**: Skill category object
- `GET /skills/get-all-skill-categories` - Get all skill categories
  - **Response**: Array of skill category objects
- `GET /skills/get-skill-categories/:id` - Get skill category by ID
  - **Response**: Skill category object
- `DELETE /skills/delete-skill-categories/:id` - Delete skill category
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Success message
- `POST /skills/add-skill-to-category/:id` - Add skill to category
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ name, level, icon, experience, projects }`
  - **Files**: `icon` (optional)
  - **Response**: Updated skill category
- `PUT /skills/update-skill-in-category/:id/:skillId` - Update skill in category
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ name, level, icon, experience, projects }`
  - **Files**: `icon` (optional)
  - **Response**: Updated skill category
- `DELETE /skills/delete-skill-from-category/:id/:skillId` - Delete skill from category
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Updated skill category

### Services Routes
- `POST /services/create-services` - Create service
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ title, description, icon, features, pricing, duration, technologies, processSteps }`
  - **Files**: `icon` (optional)
  - **Response**: Service object
- `GET /services/get-all-services` - Get all services
  - **Response**: Array of service objects
- `GET /services/get-services/:id` - Get service by ID
  - **Response**: Service object
- `PUT /services/update-services/:id` - Update service
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: Same as create
  - **Files**: `icon` (optional)
  - **Response**: Updated service object
- `DELETE /services/delete-services/:id` - Delete service
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Success message

### Contact Routes
- `POST /contact/add-update-contact-details` - Add/update contact details
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ email, phone, address, socialLinks, workingHours }`
  - **Response**: Contact details object
- `GET /contact/get-contact-details` - Get contact details
  - **Response**: Contact details object
- `POST /contact/send-message` - Send contact message
  - **Body**: `{ name, email, subject, message, priority }`
  - **Response**: Success message
- `GET /contact/get-all-messages` - Get all messages
  - **Headers**: `Authorization: Bearer <token>`
  - **Query**: `?status=<status>` (optional filter)
  - **Response**: Array of message objects
- `GET /contact/get-message/:messageId` - Get message by ID
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Message object
- `DELETE /contact/delete-message/:messageId` - Delete message
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: Success message
- `POST /contact/reply-to-message/:messageId` - Reply to message
  - **Headers**: `Authorization: Bearer <token>`
  - **Body**: `{ reply }`
  - **Response**: Updated message object
- `GET /contact/get-unread-message-count` - Get unread message count
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ count }`

### Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication

All protected routes require JWT authentication:

1. **Login** to get a token
2. **Include token** in request headers:
   - `Authorization: Bearer <your-jwt-token>`
   - Or as cookie: `token=<your-jwt-token>`

### File Uploads

For routes that accept file uploads:
- Use `multipart/form-data` content type
- File field names are specified in each route
- Supported formats: Images (jpg, jpeg, png, gif, webp)
- Max file size: 5MB per file
- Files are automatically uploaded to Cloudinary

### Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## 🔧 Architecture

### MVC + Service + Repository Pattern

- **Models**: Define data structure and validation using Mongoose schemas
- **Repository**: Handle database operations with clean data access patterns
- **Service**: Implement business logic and validation rules
- **Controllers**: Handle HTTP requests and responses
- **Middleware**: Handle cross-cutting concerns (auth, validation, error handling)

### Key Features

1. **Centralized Error Handling**: Custom error classes and middleware for consistent error responses
2. **Authentication**: JWT-based with secure cookie handling and token management
3. **File Uploads**: Cloudinary integration with automatic image optimization and CDN delivery
4. **Email Services**: OTP generation and email notifications using Nodemailer
5. **Logging**: Winston-based structured logging with different log levels
6. **Validation**: Express-validator for comprehensive input validation and sanitization
7. **Security**: CORS configuration, rate limiting, and secure headers
8. **API Versioning**: Clean versioned API structure for future scalability

### Database Schema

The system uses MongoDB with the following main collections:

- **admins**: Authentication and user management
- **heroes**: Profile section content
- **abouts**: About section content
- **educations**: Academic background and qualifications
- **projects**: Portfolio projects with images and metadata
- **skills**: Skill categories and individual skills
- **services**: Service offerings and descriptions
- **contactdetails**: Contact information and social links
- **messages**: Contact form submissions and replies

### Security Features

- Password hashing with bcryptjs
- JWT token authentication with expiration
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Secure cookie handling
- File upload validation and filtering
- Rate limiting and request throttling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

Samrat Mallick - [Portfolio](https://samratmallick-dev.github.io/myportfolio.io/)

## 🙏 Acknowledgments

- Express.js for the web framework
- MongoDB for the database
- Cloudinary for file storage
- Winston for logging
- JWT for authentication
