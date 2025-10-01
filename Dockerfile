# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.25.2-alpine-slim

ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/

# Copy built artifacts from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html/
COPY ./default.conf /etc/nginx/conf.d/
