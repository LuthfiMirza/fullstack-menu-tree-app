# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Development (target for docker-compose.dev.yml)
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Stage 3: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Stage 4: Production (target for production docker-compose.yml)
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Run as non-root user
USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]
