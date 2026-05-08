# Base image
FROM node:22-alpine AS builder

# Create app directory
WORKDIR /app

# Install openssl (required for Prisma)
RUN apk add --no-cache openssl

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the app
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Install openssl (required for Prisma)
RUN apk add --no-cache openssl

# Copy built app and dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port (NestJS usually runs on 3000)
EXPOSE 3000

CMD ["node", "dist/src/main.js"]
