# API Documentation - Portfolio Backend

Base URL: `http://localhost:8000/api/v1`

## Admin Routes

### Initialize Admin
- **Endpoint**: `POST /admin/initialize`
- **Description**: Initialize admin account (only works if no admin exists)
- **Body**:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

### Login
- **Endpoint**: `POST /admin/login`
- **Description**: Admin login
- **Body**:
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

### Logout
- **Endpoint**: `POST /admin/logout`
- **Description**: Admin logout (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get Admin User
- **Endpoint**: `GET /admin/get-admin-user`
- **Description**: Get current admin user details (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Generate OTP for Email Update
- **Endpoint**: `POST /admin/generate-otp`
- **Description**: Generate OTP for email update (requires authentication)
- **Body**:
```json
{
  "newEmail": "newemail@example.com"
}
```
- **Headers**: `Authorization: Bearer <token>`

### Verify OTP and Update Email
- **Endpoint**: `POST /admin/verify-otp-update-email`
- **Description**: Verify OTP and update email (requires authentication)
- **Body**:
```json
{
  "otp": "123456"
}
```
- **Headers**: `Authorization: Bearer <token>`

### Verify OTP and Update Password
- **Endpoint**: `POST /admin/verify-otp-update-password`
- **Description**: Verify OTP and update password (requires authentication)
- **Body**:
```json
{
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```
- **Headers**: `Authorization: Bearer <token>`

## Hero Routes

### Add/Update Hero Content
- **Endpoint**: `POST /hero/add-and-update-hero-content`
- **Description**: Add or update hero content (no auth required for testing)
- **Body**:
```json
{
  "title": "Full Stack Developer",
  "subtitle": "Building amazing web experiences",
  "description": "Passionate developer with expertise in modern web technologies",
  "resumeLink": "https://example.com/resume.pdf",
  "githubLink": "https://github.com/username",
  "linkedinLink": "https://linkedin.com/in/username",
  "email": "contact@example.com",
  "phone": "+1234567890",
  "location": "City, Country"
}
```

### Get Hero Content
- **Endpoint**: `GET /hero/get-hero-content`
- **Description**: Get current hero content

### Get Hero Content by ID
- **Endpoint**: `GET /hero/get-hero-content/:id`
- **Description**: Get specific hero content by ID

### Update Hero Content
- **Endpoint**: `PUT /hero/update-hero-content/:id`
- **Description**: Update hero content (requires authentication)
- **Body**:
```json
{
  "title": "Updated Full Stack Developer",
  "subtitle": "Building amazing web experiences",
  "description": "Updated description",
  "resumeLink": "https://example.com/updated-resume.pdf",
  "githubLink": "https://github.com/updated-username",
  "linkedinLink": "https://linkedin.com/in/updated-username",
  "email": "updated@example.com",
  "phone": "+1234567890",
  "location": "Updated City, Country"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `profileImage` (file)

### Delete Hero Content
- **Endpoint**: `DELETE /hero/delete-hero-content/:id`
- **Description**: Delete hero content (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get All Hero Content
- **Endpoint**: `GET /hero/get-all-hero-content`
- **Description**: Get all hero content (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

## About Routes

### Add/Update About Content
- **Endpoint**: `POST /about/add-and-update-about-content`
- **Description**: Add or update about content (requires authentication)
- **Body**:
```json
{
  "title": "About Me",
  "description": "Detailed description about yourself",
  "experience": "5+ years of experience",
  "specialization": "Full Stack Development",
  "achievements": "Multiple certifications and awards"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `profileImage` (file)

### Get About Content
- **Endpoint**: `GET /about/get-about-content`
- **Description**: Get current about content

### Get About Content by ID
- **Endpoint**: `GET /about/get-about-content/:id`
- **Description**: Get specific about content by ID

### Update About Content
- **Endpoint**: `PUT /about/update-about-content/:id`
- **Description**: Update about content (requires authentication)
- **Body**:
```json
{
  "title": "Updated About Me",
  "description": "Updated detailed description",
  "experience": "Updated experience",
  "specialization": "Updated specialization",
  "achievements": "Updated achievements"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `profileImage` (file)

### Delete About Content
- **Endpoint**: `DELETE /about/delete-about-content/:id`
- **Description**: Delete about content (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get All About Content
- **Endpoint**: `GET /about/get-all-about-content`
- **Description**: Get all about content (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

## Contact Routes

### Add/Update Contact Details
- **Endpoint**: `POST /contact/add-update-contact-details`
- **Description**: Add or update contact details (requires authentication)
- **Body**:
```json
{
  "email": "contact@example.com",
  "phone": "+1234567890",
  "address": "123 Street, City, Country",
  "linkedin": "https://linkedin.com/in/username",
  "github": "https://github.com/username",
  "twitter": "https://twitter.com/username"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `images` (up to 3 files)

### Get Contact Details
- **Endpoint**: `GET /contact/get-contact-details`
- **Description**: Get current contact details

### Update Contact Details
- **Endpoint**: `PUT /contact/update-contact-details/:id`
- **Description**: Update contact details (requires authentication)
- **Body**:
```json
{
  "email": "updated@example.com",
  "phone": "+1234567890",
  "address": "Updated address",
  "linkedin": "https://linkedin.com/in/updated-username",
  "github": "https://github.com/updated-username",
  "twitter": "https://twitter.com/updated-username"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `images` (up to 3 files)

### Send Message
- **Endpoint**: `POST /contact/send-message`
- **Description**: Send a message through contact form
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss a project with you."
}
```

### Get All Messages
- **Endpoint**: `GET /contact/get-all-messages`
- **Description**: Get all messages (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get Message by ID
- **Endpoint**: `GET /contact/get-message/:messageId`
- **Description**: Get specific message by ID (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Delete Message
- **Endpoint**: `DELETE /contact/delete-message/:messageId`
- **Description**: Delete message (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Mark Message as Read
- **Endpoint**: `PUT /contact/mark-as-read/:messageId`
- **Description**: Mark message as read (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Reply to Message
- **Endpoint**: `POST /contact/reply/:messageId`
- **Description**: Reply to a message (requires authentication)
- **Body**:
```json
{
  "reply": "Thank you for your message. I'll get back to you soon."
}
```
- **Headers**: `Authorization: Bearer <token>`

### Get Unread Count
- **Endpoint**: `GET /contact/get-unread-count`
- **Description**: Get count of unread messages (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get All Messages Admin
- **Endpoint**: `GET /contact/get-all-messages-admin`
- **Description**: Get all messages for admin (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

## Education Routes

### Create Education Details
- **Endpoint**: `POST /education/create-education-details`
- **Description**: Create education details (requires authentication)
- **Body**:
```json
{
  "institution": "University Name",
  "degree": "Bachelor of Science",
  "field": "Computer Science",
  "startDate": "2018-09-01",
  "endDate": "2022-06-01",
  "description": "Relevant coursework and achievements",
  "gpa": "3.8",
  "isCurrent": false
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `logo` (file)

### Get All Education Details
- **Endpoint**: `GET /education/get-all-education-details`
- **Description**: Get all education details

### Get Education Details by ID
- **Endpoint**: `GET /education/get-education-details/:id`
- **Description**: Get specific education details by ID

### Update Education Details
- **Endpoint**: `PUT /education/update-education-details/:id`
- **Description**: Update education details (requires authentication)
- **Body**:
```json
{
  "institution": "Updated University Name",
  "degree": "Master of Science",
  "field": "Computer Science",
  "startDate": "2022-09-01",
  "endDate": "2024-06-01",
  "description": "Updated description",
  "gpa": "3.9",
  "isCurrent": true
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `logo` (file)

### Delete Education Details
- **Endpoint**: `DELETE /education/delete-education-details/:id`
- **Description**: Delete education details (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get All Education Admin
- **Endpoint**: `GET /education/get-all-education-admin`
- **Description**: Get all education details for admin (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get Latest Education
- **Endpoint**: `GET /education/get-latest-education`
- **Description**: Get latest education details

## Project Routes

### Add Project
- **Endpoint**: `POST /project/add-project`
- **Description**: Create new project (requires authentication)
- **Body**:
```json
{
  "title": "Awesome Project",
  "description": "Detailed project description",
  "technologies": ["React", "Node.js", "MongoDB"],
  "category": "Web Development",
  "featured": true,
  "liveUrl": "https://project-demo.com",
  "githubUrl": "https://github.com/username/project",
  "startDate": "2023-01-01",
  "endDate": "2023-06-01",
  "status": "completed"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `images` (up to 5 files)

### Get All Projects
- **Endpoint**: `GET /project/get-all-projects`
- **Description**: Get all projects

### Get Project by ID
- **Endpoint**: `GET /project/get-project/:projectId`
- **Description**: Get specific project by ID

### Update Project
- **Endpoint**: `PUT /project/update-project/:projectId`
- **Description**: Update project (requires authentication)
- **Body**:
```json
{
  "title": "Updated Awesome Project",
  "description": "Updated project description",
  "technologies": ["React", "Node.js", "MongoDB", "TypeScript"],
  "category": "Web Development",
  "featured": false,
  "liveUrl": "https://updated-project-demo.com",
  "githubUrl": "https://github.com/username/updated-project",
  "startDate": "2023-01-01",
  "endDate": "2023-08-01",
  "status": "completed"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `images` (up to 5 files)

### Delete Project
- **Endpoint**: `DELETE /project/delete-project/:projectId`
- **Description**: Delete project (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get Featured Projects
- **Endpoint**: `GET /project/get-featured-projects`
- **Description**: Get featured projects

### Set Featured Projects
- **Endpoint**: `POST /project/set-featured-projects`
- **Description**: Set featured projects (requires authentication)
- **Body**:
```json
{
  "projectIds": ["project_id_1", "project_id_2", "project_id_3"]
}
```
- **Headers**: `Authorization: Bearer <token>`

### Get All Projects Admin
- **Endpoint**: `GET /project/get-all-projects-admin`
- **Description**: Get all projects for admin (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get Projects by Category
- **Endpoint**: `GET /project/get-projects-by-category/:category`
- **Description**: Get projects by category

### Get Projects by Technology
- **Endpoint**: `GET /project/get-projects-by-technology/:technology`
- **Description**: Get projects by technology

## Services Routes

### Create Services
- **Endpoint**: `POST /services/create-services`
- **Description**: Create new service (requires authentication)
- **Body**:
```json
{
  "title": "Web Development",
  "description": "Custom web development services",
  "features": ["Frontend Development", "Backend Development", "API Design"],
  "price": "Starting at $500",
  "duration": "2-4 weeks"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `icon` (file)

### Get All Services
- **Endpoint**: `GET /services/get-all-services`
- **Description**: Get all services

### Get Service by ID
- **Endpoint**: `GET /services/get-services/:servicesId`
- **Description**: Get specific service by ID

### Update Service
- **Endpoint**: `PUT /services/update-services/:servicesId`
- **Description**: Update service (requires authentication)
- **Body**:
```json
{
  "title": "Updated Web Development",
  "description": "Updated web development services",
  "features": ["Frontend Development", "Backend Development", "API Design", "Testing"],
  "price": "Starting at $600",
  "duration": "3-5 weeks"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `icon` (file)

### Delete Service
- **Endpoint**: `DELETE /services/delete-services/:servicesId`
- **Description**: Delete service (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get All Services Admin
- **Endpoint**: `GET /services/get-all-services-admin`
- **Description**: Get all services for admin (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

## Skills Routes

### Create Skill Category
- **Endpoint**: `POST /skills/create-skill-category`
- **Description**: Create new skill category (requires authentication)
- **Body**:
```json
{
  "name": "Programming Languages",
  "description": "Various programming languages and frameworks"
}
```
- **Headers**: `Authorization: Bearer <token>`

### Get All Skill Categories
- **Endpoint**: `GET /skills/get-all-skill-categories`
- **Description**: Get all skill categories

### Get Skill Category by ID
- **Endpoint**: `GET /skills/get-skill-categories/:id`
- **Description**: Get specific skill category by ID

### Delete Skill Category
- **Endpoint**: `DELETE /skills/delete-skill-categories/:id`
- **Description**: Delete skill category (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Add Skill to Category
- **Endpoint**: `POST /skills/add-skill-to-category/:id`
- **Description**: Add skill to category (requires authentication)
- **Body**:
```json
{
  "name": "JavaScript",
  "level": "Advanced",
  "experience": "5 years"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `icon` (file)

### Update Skill in Category
- **Endpoint**: `PUT /skills/update-skill-in-category/:id/:skillId`
- **Description**: Update skill in category (requires authentication)
- **Body**:
```json
{
  "name": "Updated JavaScript",
  "level": "Expert",
  "experience": "6 years"
}
```
- **Headers**: `Authorization: Bearer <token>`
- **Form Data**: `icon` (file)

### Delete Skill from Category
- **Endpoint**: `DELETE /skills/delete-skill-from-category/:id/:skillId`
- **Description**: Delete skill from category (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get All Skill Categories Admin
- **Endpoint**: `GET /skills/get-all-skill-categories-admin`
- **Description**: Get all skill categories for admin (requires authentication)
- **Headers**: `Authorization: Bearer <token>`

### Get Skill by ID
- **Endpoint**: `GET /skills/get-skill/:id/:skillId`
- **Description**: Get specific skill by ID

## Authentication Notes

- Most endpoints require authentication using JWT token
- Include the token in the Authorization header: `Authorization: Bearer <token>`
- Token is received after successful login
- Token expires in 7 days
- For file uploads, use `multipart/form-data` format

## File Upload Notes

- Profile images: Single file upload
- Project images: Up to 5 files
- Contact images: Up to 3 files
- Service icons: Single file upload
- Skill icons: Single file upload
- Education logos: Single file upload

## Error Responses

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Success Responses

Most endpoints return standardized success responses:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```
