# ==========================================
# Stage 1: Base
# ==========================================
FROM node:22-alpine AS base
# Install OpenSSL for Prisma
RUN apk add --no-cache openssl
WORKDIR /app

# ==========================================
# Stage 2: Dependencies
# ==========================================
FROM base AS deps
COPY package.json package-lock.json ./
# Copy prisma directory for generation
COPY prisma ./prisma
COPY prisma.config.ts ./
# Install ALL dependencies (including dev) for building and generating
RUN npm ci
# Generate Prisma Client
RUN npx prisma generate

# ==========================================
# Stage 3: Development
# ==========================================
FROM base AS development
ENV NODE_ENV=development
# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
# Copy source code
COPY . .
# Expose port
EXPOSE 4000
# Run dev command
CMD ["npm", "run", "dev"]

# ==========================================
# Stage 4: Builder
# ==========================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build the application
RUN npm run build
# Prune dev dependencies to save space
RUN npm prune --production

# ==========================================
# Stage 5: Production
# ==========================================
FROM base AS production
ENV NODE_ENV=production
# Copy production dependencies
COPY --from=builder /app/node_modules ./node_modules
# Copy built application
COPY --from=builder /app/dist ./dist
# Copy prisma directory (needed for migrations generally, though client is in node_modules)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000
# Run the application
CMD ["npm", "start"]
