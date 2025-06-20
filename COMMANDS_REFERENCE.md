# Jeff Koretke API - Commands Reference Guide

This guide contains all the essential commands for developing, testing, and managing your Jeff Koretke API server.

## Table of Contents
- [Server Management](#server-management)
- [Testing Commands](#testing-commands)
- [API Endpoint Testing with cURL](#api-endpoint-testing-with-curl)
- [Database Commands](#database-commands)
- [Development Tools](#development-tools)
- [Docker Commands](#docker-commands)
- [Git Commands](#git-commands)
- [Package Management](#package-management)
- [Environment Management](#environment-management)

## Server Management

### Start the Server

```bash
# Start in development mode (with nodemon for auto-restart)
npm run dev

# Start in production mode
npm start

# Start with specific environment
NODE_ENV=production npm start

# Start with custom port
PORT=8080 npm start
```

### Server Status & Monitoring

```bash
# Check if server is running on port 3000
lsof -i :3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Monitor server logs in real-time
tail -f logs/application-$(date +%Y-%m-%d).log

# Monitor error logs
tail -f logs/error-$(date +%Y-%m-%d).log

# Monitor access logs
tail -f logs/access-$(date +%Y-%m-%d).log
```

## Testing Commands

### Jest Test Suite

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests for CI/CD (single run, no watch)
npm run test:ci

# Run specific test file
npx jest tests/unit/contactController.test.js

# Run tests matching a pattern
npx jest --testNamePattern="contact"

# Run tests with verbose output
npx jest --verbose

# Update test snapshots
npx jest --updateSnapshot
```

### Coverage Commands

```bash
# Generate coverage report and open in browser
npm run test:coverage && open coverage/lcov-report/index.html

# View coverage summary
npx jest --coverage --coverageReporters=text-summary

# Generate coverage in different formats
npx jest --coverage --coverageReporters=html,text,lcov
```

## API Endpoint Testing with cURL

### Health & Info Endpoints

```bash
# Health check
curl -X GET http://localhost:3000/api/health

# API info
curl -X GET http://localhost:3000/api/info

# Pretty JSON output
curl -X GET http://localhost:3000/api/health | jq .
```

### Contact Form Testing

```bash
# Valid contact form submission
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello from cURL!"
  }'

# Test validation errors
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "invalid-email",
    "message": ""
  }'

# Test with verbose output
curl -v -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Testing with verbose output"
  }'
```

### About & Skills Endpoints

```bash
# Get about information
curl -X GET http://localhost:3000/api/about

# Get skills data
curl -X GET http://localhost:3000/api/skills

# Get about info with pretty formatting
curl -X GET http://localhost:3000/api/about | jq .
```

### Utility Endpoints

```bash
# Check if it's Friday
curl -X GET http://localhost:3000/api/isitnotfriday

# Test with different days (if you modify the endpoint for testing)
curl -X GET "http://localhost:3000/api/isitnotfriday?date=2025-06-20"
```

### Rate Limiting Testing

```bash
# Test contact form rate limiting (5 requests per hour)
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test$i\",\"email\":\"test$i@example.com\",\"message\":\"Rate limit test $i\"}"
  echo -e "\n"
done

# Test general rate limiting (100 requests per 15 minutes)
for i in {1..5}; do
  curl -X GET http://localhost:3000/api/health
  sleep 1
done
```

### Error Testing

```bash
# Test 404 endpoint
curl -X GET http://localhost:3000/api/nonexistent

# Test method not allowed
curl -X DELETE http://localhost:3000/api/health

# Test malformed JSON
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", invalid json}'
```

## Database Commands

### MongoDB Operations

```bash
# Connect to MongoDB (if using local instance)
mongosh

# Connect to MongoDB Atlas (replace with your connection string)
mongosh "mongodb+srv://your-cluster.mongodb.net/jeffkoretke-api"

# Export data to JSON
mongoexport --uri="your-connection-string" --collection=contacts --out=contacts-backup.json

# Import data from JSON
mongoimport --uri="your-connection-string" --collection=contacts --file=contacts-backup.json

# Create database backup
mongodump --uri="your-connection-string" --out=./backups/$(date +%Y%m%d_%H%M%S)
```

### Database Scripts

```bash
# Run migration scripts (if you create them)
node src/scripts/migrate.js

# Seed database with initial data
node src/scripts/seedData.js

# Backup database
node src/scripts/backup.js
```

## Development Tools

### Linting & Formatting

```bash
# Install ESLint globally
npm install -g eslint

# Run ESLint on source files
eslint src/

# Fix ESLint issues automatically
eslint src/ --fix

# Install Prettier globally
npm install -g prettier

# Format all JavaScript files
prettier --write "src/**/*.js"

# Check formatting without making changes
prettier --check "src/**/*.js"
```

### File Watching & Monitoring

```bash
# Watch for file changes and restart server
npx nodemon server.js

# Watch specific files/directories
npx nodemon --watch src/ --watch package.json server.js

# Watch files and run tests
npx jest --watch

# Monitor API calls in real-time
tail -f logs/access-$(date +%Y-%m-%d).log | grep "POST\|GET\|PUT\|DELETE"
```

## Docker Commands

### Basic Docker Operations

```bash
# Build production Docker image
docker build -t jeffkoretke-api .

# Build development Docker image
docker build -f Dockerfile.dev -t jeffkoretke-api:dev .

# Run production container
docker run -p 3000:3000 --env-file .env.docker jeffkoretke-api

# Run container in detached mode with restart policy
docker run -d -p 3000:3000 --name jeffkoretke-api-container --restart unless-stopped --env-file .env.docker jeffkoretke-api

# Run development container with volume mounting
docker run -p 3000:3000 -v $(pwd):/app --env-file .env.docker jeffkoretke-api:dev

# Stop container
docker stop jeffkoretke-api-container

# Remove container
docker rm jeffkoretke-api-container

# Remove image
docker rmi jeffkoretke-api

# View container logs
docker logs jeffkoretke-api-container

# Follow container logs in real-time
docker logs -f jeffkoretke-api-container

# Execute commands in running container
docker exec -it jeffkoretke-api-container sh

# Check container health status
docker inspect --format='{{.State.Health.Status}}' jeffkoretke-api-container
```

### Docker Compose Operations

```bash
# Start production services
docker-compose up

# Start in detached mode
docker-compose up -d

# Start development environment
docker-compose --profile dev up

# Start with local MongoDB
docker-compose --profile local-db up

# Start with Redis cache
docker-compose --profile cache up

# Start full development stack (API + MongoDB + Redis)
docker-compose --profile dev --profile local-db --profile cache up

# Rebuild and start
docker-compose up --build

# Force recreate containers
docker-compose up --force-recreate

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop and remove everything (containers, networks, images)
docker-compose down --rmi all -v

# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs api

# Follow logs in real-time
docker-compose logs -f

# Scale services (if configured)
docker-compose up --scale api=3

# Check service health
docker-compose ps
```

### Docker Image Management

```bash
# List all images
docker images

# Remove unused images
docker image prune

# Remove all unused containers, networks, images
docker system prune

# Remove everything including volumes
docker system prune -a --volumes

# Tag image for registry
docker tag jeffkoretke-api:latest your-registry/jeffkoretke-api:v1.0.0

# Push to registry
docker push your-registry/jeffkoretke-api:v1.0.0

# Pull from registry
docker pull your-registry/jeffkoretke-api:v1.0.0

# Inspect image layers
docker history jeffkoretke-api

# Get image size information
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### Container Monitoring & Debugging

```bash
# Monitor container resource usage
docker stats jeffkoretke-api-container

# Monitor all containers
docker stats

# Inspect container configuration
docker inspect jeffkoretke-api-container

# Check container processes
docker top jeffkoretke-api-container

# View container filesystem changes
docker diff jeffkoretke-api-container

# Export container as tar
docker export jeffkoretke-api-container > jeffkoretke-api-backup.tar

# Copy files from container
docker cp jeffkoretke-api-container:/app/logs ./container-logs

# Copy files to container
docker cp ./config.json jeffkoretke-api-container:/app/
```

### Network Management

```bash
# List Docker networks
docker network ls

# Inspect network
docker network inspect jeffkoretke-api_api-network

# Create custom network
docker network create --driver bridge custom-api-network

# Connect container to network
docker network connect custom-api-network jeffkoretke-api-container

# Disconnect container from network
docker network disconnect custom-api-network jeffkoretke-api-container
```

### Volume Management

```bash
# List volumes
docker volume ls

# Create volume
docker volume create jeffkoretke-api-data

# Inspect volume
docker volume inspect jeffkoretke-api-data

# Remove unused volumes
docker volume prune

# Backup volume
docker run --rm -v jeffkoretke-api-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

## Git Commands

### Basic Git Operations

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline

# View changes
git diff
```

### Branch Management

```bash
# Create new branch
git checkout -b feature/new-feature

# Switch to branch
git checkout main

# Merge branch
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature

# List branches
git branch -a
```

## Package Management

### NPM Commands

```bash
# Install dependencies
npm install

# Install specific package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Update packages
npm update

# Check for outdated packages
npm outdated

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# List installed packages
npm list

# Remove package
npm uninstall package-name
```

### Package Information

```bash
# View package.json scripts
npm run

# Check npm configuration
npm config list

# Clear npm cache
npm cache clean --force

# Install packages from package-lock.json exactly
npm ci
```

## Environment Management

### Environment Variables

```bash
# View environment variables
printenv | grep NODE

# Set environment variable for single command
NODE_ENV=production npm start

# Export environment variable for session
export NODE_ENV=production

# Load environment from .env file
source .env
```

### Configuration Testing

```bash
# Test with different environments
NODE_ENV=development npm start
NODE_ENV=production npm start
NODE_ENV=test npm test

# Test with different ports
PORT=8080 npm start
PORT=5000 npm start

# Test with debug mode
DEBUG=* npm start
```

## Useful One-Liners

### Server Management

```bash
# Kill all node processes
pkill -f node

# Find process using port 3000
netstat -tulpn | grep 3000

# Check server response time
curl -w "@-" -o /dev/null -s http://localhost:3000/api/health <<< "time_total: %{time_total}s\n"

# Monitor server resource usage
ps aux | grep node
```

### Log Analysis

```bash
# Count API requests by endpoint
grep -c "GET\|POST\|PUT\|DELETE" logs/access-$(date +%Y-%m-%d).log

# Find errors in logs
grep -i "error" logs/application-$(date +%Y-%m-%d).log

# Monitor real-time errors
tail -f logs/error-$(date +%Y-%m-%d).log | grep -i "error"

# Count successful vs error responses
grep -c "200\|201" logs/access-$(date +%Y-%m-%d).log
grep -c "400\|401\|403\|404\|500" logs/access-$(date +%Y-%m-%d).log
```

### Development Shortcuts

```bash
# Quick test all endpoints
curl -s http://localhost:3000/api/health && echo " ✓ Health" || echo " ✗ Health"
curl -s http://localhost:3000/api/info && echo " ✓ Info" || echo " ✗ Info"
curl -s http://localhost:3000/api/about && echo " ✓ About" || echo " ✗ About"
curl -s http://localhost:3000/api/skills && echo " ✓ Skills" || echo " ✗ Skills"

# Generate test data
echo '{"name":"Test User","email":"test@example.com","message":"Generated test message"}' | curl -d @- -H "Content-Type: application/json" http://localhost:3000/api/contact

# Quick server restart
pkill -f "node.*server.js" && npm run dev
```

## Troubleshooting Commands

### Common Issues

```bash
# Port already in use
lsof -ti:3000 | xargs kill -9

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json && npm install

# Reset Git to last commit
git reset --hard HEAD

# Check Node.js and npm versions
node --version && npm --version

# Verify all dependencies are installed
npm ls

# Check for missing dependencies
npm install --dry-run
```

### Performance Monitoring

```bash
# Monitor memory usage
node --max-old-space-size=4096 server.js

# Profile the application
node --prof server.js

# Analyze CPU usage
top -p $(pgrep -f "node.*server.js")

# Monitor network connections
netstat -an | grep :3000
```

## Quick Reference

### Essential Daily Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Test health endpoint
curl http://localhost:3000/api/health

# View logs
tail -f logs/application-$(date +%Y-%m-%d).log

# Check git status
git status
```

### Before Deployment Checklist

```bash
# Run all tests
npm run test:ci

# Check for vulnerabilities
npm audit

# Lint code
eslint src/

# Test production build
NODE_ENV=production npm start

# Verify all endpoints work
# (Run the endpoint tests above)
```

---

## Notes

- Replace `http://localhost:3000` with your actual server URL when deployed
- Make sure to have the `.env` file configured with proper environment variables
- Always test in a development environment before deploying to production
- Use `jq` for pretty JSON formatting (`sudo apt install jq` if not installed)
- Monitor logs regularly for any issues or security concerns

This reference guide should cover all the commands you'll need for day-to-day development and maintenance of your Jeff Koretke API!
