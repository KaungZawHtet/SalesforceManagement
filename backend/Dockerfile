# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY backend/package*.json ./
RUN npm ci --omit=dev

USER node
EXPOSE 3000

CMD ["node", "dist/main"]
