# --- Build stage ---
FROM node:20-alpine AS build

# Accept build argument for API URL (empty => same-origin via Nginx proxy)
ARG REACT_APP_API_BASE_URL=""
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Set the working directory
WORKDIR /app

# Copy the package.json and install dependencies
COPY package*.json ./

# Install the frontend dependencies
RUN npm ci --legacy-peer-deps

# Copy the source code and build the frontend app
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the previous stage to Nginx's default public directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port the app will run on
EXPOSE 80

# Healthcheck to verify if the app is running
HEALTHCHECK CMD wget -q -O - http://localhost/ || exit 1

# Command to run Nginx to serve the app
CMD ["nginx","-g","daemon off;"]