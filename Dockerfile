# Stage 1: Build the React application
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the built application with NGINX
FROM nginx:1.23-alpine
# Copy the static build output from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html
# Copy the custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to run the web server
EXPOSE 80
# The command to start NGINX
CMD ["nginx", "-g", "daemon off;"]