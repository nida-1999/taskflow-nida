# Build stage
FROM node:20-alpine as build-stage
 
WORKDIR /app
 
# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
 
# Copy source code
COPY . .
 
# Create .env from .env.example if .env doesn't already exist
RUN cp -n .env.example .env || true
 
# Build the application
RUN npm run build
 
# Production stage
FROM nginx:stable-alpine as production-stage
 
# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build-stage to nginx public folder
COPY --from=build-stage /app/dist /usr/share/nginx/html
 
# Expose port 80
EXPOSE 80
 
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
 