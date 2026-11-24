# --- Stage 1: Build the React app ---
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Serve static files with Nginx ---
FROM nginx:alpine

# Replace default Nginx config with our SPA + API proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled React files from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]