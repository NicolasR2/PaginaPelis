# Stage 1: Builder
FROM node:18 AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install all dependencies including devDependencies
RUN npm install -g typescript && \
    npm install && \
    npm install @mui/icons-material @mui/material @emotion/react @emotion/styled @vitejs/plugin-react

# Clean cache and remove potential conflicts
RUN rm -rf node_modules/.vite && \
    rm -rf node_modules/.cache && \
    npm cache clean --force

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]