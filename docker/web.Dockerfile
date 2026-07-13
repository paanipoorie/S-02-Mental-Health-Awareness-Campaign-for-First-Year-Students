# Base image
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build shared types
RUN pnpm --filter @campus-peer-support/shared-types typecheck

# Build Web
RUN pnpm --filter web build

# Expose port
EXPOSE 4321

# Start Web
CMD ["pnpm", "--filter", "web", "preview", "--host", "0.0.0.0", "--port", "4321"]