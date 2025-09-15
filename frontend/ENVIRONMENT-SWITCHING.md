# Environment Switching Guide

This guide explains how to switch between local development and production environments.

## Quick Switch

Use the provided script to quickly switch environments:

```bash
# Switch to local development
node switch-env.js local

# Switch to production deployment
node switch-env.js production
```

## Manual Configuration

### Local Development
- **Backend URL**: `http://localhost:8080`
- **Frontend URL**: `http://localhost:3000`
- **Database**: Local H2 database

### Production Deployment
- **Backend URL**: `http://dgh-helpdesk-backend-westus2.westus2.azurecontainer.io:8080`
- **Frontend URL**: `http://dgh-helpdesk-frontend-westus2.westus2.azurecontainer.io`
- **Database**: Azure H2 database

## Development Workflow

### 1. Local Development
```bash
# Switch to local environment
node switch-env.js local

# Start backend (in backend directory)
cd ../backend
./mvnw spring-boot:run

# Start frontend (in frontend directory)
cd ../frontend
npm start
```

### 2. Production Deployment
```bash
# Switch to production environment
node switch-env.js production

# Deploy to Azure (your deployment process)
# This will use the Azure container URLs
```

## Environment Variables

The application uses `REACT_APP_API_BASE_URL` environment variable. You can override the default by:

1. Creating a `.env` file in the frontend directory
2. Setting `REACT_APP_API_BASE_URL=http://your-backend-url:8080`

## Troubleshooting

### CORS Issues
- Make sure your backend CORS configuration includes your frontend URL
- Check that `allowCredentials=true` is set

### Session Issues
- Ensure both frontend and backend are running
- Check browser developer tools for cookie settings
- Verify session configuration in `application.properties`

### Network Issues
- Verify the backend URL is accessible
- Check firewall settings
- Ensure ports 3000 (frontend) and 8080 (backend) are available
