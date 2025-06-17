# Environment Configuration Guide

## Overview
This project uses environment variables for configuration. **Never commit actual environment files to git** - only commit template files.

## Environment Files

### Development (.env)
- Contains development-specific configuration
- Already configured for local development
- **Status:** ❌ Ignored by git (contains sensitive data)

### Production (.env.production.template)
- Template for production environment
- Safe to commit (contains no real credentials)
- **Status:** ✅ Tracked by git

### Production (.env.production)
- Actual production configuration with real credentials
- **Status:** ❌ Ignored by git (contains sensitive data)

## Setup Instructions

### For Development
Your `.env` file is already configured and working.

### For Production Deployment

1. **Copy the template:**
   ```bash
   cp .env.production.template .env.production
   ```

2. **Fill in real values:**
   ```bash
   # Edit .env.production with your actual credentials
   nano .env.production
   ```

3. **Required Changes:**
   - `SESSION_SECRET`: Generate a strong 32+ character random string
   - `EMAIL_USER`: Your production email address
   - `EMAIL_PASS`: Your email service app password
   - `MONGODB_URI`: Your production MongoDB connection string
   - `CORS_ORIGIN`: Your actual production domains

4. **Generate Strong Session Secret:**
   ```bash
   # Generate a secure random string
   openssl rand -base64 32
   ```

## Security Best Practices

### ✅ DO:
- Use `.env.*.template` files for documentation
- Keep actual `.env` files in `.gitignore`
- Use different credentials for each environment
- Generate strong, unique secrets for production
- Use app-specific passwords for email services
- Regularly rotate production secrets

### ❌ DON'T:
- Commit actual environment files
- Use the same credentials across environments
- Share production credentials in chat/email
- Use weak or predictable secrets
- Hardcode sensitive values in source code

## Environment Variables Reference

### Required for Production
```bash
NODE_ENV=production           # Enables production optimizations
HTTPS_ONLY=true              # Enforces HTTPS redirects
SESSION_SECRET=...           # Strong random string (32+ chars)
EMAIL_USER=...               # Production email address
EMAIL_PASS=...               # Email service app password
MONGODB_URI=...              # Production database connection
```

### Optional (with defaults)
```bash
PORT=3000                    # Server port
API_VERSION=1.0.0            # API version
LOG_LEVEL=info               # Logging level
RATE_LIMIT_MAX_REQUESTS=100  # Rate limiting
```

## Deployment Checklist

Before deploying to production:

- [ ] Copy `.env.production.template` to `.env.production`
- [ ] Replace all placeholder values with real credentials
- [ ] Generate strong `SESSION_SECRET` (32+ characters)
- [ ] Configure production email credentials
- [ ] Set up production MongoDB database
- [ ] Verify CORS origins match your domain
- [ ] Test all endpoints work with production config
- [ ] Ensure `.env.production` is in `.gitignore`

## Troubleshooting

### Missing Environment Variables
If you see "Missing required environment variables" error:
1. Check that your `.env` file exists
2. Verify all required variables are set
3. Restart the server after making changes

### Email Not Working
1. Verify `EMAIL_USER` and `EMAIL_PASS` are correct
2. Use app-specific passwords (not your regular password)
3. Check email service settings (Gmail, Outlook, etc.)

### Database Connection Issues
1. Verify `MONGODB_URI` connection string
2. Check database user permissions
3. Ensure IP whitelist includes your server

## Example Production Setup

```bash
# 1. On your production server
cp .env.production.template .env.production

# 2. Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)
echo "Generated session secret: $SESSION_SECRET"

# 3. Edit production config
nano .env.production

# 4. Set the generated secret and other values
# SESSION_SECRET=the-generated-secret-from-step-2
# EMAIL_USER=your-real-email@domain.com
# etc...

# 5. Start in production mode
npm run start:prod
```

Remember: **Security is only as strong as your weakest credential!**
