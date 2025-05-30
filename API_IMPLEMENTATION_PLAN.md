# REST API Implementation Plan for jeffkoretke.com

## Overview
This plan outlines the steps to create a simple Express.js REST API that will serve your website at jeffkoretke.com. As an Android developer, you'll find many concepts familiar - REST APIs work similarly to those you've consumed in Android apps, but now you'll be creating the server side.

## Phase 1: Project Setup & Foundation

### 1.1 Initialize Node.js Project

#### Prerequisites for Windows
- [x] Install Node.js from [nodejs.org](https://nodejs.org/) (includes npm) ✅ **v22.16.0 installed**
- [x] Verify installation: `node --version` and `npm --version` ✅ **Working with PATH fix**
- [x] Use PowerShell as your terminal (recommended for Windows) ✅ **Using VS Code terminal**

#### PATH Issue Note
**⚠️ Important**: Node.js is installed but requires PATH fix. Choose one:
- **Recommended**: Add `C:\Program Files\nodejs` to System PATH permanently
- **Temporary**: Run `$env:PATH += ";C:\Program Files\nodejs"` each session

#### Project Initialization
- [x] Navigate to project directory: `cd c:\Users\jeffr\VSCodeProjects\jeffkoretke-api\jeffkoretke-api`
- [x] Initialize npm project with `npm init -y`
- [x] Install core dependencies:
  ```powershell
  npm install express cors dotenv
  npm install --save-dev nodemon
  ```

### 1.2 Project Structure
Create the following folder structure using PowerShell:
```powershell
# Create directory structure
New-Item -ItemType Directory -Path "src"
New-Item -ItemType Directory -Path "src\controllers"
New-Item -ItemType Directory -Path "src\routes"
New-Item -ItemType Directory -Path "src\middleware"
New-Item -ItemType Directory -Path "src\models"
New-Item -ItemType Directory -Path "src\utils"
New-Item -ItemType Directory -Path "tests"

# Create initial files
New-Item -ItemType File -Path ".env"
New-Item -ItemType File -Path ".gitignore"
New-Item -ItemType File -Path "server.js"
```

Final structure:
```
jeffkoretke-api/
├── src/
│   ├── controllers/     # Route handlers (like Android Activities/Fragments)
│   ├── routes/         # API endpoints definition
│   ├── middleware/     # Custom middleware functions
│   ├── models/         # Data models (if using database later)
│   └── utils/          # Helper functions
├── tests/              # Unit and integration tests
├── .env               # Environment variables (not committed to git)
├── .gitignore         # Git ignore file
├── package.json       # Dependencies and scripts (created by npm init)
└── server.js          # Main application entry point
```

### 1.3 Basic Server Setup
- [x] Create main server.js file ✅ **COMPLETED**
- [x] Set up Express app with basic middleware ✅ **COMPLETED**
- [x] Configure CORS for your domain (jeffkoretke.com) ✅ **COMPLETED**
- [x] Add basic error handling ✅ **COMPLETED**
- [x] Create a health check endpoint ✅ **COMPLETED** - Working at localhost:3000/api/health

## Phase 2: Core API Development

### 2.1 Basic Endpoints
Start with these simple endpoints (think of them like Android Intent filters):

#### Health & Info Endpoints
- [x] `GET /api/health` - Server health check ✅ **COMPLETED** - Working at localhost:3000/api/health
- [x] `GET /api/info` - API version and basic info

#### Contact/Portfolio Endpoints
- [x] `POST /api/contact` - Handle contact form submissions
- [x] `GET /api/isitnotfriday` - Return "Yes" if its not Friday, "No" if it is Friday
- [ ] `GET /api/about` - Return about me information

### 2.2 Request Validation
- [ ] Install and configure express-validator
- [ ] Add input validation for all POST endpoints
- [ ] Implement proper error responses (similar to Android's error handling)

### 2.3 Rate Limiting
- [ ] Install express-rate-limit
- [ ] Implement rate limiting to prevent abuse
- [ ] Configure different limits for different endpoints

## Phase 3: Data Management

### 3.1 Static Data (Start Here)
- [ ] Create JSON files for static data:
  - projects.json (your portfolio projects)
  - about.json (about me information)
  - skills.json (your technical skills)

### 3.2 Contact Form Handling
- [ ] Set up email service (nodemailer with Gmail/SendGrid)
- [ ] Store contact submissions temporarily in memory
- [ ] Add email notifications for new contacts

### 3.3 Optional: Database Integration
For future expansion (similar to Android's Room database):
- [ ] Choose database (MongoDB with Mongoose OR PostgreSQL with Sequelize)
- [ ] Set up database connection
- [ ] Create data models
- [ ] Migrate static data to database

## Phase 4: Security & Production Preparation

### 4.1 Security Measures
- [ ] Install helmet.js for security headers
- [ ] Implement HTTPS in production
- [ ] Add request logging (morgan)
- [ ] Environment-specific configurations

### 4.2 Error Handling & Logging
- [ ] Comprehensive error handling middleware
- [ ] Request/response logging
- [ ] Error tracking (optional: integrate with services like Sentry)

### 4.3 Testing
- [ ] Install Jest and Supertest
- [ ] Write unit tests for controllers
- [ ] Write integration tests for API endpoints
- [ ] Set up test scripts in package.json

## Phase 5: Deployment

### 5.1 Platform Selection
Choose one deployment platform:
- **Recommended for beginners**: Vercel or Netlify Functions
- **Alternative options**: Heroku, Railway, or DigitalOcean

### 5.2 Deployment Configuration
- [ ] Create production environment variables
- [ ] Set up deployment scripts
- [ ] Configure domain/subdomain (api.jeffkoretke.com)
- [ ] Set up SSL certificate

### 5.3 CI/CD (Optional)
- [ ] GitHub Actions for automated testing
- [ ] Automated deployment on push to main branch

## Phase 6: Integration with Your Website

### 6.1 Frontend Integration
- [ ] Update your website's JavaScript to call API endpoints
- [ ] Handle API responses and errors gracefully
- [ ] Add loading states for API calls
- [ ] Test cross-origin requests

### 6.2 Performance Optimization
- [ ] Implement response caching where appropriate
- [ ] Optimize JSON response sizes
- [ ] Add compression middleware

## Sample API Endpoints Structure

```
GET  /api/health              # Health check
GET  /api/info                # API information
GET  /api/projects            # Get all projects
GET  /api/projects/:id        # Get specific project
GET  /api/about               # Get about information
GET  /api/skills              # Get skills list
POST /api/contact             # Submit contact form
```

## Development Tools Recommendations

### Essential VS Code Extensions
- REST Client (for testing API endpoints)
- Thunder Client (Postman alternative)
- ESLint
- Prettier

### External Tools
- Postman (for API testing)
- Git for version control
- MongoDB Compass (if using MongoDB)

## Timeline Estimate

- **Week 1**: Phase 1 & 2.1 (Basic setup and simple endpoints)
- **Week 2**: Phase 2.2 & 2.3 (Validation and rate limiting)
- **Week 3**: Phase 3.1 & 3.2 (Data management and contact form)
- **Week 4**: Phase 4 (Security and testing)
- **Week 5**: Phase 5 (Deployment)
- **Week 6**: Phase 6 (Integration and optimization)

## Android Developer Notes

### Similarities to Android Development
- **Controllers** = Activities/Fragments (handle user interactions)
- **Routes** = Intent filters (define what requests to handle)
- **Middleware** = Interceptors (process requests before/after handling)
- **Models** = Data classes/Room entities
- **Environment variables** = BuildConfig fields
- **API testing** = Unit testing with Mockito/Espresso

### Key Differences
- Stateless vs stateful (no persistent UI state)
- Request/response cycle vs event-driven UI
- Multiple concurrent requests vs single user interactions

## Next Steps

1. Start with Phase 1.1 - initialize your npm project
2. Follow the checklist step by step
3. Test each endpoint as you build it
4. Don't hesitate to start simple and iterate

Remember: Start small, test often, and gradually add complexity. This approach will give you a solid foundation and help you understand web API development coming from your Android background.
