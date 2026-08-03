FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy built assets and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
